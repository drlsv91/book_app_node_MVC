const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nodejs_course', 'root', '', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
