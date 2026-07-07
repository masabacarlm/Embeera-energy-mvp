const db = require("../config/db");

const getUserRewards = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Add up all active reward points for this user.
    const [rewardRows] = await db.execute(
      `SELECT COALESCE(SUM(points), 0) AS reward_points
       FROM rewards
       WHERE user_id = ?
         AND reward_status = 'active'`,
      [user_id]
    );

    const [certificateRows] = await db.execute(
      `SELECT certificate_status
       FROM certificates
       WHERE user_id = ?
       ORDER BY certificate_id DESC
       LIMIT 1`,
      [user_id]
    );

    res.json({
      user_id: Number(user_id),
      reward_points: Number(rewardRows[0].reward_points),
      certificate_status:
        certificateRows[0]?.certificate_status || "not eligible"
    });
  } catch (error) {
    console.error("Rewards error:", error);
    res.status(500).json({ message: "Could not load rewards" });
  }
};

module.exports = {
  getUserRewards
};
