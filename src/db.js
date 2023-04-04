const Sequilize = require('sequelize');

require('dotenv').config();                            // create .env file with dependencies

const DB_NAME = process.env.POSTGRES_DB_NAME;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASS = process.env.POSTGRES_PASS;

module.exports = new Sequilize(DB_NAME, POSTGRES_USER, POSTGRES_PASS, {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: 0,
  pool: {
    max: 5,
    min: 0,
    acquire: 3000,
    idle: 10000
  }, 
  
  define: {
    freeTableName: true,
  }
});
