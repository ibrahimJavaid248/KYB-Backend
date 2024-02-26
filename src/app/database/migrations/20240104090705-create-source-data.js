'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Source_data', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      authorityName: {
        type: Sequelize.TEXT
      },
   url :{
    type: Sequelize.TEXT
   },
   urlID :{
    type: Sequelize.INTEGER,
   },
   country: {
     type: Sequelize.TEXT,
   
   },
   state: {
    type: Sequelize.TEXT,
  
  },
   region_name : {
    type : Sequelize.TEXT
   },
   region_id : {
    type: Sequelize.INTEGER,
   },
   associateCountries: {
     type: Sequelize.ARRAY(Sequelize.TEXT),
   },
   GDP:{
    type : Sequelize.FLOAT,
   },
   format :{
    type: Sequelize.TEXT
   },
   datatype :{
    type: Sequelize.TEXT
   },
   coverage:{
    type: Sequelize.TEXT
   },
   sourceType :{
    type: Sequelize.TEXT
   },
   cost :{
    type : Sequelize.TEXT
   },
   comment : {
    type: Sequelize.TEXT
   },
   language : {
    type : Sequelize.TEXT
   },
   portal_range : {
    type: Sequelize.TEXT
   },
   contains_UBOs : {
    type : Sequelize.TEXT
   },
   keys : {
    type : Sequelize.TEXT
   },
   mapping_issues : {
    type : Sequelize.TEXT
   },
   integration_status : {
    type : Sequelize.TEXT
   },
   clickup_task : {
    type : Sequelize.TEXT
   },
   tech_comments : {
    type : Sequelize.TEXT
   },
   integrations : {
    type: Sequelize.BOOLEAN
   },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Source_data');
  }
};