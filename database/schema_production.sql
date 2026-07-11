-- Authoritative Embeera Energy production schema. Runs in the configured database.

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  email VARCHAR(150) NULL,
  password_hash VARCHAR(255) NOT NULL,
  location VARCHAR(100) NOT NULL,
  user_type ENUM('admin', 'member', 'ambassador') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_phone_number (phone_number),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_type_location (user_type, location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS circles (
  circle_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(100) NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  invite_code VARCHAR(20) NOT NULL,
  status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (circle_id), UNIQUE KEY uq_circles_invite_code (invite_code),
  KEY idx_circles_creator_status (created_by, status),
  CONSTRAINT fk_circles_created_by FOREIGN KEY (created_by) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS circle_members (
  circle_member_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  circle_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL,
  member_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (circle_member_id), UNIQUE KEY uq_circle_members_circle_user (circle_id, user_id),
  KEY idx_circle_members_user_status (user_id, member_status),
  CONSTRAINT fk_circle_members_circle FOREIGN KEY (circle_id) REFERENCES circles (circle_id),
  CONSTRAINT fk_circle_members_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contributions (
  contribution_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  circle_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL, method ENUM('momo', 'airtel', 'cash') NOT NULL,
  status ENUM('pending', 'successful', 'failed') NOT NULL DEFAULT 'successful',
  transaction_reference VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (contribution_id), UNIQUE KEY uq_contributions_transaction_reference (transaction_reference),
  KEY idx_contributions_circle_status (circle_id, status), KEY idx_contributions_user_created (user_id, created_at),
  CONSTRAINT fk_contributions_circle FOREIGN KEY (circle_id) REFERENCES circles (circle_id),
  CONSTRAINT fk_contributions_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lessons (
  lesson_id INT UNSIGNED NOT NULL AUTO_INCREMENT, title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL, sort_order INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (lesson_id), UNIQUE KEY uq_lessons_title (title), KEY idx_lessons_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lesson_completions (
  lesson_completion_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL, lesson_id INT UNSIGNED NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (lesson_completion_id), UNIQUE KEY uq_lesson_completions_user_lesson (user_id, lesson_id),
  KEY idx_lesson_completions_lesson (lesson_id),
  CONSTRAINT fk_lesson_completions_user FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT fk_lesson_completions_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificates (
  certificate_id INT UNSIGNED NOT NULL AUTO_INCREMENT, circle_id INT UNSIGNED NOT NULL,
  certificate_status ENUM('not eligible', 'issued') NOT NULL DEFAULT 'not eligible',
  summary_text TEXT NULL, issued_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (certificate_id), UNIQUE KEY uq_certificates_circle (circle_id),
  KEY idx_certificates_status (certificate_status),
  CONSTRAINT fk_certificates_circle FOREIGN KEY (circle_id) REFERENCES circles (circle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ambassador_referrals (
  referral_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ambassador_id INT UNSIGNED NOT NULL, referred_user_id INT UNSIGNED NOT NULL,
  referral_status ENUM('referred', 'active', 'completed') NOT NULL DEFAULT 'referred',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (referral_id), UNIQUE KEY uq_ambassador_referrals_pair (ambassador_id, referred_user_id),
  KEY idx_ambassador_referrals_referred_status (referred_user_id, referral_status),
  CONSTRAINT fk_ambassador_referrals_ambassador FOREIGN KEY (ambassador_id) REFERENCES users (user_id),
  CONSTRAINT fk_ambassador_referrals_referred_user FOREIGN KEY (referred_user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS delivery_requests (
  delivery_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL, circle_id INT UNSIGNED NOT NULL,
  item_name VARCHAR(120) NOT NULL,
  delivery_status ENUM('pending', 'scheduled', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  delivery_location VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  PRIMARY KEY (delivery_id), KEY idx_delivery_requests_user_circle_status (user_id, circle_id, delivery_status),
  KEY idx_delivery_requests_circle_created (circle_id, created_at),
  CONSTRAINT fk_delivery_requests_user FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT fk_delivery_requests_circle FOREIGN KEY (circle_id) REFERENCES circles (circle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
