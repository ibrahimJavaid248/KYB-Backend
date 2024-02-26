'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Countries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country_name: {
        type: Sequelize.STRING
      },
      region_name: {
        type: Sequelize.STRING,
      },
      region_id: {
        type: Sequelize.INTEGER,
      },
      gdp_year: {
        type: Sequelize.STRING,
      },
      gdp_amount: {
        type: Sequelize.FLOAT,
      },
      source_count: {
        type: Sequelize.INTEGER,
      },
      duplicate:{
        type: Sequelize.INTEGER,
      },
      countryDup:{
        type : Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('Countries');
  }
};