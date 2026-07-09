const crypto = require("crypto");
const db = require("../config/db");
const { normalizeRole } = require("../middleware/authMiddleware");

const LESSONS = [
  ["Why clean cooking matters", "How LPG reduces smoke exposure and pressure on charcoal and firewood."],
  ["Safe LPG cylinder handling", "Cylinder storage, leak checks, and safe stove use at home."],
  ["How to save consistently", "Small regular deposits through an Oluganda Circle."],
  ["Reducing smoke at home", "Practical ways to keep kitchens healthier during transition."],
  ["Preparing for LPG delivery", "What a household should confirm before receiving LPG equipment."]
];

const makeCode = (prefix = "OLU") =>
  `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const makeToken = () => crypto.randomBytes(24).toString("hex");

const userJson = (user) => ({
  user_id: user.user_id,
  full_name: user.full_name,
  phone_number: user.phone_number,
  email: user.email,
  location: user.location,
  role: normalizeRole(user.user_type),
  user_type: normalizeRole(user.user_type)
});

const ensureMvpData = async () => {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS otp_requests (
      phone_number VARCHAR(20) PRIMARY KEY,
      otp_code VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await db.execute(
    `CREATE TABLE IF NOT EXISTS lessons (
      lesson_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL UNIQUE,
      body TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  for (let index = 0; index < LESSONS.length; index += 1) {
    await db.execute(
      `INSERT INTO lessons (title, body, sort_order)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE body = VALUES(body), sort_order = VALUES(sort_order)`,
      [LESSONS[index][0], LESSONS[index][1], index + 1]
    );
  }
};

const findUserById = async (userId) => {
  const [rows] = await db.execute(
    `SELECT user_id, full_name, phone_number, email, location, user_type
     FROM users
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const getCircleSummary = async (circleId) => {
  const [circleRows] = await db.execute(
    `SELECT
       c.circle_id,
       c.name,
       c.target_amount,
       c.invite_code,
       c.created_by,
       c.created_at,
       COALESCE(SUM(CASE WHEN con.status = 'successful' THEN con.amount ELSE 0 END), 0) AS total_saved
     FROM circles c
     LEFT JOIN contributions con ON con.circle_id = c.circle_id
     WHERE c.circle_id = ?
     GROUP BY c.circle_id`,
    [circleId]
  );

  if (circleRows.length === 0) return null;

  const circle = circleRows[0];
  const [members] = await db.execute(
    `SELECT
       u.user_id,
       u.full_name,
       u.phone_number,
       u.location,
       cm.joined_at,
       COALESCE(SUM(CASE WHEN con.status = 'successful' THEN con.amount ELSE 0 END), 0) AS contribution_total
     FROM circle_members cm
     JOIN users u ON u.user_id = cm.user_id
     LEFT JOIN contributions con
       ON con.user_id = u.user_id
      AND con.circle_id = cm.circle_id
     WHERE cm.circle_id = ?
     GROUP BY u.user_id, cm.joined_at
     ORDER BY cm.joined_at ASC`,
    [circleId]
  );

  const target = Number(circle.target_amount || 0);
  const total = Number(circle.total_saved || 0);

  return {
    ...circle,
    target_amount: target,
    total_saved: total,
    progress_percentage: target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0,
    members: members.map((member) => ({
      ...member,
      contribution_total: Number(member.contribution_total || 0)
    }))
  };
};

const hasCircleAccess = async (circleId, user) => {
  if (user.role === "admin") return true;
  const [rows] = await db.execute(
    `SELECT circle_member_id
     FROM circle_members
     WHERE circle_id = ? AND user_id = ?
     LIMIT 1`,
    [circleId, user.user_id]
  );
  return rows.length > 0;
};

const requestOtp = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    await ensureMvpData();
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      `INSERT INTO otp_requests (phone_number, otp_code, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expires_at = VALUES(expires_at), created_at = CURRENT_TIMESTAMP`,
      [phone_number, otp, expiresAt]
    );

    res.status(501).json({ message: "SMS OTP is not enabled for this controlled pilot." });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({ message: "Could not generate OTP." });
  }
};

const verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;

  if (!phone_number || !otp) {
    return res.status(400).json({ message: "Phone number and OTP are required." });
  }

  try {
    await ensureMvpData();
    const [otpRows] = await db.execute(
      `SELECT otp_code, expires_at
       FROM otp_requests
       WHERE phone_number = ?
       LIMIT 1`,
      [phone_number]
    );

    if (otpRows.length === 0 || otpRows[0].otp_code !== otp || new Date(otpRows[0].expires_at) < new Date()) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    const [userRows] = await db.execute(
      `SELECT user_id, full_name, phone_number, email, location, user_type
       FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [phone_number]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "No user exists for this phone number." });
    }

    const token = makeToken();
    await db.execute(`UPDATE users SET session_token = ? WHERE user_id = ?`, [token, userRows[0].user_id]);
    await db.execute(`DELETE FROM otp_requests WHERE phone_number = ?`, [phone_number]);

    res.json({ message: "Login successful", token, user: userJson(userRows[0]) });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Could not verify OTP." });
  }
};

