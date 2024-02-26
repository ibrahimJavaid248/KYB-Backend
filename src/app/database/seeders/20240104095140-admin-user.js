'use strict';
const bcrypt = require("bcrypt");
const config = require('../../../app/config/config')

const EMAIL = config.ADMIN_EMAIL;
const PASSWORD = config.ADMIN_PASSWORD;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(PASSWORD, 12); 
   
      await queryInterface.bulkInsert('Users', [{
        full_name: 'admin',
        email:EMAIL,
        password: hashedPassword,
        is_active:true,
        // created_by:"admin",
       createdAt: new Date(),
       updatedAt: new Date()
  }], {});
    
  },

  async down (queryInterface, Sequelize) {
  
     await queryInterface.bulkDelete('Users', null, {});
  }
};
