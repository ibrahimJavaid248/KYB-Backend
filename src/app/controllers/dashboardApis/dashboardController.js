const Model = require("../../database/models");
const { Sequelize ,Op} = require("sequelize");

const { successResponse, failureResponse } = require("../../helper/responses");

const getCountries = async (req, res, next) => {
  try {
    // Custom pagination parameters
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || '';

    // Calculate start and end indices for the custom page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;


    let filterCriteria = {
      [Op.or]: [
        { country_name: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const data = await Model.Countries.findAll({
      attributes: [
        "id",
        "country_name",
        "region_name",
        "gdp_amount",
        [
          Model.sequelize.fn(
            "COUNT",
            Model.sequelize.col("Linked_urls.url_id")
          ),
          "sourceCount",
        ],
      ],
      include: [
        {
          model: Model.Linked_urls,
          attributes: [], // Empty array to prevent including Linked_urls columns in SELECT clause
          as: "Linked_urls", // Specify the alias using the 'as' keyword
          on: {
            "$Countries.id$": {
              [Model.Sequelize.Op.col]: "Linked_urls.country_id",
            },
          },
        },
      ],
      where: filterCriteria,
      group: ["Countries.id", "country_name", "region_name", "gdp_amount"],
      order: [[Model.sequelize.literal('"Countries"."country_name"')]],
      //order: [[Model.sequelize.literal('"Countries"."id"')]],
      raw: true,
    });
    ////////////////////////////////////////////////

    ///////////////////////////////////////////////
    for (let i = 0; i < data.length; i++) {
      const countryUrls = await Model.Linked_urls.findAll({
        attributes: ["url_id"],
        where: {
          country_id: data[i].id,
        },
        raw: true,
      });
      // console.log(countryUrls)

      // Extract the URLs into an array
      const urlsArray = countryUrls.map((url) => url.url_id);

      // Now, 'urlsArray' contains the array of 'url_id' values for the specified country.
      console.log(`URLs for country ID ${data[i].id}:`, urlsArray);

      // You can store 'urlsArray' wherever you need in your data or perform other operations with it.
      // data[i]["UrlsArray"] = urlsArray;
      let duplicateCounter = 0;
      if (!countryUrls || countryUrls.length === 0) {
        data[i]["Duplicate"] = duplicateCounter;
        data[i]["Not Integrated"] = 0; // Set to 0 when urlsArray is empty
        data[i]["integrated"] = 0; // Set to 0 when urlsArray is empty
      } else {
        for (let j = 0; j < countryUrls.length; j++) {
          console.log(countryUrls[j], data[i].id);
          let duplicate = await Model.Linked_urls.findOne({
            where: {
              url_id: countryUrls[j].url_id,
              country_id: {
                [Sequelize.Op.not]: data[i].id,
              },
            },
          });
          // console.log(duplicate)

          if (duplicate) {
            duplicateCounter++;
          }
        }
      }
      data[i]["Duplicate"] = duplicateCounter;
      let integrated = 0;
      let notIntegrated = 0;
      for (url of urlsArray) {
        const result = await Model.Source_data.findOne({
          where: {
            urlID: url,
          },
          raw: true,
        });
        console.log(result);
        if (result != null && result.integrations != null) {
          if (result.integrations == true) {
            integrated++;
          } else if (result.integrations == false) {
            notIntegrated++;
          }
        }
      }

      data[i]["Not Integrated"] = notIntegrated;
      data[i]["integrated"] = integrated;
    }

    let totalPages = Math.ceil(data.length / limit);
    console.log("totalPages", totalPages);
    // Extract the records for the custom page
    const paginatedData = data.slice(startIndex, endIndex);

    if (limit === -1) {
      limit = data.length;
    }

    if (totalPages < 1) {
      totalPages = 1;
    }

    const response = {
      countries: paginatedData,
    };

    const pagination = {
      currentPage: page,
      limit,
      totalPages,
      total: data.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    return successResponse(
      res,
      "success",
      200,
      "data fetched successfully",
      response,
      null,
      pagination
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return failureResponse(res, 400, error.message);
  }
};

const getCountriesWithNoIntegrations = async (req, res, next) => {
  try {
    // Custom pagination parameters
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Calculate start and end indices for the custom page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Use Sequelize queries to fetch the required data

    const data = await Model.Source_data.findAll({
      attributes: ["country"],
      where: {
        integrations: false,
      },
      group: ["country"],
      order: ["country"],
      raw: true,
    });

    console.log(data);
    for (let i = 0; i < data.length; i++) {
      const countryId = await Model.Countries.findOne({
        attributes: ["id", "country_name", "region_name", "gdp_amount"],
        where: {
          country_name: data[i].country,
        },
        raw: true,
      });

      console.log(countryId);

      if (countryId == null || countryId === undefined) {
        console.log(data.country);
        data[i]["region_name"] = null;
        data[i]["GDPAmount"] = null;
        data[i]["SourceCount"] = null;
        continue;
      }
      const sourceUrl = await Model.Linked_urls.findAll({
        attributes: ["url_id"],
        where: {
          country_id: countryId.id,
        },
        raw: true,
      });
      console.log(sourceUrl);
      data[i]["region_name"] = countryId.region_name;
      data[i]["GDPAmount"] = countryId.gdp_amount;

      let noIntegrated = 0;
      for (url of sourceUrl) {
        const result = await Model.Source_data.findOne({
          where: {
            urlID: url.url_id,
            integrations: false,
          },
        });
        if (result) {
          noIntegrated++;
        }
      }
      data[i]["SourceCount"] = noIntegrated;

      // console.log(object);
    }
    console.log("data.length", data.length);
    let totalPages = Math.ceil(data.length / limit);
    console.log("totalPages", totalPages);
    // Extract the records for the custom page
    const paginatedData = data.slice(startIndex, endIndex);
    if (limit === -1) {
      limit = data.length;
    }

    const response = {
      countries: paginatedData,
    };
    // console.log("before" , totalPages)
    if (totalPages < 1) {
      totalPages = 1;
    }
    console.log("after", totalPages);
    const pagination = {
      currentPage: page,
      limit,
      totalPages,
      total: data.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
    return successResponse(
      res,
      "success",
      200,
      "data fetched successfully",
      response,
      null,
      pagination
    );
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return failureResponse(res, 400, error.message);
  }
};

module.exports = { getCountries, getCountriesWithNoIntegrations };
