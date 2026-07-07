Embeera Energy ERD Notes
========================

Purpose
-------

This document explains the database entities and relationships used in the Embeera Energy MVP.

The database supports users, Oluganda Circles, savings transactions, learning progress, rewards, ambassadors, referrals, LPG deliveries, and Enkola Certificates.

Main Entities
-------------

1. users

Stores information about households, ambassadors, and other system users.

Important fields:
- user_id
- full_name
- phone_number
- location
- user_type
- created_at

2. oluganda_groups

Stores community savings groups.

Important fields:
- group_id
- group_name
- location
- savings_target
- current_amount
- created_at

3. group_members

Connects users to Oluganda Circles.

Important fields:
- member_id
- user_id
- group_id
- joined_at
- member_status

4. savings_transactions

Stores user savings contributions.

Important fields:
- transaction_id
- user_id
- group_id
- amount
- payment_method
- transaction_status
- created_at

5. learning_progress

Tracks clean cooking and LPG safety learning.

Important fields:
- learning_id
- user_id
- topic_name
- completion_status
- completed_at

6. rewards

Stores reward points earned by users.

Important fields:
- reward_id
- user_id
- reward_type
- points
- reward_status
- created_at

7. ambassadors

Stores Omukwano Ambassador details.

Important fields:
- ambassador_id
- user_id
- assigned_location
- referrals_count
- created_at

8. referrals

Tracks households referred by ambassadors.

Important fields:
- referral_id
- ambassador_id
- referred_user_id
- referral_status
- created_at

9. deliveries

Tracks LPG stove and cylinder deliveries.

Important fields:
- delivery_id
- user_id
- group_id
- item_name
- delivery_status
- delivery_location
- created_at
- delivered_at

10. certificates

Stores Enkola Certificate status.

Important fields:
- certificate_id
- user_id
- certificate_status
- issued_at

Main Relationships
------------------

1. One user can join many Oluganda Circles through the group_members table.

Relationship:
users 1-to-many group_members

2. One Oluganda Circle can have many users.

Relationship:
oluganda_groups 1-to-many group_members

3. One user can make many savings transactions.

Relationship:
users 1-to-many savings_transactions

4. One Oluganda Circle can receive many savings transactions.

Relationship:
oluganda_groups 1-to-many savings_transactions

5. One user can complete many learning topics.

Relationship:
users 1-to-many learning_progress

6. One user can earn many rewards.

Relationship:
users 1-to-many rewards

7. One user can be registered as one ambassador.

Relationship:
users 1-to-1 ambassadors

8. One ambassador can refer many households.

Relationship:
ambassadors 1-to-many referrals

9. One referred household is linked to one referral record.

Relationship:
users 1-to-many referrals through referred_user_id

10. One user can have many LPG delivery records.

Relationship:
users 1-to-many deliveries

11. One Oluganda Circle can have many deliveries linked to it.

Relationship:
oluganda_groups 1-to-many deliveries

12. One user can receive one Enkola Certificate after transition completion.

Relationship:
users 1-to-1 certificates

ERD Summary
-----------

The ERD shows how Embeera Energy connects households to savings groups, tracks their savings, supports learning, records rewards, manages ambassador referrals, monitors LPG delivery, and issues Enkola Certificates after successful transition.

This database design supports the main MVP journey:

Register
? Join Oluganda Circle
? Save Money
? Learn
? Request LPG Delivery
? Receive Enkola Certificate
? Earn Rewards
