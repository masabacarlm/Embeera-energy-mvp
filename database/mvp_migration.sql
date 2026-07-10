USE embeera_energy;

-- Phase 1 note:
-- The old migration that created legacy tables has been retired.
-- Do not drop legacy tables automatically during the controlled demo audit.
-- Use database/schema.sql for new local setup.

-- Constraint audit queries for an existing cleaned database.
SHOW INDEX FROM users WHERE Column_name IN ('phone_number', 'email');
SHOW INDEX FROM circles WHERE Column_name = 'invite_code';
SHOW INDEX FROM circle_members WHERE Key_name = 'unique_circle_member';
SHOW INDEX FROM lesson_completions WHERE Key_name = 'unique_lesson_completion';
SHOW INDEX FROM certificates WHERE Column_name = 'circle_id';
SHOW INDEX FROM ambassador_referrals WHERE Key_name = 'unique_ambassador_referral';
