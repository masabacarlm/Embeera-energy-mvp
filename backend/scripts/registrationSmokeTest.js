const baseUrl = (process.env.API_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const unique = `${Date.now()}`;

const member = {
  full_name: "Registration Smoke Member",
  phone_number: `25670${unique.slice(-7)}1`,
  email: `smoke-member-${unique}@example.invalid`,
  location: "Kampala",
  user_type: "member",
  password: "smoke-pin-123"
};

const ambassador = {
  ...member,
  full_name: "Registration Smoke Ambassador",
  phone_number: `25670${unique.slice(-7)}2`,
  email: `smoke-ambassador-${unique}@example.invalid`,
  user_type: "ambassador"
};

const register = async (payload) => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, message: body.message };
};

const expectStatus = async (label, expected, payload) => {
  const result = await register(payload);
  if (result.status !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${result.status} (${result.message || "no message"})`);
  }
  console.log(`${label}: ${result.status}`);
};

const run = async () => {
  await expectStatus("valid member", 201, member);
  await expectStatus("valid ambassador", 201, ambassador);
  await expectStatus("duplicate phone", 409, { ...member, email: `other-${unique}@example.invalid` });
  await expectStatus("duplicate email", 409, { ...member, phone_number: `25670${unique.slice(-7)}3` });
  await expectStatus("admin role", 400, { ...member, phone_number: `25670${unique.slice(-7)}4`, email: null, user_type: "admin" });
  await expectStatus("short PIN", 400, { ...member, phone_number: `25670${unique.slice(-7)}5`, email: null, password: "12345" });
};

run().catch((error) => {
  console.error(`Registration smoke test failed: ${error.message}`);
  process.exitCode = 1;
});
