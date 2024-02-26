
require('dotenv').config({path: '../../../.env'});
const config = require('../../../app/config/config')

const username = config.DATABASE_USERNAME;
const password = config.DATABASE_PASSWORD;
const database = config.DATABASE_NAME;
const host = config.DATABASE_HOST;

console.log(username,password,database,host);
module.exports = {
  development: {
    username: username,
    password: password,
    database: database,
    host: host,
    dialect: "postgres",
  },
  // development: {
  //   username: "testing_user",
  //   password: "testing123",
  //   database: "testing",
  //   host: "localhost",
  //   dialect: "postgres"
  // },
};