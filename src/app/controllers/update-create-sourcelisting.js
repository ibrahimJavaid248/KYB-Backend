// const {SourceList} = require('../database/models/source-listing')
const { Op } = require("sequelize");
const Joi = require("joi");
const { successResponse, failureResponse } = require("../helper/responses");
const Model = require("../database/models");

const sourceDataValidationSchema = Joi.object({
  id: Joi.number(),
  authorityName: Joi.string().required(),
  url: Joi.string().uri().required(),
  countryId: Joi.array().required(),
  regionId: Joi.number().required(),
  GDP: Joi.number().allow(null),
  stateId: Joi.number().allow(null),
  format: Joi.number().allow(null),
  datatype: Joi.string().required(),
  coverage: Joi.string().required(),
  sourceType: Joi.string().valid("Official", "Un-Official").required(),
  cost: Joi.string().valid("Paid", "Free").required(),
  comment: Joi.string().allow(""),
  language: Joi.number().allow(null),
  portal_range: Joi.string().allow(""),
  contains_UBOs: Joi.string().required(),
  keys: Joi.string().allow(""),
  mapping_issues: Joi.string().allow(""),
  tech_comments: Joi.string().allow(""),
  integrations: Joi.boolean().default(false),
  integration_status: Joi.string().allow(""),
});

async function validation(
  authorityName,
  url,
  countryId,
  regionId,
  stateId,
  GDP,
  format,
  datatype,
  coverage,
  sourceType,
  cost,
  comment,
  language,
  portal_range,
  contains_UBOs,
  keys,
  mapping_issues,
  integration_status,
  tech_comments,
  integrations
) {
  // Validate request data
  const { error, value } = sourceDataValidationSchema.validate({
    authorityName,
    url,
    countryId,
    regionId,
    stateId,
    GDP,
    format,
    datatype,
    coverage,
    sourceType,
    cost,
    comment,
    language,
    portal_range,
    contains_UBOs,
    keys,
    mapping_issues,
    tech_comments,
    integrations,
  });
  if (error) {
    throw new Error(error.message);
  }

  if (countryId.length == 0) {
    throw new Error("Atleast one country should be selected");
  }

  const existingUrl = await Model.Source_data.findOne({
    where: {
      url: url,
    },
  });

  // Check if the region exists within the transaction
  const region = await Model.Regions.findOne({
    where: {
      id: regionId,
    },
    raw: true,
  });

  if (!region) {
    throw new Error("Region with this name does not exist");
  }

  if (integrations == true && !integration_status) {
    throw new Error("Integration Status can not be empty");
  }

  let langaueName;
  if (language != null && language != undefined) {
    console.log(language);
    // Check if the region exists within the transaction
    const languageName = await Model.Languages.findOne({
      where: {
        id: language,
      },
      raw: true,
    });

    if (!languageName) {
      throw new Error("Language with this name does not exist");
    }
    langaueName = languageName.language_name;
  } else {
    langaueName = null;
  }

  let storedFormatName;
  if (format != null && format != undefined) {
    // Check if the region exists within the transaction
    const formatName = await Model.Source_types.findOne({
      where: {
        id: format,
      },
      raw: true,
    });

    if (!formatName) {
      throw new Error("Format with this name does not exist");
    }
    storedFormatName = formatName.source_type;
  } else {
    storedFormatName = null;
  }

  let state;
  if (stateId != null && stateId != undefined) {
    // Check if the region exists within the transaction
    const stateD = await Model.States.findOne({
      where: {
        id: stateId,
      },
      raw: true,
    });

    if (!stateD) {
      throw new Error("State with this name does not exist");
    }
    state = stateD;
  } else {
    state = null;
  }

  console.log("Country Name");

  const countryNames = [];
  for (id of countryId) {
    const countrywithName = await Model.Countries.findOne({
      where: {
        id: id,
      },
      raw: true,
    });

    if (!countrywithName) {
      throw new Error(
        `Country with ID ${id} does not exist in the Country table`
      );
    }
    countryNames.push(countrywithName.country_name);
  }
  return {
    state,
    existingUrl,
    countryNames,
    storedFormatName,
    langaueName,
    region,
  };
}

