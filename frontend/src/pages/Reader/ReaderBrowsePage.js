import React, { useState, useEffect } from "react";
import { booksAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorMessage from "../../components/Common/ErrorMessage";
import "./ReaderBrowsePage.css";

const ReaderBrowsePage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, filterAvailable, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAll();
      setBooks(response.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania książek");
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filtruj po dostępności
    if (filterAvailable) {
      filtered = filtered.filter((book) => book.available_copies > 0);
    }

    // Filtruj po zapytaniu
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.isbn && book.isbn.includes(query))
      );
    }

    setFilteredBooks(filtered);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="reader-browse-page">
      <div className="browse-header">
        <h1>📚 Katalog Książek</h1>
        <p>Przeglądaj dostępne książki</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Filtry i wyszukiwanie */}
      <div className="browse-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Szukaj po tytule, autorze lub ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="btn-clear">
              ✕ Wyczyść
            </button>
          )}
        </div>

        <div className="filter-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.checked)}
            />
            Tylko dostępne książki
          </label>
        </div>
      </div>

      <div className="books-count">
        <p>Znaleziono: {filteredBooks.length} książek</p>
      </div>

      {/* Lista książek */}
      {filteredBooks.length === 0 ? (
        <div className="no-books">
          <p>Nie znaleziono książek</p>
          {searchQuery && <p>Spróbuj zmienić kryteria wyszukiwania</p>}
        </div>
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-card-reader">
              <div className="book-card-header">
                <h3>{book.title}</h3>
                {book.available_copies > 0 ? (
                  <span className="availability available">✓ Dostępna</span>
                ) : (
                  <span className="availability unavailable">
                    ✗ Wypożyczona
                  </span>
                )}
              </div>

              <div className="book-card-body">
                <p>
                  <strong>Autor:</strong> {book.author}
                </p>
                {book.isbn && (
                  <p>
                    <strong>ISBN:</strong> {book.isbn}
                  </p>
                )}
                {book.publication_year && (
                  <p>
                    <strong>Rok wydania:</strong> {book.publication_year}
                  </p>
                )}

                <div className="book-availability-info">
                  <strong>Dostępność:</strong>
                  <span
                    className={
                      book.available_copies > 0 ? "text-success" : "text-danger"
                    }
                  >
                    {book.available_copies} / {book.total_copies} egzemplarzy
                  </span>
                </div>
              </div>

              <div className="book-card-footer">
                {book.available_copies > 0 ? (
                  <div className="info-message success">
                    ✓ Książka jest dostępna do wypożyczenia. Skontaktuj się z
                    biblioteką.
                  </div>
                ) : (
                  <div className="info-message">
                    ℹ️ Wszystkie egzemplarze są obecnie wypożyczone
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReaderBrowsePage;
