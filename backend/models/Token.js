const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Token = sequelize.define('Token', {
  id:           { type: DataTypes.STRING(20), primaryKey: true },
  appointment_id:{ type: DataTypes.STRING(20) },
  patient_id:   { type: DataTypes.STRING(20), allowNull: false },
  patient_name: { type: DataTypes.STRING(100) },
  dept:         { type: DataTypes.STRING(80) },
  doctor_name:  { type: DataTypes.STRING(100) },
  priority:     { type: DataTypes.ENUM('Normal','Senior Citizen','Emergency'), defaultValue: 'Normal' },
  status:       { type: DataTypes.ENUM('Waiting','In Progress','Done'), defaultValue: 'Waiting' },
  issued_at:    { type: DataTypes.STRING(20) }
}, { tableName: 'tokens', timestamps: true });

module.exports = Token;
