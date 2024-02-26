const Model = require("../database/models");
const { successResponse, failureResponse } = require("../helper/responses");

const getHistory = async (req, res) => {
  // const sourceId = req.body.id;
  const {id}  = req.params;
  try {
    console.log("sourceId", id);
    const existingHistory = await Model.History.findAll({
      where: {
        source_id: id,
      },
      attributes: {
        exclude: ["id", "createdAt"],
      },
      order: [["id", "DESC"]],
    });
    
    if (existingHistory.length === 0) {
      return failureResponse(res, 404, 'Requested source does not exist in the database');
    } else {
      // Transform the response before sending
      const transformedData = existingHistory.map(history => {
        return {
          source_id: history.source_id,
          previous_data: transformObjectToArray(history.previous_data),
          updated_data: transformObjectToArray(history.updated_data),
          modified_by: history.modified_by,
          email: history.email,
          updatedAt: history.updatedAt,
        };
      });
     return successResponse(res, "success",200,"Source fetched successfully", (data = transformedData));
    }

  } catch (error) {
    console.error("Error retrieving history:", error);
    return failureResponse(res, 500, error.message);
  }
};

function transformObjectToArray(obj) {
  if (!obj) {
    return [];
  }
  return Object.entries(obj).map(([key, value]) => {//[key,value]-->values of key,values
    return { key, value };
  });
}

///////////////////////////////////////////////

module.exports = { getHistory };
