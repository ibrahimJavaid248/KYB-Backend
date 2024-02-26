const Model = require("../database/models")




const fetchRequiredData = async () => {
    try {
      // Use Sequelize queries to fetch the required data
      const data = await Model.Source_data.findAll({
        attributes: [
          'country',
          'region_name',
          [Model.sequelize.fn('SUM', Model.sequelize.col('GDP')), 'totalGDP'], // Use 'gdp' instead of 'GDP'
          [Model.sequelize.fn('COUNT', Model.sequelize.col('url')), 'sourceCount'],
        ],
  where: {
    integrations: false, // Add this condition
  },
        group: ['country', 'region_name'],
      });
  
    return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Internal Server Error');
    }
  };
  
  

async function test(){
    try {
        const result = await fetchRequiredData();
        console.log(result);
      } catch (error) {
        console.error('Error:', error.message);
      }
}

console.log('testing_function');
test();