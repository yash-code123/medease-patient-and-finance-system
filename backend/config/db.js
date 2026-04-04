const { Sequelize } = require('sequelize');
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const sslCA = process.env.DB_SSL_CERT
  ? process.env.DB_SSL_CERT
  : fs.existsSync(path.join(__dirname, '../ca.pem'))
    ? fs.readFileSync(path.join(__dirname, '../ca.pem'), 'utf8')
    : undefined;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 15179,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: sslCA
      }
    }
  }
);

module.exports = sequelize;
