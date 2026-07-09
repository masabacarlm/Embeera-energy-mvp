USE embeera_energy;

INSERT INTO users (full_name, phone_number, email, password, location, user_type) VALUES
('Masaba Carl Michael', '0703188291', 'masabacarl8@gmail.com', '$2b$10$Yd06PWYvEXl89JywZaayE.L7vAAZ/lkmxlSdwN7.doxcl8padO9Uq', 'Mukono', 'admin'),
('Amina Nakato', '0772000001', 'household@embeera.local', '$2b$10$g5auhVM4Di7dx//Jb.5CMudzH2Q9Mihkq91Tos0hWubsRf4GkPKqi', 'Mukono', 'member'),
('Sarah Namutebi', '0772000002', 'ambassador@embeera.local', '$2b$10$t21D9hODuftN/m6s1Awi8.7fytPcK2ZX0lfRhnlnwOpQ62DQ25SjW', 'Mukono', 'ambassador'),
('John Ssewanyana', '0772000003', NULL, '$2b$10$Ae8KZfEaQanCC8qb2E61P..08uV2VtI19l4ytSyzK2F/zLk4S2thq', 'Seeta', 'member');

INSERT INTO circles (name, target_amount, invite_code, created_by) VALUES
('Mukono LPG Mothers Circle', 250000, 'OLU-MUKONO', 2),
('Seeta Clean Kitchen Circle', 300000, 'OLU-SEETA', 3);

INSERT INTO circle_members (user_id, circle_id) VALUES
(2, 1),
(4, 1),
(3, 2);

INSERT INTO contributions (user_id, circle_id, amount, payment_method, status) VALUES
(2, 1, 40000, 'momo', 'successful'),
(4, 1, 25000, 'airtel', 'successful'),
(3, 2, 30000, 'momo', 'successful');

INSERT INTO lessons (title, body, sort_order) VALUES
('Why clean cooking matters', 'How LPG reduces smoke exposure and pressure on charcoal and firewood.', 1),
('Safe LPG cylinder handling', 'Cylinder storage, leak checks, and safe stove use at home.', 2),
('How to save consistently', 'Small regular deposits through an Oluganda Circle.', 3),
('Reducing smoke at home', 'Practical ways to keep kitchens healthier during transition.', 4),
('Preparing for LPG delivery', 'What a household should confirm before receiving LPG equipment.', 5);

INSERT INTO lesson_completions (user_id, lesson_id) VALUES
(2, 1),
(2, 2),
(2, 3);

INSERT INTO ambassador_referrals (ambassador_id, referred_user_id, referral_status) VALUES
(3, 2, 'transitioning'),
(3, 4, 'saving');

INSERT INTO oluganda_groups (group_name, location, savings_target, current_amount) VALUES
('Mukono Clean Cooking Group', 'Mukono', 250000, 80000),
('Seeta LPG Savings Circle', 'Seeta', 250000, 50000);

INSERT INTO group_members (user_id, group_id, member_status) VALUES
(2, 1, 'active'),
(4, 2, 'active');

INSERT INTO savings_transactions (user_id, group_id, amount, payment_method, transaction_status) VALUES
(2, 1, 10000, 'MTN MoMo', 'successful'),
(2, 1, 20000, 'Airtel Money', 'successful'),
(4, 2, 15000, 'MTN MoMo', 'successful');

INSERT INTO learning_progress (user_id, topic_name, completion_status) VALUES
(2, 'Benefits of LPG', 'completed'),
(2, 'LPG Safety Tips', 'completed'),
(4, 'Benefits of LPG', 'completed');

INSERT INTO rewards (user_id, reward_type, points, reward_status) VALUES
(2, 'Savings Reward', 30, 'active'),
(2, 'Learning Reward', 20, 'active'),
(4, 'Savings Reward', 15, 'active');

INSERT INTO ambassadors (user_id, assigned_location, referrals_count) VALUES
(3, 'Mukono', 2);

INSERT INTO referrals (ambassador_id, referred_user_id, referral_status) VALUES
(1, 2, 'Started Saving'),
(1, 4, 'Joined Oluganda Circle');

INSERT INTO deliveries (user_id, group_id, item_name, delivery_status, delivery_location) VALUES
(2, 1, 'LPG Stove and Cylinder', 'Pending', 'Mukono');

INSERT INTO certificates (user_id, certificate_status) VALUES
(2, 'In Progress'),
(4, 'Not Eligible');
