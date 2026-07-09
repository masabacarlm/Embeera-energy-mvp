USE embeera_energy;

ALTER TABLE users
  ADD COLUMN session_token VARCHAR(100) UNIQUE;

ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255);

CREATE TABLE IF NOT EXISTS otp_requests (
  phone_number VARCHAR(20) PRIMARY KEY,
  otp_code VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS circles (
  circle_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS circle_members (
  circle_member_id INT AUTO_INCREMENT PRIMARY KEY,
  circle_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_circle_member (circle_id, user_id),
  FOREIGN KEY (circle_id) REFERENCES circles(circle_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS contributions (
  contribution_id INT AUTO_INCREMENT PRIMARY KEY,
  circle_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(30) DEFAULT 'successful',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (circle_id) REFERENCES circles(circle_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS lessons (
  lesson_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL UNIQUE,
  body TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_completions (
  lesson_completion_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_lesson_completion (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

CREATE TABLE IF NOT EXISTS ambassador_referrals (
  referral_id INT AUTO_INCREMENT PRIMARY KEY,
  ambassador_id INT NOT NULL,
  referred_user_id INT NOT NULL,
  referral_status VARCHAR(50) DEFAULT 'referred',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_ambassador_referral (ambassador_id, referred_user_id),
  FOREIGN KEY (ambassador_id) REFERENCES users(user_id),
  FOREIGN KEY (referred_user_id) REFERENCES users(user_id)
);

ALTER TABLE certificates
  ADD COLUMN circle_id INT NULL UNIQUE,
  ADD COLUMN summary_text TEXT;

INSERT INTO users (full_name, phone_number, email, password, location, user_type)
VALUES
('Masaba Carl Michael', '0703188291', 'masabacarl8@gmail.com', '$2b$10$Yd06PWYvEXl89JywZaayE.L7vAAZ/lkmxlSdwN7.doxcl8padO9Uq', 'Mukono', 'admin'),
('Amina Nakato', '0772000001', 'household@embeera.local', '$2b$10$g5auhVM4Di7dx//Jb.5CMudzH2Q9Mihkq91Tos0hWubsRf4GkPKqi', 'Mukono', 'member'),
('Sarah Namutebi', '0772000002', 'ambassador@embeera.local', '$2b$10$t21D9hODuftN/m6s1Awi8.7fytPcK2ZX0lfRhnlnwOpQ62DQ25SjW', 'Mukono', 'ambassador')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone_number = VALUES(phone_number),
  password = VALUES(password),
  location = VALUES(location),
  user_type = VALUES(user_type);

INSERT INTO lessons (title, body, sort_order) VALUES
('Why clean cooking matters', 'How LPG reduces smoke exposure and pressure on charcoal and firewood.', 1),
('Safe LPG cylinder handling', 'Cylinder storage, leak checks, and safe stove use at home.', 2),
('How to save consistently', 'Small regular deposits through an Oluganda Circle.', 3),
('Reducing smoke at home', 'Practical ways to keep kitchens healthier during transition.', 4),
('Preparing for LPG delivery', 'What a household should confirm before receiving LPG equipment.', 5)
ON DUPLICATE KEY UPDATE body = VALUES(body), sort_order = VALUES(sort_order);

INSERT INTO circles (name, target_amount, invite_code, created_by)
SELECT 'Mukono LPG Mothers Circle', 250000, 'OLU-MUKONO', user_id
FROM users
WHERE phone_number = '0772000001'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO circle_members (circle_id, user_id)
SELECT c.circle_id, u.user_id
FROM circles c
JOIN users u ON u.phone_number IN ('0772000001', '0772000003')
WHERE c.invite_code = 'OLU-MUKONO'
ON DUPLICATE KEY UPDATE joined_at = joined_at;

INSERT INTO ambassador_referrals (ambassador_id, referred_user_id, referral_status)
SELECT a.user_id, m.user_id, 'transitioning'
FROM users a
JOIN users m ON m.phone_number = '0772000001'
WHERE a.phone_number = '0772000002'
ON DUPLICATE KEY UPDATE referral_status = VALUES(referral_status);
