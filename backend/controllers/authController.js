const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { createToken, normalizeRole } = require("../middleware/authMiddleware");

const REGISTRATION_USER_TYPES = ["member", "ambassador"];
const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2y$"];
const PASSWORD_MIN_LENGTH = 4;
const DEFAULT_PILOT_ADMIN_PASSWORD_HASH =
  "$2b$10$Yd06PWYvEXl89JywZaayE.L7vAAZ/lkmxlSdwN7.doxcl8padO9Uq";

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
  try {
    const [rows] = await db.execute(
      `SELECT user_id, password_hash
       FROM users
       WHERE phone_number = ? OR email = ?
       LIMIT 1`,
      ["0703188291", "masabacarl8@gmail.com"]
    );

    if (rows.length === 0) return;

    const currentHash = rows[0].password_hash;
    const passwordHash = isBcryptHash(currentHash)
      ? currentHash
      : process.env.PILOT_ADMIN_PASSWORD_HASH || DEFAULT_PILOT_ADMIN_PASSWORD_HASH;

    await db.execute(
      `UPDATE users
       SET full_name = ?, phone_number = ?, email = ?, location = ?, user_type = 'admin', password_hash = ?
       WHERE user_id = ?`,
      [
        "Masaba Carl Michael",
        "0703188291",
        "masabacarl8@gmail.com",
        "Mukono",
        passwordHash,
        rows[0].user_id
      ]
    );
  } catch (error) {
    if (error.code !== "ER_NO_SUCH_TABLE" && error.code !== "ER_BAD_FIELD_ERROR") throw error;
  }
};

const login = async (req, res) => {
  const phoneNumber = String(req.body.phone_number || "").trim();
  const password = String(req.body.password || "");

  if (!phoneNumber || !password) {
    return res.status(400).json({ message: "Phone number and PIN/password are required." });
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
      return res.status(401).json({ message: "Phone number or PIN/password is incorrect." });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Phone number or PIN/password is incorrect." });
    }

    res.json({
      message: "Login successful",
      token: createToken(user.user_id),
      user: userJson(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Could not sign in." });
  }
};

const register = async (req, res) => {
  const fullName = String(req.body.full_name || "").trim();
  const phoneNumber = String(req.body.phone_number || "").trim();
  const email = String(req.body.email || "").trim() || null;
  const location = String(req.body.location || "").trim();
  const userType = String(req.body.user_type || "member").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!fullName || !phoneNumber) {
    return res.status(400).json({ message: "Full name and phone number are required." });
  }

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ message: "Create a secure PIN with at least 4 characters." });
  }

  if (!REGISTRATION_USER_TYPES.includes(userType)) {
    return res.status(400).json({ message: "User type must be member or ambassador." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO users (full_name, phone_number, email, location, user_type, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, phoneNumber, email, location || null, userType, passwordHash]
    );

    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type, created_at
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Account created successfully.",
      user: userJson(rows[0])
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Phone number or email is already registered." });
    }

    console.error("Register error:", error);
    res.status(500).json({ message: "Could not create account." });
  }
};

module.exports = {
  ensurePilotAdmin,
  login,
  register
};
