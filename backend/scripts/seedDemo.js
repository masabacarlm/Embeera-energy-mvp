const path = require("path");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/db");
const demoPassword = String(process.env.DEMO_PASSWORD || "");

const users = [
  ["Masaba Carl Michael", "0703188291", "masabacarl8@gmail.com", "Mukono", "admin"],
  ["Amina Nakato", "0772000001", "household@embeera.local", "Mukono", "member"],
  ["Sarah Namutebi", "0772000002", "ambassador@embeera.local", "Seeta", "ambassador"],
  ["John Ssewanyana", "0772000003", "john@embeera.local", "Seeta", "member"],
  ["Grace Nansubuga", "0772000004", "grace@embeera.local", "Kampala", "member"]
];
const lessons = [
  ["Why clean cooking matters", "How LPG reduces smoke exposure and pressure on charcoal and firewood.", 1],
  ["Safe LPG cylinder handling", "Cylinder storage, leak checks, and safe stove use at home.", 2],
  ["How to save consistently", "Small regular deposits through an Oluganda Circle.", 3],
  ["Reducing smoke at home", "Practical ways to keep kitchens healthier during transition.", 4],
  ["Preparing for LPG delivery", "What a household should confirm before receiving LPG equipment.", 5]
];

async function upsertUser(connection, user, passwordHash) {
  await connection.execute(
    `INSERT INTO users (full_name, phone_number, email, password_hash, location, user_type) VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), email=VALUES(email), password_hash=VALUES(password_hash),
       location=VALUES(location), user_type=VALUES(user_type)`,
    [user[0], user[1], user[2], passwordHash, user[3], user[4]]
  );
  const [rows] = await connection.execute("SELECT user_id FROM users WHERE phone_number=?", [user[1]]);
  return rows[0].user_id;
}

async function seedDemo() {
  if (demoPassword.length < 12) {
    throw new Error("DEMO_PASSWORD must be set to at least 12 characters.");
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const hash = await bcrypt.hash(demoPassword, 10);
    const ids = {};
    for (const user of users) ids[user[1]] = await upsertUser(connection, user, hash);
    for (const lesson of lessons) await connection.execute(
      `INSERT INTO lessons (title,body,sort_order) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE body=VALUES(body),sort_order=VALUES(sort_order)`, lesson);

    const circles = [
      ["Mukono LPG Mothers Circle", "Mukono", 90000, "OLU-MUKONO", "completed", ids["0772000001"]],
      ["Seeta Clean Kitchen Circle", "Seeta", 300000, "OLU-SEETA", "active", ids["0772000002"]],
      ["Kampala Starter Circle", "Kampala", 500000, "OLU-KAMPALA", "active", ids["0772000002"]]
    ];
    for (const circle of circles) await connection.execute(
      `INSERT INTO circles (name,location,target_amount,invite_code,status,created_by) VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name),location=VALUES(location),target_amount=VALUES(target_amount),
       status=VALUES(status),created_by=VALUES(created_by)`, circle);
    const [circleRows] = await connection.query("SELECT circle_id,invite_code FROM circles WHERE invite_code IN ('OLU-MUKONO','OLU-SEETA','OLU-KAMPALA')");
    const circleIds = Object.fromEntries(circleRows.map((row) => [row.invite_code, row.circle_id]));

    for (const [code, phone] of [["OLU-MUKONO","0772000001"],["OLU-MUKONO","0772000003"],["OLU-SEETA","0772000002"],["OLU-KAMPALA","0772000004"]])
      await connection.execute(`INSERT INTO circle_members (circle_id,user_id,member_status) VALUES (?,?,'active')
        ON DUPLICATE KEY UPDATE member_status=VALUES(member_status)`, [circleIds[code], ids[phone]]);

    const contributions = [
      [circleIds["OLU-MUKONO"],ids["0772000001"],45000,"momo","SANDBOX-SEED-001"],
      [circleIds["OLU-MUKONO"],ids["0772000003"],45000,"airtel","SANDBOX-SEED-002"],
      [circleIds["OLU-SEETA"],ids["0772000002"],150000,"cash","SANDBOX-SEED-003"],
      [circleIds["OLU-KAMPALA"],ids["0772000004"],25000,"momo","SANDBOX-SEED-004"]
    ];
    for (const row of contributions) await connection.execute(
      `INSERT INTO contributions (circle_id,user_id,amount,method,status,transaction_reference) VALUES (?,?,?,?,'successful',?)
       ON DUPLICATE KEY UPDATE amount=VALUES(amount),method=VALUES(method),status=VALUES(status)`, row);

    const [lessonRows] = await connection.query("SELECT lesson_id,sort_order FROM lessons WHERE sort_order BETWEEN 1 AND 5");
    for (const [phone, maximum] of [["0772000001",5],["0772000003",5],["0772000002",3],["0772000004",1]])
      for (const lesson of lessonRows.filter((row) => row.sort_order <= maximum))
        await connection.execute("INSERT IGNORE INTO lesson_completions (user_id,lesson_id) VALUES (?,?)", [ids[phone],lesson.lesson_id]);

    await connection.execute(`INSERT INTO certificates (circle_id,certificate_status,summary_text,issued_at)
      VALUES (?,'issued','Mukono LPG Mothers Circle completed the clean cooking transition.',CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE certificate_status=VALUES(certificate_status),summary_text=VALUES(summary_text),
      issued_at=COALESCE(issued_at,CURRENT_TIMESTAMP)`, [circleIds["OLU-MUKONO"]]);
    for (const [phone,status] of [["0772000001","completed"],["0772000004","active"]])
      await connection.execute(`INSERT INTO ambassador_referrals (ambassador_id,referred_user_id,referral_status) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE referral_status=VALUES(referral_status)`, [ids["0772000002"],ids[phone],status]);

    const deliveries = [
      [ids["0772000001"],circleIds["OLU-MUKONO"],"LPG starter kit","pending","Mukono"],
      [ids["0772000003"],circleIds["OLU-MUKONO"],"LPG refill","delivered","Mukono"]
    ];
    for (const row of deliveries) await connection.execute(
      `INSERT INTO delivery_requests (user_id,circle_id,item_name,delivery_status,delivery_location,delivered_at)
       SELECT ?,?,?,?,?,IF(?='delivered',CURRENT_TIMESTAMP,NULL) WHERE NOT EXISTS
       (SELECT 1 FROM delivery_requests WHERE user_id=? AND circle_id=? AND item_name=?)`,
      [...row,row[3],row[0],row[1],row[2]]);
    await connection.commit();
    console.log("Demo data seeded successfully.");
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

seedDemo().catch((error) => { console.error("Demo seed failed:", error.message); process.exitCode=1; })
  .finally(() => db.end());
