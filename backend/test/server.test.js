const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-that-is-never-used-in-production";

const db = require("../config/db");
db.execute = async () => [[{ ok: 1 }], []];
const app = require("../server");

const withServer = async (run) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test("health reports application and mocked database status safely", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, application: "running", database: "connected" });
  });
});

test("malformed JSON returns HTTP 400", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json"
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, "Request body must contain valid JSON.");
  });
});

test("protected route rejects a missing token without touching the database", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/overview`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).success, false);
  });
});
