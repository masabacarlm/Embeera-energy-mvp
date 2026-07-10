const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

const assertStatus = (name, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`ok - ${name}`);
};

const run = async () => {
  const health = await request("/api/health");
  assertStatus("health", health.response.status, 200);

  const invalidLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone_number: "0000000000", password: "wrong-password" })
  });
  assertStatus("invalid login rejected", invalidLogin.response.status, 401);

  const noTokenAdmin = await request("/api/admin/overview");
  assertStatus("admin requires auth", noTokenAdmin.response.status, 401);

  const noTokenCircles = await request("/api/circles/my");
  assertStatus("circles require auth", noTokenCircles.response.status, 401);

  console.log("Smoke tests completed.");
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
