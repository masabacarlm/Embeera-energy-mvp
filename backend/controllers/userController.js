const db = require("../config/db");

const registerUser = async (req, res) => {
  const { full_name, phone_number, location, user_type } = req.body;

  if (!full_name || !phone_number) {
    return res.status(400).json({
      message: "full_name and phone_number are required"
    });
  }

  try {
    // The question marks keep user input separate from the SQL command.
    const [result] = await db.execute(
      `INSERT INTO users (full_name, phone_number, location, user_type)
       VALUES (?, ?, ?, ?)`,
      [full_name, phone_number, location || null, user_type || "household"]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: result.insertId,
        full_name,
        phone_number,
        location: location || null,
        user_type: user_type || "household"
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "A user with this phone number already exists"
      });
    }

    console.error("Register user error:", error);
    res.status(500).json({ message: "Could not register user" });
  }
};

module.exports = {
  registerUser
};
