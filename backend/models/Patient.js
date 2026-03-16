const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Patient = sequelize.define('Patient', {
  id:         { type: DataTypes.STRING(20), primaryKey: true },
  fname:      { type: DataTypes.STRING(60), allowNull: false },
  lname:      { type: DataTypes.STRING(60), allowNull: false },
  dob:        { type: DataTypes.DATEONLY },
  gender:     { type: DataTypes.ENUM('Male','Female','Other') },
  blood:      { type: DataTypes.STRING(5) },
  phone:      { type: DataTypes.STRING(15) },
  email:      { type: DataTypes.STRING(100) },
  aadhaar:    { type: DataTypes.STRING(20) },
  address:    { type: DataTypes.TEXT },
  allergies:  { type: DataTypes.STRING(255), defaultValue: 'None' },
  emergency:  { type: DataTypes.STRING(150) },
  registered: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, { tableName: 'patients', timestamps: false });

module.exports = Patient;
