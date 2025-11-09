import db from "../config/database.js";

class Rental {
  // Pobierz wszystkie wypożyczenia
  static async getAll() {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn,
              u.first_name, u.last_name, u.email
       FROM rentals r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.rental_date DESC`
    );
    return rows;
  }

  // Pobierz wypożyczenie po ID
  static async getById(id) {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn,
              u.first_name, u.last_name, u.email
       FROM rentals r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Pobierz aktywne wypożyczenia
  static async getActive() {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn,
              u.first_name, u.last_name, u.email
       FROM rentals r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.status = 'active'
       ORDER BY r.due_date ASC`
    );
    return rows;
  }

  // Pobierz przeterminowane wypożyczenia
  static async getOverdue() {
    // Automatycznie zaktualizuj status na 'overdue'
    await db.query(
      `UPDATE rentals 
         SET status = 'overdue' 
         WHERE status = 'active' AND due_date < CURDATE()`
    );

    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn,
              u.first_name, u.last_name, u.email,
              DATEDIFF(CURDATE(), r.due_date) as days_overdue
       FROM rentals r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.status = 'overdue'
       ORDER BY r.due_date ASC`
    );

    return rows;
  }

  // Wypożycz książkę
  static async create(rentalData) {
    const { book_id, user_id, rental_date, due_date } = rentalData;

    // Sprawdź dostępność książki
    const [bookRows] = await db.query(
      "SELECT available_copies FROM books WHERE id = ?",
      [book_id]
    );

    if (!bookRows[0] || bookRows[0].available_copies <= 0) {
      throw new Error("Książka nie jest dostępna do wypożyczenia");
    }

    // Sprawdź czy użytkownik nie ma już tej książki wypożyczonej
    const [existingRental] = await db.query(
      'SELECT id FROM rentals WHERE book_id = ? AND user_id = ? AND status = "active"',
      [book_id, user_id]
    );

    if (existingRental.length > 0) {
      throw new Error("Użytkownik już wypożyczył tę książkę");
    }

    // Rozpocznij transakcję
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Dodaj wypożyczenie
      const [result] = await connection.query(
        'INSERT INTO rentals (book_id, user_id, rental_date, due_date, status) VALUES (?, ?, ?, ?, "active")',
        [book_id, user_id, rental_date, due_date]
      );

      // Zmniejsz liczbę dostępnych egzemplarzy
      await connection.query(
        "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
        [book_id]
      );

      await connection.commit();
      connection.release();

      return result.insertId;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Zwróć książkę
  static async returnBook(rentalId) {
    // Pobierz informacje o wypożyczeniu
    const [rentalRows] = await db.query("SELECT * FROM rentals WHERE id = ?", [
      rentalId,
    ]);

    if (!rentalRows[0]) {
      throw new Error("Wypożyczenie nie zostało znalezione");
    }

    const rental = rentalRows[0];

    if (rental.status === "returned") {
      throw new Error("Książka została już zwrócona");
    }

    // Rozpocznij transakcję
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Zaktualizuj status wypożyczenia
      await connection.query(
        'UPDATE rentals SET status = "returned", return_date = CURDATE() WHERE id = ?',
        [rentalId]
      );

      // Zwiększ liczbę dostępnych egzemplarzy
      await connection.query(
        "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?",
        [rental.book_id]
      );

      await connection.commit();
      connection.release();

      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Przedłuż wypożyczenie
  static async extend(rentalId, newDueDate) {
    const [rentalRows] = await db.query("SELECT * FROM rentals WHERE id = ?", [
      rentalId,
    ]);

    if (!rentalRows[0]) {
      throw new Error("Wypożyczenie nie zostało znalezione");
    }

    if (rentalRows[0].status !== "active") {
      throw new Error("Można przedłużyć tylko aktywne wypożyczenia");
    }

    const [result] = await db.query(
      'UPDATE rentals SET due_date = ?, status = "active" WHERE id = ?',
      [newDueDate, rentalId]
    );

    return result.affectedRows;
  }

  // Statystyki wypożyczeń
  static async getStats() {
    const [activeCount] = await db.query(
      'SELECT COUNT(*) as count FROM rentals WHERE status = "active"'
    );

    const [overdueCount] = await db.query(
      'SELECT COUNT(*) as count FROM rentals WHERE status = "active" AND due_date < CURDATE()'
    );

    const [returnedCount] = await db.query(
      'SELECT COUNT(*) as count FROM rentals WHERE status = "returned"'
    );

    const [totalCount] = await db.query(
      "SELECT COUNT(*) as count FROM rentals"
    );

    return {
      active: activeCount[0].count,
      overdue: overdueCount[0].count,
      returned: returnedCount[0].count,
      total: totalCount[0].count,
    };
  }

  // Najpopularniejsze książki
  static async getMostRented(limit = 10) {
    const [rows] = await db.query(
      `SELECT b.id, b.title, b.author, b.isbn, COUNT(r.id) as rental_count
       FROM books b
       JOIN rentals r ON b.id = r.book_id
       GROUP BY b.id
       ORDER BY rental_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

export default Rental;
