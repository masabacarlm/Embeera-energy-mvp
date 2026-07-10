const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { fail } = require("../utils/apiResponse");

const getTokenSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }
  return "development-only-embeera-secret-change-before-production";
};

const normalizeRole = (role) => {
  if (role === "household") return "member";
  return role || "member";
};

const readToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
};

const createToken = (userId) => jwt.sign({ user_id: userId }, getTokenSecret(), { expiresIn: "24h" });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, getTokenSecret());
  } catch (error) {
    return null;
  }
};

const requireAuth = async (req, res, next) => {
  try {
    const token = readToken(req);
    const payload = verifyToken(token);

    if (!payload?.user_id) {
      return fail(res, 401, "Please sign in to continue.");
    }

    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [payload.user_id]
    );

    if (rows.length === 0) {
      return fail(res, 401, "Please sign in to continue.");
    }

    req.user = {
      ...rows[0],
      role: normalizeRole(rows[0].user_type),
      user_type: normalizeRole(rows[0].user_type)
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    fail(res, 500, "Could not verify session.");
  }
};

const requireRole = (...roles) => (req, res, next) => {
  const allowed = roles.map(normalizeRole);
  if (!req.user || !allowed.includes(normalizeRole(req.user.user_type))) {
    return fail(res, 403, "User not authorised for this action.");
  }
  next();
};

module.exports = {
  createToken,
  normalizeRole,
  requireAuth,
  requireRole,
  authenticate: requireAuth,
  allowRoles: requireRole
};
