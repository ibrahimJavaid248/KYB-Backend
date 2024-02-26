const {getCountries,getCountriesWithNoIntegrations} = require('../controllers/dashboardApis/dashboardController');
const {getRegions} = require("../controllers/dashboardApis/regionController")
const {authorizeUser} = require("../middleware/auth")
const express = require('express');
const countryRouter = express.Router();
const {dashBoardChart} = require('../controllers/dashboardChart')

//countryRouter.get('/get-countries/', authorizeUser,getCountries);

countryRouter.get('/get-countries/',getCountries);
countryRouter.get('/get-countries-with-no-integrations/' , authorizeUser,getCountriesWithNoIntegrations);
countryRouter.get('/get-regions/' , authorizeUser,getRegions);
countryRouter.get('/dashboard-chart' , authorizeUser,dashBoardChart);

module.exports = {countryRouter};