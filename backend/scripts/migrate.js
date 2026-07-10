const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function run() {
  const file = path.resolve(__dirname, "../../database/schema_production.sql");
  const sql = fs.readFileSync(file, "utf8");
  const connection = await db.getConnection();
  try {
    for (const statement of sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
      await connection.query(statement);
    }
    console.log("Production schema migration completed.");
  } finally {
    connection.release();
    await db.end();
  }
}

run().catch((error) => { console.error("Migration failed:", error.message); process.exitCode = 1; });
