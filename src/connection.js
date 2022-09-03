const sql = require("mssql");
const config = require("../config");
const Logger = require('./utils/logger')
const logger = new Logger('Connection')

 const dbSettings = {
  user: config.dbUser,
  password: config.dbPassword,
  server: config.dbServer,
  database: config.dbDatabase,
  options: {
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

 const cnx = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    logger.error('DB Connection failed',error);
  }
};

module.exports = cnx