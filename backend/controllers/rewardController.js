const db = require("../config/db");

const REQUIRED_LEARNING_TOPIC_COUNT = 3;

const getCertificateStatus = (requirements, latestCertificateStatus) => {
  if (String(latestCertificateStatus).toLowerCase() === "issued") {
    return "Issued";
  }

  if (!requirements.savings_target_reached) {
    return "Not Eligible";
  }

  if (!requirements.learning_completed) {
    return "Learning Required";
  }

  if (!requirements.delivery_requested) {
    return "Delivery Required";
  }

  return "Eligible";
};

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

    const [savingsRows] = await db.execute(
      `SELECT
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
       GROUP BY gm.user_id, g.group_id, g.savings_target
       LIMIT 1`,
      [user_id]
    );

    const [learningRows] = await db.execute(
      `SELECT COUNT(DISTINCT topic_name) AS completed_topics
       FROM learning_progress
       WHERE user_id = ?
         AND completion_status = 'completed'`,
      [user_id]
    );

    const [deliveryRows] = await db.execute(
      `SELECT COUNT(*) AS requested_deliveries
       FROM deliveries
       WHERE user_id = ?`,
      [user_id]
    );

    const savingsTarget = Number(savingsRows[0]?.savings_target || 0);
    const amountSaved = Number(savingsRows[0]?.amount_saved || 0);
    const completedTopics = Number(learningRows[0]?.completed_topics || 0);
    const requestedDeliveries = Number(deliveryRows[0]?.requested_deliveries || 0);
    const latestCertificateStatus = certificateRows[0]?.certificate_status || "";
    const certificateRequirements = {
      savings_target_reached: savingsTarget > 0 && amountSaved >= savingsTarget,
      learning_completed: completedTopics >= REQUIRED_LEARNING_TOPIC_COUNT,
      delivery_requested: requestedDeliveries > 0
    };

    certificateRequirements.certificate_ready =
      certificateRequirements.savings_target_reached &&
      certificateRequirements.learning_completed &&
      certificateRequirements.delivery_requested;

    res.json({
      user_id: Number(user_id),
      reward_points: Number(rewardRows[0].reward_points),
      certificate_status: getCertificateStatus(
        certificateRequirements,
        latestCertificateStatus
      ),
      certificate_requirements: certificateRequirements
    });
  } catch (error) {
    console.error("Rewards error:", error);
    res.status(500).json({ message: "Could not load rewards" });
  }
};

module.exports = {
  getUserRewards
};
