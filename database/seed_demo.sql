-- Authoritative demo data specification for the canonical schema.
-- Run `npm run db:seed-demo` from backend instead of executing this file directly.
-- The Node seed hashes DEMO_PASSWORD with bcryptjs and safely upserts the users below:
-- Masaba Carl Michael / 0703188291 / masabacarl8@gmail.com / Mukono / admin
-- Amina Nakato / 0772000001 / household@embeera.local / Mukono / member
-- Sarah Namutebi / 0772000002 / ambassador@embeera.local / Seeta / ambassador
-- John Ssewanyana and Grace Nansubuga provide certificate-ready and low-progress examples.
--
-- The Node implementation also idempotently inserts five Transition lessons, three
-- deterministic circles, memberships, successful sandbox contributions, lesson
-- completions at low/active/ready levels, one certificate, referrals, and pending
-- and completed delivery requests. Passwords and password hashes intentionally do
-- not live in SQL. See backend/scripts/seedDemo.js for the executable seed.

INSERT INTO lessons (title, body, sort_order) VALUES
  ('Why clean cooking matters', 'How LPG reduces smoke exposure and pressure on charcoal and firewood.', 1),
  ('Safe LPG cylinder handling', 'Cylinder storage, leak checks, and safe stove use at home.', 2),
  ('How to save consistently', 'Small regular deposits through an Oluganda Circle.', 3),
  ('Reducing smoke at home', 'Practical ways to keep kitchens healthier during transition.', 4),
  ('Preparing for LPG delivery', 'What a household should confirm before receiving LPG equipment.', 5)
ON DUPLICATE KEY UPDATE body = VALUES(body), sort_order = VALUES(sort_order);

INSERT INTO circles (name, location, target_amount, invite_code, status, created_by)
SELECT 'Mukono LPG Mothers Circle', 'Mukono', 90000, 'OLU-MUKONO', 'completed', user_id
FROM users WHERE phone_number = '0772000001'
ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location),
  target_amount = VALUES(target_amount), status = VALUES(status), created_by = VALUES(created_by);
INSERT INTO circles (name, location, target_amount, invite_code, status, created_by)
SELECT 'Seeta Clean Kitchen Circle', 'Seeta', 300000, 'OLU-SEETA', 'active', user_id
FROM users WHERE phone_number = '0772000002'
ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location),
  target_amount = VALUES(target_amount), status = VALUES(status), created_by = VALUES(created_by);
INSERT INTO circles (name, location, target_amount, invite_code, status, created_by)
SELECT 'Kampala Starter Circle', 'Kampala', 500000, 'OLU-KAMPALA', 'active', user_id
FROM users WHERE phone_number = '0772000002'
ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location),
  target_amount = VALUES(target_amount), status = VALUES(status), created_by = VALUES(created_by);

INSERT IGNORE INTO circle_members (circle_id, user_id, member_status)
SELECT c.circle_id, u.user_id, 'active' FROM circles c JOIN users u
WHERE (c.invite_code = 'OLU-MUKONO' AND u.phone_number IN ('0772000001', '0772000003'))
   OR (c.invite_code = 'OLU-SEETA' AND u.phone_number = '0772000002')
   OR (c.invite_code = 'OLU-KAMPALA' AND u.phone_number = '0772000004');

INSERT IGNORE INTO contributions (circle_id, user_id, amount, method, status, transaction_reference)
SELECT c.circle_id, u.user_id, d.amount, d.method, 'successful', d.transaction_reference
FROM (
  SELECT 'OLU-MUKONO' invite_code, '0772000001' phone_number, 45000 amount, 'momo' method, 'SANDBOX-SEED-001' transaction_reference
  UNION ALL SELECT 'OLU-MUKONO', '0772000003', 45000, 'airtel', 'SANDBOX-SEED-002'
  UNION ALL SELECT 'OLU-SEETA', '0772000002', 150000, 'cash', 'SANDBOX-SEED-003'
  UNION ALL SELECT 'OLU-KAMPALA', '0772000004', 25000, 'momo', 'SANDBOX-SEED-004'
) d JOIN circles c ON c.invite_code = d.invite_code JOIN users u ON u.phone_number = d.phone_number;

INSERT IGNORE INTO lesson_completions (user_id, lesson_id)
SELECT u.user_id, l.lesson_id FROM users u JOIN lessons l
WHERE (u.phone_number IN ('0772000001', '0772000003') AND l.sort_order <= 5)
   OR (u.phone_number = '0772000002' AND l.sort_order <= 3)
   OR (u.phone_number = '0772000004' AND l.sort_order = 1);

INSERT INTO certificates (circle_id, certificate_status, summary_text, issued_at)
SELECT circle_id, 'issued', 'Mukono LPG Mothers Circle completed the clean cooking transition.', CURRENT_TIMESTAMP
FROM circles WHERE invite_code = 'OLU-MUKONO'
ON DUPLICATE KEY UPDATE certificate_status = VALUES(certificate_status),
  summary_text = VALUES(summary_text), issued_at = COALESCE(issued_at, CURRENT_TIMESTAMP);

INSERT IGNORE INTO ambassador_referrals (ambassador_id, referred_user_id, referral_status)
SELECT a.user_id, u.user_id, d.referral_status
FROM (SELECT '0772000001' phone_number, 'completed' referral_status
      UNION ALL SELECT '0772000004', 'active') d
JOIN users a ON a.phone_number = '0772000002' JOIN users u ON u.phone_number = d.phone_number;

INSERT INTO delivery_requests (user_id, circle_id, item_name, delivery_status, delivery_location, delivered_at)
SELECT u.user_id, c.circle_id, d.item_name, d.delivery_status, 'Mukono',
  IF(d.delivery_status = 'delivered', CURRENT_TIMESTAMP, NULL)
FROM (SELECT '0772000001' phone_number, 'LPG starter kit' item_name, 'pending' delivery_status
      UNION ALL SELECT '0772000003', 'LPG refill', 'delivered') d
JOIN users u ON u.phone_number = d.phone_number JOIN circles c ON c.invite_code = 'OLU-MUKONO'
WHERE NOT EXISTS (
  SELECT 1 FROM delivery_requests existing
  WHERE existing.user_id = u.user_id AND existing.circle_id = c.circle_id AND existing.item_name = d.item_name
);
