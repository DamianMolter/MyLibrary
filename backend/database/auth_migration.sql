USE library_db;

-- Dodaj kolumny do tabeli users
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) NOT NULL AFTER email,
ADD COLUMN role ENUM('admin', 'reader') DEFAULT 'reader' AFTER password,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Aktualizuj istniejące dane (opcjonalnie)
-- Hasło: admin123 (zahashowane)
UPDATE users SET 
  password = '$2b$10$rZ5FqP0vK8pY.4LqJ9mNP.FqF9yqF5QxH5VxH5VxH5VxH5VxH5VxH',
  role = 'reader'
WHERE password = '';

-- Dodaj konto administratora (hasło: admin123)
INSERT INTO users (first_name, last_name, email, password, role, phone) 
VALUES ('Admin', 'System', 'admin@library.com', '$2b$10$rZ5FqP0vK8pY.4LqJ9mNP.FqF9yqF5QxH5VxH5VxH5VxH5VxH5VxH', 'admin', '000000000')
ON DUPLICATE KEY UPDATE role = 'admin';