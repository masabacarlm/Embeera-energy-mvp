const db = require("../config/db");
const { fail, ok } = require("../utils/apiResponse");

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
      [recentUserRows],
      [recentReferralRows],
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
        `SELECT user_id, full_name, phone_number, email, location, user_type, created_at
         FROM users
         ORDER BY created_at DESC, user_id DESC
         LIMIT 8`
      ),
      db.execute(
        `SELECT ar.referral_id, ar.referral_status, ar.created_at,
                amb.full_name AS ambassador_name,
                ref.full_name AS referred_name,
                ref.phone_number AS referred_phone_number
         FROM ambassador_referrals ar
         JOIN users amb ON amb.user_id = ar.ambassador_id
         JOIN users ref ON ref.user_id = ar.referred_user_id
         ORDER BY ar.created_at DESC, ar.referral_id DESC
         LIMIT 8`
      ),
      db.execute(
        `SELECT con.contribution_id, con.amount, con.method, con.status, con.created_at, u.full_name, c.name AS circle_name
         FROM contributions con
         JOIN users u ON u.user_id = con.user_id
         JOIN circles c ON c.circle_id = con.circle_id
         ORDER BY con.created_at DESC, con.contribution_id DESC
         LIMIT 8`
      )
    ]);

    ok(res, "Admin overview loaded.", {
      total_users: Number(userRows[0].total_users),
      total_members: Number(memberRows[0].total_members),
      total_ambassadors: Number(ambassadorRows[0].total_ambassadors),
      total_circles: Number(circleRows[0].total_circles),
      total_savings: Number(savingsRows[0].total_savings),
      issued_certificates: Number(certificateRows[0].issued_certificates),
      pending_deliveries: Number(deliveryRows[0].pending_deliveries),
      recent_users: recentUserRows,
      recent_referrals: recentReferralRows,
      recent_contributions: recentContributionRows
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    fail(res, 500, "Could not load admin overview.");
  }
};

const getAmbassadorOverview = async (req, res) => {
  fail(res, 410, "Use /api/ambassador/referrals for ambassador progress.");
};

const list = (query, key) => async (req, res) => {
  try { const [rows] = await db.execute(query); ok(res, `${key} loaded.`, { [key]: rows }); }
  catch (error) { console.error(`Admin ${key} error:`, error); fail(res, 500, `Could not load ${key}.`); }
};

const getUsers = list(`SELECT user_id, full_name, phone_number, email, location, user_type, created_at FROM users ORDER BY created_at DESC`, "users");
const getCircles = list(`SELECT c.circle_id,c.name,c.location,c.target_amount,c.invite_code,c.status,c.created_at,u.full_name AS created_by_name,COALESCE(SUM(CASE WHEN con.status='successful' THEN con.amount ELSE 0 END),0) total_saved,COUNT(DISTINCT cm.user_id) member_count FROM circles c JOIN users u ON u.user_id=c.created_by LEFT JOIN circle_members cm ON cm.circle_id=c.circle_id LEFT JOIN contributions con ON con.circle_id=c.circle_id GROUP BY c.circle_id,u.full_name ORDER BY c.created_at DESC`, "circles");
const getContributions = list(`SELECT con.contribution_id,con.amount,con.method,con.status,con.transaction_reference,con.created_at,u.full_name,c.name circle_name FROM contributions con JOIN users u ON u.user_id=con.user_id JOIN circles c ON c.circle_id=con.circle_id ORDER BY con.created_at DESC`, "contributions");
const getCertificates = list(`SELECT cert.certificate_id,cert.certificate_status,cert.summary_text,cert.issued_at,c.name circle_name FROM certificates cert JOIN circles c ON c.circle_id=cert.circle_id ORDER BY cert.issued_at DESC`, "certificates");
const getReferrals = list(`SELECT ar.referral_id,ar.referral_status,ar.created_at,a.full_name ambassador_name,u.full_name household_name,u.phone_number,u.location FROM ambassador_referrals ar JOIN users a ON a.user_id=ar.ambassador_id JOIN users u ON u.user_id=ar.referred_user_id ORDER BY ar.created_at DESC`, "referrals");

module.exports = {
  getAdminOverview,
  getAmbassadorOverview, getUsers, getCircles, getContributions, getCertificates, getReferrals
};
