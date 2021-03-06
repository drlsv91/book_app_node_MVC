const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = require('../utils/database');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: 'user' }
);

module.exports = User;
