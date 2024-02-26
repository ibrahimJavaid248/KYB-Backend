// const {SourceList} = require('../database/models/source-listing')
const { Op, Sequelize } = require('sequelize');
const { successResponse, failureResponse } = require('../helper/responses')
const Model = require("../database/models")
const { isValid } = require('date-fns')
const { format } = require('date-fns');
const languages = require('../database/models/languages');


const getAllSource = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const startCreatedAt = req.query.startCreatedAt || '';
    const endCreatedAt = req.query.endCreatedAt || '';
    const startUpdatedAt = req.query.startUpdatedAt || '';
    const endUpdatedAt = req.query.endUpdatedAt || '';
    const countryWithId = req.query.countryWithId || '';
    const duplicateUrlId = req.query.showDuplicate || false;
    const sourceType = req.query.sourceType || '';
    const cost = req.query.cost || '';
    const regionWithId = req.query.regionWithId || '';
    const integrationStatus = req.query.integrationStatus || '';
    const containUbos =  req.query.containUbos || '';

    //single search on below column
    const searchTermWithSpaces = searchTerm.replace(/ /g, '%');


    let filterCriteria = {
      [Op.or]: [
        { authorityName: { [Op.iLike]: `%${searchTermWithSpaces}%` } },
        { url: { [Op.iLike]: `%${searchTermWithSpaces}%` } },
        { comment: { [Op.iLike]: `%${searchTermWithSpaces}%` } },
        { tech_comments: { [Op.iLike]: `%${searchTermWithSpaces}%` } },
      ],
    };

    if (countryWithId) {
      let countryIds = JSON.parse(countryWithId)
      const countryIdsArray = await getIdsByModel(Model.Linked_urls, countryIds, "country_id", "url_id");
      console.log("Country object Array with function", countryIdsArray);
      filterCriteria = await applyFilterCriteria(filterCriteria, 'urlID', countryIdsArray);

    }

    if (regionWithId) {
      console.log("region with id", regionWithId)
      regionIds = JSON.parse(regionWithId)
      const regionIdsArray = await getIdsByModel(Model.Countries, regionIds, "region_id", "id");
      console.log("Find All countries Id with Function", regionIdsArray)
      const urlIdsArray = await getIdsByModel(Model.Linked_urls, regionIdsArray, "country_id", "url_id");
      console.log("Find All url Id with countries Id Arrays", urlIdsArray)
      filterCriteria = await applyFilterCriteria(filterCriteria, 'urlID', urlIdsArray);

    }

    if (duplicateUrlId) {

      const duplicateUrls = await filterByDuplicateUrlId()
      filterCriteria = await applyFilterCriteria(filterCriteria, 'urlID', duplicateUrls);

    }

    if (integrationStatus) {
      console.log(integrationStatus)
      let integrationStatusArray = JSON.parse(integrationStatus)
      console.log(integrationStatusArray)
      filterCriteria = {
        [Op.and]: [
          filterCriteria,
          { integration_status: { [Op.in]: integrationStatusArray } },
        ],
      };

    }

    // filter on start created At
    filterByDateRange(startCreatedAt, endCreatedAt, 'createdAt', filterCriteria);

    // filter on start Updated At
     filterByDateRange(startUpdatedAt, endUpdatedAt, 'updatedAt', filterCriteria);

    //filter on coverage
    if (req.query.coverage) {
      filterCriteria.coverage = { [Op.iLike]: `%${req.query.coverage}%` };
    }

    //filter on sourceType
    if (sourceType) {
      filterCriteria = applyFilter(filterCriteria, 'sourceType', sourceType);
    }

    //filter on cost
    if (cost) {
      filterCriteria = applyFilter(filterCriteria, 'cost', cost);
    }

    if(containUbos){
      filterCriteria = applyFilter(filterCriteria, 'contains_UBOs', containUbos);
    }

    //filter on dataType
    if (req.query.datatype) {
      filterCriteria.datatype = { [Op.iLike]: `%${req.query.datatype}%` };
    }


    //filter on language
    if (req.query.language) {
      try {

        const getLanguage = await Model.Languages.findOne({
          where: {
            id: req.query.language
          }
        })
        if (!getLanguage) {
          return failureResponse(res, 400, "Sorry No language Found");
        }
        const languageName = getLanguage.dataValues.language_name
        filterCriteria.language = { [Op.iLike]: `%${languageName}%` };



      } catch (error) {
        return failureResponse(res, 400, error.message);
      }

    }

    //filter on format
    if (req.query.format) {
      try {
        const getFormat = await Model.Source_types.findOne({
          where: {
            id: req.query.format
          }
        })
        if (!getFormat) {
          return failureResponse(res, 400, "Sorry No Format Found");
        }

        const formatName = getFormat.dataValues.source_type
        filterCriteria.format = { [Op.iLike]: `%${formatName}%` };
      }
      catch (error) {
        return failureResponse(res, 400, error.message);
      }

    }

    //filter on integrations
    if (req.query.integrations) {
      filterCriteria.integrations = req.query.integrations === 'true';
    }






    const offset = (page - 1) * limit;

    //Total data in database count
    const totalRecords = await Model.Source_data.count()

    //Total count with filterations
    const totalCount = await Model.Source_data.count({ where: filterCriteria });

    //Apply Filter on limit
    if (limit === -1) {
      limit = totalRecords;
    }

    // Filtration on source Data Table
    const sourceList = await Model.Source_data.findAll({
      where: filterCriteria,
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(totalCount / limit);


    const pagination = {
      totalRecords,
      currentPage: page,
      limit: limit,
      totalCount: totalCount,
      totalPages: totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const response = {
      source: sourceList,
      pagination
    };


    return successResponse(res, 'success', 200, 'Source shown successfully', response);
  } catch (error) {

    console.error(error);
    return failureResponse(res, 400, error.message);
  }
};




async function getIdsByModel(Model, idArray, idField, attributValue) {
  console.log("Generic Function is invoking................")
  const resultIds = [];

  for (const id of idArray) {
    const data = await Model.findAll({
      where: {
        [idField]: id
      },
      attributes: [attributValue]
    });
    const modelIds = data.map(entry => entry[attributValue]);
    resultIds.push(...modelIds);
  }

  return resultIds;
}

async function applyFilterCriteria(filterCriteria, property, values) {
  console.log("Filter Critera Function Invoking.....")
  return {
    [Op.and]: [
      filterCriteria,
      { [property]: { [Op.in]: values } },
    ],
  };
}

async function filterByDuplicateUrlId() {

  const data = await Model.Linked_urls.findAll({
    attributes: ['url_id'],
    group: ['url_id'],
    having: Sequelize.literal('COUNT(DISTINCT country_id) > 1'),
  });

  const urlIds = data.map((entry) => entry.dataValues.url_id);

  return urlIds;
}

function filterByDateRange(start, end, property, filterCriteria) {
  if (start && end) {
    let validStartDate = isValid(new Date(start)) ? new Date(start) : null;
    let validEndDate = isValid(new Date(end)) ? new Date(end) : null;

    if (validStartDate && validEndDate && validStartDate > validEndDate) {
      [validStartDate, validEndDate] = [validEndDate, validStartDate];
    }

    validEndDate.setHours(23, 59, 59, 999);

    if (validStartDate && validEndDate) {
      filterCriteria[property] = {
        [Op.between]: [validStartDate, validEndDate],
      };
    }
  }
}

function applyFilter(criteria, key, value) {
  return {
    ...criteria,
    [key]: value
  };
}






module.exports = { getAllSource }