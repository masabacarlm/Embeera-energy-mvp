const db = require("../config/db");

const normalizeRole = (role) => {
  if (role === "household") return "member";
  return role || "member";
};

const readToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
};

const requireAuth = async (req, res, next) => {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authorised. Login is required." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type
       FROM users
       WHERE session_token = ?
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Not authorised. Session is invalid." });
    }

    req.user = {
      ...rows[0],
      role: normalizeRole(rows[0].user_type),
      user_type: normalizeRole(rows[0].user_type)
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Could not verify session" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  const allowed = roles.map(normalizeRole);
  if (!req.user || !allowed.includes(normalizeRole(req.user.user_type))) {
    return res.status(403).json({ message: "User not authorised for this action." });
  }
  next();
};

module.exports = {
  normalizeRole,
  requireAuth,
  requireRole
};
