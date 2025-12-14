import db from "../config/database.js";

class Reservation {
  // Pobierz wszystkie rezerwacje
  static async getAll() {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn, b.available_copies,
              u.first_name, u.last_name, u.email,
              admin.first_name as admin_first_name, admin.last_name as admin_last_name
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users admin ON r.processed_by = admin.id
       ORDER BY r.reservation_date DESC`
    );
    return rows;
  }

  // Pobierz rezerwację po ID
  static async getById(id) {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn, b.available_copies,
              u.first_name, u.last_name, u.email,
              admin.first_name as admin_first_name, admin.last_name as admin_last_name
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users admin ON r.processed_by = admin.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Pobierz rezerwacje użytkownika
  static async getByUserId(userId) {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn, b.available_copies
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = ?
       ORDER BY r.reservation_date DESC`,
      [userId]
    );
    return rows;
  }

  // Pobierz oczekujące rezerwacje
  static async getPending() {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn, b.available_copies,
              u.first_name, u.last_name, u.email
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.status = 'pending'
       ORDER BY r.reservation_date ASC`
    );
    return rows;
  }

  // Pobierz zaakceptowane rezerwacje
  static async getApproved() {
    const [rows] = await db.query(
      `SELECT r.*, 
              b.title, b.author, b.isbn, b.available_copies,
              u.first_name, u.last_name, u.email
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE r.status = 'approved'
       ORDER BY r.preferred_pickup_date ASC`
    );
    return rows;
  }

  // Utwórz rezerwację
  static async create(reservationData) {
    const { book_id, user_id, preferred_pickup_date } = reservationData;

    // Sprawdź czy użytkownik nie ma już aktywnej rezerwacji tej książki
    const [existingReservation] = await db.query(
      `SELECT id FROM reservations 
       WHERE book_id = ? AND user_id = ? 
       AND status IN ('pending', 'approved')`,
      [book_id, user_id]
    );

    if (existingReservation.length > 0) {
      throw new Error("Masz już aktywną rezerwację tej książki");
    }

    // Sprawdź czy użytkownik nie ma aktywnego wypożyczenia tej książki
    const [existingRental] = await db.query(
      `SELECT id FROM rentals 
       WHERE book_id = ? AND user_id = ? AND status = 'active'`,
      [book_id, user_id]
    );

    if (existingRental.length > 0) {
      throw new Error("Masz już wypożyczoną tę książkę");
    }

    // Ustaw datę wygaśnięcia (7 dni od zatwierdzenia)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [result] = await db.query(
      `INSERT INTO reservations 
       (book_id, user_id, preferred_pickup_date, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [book_id, user_id, preferred_pickup_date, expiresAt]
    );

    return result.insertId;
  }

  // Zatwierdź rezerwację (admin)
  static async approve(id, adminId, adminNotes = null) {
    const reservation = await this.getById(id);

    if (!reservation) {
      throw new Error("Rezerwacja nie została znaleziona");
    }

    if (reservation.status !== "pending") {
      throw new Error("Można zatwierdzić tylko oczekujące rezerwacje");
    }

    // Sprawdź dostępność książki
    const [book] = await db.query(
      "SELECT available_copies FROM books WHERE id = ?",
      [reservation.book_id]
    );

    if (!book[0] || book[0].available_copies <= 0) {
      throw new Error("Książka nie jest dostępna");
    }

    const [result] = await db.query(
      `UPDATE reservations 
       SET status = 'approved', 
           processed_by = ?, 
           processed_date = NOW(),
           admin_notes = ?
       WHERE id = ?`,
      [adminId, adminNotes, id]
    );

    return result.affectedRows;
  }

  // Odrzuć rezerwację (admin)
  static async reject(id, adminId, adminNotes) {
    const reservation = await this.getById(id);

    if (!reservation) {
      throw new Error("Rezerwacja nie została znaleziona");
    }

    if (reservation.status !== "pending") {
      throw new Error("Można odrzucić tylko oczekujące rezerwacje");
    }

    const [result] = await db.query(
      `UPDATE reservations 
       SET status = 'rejected', 
           processed_by = ?, 
           processed_date = NOW(),
           admin_notes = ?
       WHERE id = ?`,
      [adminId, adminNotes, id]
    );

    return result.affectedRows;
  }

  // Anuluj rezerwację (użytkownik)
  static async cancel(id, userId) {
    const reservation = await this.getById(id);

    if (!reservation) {
      throw new Error("Rezerwacja nie została znaleziona");
    }

    if (reservation.user_id !== userId) {
      throw new Error("Nie możesz anulować cudzej rezerwacji");
    }

    if (!["pending", "approved"].includes(reservation.status)) {
      throw new Error("Nie można anulować tej rezerwacji");
    }

    const [result] = await db.query(
      `UPDATE reservations 
       SET status = 'cancelled' 
       WHERE id = ?`,
      [id]
    );

    return result.affectedRows;
  }

  // Zamień rezerwację na wypożyczenie (admin)
  static async convertToRental(reservationId, rentalDate, dueDate) {
    const reservation = await this.getById(reservationId);

    if (!reservation) {
      throw new Error("Rezerwacja nie została znaleziona");
    }

    if (reservation.status !== "approved") {
      throw new Error("Można zamienić tylko zatwierdzone rezerwacje");
    }

    // Sprawdź dostępność książki
    const [book] = await db.query(
      "SELECT available_copies FROM books WHERE id = ?",
      [reservation.book_id]
    );

    if (!book[0] || book[0].available_copies <= 0) {
      throw new Error("Książka nie jest dostępna do wypożyczenia");
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Utwórz wypożyczenie
      await connection.query(
        `INSERT INTO rentals (book_id, user_id, rental_date, due_date, status) 
         VALUES (?, ?, ?, ?, 'active')`,
        [reservation.book_id, reservation.user_id, rentalDate, dueDate]
      );

      // Zmniejsz liczbę dostępnych egzemplarzy
      await connection.query(
        "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
        [reservation.book_id]
      );

      // Oznacz rezerwację jako zrealizowaną
      await connection.query(
        `UPDATE reservations SET status = 'completed' WHERE id = ?`,
        [reservationId]
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

  // Usuń wygasłe rezerwacje
  static async cleanupExpired() {
    const [result] = await db.query(
      `UPDATE reservations 
       SET status = 'cancelled' 
       WHERE status = 'approved' 
       AND expires_at < NOW()`
    );

    return result.affectedRows;
  }

  // Statystyki rezerwacji
  static async getStats() {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM reservations`
    );

    return stats[0];
  }
}

export default Reservation;
