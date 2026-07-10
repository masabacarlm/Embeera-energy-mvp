const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const dbName = process.env.DB_NAME || "embeera_energy";
if (!/^[A-Za-z0-9_]+$/.test(dbName)) throw new Error("DB_NAME contains unsupported characters.");
(async () => { let connection; try {
  console.log(`Resetting configured demo database: ${dbName}`);
  connection = await mysql.createConnection({ host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", multipleStatements: true });
  await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`; CREATE DATABASE \`${dbName}\`; USE \`${dbName}\`;`);
  const schema = fs.readFileSync(path.resolve(__dirname, "../../database/schema_demo_production.sql"), "utf8").replace(/CREATE DATABASE[^;]+;|USE\s+\w+;/gi, "");
  await connection.query(schema); await connection.end(); connection = null;
  console.log("Schema created. Seeding demo data...");
  const seed = spawnSync(process.execPath, [path.resolve(__dirname, "seedDemoProduction.js")], { stdio: "inherit", env: { ...process.env, DB_NAME: dbName } });
  if (seed.status !== 0) throw new Error("Demo seeding failed.");
  console.log("Demo database reset complete.");
} catch (error) { console.error("Demo reset failed:", error.message); process.exitCode = 1; } finally { if (connection) await connection.end(); } })();
