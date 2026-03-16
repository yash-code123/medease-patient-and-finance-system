const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Doctor = sequelize.define('Doctor', {
  id:       { type: DataTypes.STRING(20), primaryKey: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  dept:     { type: DataTypes.STRING(80), allowNull: false },
  qual:     { type: DataTypes.STRING(150) },
  exp:      { type: DataTypes.INTEGER, defaultValue: 0 },
  phone:    { type: DataTypes.STRING(15) },
  email:    { type: DataTypes.STRING(100) },
  schedule: { type: DataTypes.STRING(100) },
  fee:      { type: DataTypes.INTEGER, defaultValue: 500 },
  about:    { type: DataTypes.TEXT },
  status:   { type: DataTypes.ENUM('Active','Inactive'), defaultValue: 'Active' }
}, { tableName: 'doctors', timestamps: false });

module.exports = Doctor;
