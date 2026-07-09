const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { normalizeRole } = require("../middleware/authMiddleware");

const VALID_USER_TYPES = ["admin", "member", "household", "ambassador"];
const REGISTRATION_USER_TYPES = ["member", "ambassador"];
const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2y$"];
const PASSWORD_MIN_LENGTH = 4;
const DEFAULT_PILOT_ADMIN_PASSWORD_HASH =
  "$2b$10$Yd06PWYvEXl89JywZaayE.L7vAAZ/lkmxlSdwN7.doxcl8padO9Uq";

const registeredUserJson = (user) => ({
  user_id: user.user_id,
  full_name: user.full_name,
  phone_number: user.phone_number,
  location: user.location,
  user_type: normalizeRole(user.user_type)
});

const isBcryptHash = (value) =>
  typeof value === "string" && BCRYPT_PREFIXES.some((prefix) => value.startsWith(prefix));

const ensurePilotAdmin = async () => {
  const admin = {
    full_name: "Masaba Carl Michael",
    phone_number: "0703188291",
    email: "masabacarl8@gmail.com",
    location: "Mukono",
    user_type: "admin"
  };

  const [rows] = await db.execute(
    `SELECT user_id, phone_number, email, password
     FROM users
     WHERE phone_number = ? OR email = ?
     ORDER BY user_type = 'admin' DESC, user_id ASC
     LIMIT 5`,
    [admin.phone_number, admin.email]
  );

  const phoneOwner = rows.find((row) => row.phone_number === admin.phone_number);
  const emailOwner = rows.find((row) => row.email === admin.email);
  const target = phoneOwner || emailOwner || rows[0];
  const currentPassword = target?.password;
  const passwordHash = isBcryptHash(currentPassword)
    ? currentPassword
    : currentPassword
      ? await bcrypt.hash(currentPassword, 10)
      : process.env.PILOT_ADMIN_PASSWORD_HASH || DEFAULT_PILOT_ADMIN_PASSWORD_HASH;

  if (target) {
    const emailCanBeUpdated = !emailOwner || emailOwner.user_id === target.user_id;
    await db.execute(
      `UPDATE users
       SET full_name = ?,
           phone_number = ?,
           email = CASE WHEN ? THEN ? ELSE email END,
           location = ?,
           user_type = ?,
           password = ?
       WHERE user_id = ?`,
      [
        admin.full_name,
        admin.phone_number,
        emailCanBeUpdated,
        admin.email,
        admin.location,
        admin.user_type,
        passwordHash,
        target.user_id
      ]
    );
    return;
  }

  await db.execute(
    `INSERT INTO users (full_name, phone_number, email, location, user_type, password)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      admin.full_name,
      admin.phone_number,
      admin.email,
      admin.location,
      admin.user_type,
      passwordHash
    ]
  );
};

const login = async (req, res) => {
  const phoneNumber = String(req.body.phone_number || "").trim();
  const password = String(req.body.password || "");

  if (!phoneNumber) {
    return res.status(400).json({
      message: "Phone number is required"
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "PIN/password is required"
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type, password, created_at
       FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [phoneNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No account exists for this phone number. Please create an account first."
      });
    }

    const user = rows[0];
    if (!user.password) {
      return res.status(401).json({
        message: "This account needs a secure PIN before it can sign in. Please create a new account or contact the pilot administrator."
      });
    }

    let passwordMatches = false;
    if (isBcryptHash(user.password)) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = password === user.password;
      if (passwordMatches) {
        const passwordHash = await bcrypt.hash(password, 10);
        await db.execute(`UPDATE users SET password = ? WHERE user_id = ?`, [
          passwordHash,
          user.user_id
        ]);
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        message: "PIN/password is incorrect"
      });
    }

    const userType = VALID_USER_TYPES.includes(user.user_type)
      ? user.user_type
      : "household";

    const token = crypto.randomBytes(24).toString("hex");
    await db.execute(`UPDATE users SET session_token = ? WHERE user_id = ?`, [
      token,
      user.user_id
    ]);

    res.json({
      message: "Login successful",
      token,
      user: registeredUserJson({ ...user, user_type: userType })
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Could not log in" });
  }
};

const register = async (req, res) => {
  const fullName = String(req.body.full_name || "").trim();
  const phoneNumber = String(req.body.phone_number || "").trim();
  const location = String(req.body.location || "").trim();
  const userType = String(req.body.user_type || "member").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!fullName) {
    return res.status(400).json({ message: "Full name is required" });
  }

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ message: "Create a secure PIN with at least 4 characters" });
  }

  if (!REGISTRATION_USER_TYPES.includes(userType)) {
    return res.status(400).json({ message: "User type must be member or ambassador" });
  }

  try {
    const [existing] = await db.execute(
      `SELECT user_id FROM users WHERE phone_number = ? LIMIT 1`,
      [phoneNumber]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Phone number is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (full_name, phone_number, location, user_type, password)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, phoneNumber, location || null, userType, passwordHash]
    );

    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type, created_at
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Account created successfully",
      user: registeredUserJson(rows[0])
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Phone number is already registered" });
    }

    console.error("Register error:", error);
    res.status(500).json({ message: "Could not create account" });
  }
};

module.exports = {
  ensurePilotAdmin,
  login,
  register
};
