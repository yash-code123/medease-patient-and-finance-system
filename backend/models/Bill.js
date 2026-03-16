const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bill = sequelize.define('Bill', {
  id:           { type: DataTypes.STRING(20), primaryKey: true },
  patient_id:   { type: DataTypes.STRING(20), allowNull: false },
  patient_name: { type: DataTypes.STRING(100) },
  appt_id:      { type: DataTypes.STRING(20) },
  amount:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  mode:         { type: DataTypes.STRING(20), defaultValue: 'UPI' },
  txn_id:       { type: DataTypes.STRING(100) },
  status:       { type: DataTypes.ENUM('Paid','Pending'), defaultValue: 'Pending' },
  note:         { type: DataTypes.STRING(150) },
  date:         { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, { tableName: 'bills', timestamps: true });

module.exports = Bill;
