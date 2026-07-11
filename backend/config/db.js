const mysql = require("mysql2/promise");
require("dotenv").config();

const poolOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const mysqlVariables = [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE"
];
const hasCompleteMysqlConfig = mysqlVariables.every((name) => process.env[name]);
const ca = process.env.MYSQL_CA_CERT
  ? process.env.MYSQL_CA_CERT.replace(/\\n/g, "\n")
  : undefined;
const ssl = process.env.MYSQL_SSL === "true"
  ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) }
  : undefined;

const pool = process.env.MYSQL_URL
  ? mysql.createPool({ ...poolOptions, uri: process.env.MYSQL_URL, ...(ssl ? { ssl } : {}) })
  : hasCompleteMysqlConfig
    ? mysql.createPool({
        ...poolOptions,
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ...(ssl ? { ssl } : {})
      })
    : mysql.createPool({
        ...poolOptions,
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "embeera_energy"
      });

module.exports = pool;