const getMe = async (req, res) => {
  res.json({ user: userJson(req.user) });
};

const createCircle = async (req, res) => {
  const { name, target_amount } = req.body;
  const target = Number(target_amount);

  if (!name || !Number.isFinite(target) || target <= 0) {
    return res.status(400).json({ message: "Circle name and target amount greater than zero are required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    let inviteCode = makeCode();
    let inserted = false;
    let result;

    while (!inserted) {
      try {
        [result] = await connection.execute(
          `INSERT INTO circles (name, target_amount, invite_code, created_by)
           VALUES (?, ?, ?, ?)`,
          [name, target, inviteCode, req.user.user_id]
        );
        inserted = true;
      } catch (error) {
        if (error.code !== "ER_DUP_ENTRY") throw error;
        inviteCode = makeCode();
      }
    }

    await connection.execute(
      `INSERT INTO circle_members (circle_id, user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE joined_at = joined_at`,
      [result.insertId, req.user.user_id]
    );

    await connection.commit();
    res.status(201).json({ message: "Oluganda Circle created.", circle: await getCircleSummary(result.insertId) });
  } catch (error) {
    await connection.rollback();
    console.error("Create circle error:", error);
    res.status(500).json({ message: "Could not create circle." });
  } finally {
    connection.release();
  }
};

const getMyCircles = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.circle_id
       FROM circle_members cm
       JOIN circles c ON c.circle_id = cm.circle_id
       WHERE cm.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );
    const circles = [];
    for (const row of rows) circles.push(await getCircleSummary(row.circle_id));
    res.json({ circles });
  } catch (error) {
    console.error("My circles error:", error);
    res.status(500).json({ message: "Could not load circles." });
  }
};

const joinCircle = async (req, res) => {
  const { invite_code } = req.body;

  if (!invite_code) {
    return res.status(400).json({ message: "Invite code is required." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT circle_id FROM circles WHERE invite_code = ? LIMIT 1`,
      [String(invite_code).trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Invalid invite code." });
    }

    await db.execute(
      `INSERT INTO circle_members (circle_id, user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE joined_at = joined_at`,
      [rows[0].circle_id, req.user.user_id]
    );

    res.json({ message: "Joined Oluganda Circle.", circle: await getCircleSummary(rows[0].circle_id) });
  } catch (error) {
    console.error("Join circle error:", error);
    res.status(500).json({ message: "Could not join circle." });
  }
};

const getCircle = async (req, res) => {
  const circleId = Number(req.params.circleId);

  try {
    if (!(await hasCircleAccess(circleId, req.user))) {
      return res.status(403).json({ message: "User not authorised for this circle." });
    }
    const circle = await getCircleSummary(circleId);
    if (!circle) return res.status(404).json({ message: "Circle not found." });
    res.json({ circle });
  } catch (error) {
    console.error("Circle error:", error);
    res.status(500).json({ message: "Could not load circle." });
  }
};

const getCircleMembers = async (req, res) => {
  const circle = await getCircleSummary(Number(req.params.circleId));
  if (!circle) return res.status(404).json({ message: "Circle not found." });
  res.json({ members: circle.members });
};

const createContribution = async (req, res) => {
  const circleId = Number(req.params.circleId);
  const amount = Number(req.body.amount);
  const paymentMethod = req.body.payment_method;

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Contribution amount must be greater than zero." });
  }

  if (!["momo", "airtel"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Payment method must be momo or airtel." });
  }

  try {
    if (!(await hasCircleAccess(circleId, req.user))) {
      return res.status(403).json({ message: "Join this Oluganda Circle before contributing." });
    }

    const [result] = await db.execute(
      `INSERT INTO contributions (circle_id, user_id, amount, payment_method, status)
       VALUES (?, ?, ?, ?, 'successful')`,
      [circleId, req.user.user_id, amount, paymentMethod]
    );

    res.status(201).json({
      message: "Sandbox payment recorded",
      contribution: {
        contribution_id: result.insertId,
        circle_id: circleId,
        user_id: req.user.user_id,
        amount,
        payment_method: paymentMethod,
        status: "successful"
      },
      circle: await getCircleSummary(circleId)
    });
  } catch (error) {
    console.error("Contribution error:", error);
    res.status(500).json({ message: "Could not save contribution." });
  }
};

const getContributions = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT con.*, u.full_name
       FROM contributions con
       JOIN users u ON u.user_id = con.user_id
       WHERE con.circle_id = ?
       ORDER BY con.created_at DESC`,
      [req.params.circleId]
    );
    res.json({ contributions: rows });
  } catch (error) {
    console.error("Contributions error:", error);
    res.status(500).json({ message: "Could not load contributions." });
  }
};

const getMyContributions = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT *
       FROM contributions
       WHERE circle_id = ? AND user_id = ?
       ORDER BY created_at DESC`,
      [req.params.circleId, req.user.user_id]
    );
    res.json({ contributions: rows });
  } catch (error) {
    console.error("My contributions error:", error);
    res.status(500).json({ message: "Could not load your contributions." });
  }
};

const getLessons = async (req, res) => {
  try {
    await ensureMvpData();
    const [lessons] = await db.execute(`SELECT * FROM lessons ORDER BY sort_order ASC, lesson_id ASC`);
    const [completed] = await db.execute(
      `SELECT lesson_id FROM lesson_completions WHERE user_id = ?`,
      [req.user.user_id]
    );
    const completedSet = new Set(completed.map((row) => row.lesson_id));
    res.json({
      lessons: lessons.map((lesson) => ({
        ...lesson,
        completed: completedSet.has(lesson.lesson_id)
      }))
    });
  } catch (error) {
    console.error("Lessons error:", error);
    res.status(500).json({ message: "Could not load lessons." });
  }
};

const getLesson = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM lessons WHERE lesson_id = ? LIMIT 1`, [req.params.lessonId]);
    if (rows.length === 0) return res.status(404).json({ message: "Lesson not found." });
    res.json({ lesson: rows[0] });
  } catch (error) {
    console.error("Lesson error:", error);
    res.status(500).json({ message: "Could not load lesson." });
  }
};

