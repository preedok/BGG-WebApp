const sequelize = require('../config/sequelize');

const db = {
  sequelize,
  Sequelize: require('sequelize')
};

module.exports = db;
