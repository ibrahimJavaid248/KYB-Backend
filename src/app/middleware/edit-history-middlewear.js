const { format } = require("date-fns");
const Model = require("../database/models");

const { successResponse, failureResponse } = require("../helper/responses");

async function trackEditHistoryMiddleware(req, res, next) {
  try {
    const sourceId = req.body.id;
    // Previous object fetching
    const previous = await Model.Source_data.findByPk(sourceId, {
      attributes: {
        exclude: [
          "urlID",
          "country",
          "region_id",
          "associateCountries",
          "clickup_task",
          "createdAt",
          "updatedAt",
        ],
      },
      raw: true,
    });

    if (!previous) {
      return failureResponse(res, 404, "Source with this id not found");
    }

    console.log("previous Object", previous);

    const updatedWithNames = [];
    // Updated object fetching
    const updated = req.body;
    console.log("updated", updated);
    const {
      format,
      id,
      stateId,
      language,
      regionId,
      authorityName,
      GDP,
      url,
      datatype,
      coverage,
      sourceType,
      cost,
      comment,
      portal_range,
      contains_UBOs,
      keys,
      mapping_issues,
      integration_status,
      tech_comments,
      integrations,
    } = req.body;
    console.log('id of source from request Body is',id);
    if (format) {
      let formatName = await Model.Source_types.findByPk(format);
      formatName = formatName ? formatName.source_type : null;
      updatedWithNames.push({ format: formatName });
    } else {
      updatedWithNames.push({ format: null });
    }

    if (stateId) {
      let stateName = await Model.States.findByPk(stateId);
      stateName = stateName ? stateName.state_name : "";
      updatedWithNames.push({ state: stateName });
      // return
    } else {
      updatedWithNames.push({ state: "" });
    }

    if (language) {
      let languageName = await Model.Languages.findByPk(language);
      languageName = languageName ? languageName.language_name : null;
      updatedWithNames.push({ language: languageName });
    } else {
      updatedWithNames.push({ language: null });
    }
    if (regionId) {
      let regionName = await Model.Regions.findByPk(regionId);
      regionName = regionName ? regionName.region_name : null;
      updatedWithNames.push({ region_name: regionName });
    } else {
      updatedWithNames.push({ region_name: null });
    }
    if (GDP) {
      updatedWithNames.push({ GDP: GDP });
    } else {
      updatedWithNames.push({ GDP: null });
    }
    if (id) {
      updatedWithNames.push({ id: id });
    }
    if (url) {
      updatedWithNames.push({ url: url });
    }
    if (datatype) {
      updatedWithNames.push({ datatype: datatype });
    }
    if (coverage) {
      updatedWithNames.push({ coverage: coverage });
    }
    if (sourceType) {
      updatedWithNames.push({ sourceType: sourceType });
    }
    if (cost) {
      updatedWithNames.push({ cost: cost });
    }
    if (comment) {
      updatedWithNames.push({ comment: comment });
    } else {
      updatedWithNames.push({ comment: "" });
    }
    if (tech_comments) {
      updatedWithNames.push({ tech_comments: tech_comments });
    } else {
      updatedWithNames.push({ tech_comments: "" });
    }
    if (portal_range) {
      updatedWithNames.push({ portal_range: portal_range });
    } else {
      updatedWithNames.push({ portal_range: "" });
    }
    if (contains_UBOs) {
      updatedWithNames.push({ contains_UBOs: contains_UBOs });
    }
    if (keys) {
      updatedWithNames.push({ keys: keys });
    } else {
      updatedWithNames.push({ keys: "" });
    }
    if (mapping_issues) {
      updatedWithNames.push({ mapping_issues: mapping_issues });
    } else {
      updatedWithNames.push({ mapping_issues: "" });
    }
    if (integration_status) {
      updatedWithNames.push({ integration_status: integration_status });
    } else {
      updatedWithNames.push({ integration_status: "" });
    }
    if (integrations) {
      console.log('integrations',integrations);
      updatedWithNames.push({ integrations: integrations });
    }else {
      updatedWithNames.push({ integrations: false });
    }
    if (authorityName) {
      updatedWithNames.push({ authorityName: authorityName });
    }

    console.log("updated object", updated);

    console.log("updatedWithNames", updatedWithNames);
    // Convert the array of objects to a single object
    const updatedObjectWithNames = Object.assign({}, ...updatedWithNames);

    console.log("updatedObjectWithNames", updatedObjectWithNames);

    // Function for determining modified fields
    const changedKeys = Object.keys(previous).filter((key) => {
      if (
        Array.isArray(previous[key]) &&
        Array.isArray(updatedObjectWithNames[key])
      ) {
        return (
          JSON.stringify(previous[key]) !==
          JSON.stringify(updatedObjectWithNames[key])
        );
      } else {
        return previous[key] !== updatedObjectWithNames[key];
      }
    });

    const modifiedField = changedKeys.join(", ");
    console.log("modifiedField", modifiedField);
    let prevValue = {};
    let updValue = {};
    for (const key of changedKeys) {
      prevValue[key] = previous[key];
      updValue[key] = updatedObjectWithNames[key];
    }
    console.log("preValue", prevValue);
    console.log("updValue", updValue);
    req.updatedData = updValue;
    req.previousData = prevValue;

    next();
  } catch (error) {
    console.error("Error in history tracking middleware:", error);
    return failureResponse(res, 500, error.message);
  }
}

module.exports = { trackEditHistoryMiddleware };
