const db = require("../config/db");

const getAdminOverview = async (req, res) => {
  try {
    const [
      [householdRows],
      [groupRows],
      [savingsRows],
      [deliveryRows],
      [certificateRows],
      [ambassadorRows],
      [recentUserRows]
    ] =
      await Promise.all([
        db.execute(
          `SELECT COUNT(*) AS total_households
           FROM users
           WHERE user_type = 'household'`
        ),
        db.execute(
          `SELECT COUNT(*) AS active_groups
           FROM oluganda_groups`
        ),
        db.execute(
          `SELECT COALESCE(SUM(amount), 0) AS total_savings
           FROM savings_transactions
           WHERE transaction_status = 'successful'`
        ),
        db.execute(
          `SELECT COUNT(*) AS pending_deliveries
           FROM deliveries
           WHERE LOWER(delivery_status) = 'pending'`
        ),
        db.execute(
          `SELECT COUNT(*) AS certificates_issued
           FROM certificates
           WHERE LOWER(certificate_status) = 'issued'`
        ),
        db.execute(
          `SELECT COUNT(*) AS active_ambassadors
           FROM ambassadors`
        ),
        db.execute(
          `SELECT user_id, full_name, email, location, user_type, created_at
           FROM users
           ORDER BY created_at DESC, user_id DESC
           LIMIT 6`
        )
      ]);

    res.json({
      total_households: Number(householdRows[0].total_households),
      active_groups: Number(groupRows[0].active_groups),
      total_savings: Number(savingsRows[0].total_savings),
      pending_deliveries: Number(deliveryRows[0].pending_deliveries),
      certificates_issued: Number(certificateRows[0].certificates_issued),
      active_ambassadors: Number(ambassadorRows[0].active_ambassadors),
      recent_users: recentUserRows
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Could not load admin overview" });
  }
};

const getAmbassadorOverview = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT
         a.ambassador_id,
         a.assigned_location,
         a.referrals_count,
         u.full_name,
         u.location,
         COUNT(DISTINCT r.referred_user_id) AS supported_households,
         COUNT(DISTINCT gm.user_id) AS households_in_circles,
         COUNT(DISTINCT st.user_id) AS households_saving
       FROM ambassadors a
       JOIN users u ON a.user_id = u.user_id
       LEFT JOIN referrals r ON r.ambassador_id = a.ambassador_id
       LEFT JOIN group_members gm ON gm.user_id = r.referred_user_id
       LEFT JOIN savings_transactions st
         ON st.user_id = r.referred_user_id
        AND st.transaction_status = 'successful'
       WHERE a.user_id = ?
       GROUP BY a.ambassador_id, a.assigned_location, a.referrals_count, u.full_name, u.location
       LIMIT 1`,
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No ambassador overview found for this user"
      });
    }

    const overview = rows[0];

    res.json({
      ambassador_id: overview.ambassador_id,
      assigned_location: overview.assigned_location,
      referrals_count: Number(overview.referrals_count),
      supported_households: Number(overview.supported_households),
      households_in_circles: Number(overview.households_in_circles),
      households_saving: Number(overview.households_saving),
      community_support_notes: [
        "Help households understand LPG safety and savings steps.",
        "Follow up with referred households that have not joined a circle.",
        "Share delivery readiness updates with the operations team."
      ]
    });
  } catch (error) {
    console.error("Ambassador overview error:", error);
    res.status(500).json({ message: "Could not load ambassador overview" });
  }
};

module.exports = {
  getAdminOverview,
  getAmbassadorOverview
};
