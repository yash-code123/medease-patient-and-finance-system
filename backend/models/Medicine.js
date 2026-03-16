const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Medicine = sequelize.define('Medicine', {
  id:       { type: DataTypes.STRING(20), primaryKey: true },
  name:     { type: DataTypes.STRING(150), allowNull: false },
  category: { type: DataTypes.STRING(60) },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  min_stock:{ type: DataTypes.INTEGER, defaultValue: 20 },
  price:    { type: DataTypes.DECIMAL(8,2), defaultValue: 0 },
  expiry:   { type: DataTypes.DATEONLY }
}, { tableName: 'medicines', timestamps: false });

module.exports = Medicine;
