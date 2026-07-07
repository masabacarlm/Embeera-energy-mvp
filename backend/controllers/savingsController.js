const db = require("../config/db");

const getSavingsProgress = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Find the user's active group and compare saved money to the target.
    const [rows] = await db.execute(
      `SELECT
         gm.user_id,
         g.group_id,
         g.group_name,
         g.savings_target,
         COALESCE(SUM(st.amount), 0) AS amount_saved
       FROM group_members gm
       JOIN oluganda_groups g ON gm.group_id = g.group_id
       LEFT JOIN savings_transactions st
         ON st.user_id = gm.user_id
        AND st.group_id = gm.group_id
        AND st.transaction_status = 'successful'
       WHERE gm.user_id = ?
         AND gm.member_status = 'active'
       GROUP BY gm.user_id, g.group_id, g.group_name, g.savings_target
       LIMIT 1`,
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No savings progress found for this user"
      });
    }

    const progress = rows[0];
    const amountSaved = Number(progress.amount_saved);
    const savingsTarget = Number(progress.savings_target);
    const progressPercentage =
      savingsTarget > 0 ? Math.round((amountSaved / savingsTarget) * 100) : 0;

    res.json({
      user_id: Number(user_id),
      group_id: progress.group_id,
      group_name: progress.group_name,
      amount_saved: amountSaved,
      savings_target: savingsTarget,
      progress_percentage: progressPercentage,
      remaining_amount: Math.max(savingsTarget - amountSaved, 0)
    });
  } catch (error) {
    console.error("Savings progress error:", error);
    res.status(500).json({ message: "Could not load savings progress" });
  }
};

module.exports = {
  getSavingsProgress
};
