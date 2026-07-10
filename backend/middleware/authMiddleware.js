const crypto = require("crypto");
const db = require("../config/db");

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "embeera-demo-local-secret";

const normalizeRole = (role) => {
  if (role === "household") return "member";
  return role || "member";
};

const readToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
};

const signPayload = (payload) =>
  crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");

const createToken = (userId) => {
  const payload = Buffer.from(
    JSON.stringify({
      user_id: userId,
      nonce: crypto.randomBytes(16).toString("hex"),
      issued_at: Date.now()
    })
  ).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = signPayload(payload);
  if (!signature || signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
};

const requireAuth = async (req, res, next) => {
  const token = readToken(req);
  const payload = verifyToken(token);

  if (!payload?.user_id) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [payload.user_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    req.user = {
      ...rows[0],
      role: normalizeRole(rows[0].user_type),
      user_type: normalizeRole(rows[0].user_type)
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Could not verify session." });
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
  createToken,
  normalizeRole,
  requireAuth,
  requireRole
};
