'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Source_types extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Source_types.init({
    source_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Source_types',
  });
  return Source_types;
};