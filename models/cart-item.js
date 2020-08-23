const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class CartItem extends Model {}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    quantity: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: 'cartItem' }
);

module.exports = CartItem;
