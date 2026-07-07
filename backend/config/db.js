const mysql = require("mysql2/promise");
require("dotenv").config();

// One shared connection pool is used by all controllers.
// Copy .env.example to .env and fill in your local MySQL details.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "embeera_energy",
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
