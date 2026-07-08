const db = require("../config/db");

const updateLearningProgress = async (req, res) => {
  const { user_id, topic_name, completion_status } = req.body;
  const completedAtSql =
    String(completion_status).toLowerCase() === "completed"
      ? "CURRENT_TIMESTAMP"
      : "NULL";

  if (!user_id || !topic_name || !completion_status) {
    return res.status(400).json({
      message: "user_id, topic_name, and completion_status are required"
    });
  }

  try {
    const [existingRows] = await db.execute(
      `SELECT learning_id
       FROM learning_progress
       WHERE user_id = ? AND topic_name = ?
       LIMIT 1`,
      [user_id, topic_name]
    );

    if (existingRows.length > 0) {
      await db.execute(
        `UPDATE learning_progress
         SET completion_status = ?, completed_at = ${completedAtSql}
         WHERE learning_id = ?`,
        [completion_status, existingRows[0].learning_id]
      );
    } else {
      await db.execute(
        `INSERT INTO learning_progress
         (user_id, topic_name, completion_status, completed_at)
         VALUES (?, ?, ?, ${completedAtSql})`,
        [user_id, topic_name, completion_status]
      );
    }

    res.json({
      message: "Learning progress updated",
      user_id,
      topic_name,
      completion_status
    });
  } catch (error) {
    console.error("Learning progress update error:", error);
    res.status(500).json({ message: "Could not update learning progress" });
  }
};

module.exports = {
  updateLearningProgress
};
