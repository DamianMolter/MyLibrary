import db from "../config/database.js";

class User {
  // Pobierz wszystkich użytkowników
  static async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    return rows;
  }

  // Pobierz użytkownika po ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  // Pobierz użytkownika po email
  static async getByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  // Dodaj nowego użytkownika
  static async create(userData) {
    const { first_name, last_name, email, phone } = userData;

    // Sprawdź czy email już istnieje
    const existingUser = await this.getByEmail(email);
    if (existingUser) {
      throw new Error("Użytkownik z tym adresem email już istnieje");
    }

    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)",
      [first_name, last_name, email, phone]
    );
    return result.insertId;
  }

  // Aktualizuj użytkownika
  static async update(id, userData) {
    const { first_name, last_name, email, phone } = userData;

    // Jeśli zmienia email, sprawdź czy nowy email nie jest zajęty
    if (email) {
      const existingUser = await this.getByEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        throw new Error("Użytkownik z tym adresem email już istnieje");
      }
    }

    const [result] = await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?",
      [first_name, last_name, email, phone, id]
    );
    return result.affectedRows;
  }

  // Usuń użytkownika
  static async delete(id) {
    // Sprawdź czy użytkownik ma aktywne wypożyczenia
    const [activeRentals] = await db.query(
      'SELECT COUNT(*) as count FROM rentals WHERE user_id = ? AND status = "active"',
      [id]
    );

    if (activeRentals[0].count > 0) {
      throw new Error(
        "Nie można usunąć użytkownika z aktywnymi wypożyczeniami"
      );
    }

    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows;
  }

  // Wyszukaj użytkowników
  static async search(query) {
    const searchTerm = `%${query}%`;
    const [rows] = await db.query(
      "SELECT * FROM users WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?",
      [searchTerm, searchTerm, searchTerm]
    );
    return rows;
  }

  // Pobierz historię wypożyczeń użytkownika
  static async getRentalHistory(userId) {
    const [rows] = await db.query(
      `SELECT r.*, b.title, b.author, b.isbn 
       FROM rentals r 
       JOIN books b ON r.book_id = b.id 
       WHERE r.user_id = ? 
       ORDER BY r.rental_date DESC`,
      [userId]
    );
    return rows;
  }

  // Pobierz aktywne wypożyczenia użytkownika
  static async getActiveRentals(userId) {
    const [rows] = await db.query(
      `SELECT r.*, b.title, b.author, b.isbn 
       FROM rentals r 
       JOIN books b ON r.book_id = b.id 
       WHERE r.user_id = ? AND r.status = 'active'
       ORDER BY r.due_date ASC`,
      [userId]
    );
    return rows;
  }
}

export default User;
