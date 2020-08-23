const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = require('../utils/database');

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'product' }
);

module.exports = Product;
