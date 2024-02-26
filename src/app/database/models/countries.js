'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Countries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Countries.hasMany(models.Linked_urls, {
        foreignKey: 'country_id',
        as: 'Linked_urls',
      });
    }
  }
  Countries.init({
    country_name: DataTypes.STRING,
    region_name : DataTypes.STRING,
    region_id : DataTypes.INTEGER,
    gdp_year: DataTypes.STRING,
    gdp_amount: DataTypes.FLOAT,
    source_count : DataTypes.INTEGER,
    duplicate : DataTypes.INTEGER,
    countryDup: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Countries',
  });
  return Countries;
};