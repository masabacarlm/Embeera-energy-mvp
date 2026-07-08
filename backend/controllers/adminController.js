const db = require("../config/db");

const getAdminOverview = async (req, res) => {
  try {
    const [[householdRows], [groupRows], [savingsRows], [deliveryRows], [certificateRows], [ambassadorRows]] =
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
        )
      ]);

    res.json({
      total_households: Number(householdRows[0].total_households),
      active_groups: Number(groupRows[0].active_groups),
      total_savings: Number(savingsRows[0].total_savings),
      pending_deliveries: Number(deliveryRows[0].pending_deliveries),
      certificates_issued: Number(certificateRows[0].certificates_issued),
      active_ambassadors: Number(ambassadorRows[0].active_ambassadors)
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Could not load admin overview" });
  }
};

module.exports = {
  getAdminOverview
};
