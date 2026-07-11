USE embeera_energy;

INSERT INTO users (user_id, full_name, phone_number, email, password_hash, location, user_type) VALUES
(1, 'Masaba Carl Michael', '0703188291', 'masabacarl8@gmail.com', '$2b$10$PVm1AA6Hr9G8ct.hUUcHp.YtSP4Xg9lQfot0MwsBGbBfMHw6sijAG', 'Mukono', 'admin'),
(2, 'Amina Nakato', '0772000001', 'household@embeera.local', '$2b$10$edLIJuLo4e1Aj4wkYgFXGuHzb4ORGLAbci0zQVvjzIYASuiJQSN62', 'Mukono', 'member'),
(3, 'Sarah Namutebi', '0772000002', 'ambassador@embeera.local', '$2b$10$FS62LYJuRZma4g1YUMh/JON5gfkQgQkspJEWxsmRldp0jD9vmyq02', 'Seeta', 'ambassador'),
(4, 'John Ssewanyana', '0772000003', NULL, '$2b$10$edLIJuLo4e1Aj4wkYgFXGuHzb4ORGLAbci0zQVvjzIYASuiJQSN62', 'Seeta', 'member');

INSERT INTO circles (circle_id, name, location, target_amount, invite_code, status, created_by) VALUES
(1, 'Mukono LPG Mothers Circle', 'Mukono', 90000, 'OLU-MUKONO', 'active', 2),
(2, 'Seeta Clean Kitchen Circle', 'Seeta', 300000, 'OLU-SEETA', 'active', 3);

INSERT INTO circle_members (circle_id, user_id, member_status) VALUES
(1, 2, 'active'),
(1, 4, 'active'),
(2, 3, 'active');

INSERT INTO contributions (circle_id, user_id, amount, method, status, transaction_reference) VALUES
(1, 2, 45000, 'momo', 'successful', 'SANDBOX-SEED-001'),
(1, 4, 45000, 'airtel', 'successful', 'SANDBOX-SEED-002'),
(2, 3, 30000, 'cash', 'successful', 'SANDBOX-SEED-003');

INSERT INTO lessons (lesson_id, title, body, sort_order) VALUES
(1, 'Why clean cooking matters', 'How LPG reduces smoke exposure and pressure on charcoal and firewood.', 1),
(2, 'Safe LPG cylinder handling', 'Cylinder storage, leak checks, and safe stove use at home.', 2),
(3, 'How to save consistently', 'Small regular deposits through an Oluganda Circle.', 3),
(4, 'Reducing smoke at home', 'Practical ways to keep kitchens healthier during transition.', 4),
(5, 'Preparing for LPG delivery', 'What a household should confirm before receiving LPG equipment.', 5);

INSERT INTO lesson_completions (user_id, lesson_id) VALUES
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5);

INSERT INTO certificates (circle_id, certificate_status, summary_text, issued_at) VALUES
(1, 'issued', 'Mukono LPG Mothers Circle has completed the clean cooking journey and is ready for LPG transition.', CURRENT_TIMESTAMP);

INSERT INTO ambassador_referrals (ambassador_id, referred_user_id, referral_status) VALUES
(3, 2, 'completed');

INSERT INTO delivery_requests (user_id, circle_id, item_name, delivery_status, delivery_location) VALUES
(2, 1, 'LPG starter kit', 'pending', 'Mukono');
