const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/db");
const schemaPath = path.resolve(__dirname, "../../database/schema_production.sql");

async function migrate() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  if (/\b(?:CREATE|DROP)\s+DATABASE\b|\bUSE\s+[`\w-]+/i.test(schema)) {
    throw new Error("Schema contains a forbidden database-level statement.");
  }
  const statements = schema.split(/;\s*(?:\r?\n|$)/).map((value) => value.trim()).filter(Boolean);
  const connection = await db.getConnection();
  try {
    for (const statement of statements) await connection.query(statement);
    console.log("Production schema migration completed.");
  } finally {
    connection.release();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
}).finally(() => db.end());
