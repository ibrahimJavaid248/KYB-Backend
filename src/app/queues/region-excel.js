const Queue = require("bull");
const Model = require('../database/models')
const reader = require("xlsx");

const regionQueue = new Queue("region", {
  // limiter: {
  //   max: 10,
  //   duration: 1000,
  // },
});

regionQueue.process(async (job) => {
  const { regionName } = job.data;

  try {
    console.log(job.id);


    if (regionName !== undefined) {
      await Model.Regions.findOrCreate({
        where: { region_name: regionName },
        defaults: {
          region_name: regionName,
          // total: total !== undefined ? total : 0,
          // cost: cost !== undefined ? cost : null,
          // source_type: sourceType !== undefined ? sourceType : null,
        },
      });
    }
  } catch (error) {
    console.error("Error processing job:", error.message);
  }
});
module.exports = { regionQueue };
