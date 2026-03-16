const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bed = sequelize.define('Bed', {
  id:         { type: DataTypes.STRING(10), primaryKey: true },
  ward:       { type: DataTypes.STRING(50) },
  status:     { type: DataTypes.ENUM('available','occupied','maintenance'), defaultValue: 'available' },
  patient_id: { type: DataTypes.STRING(20) }
}, { tableName: 'beds', timestamps: false });

module.exports = Bed;
