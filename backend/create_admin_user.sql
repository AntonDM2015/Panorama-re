-- =============================================
-- CREATE ADMIN USER
-- =============================================

-- Password: admin123
-- Email: admin@plekhanov.ru

INSERT INTO users (email, password_hash, role) 
VALUES (
  'admin@plekhanov.ru',
  crypt('admin123', gen_salt('bf')),
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, role FROM users WHERE email = 'admin@plekhanov.ru';
