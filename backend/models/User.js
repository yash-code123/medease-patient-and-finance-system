const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role:     { type: DataTypes.ENUM('admin','doctor','patient'), allowNull: false },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  ref_id:   { type: DataTypes.STRING(20) }   // links to patient/doctor id
}, { tableName: 'users', timestamps: true });

module.exports = User;
