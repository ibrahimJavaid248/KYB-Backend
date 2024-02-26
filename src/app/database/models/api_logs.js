'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Api_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Api_logs.init({
    user_name: DataTypes.STRING,
    email : DataTypes.STRING,
    user_agent: DataTypes.STRING,
    methos : DataTypes.STRING,
    req_body : DataTypes.STRING,
    endpoint : DataTypes.STRING,
    status_code : DataTypes.STRING,
    res_body : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Api_logs',
  });
  return Api_logs;
};