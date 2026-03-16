const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Prescription = sequelize.define('Prescription', {
  id:           { type: DataTypes.STRING(20), primaryKey: true },
  patient_id:   { type: DataTypes.STRING(20), allowNull: false },
  patient_name: { type: DataTypes.STRING(100) },
  doctor_id:    { type: DataTypes.STRING(20) },
  doctor_name:  { type: DataTypes.STRING(100) },
  diagnosis:    { type: DataTypes.STRING(255), allowNull: false },
  complaints:   { type: DataTypes.TEXT },
  advice:       { type: DataTypes.TEXT },
  date:         { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  next_visit:   { type: DataTypes.DATEONLY },
  medicines:    { type: DataTypes.JSON },   // array of {name,dose,freq,dur}
  vitals:       { type: DataTypes.JSON },   // bp,pulse,temp,spo2 etc.
  appt_id:      { type: DataTypes.STRING(20) }
}, { tableName: 'prescriptions', timestamps: true });

module.exports = Prescription;
