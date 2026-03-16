const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id:           { type: DataTypes.STRING(20), primaryKey: true },
  patient_id:   { type: DataTypes.STRING(20), allowNull: false },
  patient_name: { type: DataTypes.STRING(100) },
  doctor_id:    { type: DataTypes.STRING(20) },
  doctor_name:  { type: DataTypes.STRING(100) },
  dept:         { type: DataTypes.STRING(80) },
  date:         { type: DataTypes.DATEONLY },
  time:         { type: DataTypes.STRING(20) },
  type:         { type: DataTypes.ENUM('New Visit','Follow-Up','Emergency'), defaultValue: 'New Visit' },
  notes:        { type: DataTypes.TEXT },
  phone:        { type: DataTypes.STRING(15) },
  fee:          { type: DataTypes.INTEGER, defaultValue: 0 },
  pay_mode:     { type: DataTypes.STRING(20) },
  txn_id:       { type: DataTypes.STRING(100) },
  pay_status:   { type: DataTypes.ENUM('Paid','Pending'), defaultValue: 'Pending' },
  status:       { type: DataTypes.ENUM('Confirmed','Completed','Cancelled'), defaultValue: 'Confirmed' }
}, { tableName: 'appointments', timestamps: true });

module.exports = Appointment;
