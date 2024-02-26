const Model = require("../database/models")
const Queue = require("bull");
const reader = require("xlsx");

const languageQueue= new Queue("language");

languageQueue.process(async (job) => {
  const { language } = job.data;
  console.log(job.data);
  try {
    console.log(job.id);
  
  
    await Model.Languages.findOrCreate({
      where: { language_name: language },
      defaults: {
        language_name: language
      },
    });
  } catch (error) {
    console.error("Error processing job:", error.message);
  }
});
module.exports = { languageQueue };
