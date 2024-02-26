const Model = require("../../database/models");
const { successResponse, failureResponse } = require("../../helper/responses");

const getRegions = async (req, res, next) => {
  try {
    const sourceCountByRegion = await Model.Source_data.findAll({
      attributes: [
        "region_name",
        [Model.sequelize.fn("COUNT", Model.sequelize.col("region_id")), "total"],
        [
          Model.sequelize.fn(
            "SUM",
            Model.sequelize.literal(
              "CASE WHEN \"sourceType\" = 'Un-Official' AND \"cost\" = 'Paid' THEN 1 ELSE 0 END"
            )
          ),
          "totalUnOfficialPaid",
        ],
        [
          Model.sequelize.fn(
            "SUM",
            Model.sequelize.literal(
              "CASE WHEN \"sourceType\" = 'Un-Official' AND \"cost\" = 'Free' THEN 1 ELSE 0 END"
            )
          ),
          "totalUnOfficialFree",
        ],
        [
          Model.sequelize.fn(
            "SUM",
            Model.sequelize.literal(
              "CASE WHEN \"sourceType\" = 'Official' AND \"cost\" = 'Paid' THEN 1 ELSE 0 END"
            )
          ),
          "totalOfficialPaid",
        ],
        [
          Model.sequelize.fn(
            "SUM",
            Model.sequelize.literal(
              "CASE WHEN \"sourceType\" = 'Official' AND \"cost\" = 'Free' THEN 1 ELSE 0 END"
            )
          ),
          "totalOfficialFree",
        ],
      ],
      group: ["region_name"],
    });

    return successResponse(
      res,
      "success",
      200,
      "data fetched successfully",
      sourceCountByRegion
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    return failureResponse(res, 400, "Invalid");
  }
};

module.exports = { getRegions };

// get();
