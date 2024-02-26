'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Integration_status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Integration_status.init({
    integration_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Integration_status',
  });
  return Integration_status;
};