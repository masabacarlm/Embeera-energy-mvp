const db = require("../config/db");

const VALID_USER_TYPES = ["admin", "household", "ambassador"];

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required"
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type, created_at
       FROM users
       WHERE email = ?
         AND \`password\` = ?
       LIMIT 1`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = rows[0];
    const userType = VALID_USER_TYPES.includes(user.user_type)
      ? user.user_type
      : "household";

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email,
        location: user.location,
        user_type: userType,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Could not log in" });
  }
};

module.exports = {
  login
};
