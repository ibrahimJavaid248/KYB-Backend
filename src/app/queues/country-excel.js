const Model = require("../database/models")
const Queue = require("bull");
const reader = require("xlsx");

const countryQueue= new Queue("country");

countryQueue.process(async (job) => {
  const { country, region, gdp, gdp_us_millions } = job.data;
  console.log(job.data);
  try {
    console.log(job.id);
    if (region === undefined && country === undefined) {
      return "region or country is not present";
    }
    console.log(region)
    let regionName = region; // Use let instead of const

    let regionInstance = null;
    if (country === "Global") {
      regionName = 'All';
    }

    if (regionName !== null) {
      regionInstance = await Model.Regions.findOne({
        where: { region_name: regionName },
      });
    }
    
    console.log(regionInstance)
    console.log(regionName, regionInstance ? regionInstance.id : null)

   

    await Model.Countries.findOrCreate({
      where: { country_name: country },
      defaults: {
        country_name: country,
        region_name: regionName,
        region_id: regionInstance.id ? regionInstance.id : 8 , 
        gdp_year: gdp !== undefined ? gdp : "",
        gdp_amount: gdp_us_millions
      },
    });
  } catch (error) {
    console.error("Error processing job:", error.message);
  }
});


module.exports = { countryQueue };
