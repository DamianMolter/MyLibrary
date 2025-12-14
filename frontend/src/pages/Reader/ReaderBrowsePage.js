import React, { useState, useEffect } from "react";
import { booksAPI, reservationsAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorMessage from "../../components/Common/ErrorMessage";
import "./ReaderBrowsePage.css";

const ReaderBrowsePage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [reservingBookId, setReservingBookId] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [preferredDate, setPreferredDate] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, filterAvailable, books]);

  useEffect(() => {
    // Ustaw minimalną datę na jutro
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split("T")[0]);
  }, []);

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

    if (filterAvailable) {
      filtered = filtered.filter((book) => book.available_copies > 0);
    }

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

  const handleReserveClick = (book) => {
    setSelectedBook(book);
    setShowReservationModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleReserveSubmit = async () => {
    if (!preferredDate) {
      setError("Wybierz preferowaną datę odbioru");
      return;
    }

    try {
      setReservingBookId(selectedBook.id);
      await reservationsAPI.create({
        book_id: selectedBook.id,
        preferred_pickup_date: preferredDate,
      });

      setSuccess(
        `Rezerwacja książki "${selectedBook.title}" została złożona! Poczekaj na potwierdzenie przez administratora.`
      );
      setShowReservationModal(false);
      setSelectedBook(null);

      // Wyczyść success po 5 sekundach
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Błąd podczas tworzenia rezerwacji"
      );
      console.error("Error creating reservation:", err);
    } finally {
      setReservingBookId(null);
    }
  };

  const handleCloseModal = () => {
    setShowReservationModal(false);
    setSelectedBook(null);
    setError(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="reader-browse-page">
      <div className="browse-header">
        <h1>📚 Katalog Książek</h1>
        <p>Przeglądaj i rezerwuj dostępne książki</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {success && <div className="success-message">✅ {success}</div>}

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
                  <button
                    onClick={() => handleReserveClick(book)}
                    className="btn-reserve"
                    disabled={reservingBookId === book.id}
                  >
                    {reservingBookId === book.id
                      ? "⏳ Rezerwuję..."
                      : "📅 Zarezerwuj książkę"}
                  </button>
                ) : (
                  <div className="info-message">
                    ℹ️ Wszystkie egzemplarze są obecnie wypożyczone. Możesz
                    zarezerwować gdy będzie dostępna.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal rezerwacji */}
      {showReservationModal && selectedBook && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Rezerwacja książki</h2>
              <button onClick={handleCloseModal} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="book-info-modal">
                <h3>{selectedBook.title}</h3>
                <p>
                  <strong>Autor:</strong> {selectedBook.author}
                </p>
                {selectedBook.isbn && (
                  <p>
                    <strong>ISBN:</strong> {selectedBook.isbn}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="preferred_date">
                  Preferowana data odbioru: *
                </label>
                <input
                  type="date"
                  id="preferred_date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={
                    new Date(Date.now() + 86400000).toISOString().split("T")[0]
                  }
                  className="date-input"
                />
                <small className="form-hint">
                  Wybierz dzień, w którym chcesz odebrać książkę z biblioteki
                </small>
              </div>

              <div className="info-box">
                <p>
                  <strong>ℹ️ Informacje:</strong>
                </p>
                <ul>
                  <li>Rezerwacja wymaga potwierdzenia przez administratora</li>
                  <li>Po zatwierdzeniu masz 7 dni na odbiór książki</li>
                  <li>Otrzymasz powiadomienie o statusie rezerwacji</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn-cancel">
                Anuluj
              </button>
              <button
                onClick={handleReserveSubmit}
                className="btn-confirm"
                disabled={reservingBookId === selectedBook.id}
              >
                {reservingBookId === selectedBook.id
                  ? "⏳ Rezerwuję..."
                  : "✓ Potwierdź rezerwację"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderBrowsePage;
