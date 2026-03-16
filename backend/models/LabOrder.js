const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LabOrder = sequelize.define('LabOrder', {
  id:           { type: DataTypes.STRING(20), primaryKey: true },
  patient_id:   { type: DataTypes.STRING(20), allowNull: false },
  patient_name: { type: DataTypes.STRING(100) },
  doctor_name:  { type: DataTypes.STRING(100) },
  test:         { type: DataTypes.STRING(150), allowNull: false },
  priority:     { type: DataTypes.ENUM('Normal','Urgent','STAT'), defaultValue: 'Normal' },
  notes:        { type: DataTypes.TEXT },
  status:       { type: DataTypes.ENUM('New','Processing','Done'), defaultValue: 'New' },
  result:       { type: DataTypes.TEXT },
  ordered_at:   { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, { tableName: 'lab_orders', timestamps: true });

module.exports = LabOrder;
