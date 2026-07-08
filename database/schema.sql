CREATE DATABASE IF NOT EXISTS embeera_energy;
USE embeera_energy;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    location VARCHAR(100),
    user_type VARCHAR(50) DEFAULT 'household',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oluganda_groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    savings_target DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_status VARCHAR(50) DEFAULT 'active',
    UNIQUE KEY unique_group_member (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES oluganda_groups(group_id)
);

CREATE TABLE savings_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_id INT,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_status VARCHAR(50) DEFAULT 'successful',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES oluganda_groups(group_id)
);

CREATE TABLE learning_progress (
    learning_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    topic_name VARCHAR(100),
    completion_status VARCHAR(50) DEFAULT 'not completed',
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE rewards (
    reward_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    reward_type VARCHAR(100),
    points INT DEFAULT 0,
    reward_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE ambassadors (
    ambassador_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    assigned_location VARCHAR(100),
    referrals_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    ambassador_id INT,
    referred_user_id INT,
    referral_status VARCHAR(50) DEFAULT 'referred',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambassador_id) REFERENCES ambassadors(ambassador_id),
    FOREIGN KEY (referred_user_id) REFERENCES users(user_id)
);

CREATE TABLE deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_id INT,
    item_name VARCHAR(100),
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES oluganda_groups(group_id)
);

CREATE TABLE certificates (
    certificate_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    certificate_status VARCHAR(50) DEFAULT 'not eligible',
    issued_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
