const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { createToken, normalizeRole } = require("../middleware/authMiddleware");
const { fail, ok } = require("../utils/apiResponse");

const REGISTRATION_USER_TYPES = ["member", "ambassador"];
const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2y$"];
const PASSWORD_MIN_LENGTH = 6;

const userJson = (user) => ({
  user_id: user.user_id,
  full_name: user.full_name,
  phone_number: user.phone_number,
  email: user.email,
  location: user.location,
  role: normalizeRole(user.user_type),
  user_type: normalizeRole(user.user_type)
});

const isBcryptHash = (value) =>
  typeof value === "string" && BCRYPT_PREFIXES.some((prefix) => value.startsWith(prefix));

const ensurePilotAdmin = async () => {
  const pilotPhone = String(process.env.PILOT_ADMIN_PHONE || "").trim();
  const pilotEmail = String(process.env.PILOT_ADMIN_EMAIL || "").trim();
  const pilotHash = String(process.env.PILOT_ADMIN_PASSWORD_HASH || "").trim();

  if (!pilotPhone && !pilotEmail) return;

  try {
    const [rows] = await db.execute(
      `SELECT user_id, password_hash
       FROM users
       WHERE phone_number = ? OR email = ?
       LIMIT 1`,
      [pilotPhone || "__no_phone__", pilotEmail || "__no_email__"]
    );

    if (rows.length === 0) return;

    const currentHash = rows[0].password_hash;
    const passwordHash = isBcryptHash(currentHash) ? currentHash : pilotHash;
    if (!isBcryptHash(passwordHash)) return;

    await db.execute(
      `UPDATE users
       SET user_type = 'admin', password_hash = ?
       WHERE user_id = ?`,
      [passwordHash, rows[0].user_id]
    );
  } catch (error) {
    if (error.code !== "ER_NO_SUCH_TABLE" && error.code !== "ER_BAD_FIELD_ERROR") throw error;
  }
};

const login = async (req, res) => {
  const phoneNumber = String(req.body.phone_number || "").trim();
  const password = String(req.body.password || "");

  if (!phoneNumber || !password) {
    return fail(res, 400, "Phone number and PIN/password are required.");
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type, password_hash, created_at
       FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [phoneNumber]
    );

    if (rows.length === 0 || !rows[0].password_hash) {
      return fail(res, 401, "Phone number or PIN/password is incorrect.");
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return fail(res, 401, "Phone number or PIN/password is incorrect.");
    }

    ok(res, "Login successful", {
      token: createToken(user.user_id),
      user: userJson(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    fail(res, 500, "Could not sign in.");
  }
};

const register = async (req, res) => {
  const fullName = String(req.body.full_name || "").trim();
  const phoneNumber = String(req.body.phone_number || "").trim();
  const email = String(req.body.email || "").trim() || null;
  const location = String(req.body.location || "").trim();
  const userType = String(req.body.user_type || "member").trim().toLowerCase();
  const password = String(req.body.password || "");
  const errors = [];

  if (!fullName) errors.push("Full name is required.");
  if (!phoneNumber) errors.push("Phone number is required.");
  if (!location) errors.push("Location is required.");

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push("Create a secure PIN/password with at least 6 characters.");
  }

  if (!REGISTRATION_USER_TYPES.includes(userType)) {
    errors.push("User type must be member or ambassador.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email address is invalid.");
  }

  if (errors.length > 0) {
    return fail(res, 400, errors[0], errors);
  }

  try {
    const [duplicatePhoneRows] = await db.execute(
      `SELECT user_id FROM users WHERE phone_number = ? LIMIT 1`,
      [phoneNumber]
    );
    if (duplicatePhoneRows.length > 0) {
      return fail(res, 409, "This phone number is already registered. Please sign in instead.");
    }

    if (email) {
      const [duplicateEmailRows] = await db.execute(
        `SELECT user_id FROM users WHERE email = ? LIMIT 1`,
        [email]
      );
      if (duplicateEmailRows.length > 0) {
        return fail(res, 409, "Email address is already registered.");
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO users (full_name, phone_number, email, location, user_type, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, phoneNumber, email, location, userType, passwordHash]
    );

    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type, created_at
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    ok(res, "Account created successfully.", {
      user: userJson(rows[0])
    }, 201);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return fail(res, 409, "Phone number or email is already registered.");
    }

    console.error("Register error:", error);
    fail(res, 500, "Could not create account.");
  }
};

module.exports = {
  ensurePilotAdmin,
  login,
  register
};