const createLinkedUrlsAndSourceDataWithState = async (
  sourceUrlId,
  allCountries,
  countryId,
  state,
  stateId,
  transaction
) => {
  if (state === null) {
    // Create linked URLs within the transaction
    await Promise.all(
      countryId.map(async (id) => {
        await Model.Linked_urls.create(
          {
            url_id: sourceUrlId,
            country_id: id,
          },
          { transaction }
        );
      })
    );
  } else {
    console.log(countryId);
    console.log(state.country_id);
    const checkStateID = allCountries.includes(state.country_id)
      ? state.state_name
      : false;
    if (checkStateID === false) {
      console.log(checkStateID);
      throw new Error("Select correct state for country");
    }

    // Create linked URLs within the transaction
    await Promise.all(
      countryId.map(async (id) => {
        await Model.Linked_urls.create(
          {
            url_id: sourceUrlId,
            country_id: id,
            state_id: state.id === id ? stateId : null,
          },
          { transaction }
        );
      })
    );
  }
};

const createSource = async (req, res) => {
  const transaction = await Model.sequelize.transaction(); // Start a transaction

  try {
    const {
      authorityName,
      url,
      countryId,
      regionId,
      stateId,
      GDP,
      format,
      datatype,
      coverage,
      sourceType,
      cost,
      comment,
      language,
      portal_range,
      contains_UBOs,
      keys,
      mapping_issues,
      integration_status,
      tech_comments,
      integrations,
    } = req.body;

    let validationData;
    try {
      validationData = await validation(
        authorityName,
        url,
        countryId,
        regionId,
        stateId,
        GDP,
        format,
        datatype,
        coverage,
        sourceType,
        cost,
        comment,
        language,
        portal_range,
        contains_UBOs,
        keys,
        mapping_issues,
        integration_status,
        tech_comments,
        integrations
      );
    } catch (validationError) {
      return failureResponse(res, 400, validationError.message);
    }

    const {
      state,
      existingUrl,
      countryNames,
      storedFormatName,
      langaueName,
      region,
    } = validationData;

    console.log("====================");
    console.log(
      state,
      countryNames,
      existingUrl,
      storedFormatName,
      langaueName,
      region
    );

    if (existingUrl) {
      return failureResponse(res, 422, "URL already exists");
    }

    console.log("sourceUrl");
    // Create source URL within the transaction
    const sourceUrl = await Model.Source_url.create(
      {
        url: url,
      },
      { transaction }
    );

    try {
      await createLinkedUrlsAndSourceDataWithState(
        sourceUrl.id,
        countryId,
        countryId,
        state,
        stateId,
        transaction
      );
    } catch (error) {
      return failureResponse(res, 400, error.message);
    }

    const data = await Model.Source_data.create(
      {
        authorityName,
        url,
        urlID: sourceUrl.id,
        region_id: regionId,
        region_name: region.region_name,
        associateCountries: [...countryNames],
        state: state != null ? state.state_name : "",
        GDP,
        format: storedFormatName,
        datatype,
        coverage,
        sourceType,
        cost,
        comment,
        language: langaueName,
        portal_range,
        contains_UBOs,
        keys,
        mapping_issues,
        integration_status,
        tech_comments,
        integrations,
      },
      { transaction }
    );

    //extracting userName.
    const user = req.user;
    console.log("user", user);

    const modifiedBy = req.user.dataValues.full_name;
    const email = req.user.dataValues.email;
    console.log("modefied By", modifiedBy);

    // Exclude created and updated fields from the data object
const { id,urlID,createdAt, updatedAt,region_id,clickup_task, ...updatedDataWithoutTimestamps } = data.get();

console.log(typeof(updatedDataWithoutTimestamps))

    // Create history entry
    await Model.History.create(
      {
        source_id: data.id,
        previous_data: null,
        updated_data: updatedDataWithoutTimestamps,
        modified_by: modifiedBy,
        email:email,
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    return successResponse(
      res,
      "success",
      200,
      "Resource created successfully"
    );
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    return failureResponse(res, 500, error.message);
  }
};

const updateSource = async (req, res) => {
  const transaction = await Model.sequelize.transaction(); // Start a transaction

  try {
    const {
      id,
      authorityName,
      url,
      countryId,
      regionId,
      stateId,
      GDP,
      format,
      datatype,
      coverage,
      sourceType,
      cost,
      comment,
      language,
      portal_range,
      contains_UBOs,
      keys,
      mapping_issues,
      integration_status,
      tech_comments,
      integrations,
    } = req.body;
    let validationData;
    try {
      validationData = await validation(
        authorityName,
        url,
        countryId,
        regionId,
        stateId,
        GDP,
        format,
        datatype,
        coverage,
        sourceType,
        cost,
        comment,
        language,
        portal_range,
        contains_UBOs,
        keys,
        mapping_issues,
        integration_status,
        tech_comments,
        integrations
      );
    } catch (validationError) {
      return failureResponse(res, 400, validationError.message);
    }

    const { state, countryNames, storedFormatName, langaueName, region } =
      validationData;
    const existingUrl = await Model.Source_data.findOne({
      where: {
        id: id,
      },
    });

    console.log(existingUrl);
    if (!existingUrl) {
      return failureResponse(res, 404, "Source with this Id does not exist");
    }

    const existingCountryIdPromises = existingUrl.associateCountries.map(
      async (state) => {
        const country = await Model.Countries.findOne({
          attributes: ["id"],
          where: {
            country_name: state,
          },
          raw: true,
        });
        return country.id;
      }
    );

    const existingCountryId = await Promise.all(existingCountryIdPromises);

    existingCountryId.sort();
    countryId.sort();

    const areArraysEqual = (arr1, arr2) =>
      arr1.length === arr2.length &&
      arr1.every((val, index) => val === arr2[index]);

    console.log(
      existingCountryId,
      countryId,
      areArraysEqual(existingCountryId, countryId)
    );

    let previous_values = req.previousData;
    let updated_values = req.updatedData;

    console.log("==================================");
    console.log("ibraheem", previous_values, updated_values);

    //extracting userName.
    const user = req.user;
    console.log("user", user);
    const modifiedBy = req.user.dataValues.full_name;
    const email = req.user.dataValues.email;
    console.log("modefied By", modifiedBy);

    //tested
    if (
      existingUrl.url === url &&
      !areArraysEqual(countryId, existingCountryId)
    ) {
      console.log("Url not changed but countries are updated");
      // New countries not in existing countries
      const newCountriesNotInExisting = countryId.filter(
        (country) => !existingCountryId.includes(country)
      );

      try {
        await createLinkedUrlsAndSourceDataWithState(
          existingUrl.urlID,
          countryId,
          newCountriesNotInExisting,
          state,
          stateId,
          transaction
        );
      } catch (error) {
        return failureResponse(res, 400, error.message);
      }

      // Existing countries not in new countries
      const existingCountriesNotInNew = existingCountryId.filter(
        (country) => !countryId.includes(country)
      );

      for (existingCountryToBeDeleted of existingCountriesNotInNew) {
        const result = await Model.Linked_urls.destroy({
          where: {
            url_id: existingUrl.urlID,
            country_id: existingCountryToBeDeleted,
          },
        });
      }
      updated_values.countries = [...countryNames];
      previous_values.countries = [...existingUrl.associateCountries];

      console.log("==================================");
      console.log(previous_values, id, modifiedBy);
      console.log(updated_values);
      const data = await Model.History.create(
        {
          source_id: id,
          previous_data: previous_values,
          updated_data: updated_values,
          modified_by: modifiedBy,
        },
        { transaction }
      );

      console.log(data);

      await Model.Source_data.update(
        {
          authorityName: authorityName,
          region_id: regionId,
          region_name: region.region_name,
          associateCountries: [...countryNames],
          state: state != null ? state.state_name : "",
          GDP: GDP,
          format: storedFormatName,
          datatype: datatype,
          coverage: coverage,
          sourceType: sourceType,
          cost: cost,
          comment: comment,
          language: langaueName,
          portal_range: portal_range,
          contains_UBOs: contains_UBOs,
          keys: keys,
          mapping_issues: mapping_issues,
          integration_status: integration_status,
          tech_comments: tech_comments,
          integrations: integrations,
        },
        {
          where: { id: id },
        },
        { transaction }
      );
    } else if (
      //tested
      existingUrl.url !== url &&
      areArraysEqual(countryId, existingCountryId)
    ) {
      console.log("===================================");
      console.log("Url changed but countries are same");
      const checkIfNewUrlAlreadyExist = await Model.Source_url.findOne({
        where: {
          url: url,
        },
        raw: true,
      });

      if (checkIfNewUrlAlreadyExist) {
        return failureResponse(res, 404, "Source url already Exist");
      }

      const sourceLink = await Model.Source_url.update(
        {
          url: url,
        },
        {
          where: {
            url: existingUrl.url,
          },
        }
      );

      try {
        await createLinkedUrlsAndSourceDataWithState(
          existingUrl.urlID,
          countryId,
          countryId,
          state,
          stateId,
          transaction
        );
      } catch (error) {
        return failureResponse(res, 400, error.message);
      }

      await Model.Source_data.update(
        {
          authorityName: authorityName,
          url: url,
          region_id: regionId,
          region_name: region.region_name,
          state: state != null ? state.state_name : "",
          GDP: GDP,
          format: storedFormatName,
          datatype: datatype,
          coverage: coverage,
          sourceType: sourceType,
          cost: cost,
          comment: comment,
          language: langaueName,
          portal_range: portal_range,
          contains_UBOs: contains_UBOs,
          keys: keys,
          mapping_issues: mapping_issues,
          integration_status: integration_status,
          tech_comments: tech_comments,
          integrations: integrations,
        },
        {
          where: { id: id },
        },
        { transaction }
      );
    } else if (
      existingUrl.url !== url &&
      !areArraysEqual(countryId, existingCountryId) //tested
    ) {
      console.log("Url and countries are updated");
      const checkIfNewUrlAlreadyExist = await Model.Source_url.findOne({
        where: {
          url: url,
        },
        raw: true,
      });

      if (checkIfNewUrlAlreadyExist) {
        return failureResponse(res, 404, "Source url already Exist");
      }
      const sourceLink = await Model.Source_url.update(
        {
          url: url,
        },
        {
          where: {
            url: existingUrl.url,
          },
        }
      );

      // New countries not in existing countries
      const newCountriesNotInExisting = countryId.filter(
        (country) => !existingCountryId.includes(country)
      );

      try {
        await createLinkedUrlsAndSourceDataWithState(
          existingUrl.urlID,
          countryId,
          newCountriesNotInExisting,
          state,
          stateId,
          transaction
        );
      } catch (error) {
        return failureResponse(res, 400, error.message);
      }
      // Existing countries not in new countries
      const existingCountriesNotInNew = existingCountryId.filter(
        (country) => !countryId.includes(country)
      );

      for (ids of existingCountriesNotInNew) {
        console.log(ids);
        const result = await Model.Linked_urls.destroy({
          where: {
            url_id: existingUrl.urlID,
            country_id: ids,
          },
        });
      }

      await Model.Source_data.update(
        {
          authorityName: authorityName,
          url: url,
          region_id: regionId,
          region_name: region.region_name,
          associateCountries: [...countryNames],
          state: state != null ? state.state_name : "",
          GDP: GDP,
          format: storedFormatName,
          datatype: datatype,
          coverage: coverage,
          sourceType: sourceType,
          cost: cost,
          comment: comment,
          language: langaueName,
          portal_range: portal_range,
          contains_UBOs: contains_UBOs,
          keys: keys,
          mapping_issues: mapping_issues,
          integration_status: integration_status,
          tech_comments: tech_comments,
          integrations: integrations,
        },
        {
          where: { id: id },
        },
        { transaction }
      );

      updated_values.countries = [...countryNames];
      previous_values.countries = [...existingUrl.associateCountries];
    } else {
      console.log("both note chnaged");

      try {
        await createLinkedUrlsAndSourceDataWithState(
          existingUrl.urlID,
          countryId,
          countryId,
          state,
          stateId,
          transaction
        );
      } catch (error) {
        return failureResponse(res, 400, error.message);
      }
      await Model.Source_data.update(
        {
          authorityName: authorityName,
          url: url,
          region_id: regionId,
          region_name: region.region_name,
          state: state != null ? state.state_name : "",
          GDP: GDP,
          format: storedFormatName,
          datatype: datatype,
          coverage: coverage,
          sourceType: sourceType,
          cost: cost,
          comment: comment,
          language: langaueName,
          portal_range: portal_range,
          contains_UBOs: contains_UBOs,
          keys: keys,
          mapping_issues: mapping_issues,
          integration_status: integration_status,
          tech_comments: tech_comments,
          integrations: integrations,
        },
        {
          where: { id: id },
        },
        { transaction }
      );
    }

    await Model.History.create(
      {
        source_id: id,
        previous_data: previous_values,
        updated_data: updated_values,
        modified_by: modifiedBy,
        email:email
      },
      { transaction }
    );

    await transaction.commit();
    return successResponse(
      res,
      "success",
      200,
      "Resource Updated Successfully"
    );
  } catch (error) {
    await transaction.rollback();
    return failureResponse(res, 500, error.message);
  }
};

module.exports = { createSource, updateSource };