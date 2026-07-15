const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-that-is-never-used-in-production";

const { validatePasswordChange, validateRegistration } = require("../controllers/authController");
const { requireRole } = require("../middleware/authMiddleware");

test("registration accepts a complete member payload", () => {
  assert.deepEqual(validateRegistration({
    fullName: "Amina Namusoke", phoneNumber: "+256700000001",
    email: "amina@example.test", location: "Mukono",
    userType: "member", password: "123456"
  }), []);
});

test("registration rejects missing, invalid, and privileged fields", () => {
  const errors = validateRegistration({
    fullName: "", phoneNumber: "", email: "not-an-email",
    location: "", userType: "admin", password: "123"
  });
  for (const message of [
    "Full name is required.", "Phone number is required.", "Location is required.",
    "PIN must contain at least 6 characters.", "User type must be member or ambassador.",
    "Email address is invalid."
  ]) assert.ok(errors.includes(message));
});

test("role middleware denies an unauthorised role with HTTP 403", () => {
  const response = { statusCode: 200 };
  response.status = (statusCode) => { response.statusCode = statusCode; return response; };
  response.json = (payload) => { response.payload = payload; return response; };
  let nextCalled = false;
  requireRole("admin")({ user: { user_type: "member" } }, response, () => { nextCalled = true; });
  assert.equal(response.statusCode, 403);
  assert.equal(response.payload.success, false);
  assert.equal(nextCalled, false);
});

test("role middleware allows an authorised role", () => {
  let nextCalled = false;
  requireRole("member")({ user: { user_type: "member" } }, {}, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test("password change validation requires a new secure value", () => {
  assert.equal(validatePasswordChange("", "123456"), "Current PIN/password is required.");
  assert.equal(validatePasswordChange("123456", "123"), "New PIN/password must contain at least 6 characters.");
  assert.equal(validatePasswordChange("123456", "123456"), "New PIN/password must be different from the current one.");
  assert.equal(validatePasswordChange("123456", "654321"), null);
});
