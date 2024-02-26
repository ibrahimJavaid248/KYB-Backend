'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Source_data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Source_data.hasMany(models.History, {
        foreignKey: 'source_id',
        as: 'histories',
      });
    }
  }
  Source_data.init({
    authorityName: DataTypes.STRING,
    url : DataTypes.TEXT,
    urlID : DataTypes.TEXT,
    country : DataTypes.TEXT,
    state : DataTypes.TEXT,
    region_name : DataTypes.TEXT,
    region_id : DataTypes.TEXT,
    associateCountries : DataTypes.ARRAY(DataTypes.TEXT),
    GDP : DataTypes.FLOAT,
    format : DataTypes.TEXT,
    datatype : DataTypes.TEXT,
    coverage : DataTypes.TEXT,
    sourceType: DataTypes.TEXT,
    cost: DataTypes.TEXT,
    comment: DataTypes.TEXT,
    language: DataTypes.TEXT,
    portal_range: DataTypes.TEXT,
    contains_UBOs: DataTypes.TEXT,
    keys: DataTypes.TEXT,
    mapping_issues: DataTypes.TEXT,
    integration_status: DataTypes.TEXT,
    clickup_task: DataTypes.TEXT,
    tech_comments: DataTypes.TEXT,
    integrations: DataTypes.BOOLEAN,

  }, {
    sequelize,
    modelName: 'Source_data',
  });
  return Source_data;
};