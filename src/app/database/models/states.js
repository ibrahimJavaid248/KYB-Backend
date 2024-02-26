'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class States extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  States.init({
    state_name: DataTypes.STRING,
    country_id : DataTypes.INTEGER,
    gdp_year: DataTypes.STRING,
    gdp_amount: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'States',
  });
  return States;
};