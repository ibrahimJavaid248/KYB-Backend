const Model = require("../../database/models");
const { successResponse, failureResponse } = require("../../helper/responses");

const getLanguages = async (req, res) => {
  try {
    const result = await Model.Languages.findAll({
      attributes: [
        ["language_name", "label"],
        ["id", "id"],
      ],
      order:["language_name"],
      raw: true,
    });
    console.log(result);
    return successResponse(
      res,
      "success",
      200,
      "data fetched successfully",
      result
    );
  } catch (error) {
    return failureResponse(res, 400, "Invalid");
  }
};

const getSourcetype = async (req, res) => {
  try {
    const result = await Model.Source_types.findAll({
      attributes: [
        ["source_type", "label"],
        ["id", "id"],
      ],
      raw: true,
    });

    console.log(result);

    return successResponse(
      res,
      "success",
      200,
      "data fetched successfully",
      result
    );
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

const getCountries = async (req, res) => {
  try {
    const result = await Model.Countries.findAll({
      attributes: [
        ["country_name", "label"],
        ["id", "id"],
      ],

      order : ['country_name'],
      raw: true,
    });

    console.log(result);
    return successResponse(
      res,
      "success",
      200,
      "data fetched successfully",
      result
    );
  } catch (error) {
    return failureResponse(res, 400, "Invalid");
  }
};

const getRegions = async(req,res)=>{
  try {
    const result = await Model.Regions.findAll({
      attributes: [
        ["region_name", "label"],
        ["id", "id"],
      ],
      raw: true,
    });

    console.log(result);
    return successResponse(
      res,
      "success",
      200,
      "Regions fetched successfully",
      result
    );
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
}

const getState = async(req,res)=>{  
  // Remove connection with region model and establish  with sate model
  try {
    const result = await Model.States.findAll({
      attributes: [
        ["state_name", "label"],
        ["id", "id"],
      ],
      order:["state_name"],
      raw: true,
    });

    console.log(result);
    return successResponse(
      res,
      "success",
      200,
      "states fetched successfully",
      result
    );
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
}



module.exports = { getLanguages, getSourcetype, getCountries , getRegions , getState};
