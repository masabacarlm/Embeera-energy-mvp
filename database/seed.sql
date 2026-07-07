USE embeera_energy;

INSERT INTO users (full_name, phone_number, location, user_type) VALUES
('Amina Nakato', '0700000001', 'Mukono', 'household'),
('John Ssewanyana', '0700000002', 'Seeta', 'household'),
('Sarah Namutebi', '0700000003', 'Wakiso', 'ambassador');

INSERT INTO oluganda_groups (group_name, location, savings_target, current_amount) VALUES
('Mukono Clean Cooking Group', 'Mukono', 250000, 80000),
('Seeta LPG Savings Circle', 'Seeta', 250000, 50000);

INSERT INTO group_members (user_id, group_id, member_status) VALUES
(1, 1, 'active'),
(2, 2, 'active');

INSERT INTO savings_transactions (user_id, group_id, amount, payment_method, transaction_status) VALUES
(1, 1, 10000, 'MTN MoMo', 'successful'),
(1, 1, 20000, 'Airtel Money', 'successful'),
(2, 2, 15000, 'MTN MoMo', 'successful');

INSERT INTO learning_progress (user_id, topic_name, completion_status) VALUES
(1, 'Benefits of LPG', 'completed'),
(1, 'LPG Safety Tips', 'completed'),
(2, 'Benefits of LPG', 'completed');

INSERT INTO rewards (user_id, reward_type, points, reward_status) VALUES
(1, 'Savings Reward', 30, 'active'),
(1, 'Learning Reward', 20, 'active'),
(2, 'Savings Reward', 15, 'active');

INSERT INTO ambassadors (user_id, assigned_location, referrals_count) VALUES
(3, 'Mukono', 2);

INSERT INTO referrals (ambassador_id, referred_user_id, referral_status) VALUES
(1, 1, 'Started Saving'),
(1, 2, 'Joined Oluganda Circle');

INSERT INTO deliveries (user_id, group_id, item_name, delivery_status, delivery_location) VALUES
(1, 1, 'LPG Stove and Cylinder', 'Pending', 'Mukono');

INSERT INTO certificates (user_id, certificate_status) VALUES
(1, 'In Progress'),
(2, 'Not Eligible');
