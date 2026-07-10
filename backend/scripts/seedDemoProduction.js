const bcrypt = require("bcryptjs");
const db = require("../config/db");

const users = [
  {
    full_name: "Masaba Carl Michael",
    phone_number: "0703188291",
    email: "masabacarl8@gmail.com",
    location: "Mukono",
    user_type: "admin",
    password: "admin123"
  },
  {
    full_name: "Amina Nakato",
    phone_number: "0772000001",
    email: "household@embeera.local",
    location: "Mukono",
    user_type: "member",
    password: "member123"
  },
  {
    full_name: "Sarah Namutebi",
    phone_number: "0772000002",
    email: "ambassador@embeera.local",
    location: "Seeta",
    user_type: "ambassador",
    password: "ambassador123"
  },
  {
    full_name: "John Ssewanyana",
    phone_number: "0772000003",
    email: null,
    location: "Seeta",
    user_type: "member",
    password: "member123"
  }
];

const lessons = [
  ["Why clean cooking matters", "How LPG reduces smoke exposure and pressure on charcoal and firewood.", 1],
  ["Safe LPG cylinder handling", "Cylinder storage, leak checks, and safe stove use at home.", 2],
  ["How to save consistently", "Small regular deposits through an Oluganda Circle.", 3],
  ["Reducing smoke at home", "Practical ways to keep kitchens healthier during transition.", 4],
  ["Preparing for LPG delivery", "What a household should confirm before receiving LPG equipment.", 5]
];

const upsertUser = async (connection, user) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  await connection.execute(
    `INSERT INTO users (full_name, phone_number, email, password_hash, location, user_type)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       email = VALUES(email),
       password_hash = VALUES(password_hash),
       location = VALUES(location),
       user_type = VALUES(user_type)`,
    [user.full_name, user.phone_number, user.email, passwordHash, user.location, user.user_type]
  );

  const [rows] = await connection.execute(
    `SELECT user_id FROM users WHERE phone_number = ? LIMIT 1`,
    [user.phone_number]
  );
  return rows[0].user_id;
};

const run = async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const ids = {};
    for (const user of users) {
      ids[user.phone_number] = await upsertUser(connection, user);
    }

    for (const lesson of lessons) {
      await connection.execute(
        `INSERT INTO lessons (title, body, sort_order)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE body = VALUES(body), sort_order = VALUES(sort_order)`,
        lesson
      );
    }

    await connection.execute(
      `INSERT INTO circles (circle_id, name, location, target_amount, invite_code, status, created_by)
       VALUES
       (1, 'Mukono LPG Mothers Circle', 'Mukono', 90000, 'OLU-MUKONO', 'active', ?),
       (2, 'Seeta Clean Kitchen Circle', 'Seeta', 300000, 'OLU-SEETA', 'active', ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location), target_amount = VALUES(target_amount), status = VALUES(status)`,
      [ids["0772000001"], ids["0772000002"]]
    );

    await connection.execute(
      `INSERT INTO circle_members (circle_id, user_id, member_status)
       VALUES (1, ?, 'active'), (1, ?, 'active'), (2, ?, 'active')
       ON DUPLICATE KEY UPDATE member_status = 'active'`,
      [ids["0772000001"], ids["0772000003"], ids["0772000002"]]
    );

    await connection.execute(
      `INSERT INTO contributions (circle_id, user_id, amount, method, status, transaction_reference)
       VALUES
       (1, ?, 45000, 'momo', 'successful', 'SANDBOX-SEED-001'),
       (1, ?, 45000, 'airtel', 'successful', 'SANDBOX-SEED-002'),
       (2, ?, 30000, 'cash', 'successful', 'SANDBOX-SEED-003')`,
      [ids["0772000001"], ids["0772000003"], ids["0772000002"]]
    );

    const [lessonRows] = await connection.execute(`SELECT lesson_id FROM lessons ORDER BY sort_order ASC`);
    for (const memberPhone of ["0772000001", "0772000003"]) {
      for (const lesson of lessonRows) {
        await connection.execute(
          `INSERT INTO lesson_completions (user_id, lesson_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE completed_at = completed_at`,
          [ids[memberPhone], lesson.lesson_id]
        );
      }
    }

    await connection.execute(
      `INSERT INTO certificates (circle_id, certificate_status, summary_text, issued_at)
       VALUES (1, 'issued', 'Mukono LPG Mothers Circle has completed the clean cooking journey and is ready for LPG transition.', CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE certificate_status = 'issued', summary_text = VALUES(summary_text), issued_at = COALESCE(issued_at, CURRENT_TIMESTAMP)`
    );

    await connection.execute(
      `INSERT INTO ambassador_referrals (ambassador_id, referred_user_id, referral_status)
       VALUES (?, ?, 'completed')
       ON DUPLICATE KEY UPDATE referral_status = VALUES(referral_status)`,
      [ids["0772000002"], ids["0772000001"]]
    );

    await connection.execute(
      `INSERT INTO delivery_requests (user_id, circle_id, item_name, delivery_status, delivery_location)
       VALUES (?, 1, 'LPG starter kit', 'pending', 'Mukono')
       ON DUPLICATE KEY UPDATE delivery_status = delivery_status`,
      [ids["0772000001"]]
    );

    await connection.commit();
    console.log("Demo production seed data inserted.");
  } catch (error) {
    await connection.rollback();
    console.error("Demo production seed failed:", error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await db.end();
  }
};

run();
