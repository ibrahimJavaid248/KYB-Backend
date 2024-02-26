'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      History.belongsTo(models.Source_data, {
        foreignKey: 'source_id',
        as: 'Source_data',
      });
    }
  }
  History.init({
    source_id: DataTypes.INTEGER,
    previous_data: DataTypes.JSONB,
    updated_data: DataTypes.JSONB,
    modified_by: DataTypes.STRING,
    email:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'History',
  });
  return History;
};