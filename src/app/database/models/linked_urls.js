'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Linked_urls extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Linked_urls.belongsTo(models.Countries, {
        foreignKey: 'country_id',
        as: 'Country',
      });
    }
  }
  Linked_urls.init({
    url_id: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER,
    state_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Linked_urls',
  });
  return Linked_urls;
};