import db from "../config/database.js";

class Book {
  // Pobierz wszystkie książki
  static async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM books ORDER BY created_at DESC"
    );
    return rows;
  }

  // Pobierz książkę po ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [id]);
    return rows[0];
  }

  // Dodaj nową książkę
  static async create(bookData) {
    const {
      title,
      author,
      isbn,
      publication_year,
      total_copies,
      available_copies,
    } = bookData;
    const [result] = await db.query(
      "INSERT INTO books (title, author, isbn, publication_year, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title,
        author,
        isbn,
        publication_year,
        total_copies || 1,
        available_copies || 1,
      ]
    );
    return result.insertId;
  }

  // Aktualizuj książkę
  static async update(id, bookData) {
    const {
      title,
      author,
      isbn,
      publication_year,
      total_copies,
      available_copies,
    } = bookData;
    const [result] = await db.query(
      "UPDATE books SET title = ?, author = ?, isbn = ?, publication_year = ?, total_copies = ?, available_copies = ? WHERE id = ?",
      [
        title,
        author,
        isbn,
        publication_year,
        total_copies,
        available_copies,
        id,
      ]
    );
    return result.affectedRows;
  }

  // Usuń książkę
  static async delete(id) {
    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);
    return result.affectedRows;
  }

  // Wyszukaj książki
  static async search(query) {
    const searchTerm = `%${query}%`;
    const [rows] = await db.query(
      "SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?",
      [searchTerm, searchTerm, searchTerm]
    );
    return rows;
  }

  // Sprawdź dostępność
  static async checkAvailability(id) {
    const [rows] = await db.query(
      "SELECT available_copies FROM books WHERE id = ?",
      [id]
    );
    return rows[0]?.available_copies > 0;
  }
}

export default Book;
