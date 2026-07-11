const mysql = require("mysql2/promise");
require("dotenv").config();

const poolOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const railwayVariables = [
  "MYSQLHOST",
  "MYSQLPORT",
  "MYSQLUSER",
  "MYSQLPASSWORD",
  "MYSQLDATABASE"
];
const hasCompleteRailwayConfig = railwayVariables.every((name) => process.env[name]);

const pool = process.env.MYSQL_URL
  ? mysql.createPool({ ...poolOptions, uri: process.env.MYSQL_URL })
  : hasCompleteRailwayConfig
    ? mysql.createPool({
        ...poolOptions,
        host: process.env.MYSQLHOST,
        port: Number(process.env.MYSQLPORT),
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE
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
