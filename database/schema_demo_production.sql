DROP DATABASE IF EXISTS embeera_energy;
CREATE DATABASE embeera_energy;
USE embeera_energy;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone_number VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NULL,
  password_hash VARCHAR(255) NULL,
  location VARCHAR(100),
  user_type ENUM('admin','member','ambassador') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE circles (
  circle_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(100),
  target_amount DECIMAL(12,2) NOT NULL,
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  status ENUM('active','completed') NOT NULL DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE circle_members (
  circle_member_id INT AUTO_INCREMENT PRIMARY KEY,
  circle_id INT NOT NULL,
  user_id INT NOT NULL,
  member_status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (circle_id, user_id),
  FOREIGN KEY (circle_id) REFERENCES circles(circle_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE contributions (
  contribution_id INT AUTO_INCREMENT PRIMARY KEY,
  circle_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('momo','airtel','cash') NOT NULL,
  status ENUM('pending','successful','failed') NOT NULL DEFAULT 'successful',
  transaction_reference VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (circle_id) REFERENCES circles(circle_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE lessons (
  lesson_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) UNIQUE NOT NULL,
  body TEXT NOT NULL,
  sort_order INT NOT NULL
);

CREATE TABLE lesson_completions (
  lesson_completion_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

CREATE TABLE certificates (
  certificate_id INT AUTO_INCREMENT PRIMARY KEY,
  circle_id INT NOT NULL UNIQUE,
  certificate_status ENUM('not eligible','issued') NOT NULL DEFAULT 'not eligible',
  summary_text TEXT,
  issued_at TIMESTAMP NULL,
  FOREIGN KEY (circle_id) REFERENCES circles(circle_id)
);

CREATE TABLE ambassador_referrals (
  referral_id INT AUTO_INCREMENT PRIMARY KEY,
  ambassador_id INT NOT NULL,
  referred_user_id INT NOT NULL,
  referral_status ENUM('referred','active','completed') NOT NULL DEFAULT 'referred',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (ambassador_id, referred_user_id),
  FOREIGN KEY (ambassador_id) REFERENCES users(user_id),
  FOREIGN KEY (referred_user_id) REFERENCES users(user_id)
);

CREATE TABLE delivery_requests (
  delivery_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  circle_id INT NOT NULL,
  item_name VARCHAR(120) NOT NULL,
  delivery_status ENUM('pending','scheduled','delivered','cancelled') NOT NULL DEFAULT 'pending',
  delivery_location VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (circle_id) REFERENCES circles(circle_id)
);
