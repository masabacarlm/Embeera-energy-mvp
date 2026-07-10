const db = require("../config/db");

const getAdminOverview = async (req, res) => {
  try {
    const [
      [userRows],
      [memberRows],
      [ambassadorRows],
      [circleRows],
      [savingsRows],
      [certificateRows],
      [deliveryRows],
      [recentContributionRows]
    ] = await Promise.all([
      db.execute(`SELECT COUNT(*) AS total_users FROM users`),
      db.execute(`SELECT COUNT(*) AS total_members FROM users WHERE user_type = 'member'`),
      db.execute(`SELECT COUNT(*) AS total_ambassadors FROM users WHERE user_type = 'ambassador'`),
      db.execute(`SELECT COUNT(*) AS total_circles FROM circles`),
      db.execute(`SELECT COALESCE(SUM(amount), 0) AS total_savings FROM contributions WHERE status = 'successful'`),
      db.execute(`SELECT COUNT(*) AS issued_certificates FROM certificates WHERE certificate_status = 'issued'`),
      db.execute(`SELECT COUNT(*) AS pending_deliveries FROM delivery_requests WHERE delivery_status = 'pending'`),
      db.execute(
        `SELECT con.contribution_id, con.amount, con.method, con.status, con.created_at, u.full_name, c.name AS circle_name
         FROM contributions con
         JOIN users u ON u.user_id = con.user_id
         JOIN circles c ON c.circle_id = con.circle_id
         ORDER BY con.created_at DESC, con.contribution_id DESC
         LIMIT 8`
      )
    ]);

    res.json({
      total_users: Number(userRows[0].total_users),
      total_members: Number(memberRows[0].total_members),
      total_ambassadors: Number(ambassadorRows[0].total_ambassadors),
      total_circles: Number(circleRows[0].total_circles),
      total_savings: Number(savingsRows[0].total_savings),
      issued_certificates: Number(certificateRows[0].issued_certificates),
      pending_deliveries: Number(deliveryRows[0].pending_deliveries),
      recent_contributions: recentContributionRows
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Could not load admin overview." });
  }
};

const getAmbassadorOverview = async (req, res) => {
  res.status(410).json({ message: "Use /api/ambassador/referrals for ambassador progress." });
};

module.exports = {
  getAdminOverview,
  getAmbassadorOverview
};
