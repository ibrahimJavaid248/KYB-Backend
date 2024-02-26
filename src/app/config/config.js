const dotenv = require('dotenv');
const path = require('path');
const testEnv = dotenv.config({path : path.join(__dirname, '../../.env')});

if (testEnv.error) {
  throw testEnv.error;
}

console.log(process.env);
module.exports = {
    DATABASE_USERNAME: process.env.DB_USERNAME,
    DATABASE_PASSWORD : process.env.DB_PASSWORD,
    DATABASE_NAME : process.env.DB_NAME,
    DATABASE_HOST : process.env.DB_HOST,
    PORT: process.env.PORT,
    DB_PORT: process.env.DB_PORT,
    // ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    // ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
    ADMIN_EMAIL: 'admin@gmail.com',
    ADMIN_PASSWORD:'123456'

}