const completeLesson = async (req, res) => {
  try {
    await db.execute(
      `INSERT INTO lesson_completions (user_id, lesson_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE completed_at = completed_at`,
      [req.user.user_id, req.params.lessonId]
    );
    res.json({ message: "Lesson marked complete." });
  } catch (error) {
    console.error("Complete lesson error:", error);
    res.status(500).json({ message: "Could not complete lesson." });
  }
};

const getLessonProgress = async (req, res) => {
  try {
    const [[lessonCount]] = await db.execute(`SELECT COUNT(*) AS total FROM lessons`);
    const [[completionCount]] = await db.execute(
      `SELECT COUNT(*) AS completed FROM lesson_completions WHERE user_id = ?`,
      [req.user.user_id]
    );
    res.json({
      completed: Number(completionCount.completed || 0),
      total: Number(lessonCount.total || 0)
    });
  } catch (error) {
    console.error("Lesson progress error:", error);
    res.status(500).json({ message: "Could not load lesson progress." });
  }
};

const getCertificateStatusForCircle = async (circleId) => {
  const circle = await getCircleSummary(circleId);
  if (!circle) return null;

  const [[lessonCount]] = await db.execute(`SELECT COUNT(*) AS total FROM lessons`);
  const [memberRows] = await db.execute(
    `SELECT cm.user_id, COUNT(lc.lesson_id) AS completed_lessons
     FROM circle_members cm
     LEFT JOIN lesson_completions lc ON lc.user_id = cm.user_id
     WHERE cm.circle_id = ?
     GROUP BY cm.user_id`,
    [circleId]
  );
  const [certificateRows] = await db.execute(
    `SELECT * FROM certificates WHERE circle_id = ? LIMIT 1`,
    [circleId]
  );

  const totalLessons = Number(lessonCount.total || 0);
  const allLessonsComplete =
    memberRows.length > 0 &&
    memberRows.every((row) => Number(row.completed_lessons || 0) >= totalLessons);
  const savingsReady = circle.total_saved >= circle.target_amount;
  const qualified = savingsReady && allLessonsComplete;

  return {
    qualified,
    savings_ready: savingsReady,
    lessons_ready: allLessonsComplete,
    total_saved: circle.total_saved,
    target_amount: circle.target_amount,
    completed_members: memberRows.filter((row) => Number(row.completed_lessons || 0) >= totalLessons).length,
    member_count: memberRows.length,
    total_lessons: totalLessons,
    certificate: certificateRows[0] || null
  };
};

const certificateStatus = async (req, res) => {
  try {
    const status = await getCertificateStatusForCircle(Number(req.params.circleId));
    if (!status) return res.status(404).json({ message: "Circle not found." });
    res.json(status);
  } catch (error) {
    console.error("Certificate status error:", error);
    res.status(500).json({ message: "Could not load certificate status." });
  }
};

