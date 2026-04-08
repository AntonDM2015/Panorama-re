-- =============================================
-- DELETE OLD ADMIN USER (created with wrong password hash)
-- =============================================

DELETE FROM users WHERE email = 'admin@plekhanov.ru';

-- Verify deletion
SELECT COUNT(*) as remaining_users FROM users WHERE email = 'admin@plekhanov.ru';
