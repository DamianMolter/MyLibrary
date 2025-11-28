-- Production Database Setup
-- Execute this in Railway MySQL Query interface

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'reader') DEFAULT 'reader',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(13),
  publication_year INT,
  available_copies INT DEFAULT 1,
  total_copies INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_isbn (isbn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  rental_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_book (book_id),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert admin user
-- Password: admin123
-- IMPORTANT: Change this password after first login!
INSERT INTO users (first_name, last_name, email, password, role, phone) 
VALUES (
  'Admin', 
  'System', 
  'admin@library.com', 
  '$2b$10$K8p4aKZ0.L5l5l5l5l5l5OeGZQvJ5J5J5J5J5J5J5J5J5J5J5J5J5O',
  'admin', 
  '000000000'
)
-- Insert example reader user
-- Password: password123
-- IMPORTANT: Change this password after first login!
VALUES (
   'Czytelnik',
   'System',
   'jan@example.com',
   '$2a$12$uwSb3d5hv368cMqIgI/SvuO27faSiGMmdH5z5tY43Hrj6v1BsL2tK',
   'reader',
   '000000000')
 ON DUPLICATE KEY UPDATE email = email;

-- Insert sample books (optional)
INSERT INTO books (title, author, isbn, publication_year, total_copies, available_copies) VALUES
('Wiedźmin: Ostatnie życzenie', 'Andrzej Sapkowski', '9788375780659', 1993, 3, 3),
('Pan Tadeusz', 'Adam Mickiewicz', '9788308038472', 1834, 2, 2),
('Solaris', 'Stanisław Lem', '9788308049242', 1961, 2, 2)
ON DUPLICATE KEY UPDATE title = title;