const generateCertificate = async (req, res) => {
  const circleId = Number(req.params.circleId);

  try {
    const status = await getCertificateStatusForCircle(circleId);
    if (!status) return res.status(404).json({ message: "Circle not found." });
    if (!status.qualified) {
      return res.status(400).json({ message: "Circle is not certificate-ready yet.", status });
    }

    const circle = await getCircleSummary(circleId);
    const summary = `${circle.name} has completed the Embeera Energy clean LPG transition readiness journey with UGX ${Number(circle.total_saved).toLocaleString()} saved.`;

    await db.execute(
      `INSERT INTO certificates (circle_id, certificate_status, issued_at, summary_text)
       VALUES (?, 'issued', CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE certificate_status = certificate_status`,
      [circleId, summary]
    );

    const refreshed = await getCertificateStatusForCircle(circleId);
    res.status(201).json({ message: "Enkola Certificate ready.", certificate: refreshed.certificate });
  } catch (error) {
    console.error("Generate certificate error:", error);
    res.status(500).json({ message: "Could not generate certificate." });
  }
};

const getCertificate = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM certificates WHERE circle_id = ? LIMIT 1`,
      [req.params.circleId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Certificate not found." });
    res.json({ certificate: rows[0] });
  } catch (error) {
    console.error("Certificate error:", error);
    res.status(500).json({ message: "Could not load certificate." });
  }
};

const addReferral = async (req, res) => {
  const { full_name, phone_number, location } = req.body;

  if (!full_name || !phone_number) {
    return res.status(400).json({ message: "Household name and phone number are required." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      `SELECT user_id FROM users WHERE phone_number = ? LIMIT 1`,
      [phone_number]
    );

    let referredUserId = existing[0]?.user_id;
    if (!referredUserId) {
      const [result] = await connection.execute(
        `INSERT INTO users (full_name, phone_number, location, user_type)
         VALUES (?, ?, ?, 'member')`,
        [full_name, phone_number, location || req.user.location || "Mukono"]
      );
      referredUserId = result.insertId;
    }

    await connection.execute(
      `INSERT INTO ambassador_referrals (ambassador_id, referred_user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE referral_status = referral_status`,
      [req.user.user_id, referredUserId]
    );

    await connection.commit();
    res.status(201).json({ message: "Household referral saved.", referred_user_id: referredUserId });
  } catch (error) {
    await connection.rollback();
    console.error("Add referral error:", error);
    res.status(500).json({ message: "Could not save referral." });
  } finally {
    connection.release();
  }
};

const referralRowsFor = async (ambassadorId, referredUserId = null) => {
  const params = [ambassadorId];
  let filter = "";
  if (referredUserId) {
    filter = "AND u.user_id = ?";
    params.push(referredUserId);
  }

  const [rows] = await db.execute(
    `SELECT
       ar.referral_id,
       ar.referral_status,
       ar.created_at,
       u.user_id,
       u.full_name,
       u.phone_number,
       u.location,
       c.circle_id,
       c.name AS circle_name,
       c.target_amount,
       COALESCE(SUM(CASE WHEN con.status = 'successful' THEN con.amount ELSE 0 END), 0) AS total_saved,
       cert.certificate_id
     FROM ambassador_referrals ar
     JOIN users u ON u.user_id = ar.referred_user_id
     LEFT JOIN circle_members cm ON cm.user_id = u.user_id
     LEFT JOIN circles c ON c.circle_id = cm.circle_id
     LEFT JOIN contributions con ON con.circle_id = c.circle_id
     LEFT JOIN certificates cert ON cert.circle_id = c.circle_id
     WHERE ar.ambassador_id = ?
       ${filter}
     GROUP BY ar.referral_id, u.user_id, c.circle_id, cert.certificate_id
     ORDER BY ar.created_at DESC`,
    params
  );

  return rows.map((row) => {
    const target = Number(row.target_amount || 0);
    const saved = Number(row.total_saved || 0);
    const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return {
      ...row,
      target_amount: target,
      total_saved: saved,
      progress_percentage: progress,
      transition_status: row.certificate_id
        ? "certificate-ready"
        : progress > 0
          ? "transitioning"
          : "saving"
    };
  });
};

const getReferrals = async (req, res) => {
  try {
    res.json({ referrals: await referralRowsFor(req.user.user_id) });
  } catch (error) {
    console.error("Referrals error:", error);
    res.status(500).json({ message: "Could not load referrals." });
  }
};

const getReferral = async (req, res) => {
  try {
    const referrals = await referralRowsFor(req.user.user_id, req.params.referredUserId);
    if (referrals.length === 0) return res.status(404).json({ message: "Referral not found." });
    res.json({ referral: referrals[0] });
  } catch (error) {
    console.error("Referral detail error:", error);
    res.status(500).json({ message: "Could not load referral." });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  getMe,
  createCircle,
  getMyCircles,
  joinCircle,
  getCircle,
  getCircleMembers,
  createContribution,
  getContributions,
  getMyContributions,
  getLessons,
  getLesson,
  completeLesson,
  getLessonProgress,
  certificateStatus,
  generateCertificate,
  getCertificate,
  addReferral,
  getReferrals,
  getReferral
};
