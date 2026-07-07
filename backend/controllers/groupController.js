const db = require("../config/db");

const joinGroup = async (req, res) => {
  const { user_id, group_id } = req.body;

  if (!user_id || !group_id) {
    return res.status(400).json({
      message: "user_id and group_id are required"
    });
  }

  try {
    // Save the relationship between a user and an Oluganda Circle.
    const [result] = await db.execute(
      `INSERT INTO group_members (user_id, group_id, member_status)
       VALUES (?, ?, ?)`,
      [user_id, group_id, "active"]
    );

    res.status(201).json({
      message: "User joined Oluganda Circle successfully",
      membership: {
        member_id: result.insertId,
        user_id,
        group_id,
        member_status: "active"
      }
    });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ message: "Could not join group" });
  }
};

module.exports = {
  joinGroup
};
