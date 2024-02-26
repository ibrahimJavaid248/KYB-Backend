const Model = require("../database/models")
const Queue = require("bull");
const reader = require("xlsx");

const sourceTypeQueue= new Queue("sourcetype");

sourceTypeQueue.process(async (job) => {
  const { sourceType } = job.data;
  console.log(job.data);
  try {
    console.log(job.id);
  
  
    await Model.Source_types.findOrCreate({
      where: { source_type: sourceType },
      defaults: {
        source_type: sourceType
      },
    });
  } catch (error) {
    console.error("Error processing job:", error.message);
  }
});
module.exports = { sourceTypeQueue };
