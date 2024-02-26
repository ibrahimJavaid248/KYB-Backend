'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Error_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Error_logs.init({
    error_message: DataTypes.STRING,
    error_code : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Error_logs',
  });
  return Error_logs;
};