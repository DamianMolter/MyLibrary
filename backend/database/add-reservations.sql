USE library_db;

-- Dodaj tabelę rezerwacji
CREATE TABLE IF NOT EXISTS reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  preferred_pickup_date DATE,
  status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
  admin_notes TEXT,
  processed_by INT,
  processed_date DATETIME,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_book (book_id),
  INDEX idx_reservation_date (reservation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela reservations utworzona pomyślnie!' as message;