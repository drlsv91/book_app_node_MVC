const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: { type: DataTypes.INTEGER },
  },
  { sequelize, modelName: 'orderItem' }
);

module.exports = OrderItem;
