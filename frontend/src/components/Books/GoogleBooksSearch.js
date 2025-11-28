import { useState } from "react";
import { googleBooksAPI } from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./GoogleBooksSearch.css";

const GoogleBooksSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("general"); // general, title, author, isbn
  const [results, setResults] = useState([]);
  const [formStatus, setFormStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Wprowadź zapytanie wyszukiwania");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFormStatus(true);
      let response;

      switch (searchType) {
        case "title":
          response = await googleBooksAPI.searchByTitle(searchQuery);
          break;
        case "author":
          response = await googleBooksAPI.searchByAuthor(searchQuery);
          break;
        case "isbn":
          response = await googleBooksAPI.searchByISBN(searchQuery);
          setResults(response.data.data ? [response.data.data] : []);
          setLoading(false);
          return;
        default:
          response = await googleBooksAPI.search(searchQuery, 20);
      }

      setResults(response.data.data || []);
    } catch (err) {
      setError("Błąd podczas wyszukiwania w Google Books");
      console.error("Error searching Google Books:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (book) => {
    try {
      setImporting(book.googleBooksId);
      setError(null);

      const copies = {
        total_copies: 1,
        available_copies: 1,
      };

      await googleBooksAPI.import(book.googleBooksId, copies);

      alert(`Książka "${book.title}" została zaimportowana!`);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Ta książka już istnieje w bazie danych");
      } else {
        setError("Błąd podczas importowania książki");
      }
      console.error("Error importing book:", err);
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="google-books-search">
      <div className="search-header">
        <h2>🔍 Wyszukaj książki w Google Books</h2>
        <button onClick={onClose} className="btn-close-search">
          ✕
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-type-selector">
          <label>
            <input
              type="radio"
              value="general"
              checked={searchType === "general"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            Ogólne
          </label>
          <label>
            <input
              type="radio"
              value="title"
              checked={searchType === "title"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            Tytuł
          </label>
          <label>
            <input
              type="radio"
              value="author"
              checked={searchType === "author"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            Autor
          </label>
          <label>
            <input
              type="radio"
              value="isbn"
              checked={searchType === "isbn"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            ISBN
          </label>
        </div>

        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFormStatus(false);
            }}
            placeholder={
              searchType === "isbn"
                ? "Wpisz ISBN (np. 9788375780659)"
                : searchType === "title"
                ? "Wpisz tytuł książki"
                : searchType === "author"
                ? "Wpisz nazwisko autora"
                : "Wpisz tytuł, autora lub słowo kluczowe"
            }
            className="search-input-google"
          />
          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? "Szukam..." : "🔍 Szukaj"}
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner />}

      {!loading && results.length > 0 && (
        <div className="results-container">
          <h3>Znaleziono {results.length} książek</h3>
          <div className="results-grid">
            {results.map((book) => (
              <div key={book.googleBooksId} className="google-book-card">
                {book.imageLinks?.thumbnail && (
                  <img
                    src={book.imageLinks.thumbnail}
                    alt={book.title}
                    className="book-thumbnail"
                  />
                )}

                <div className="google-book-info">
                  <h4>{book.title}</h4>
                  <p className="book-authors">{book.author}</p>

                  {book.publisher && (
                    <p className="book-publisher">
                      <strong>Wydawca:</strong> {book.publisher}
                    </p>
                  )}

                  {book.publicationYear && (
                    <p className="book-year">
                      <strong>Rok:</strong> {book.publicationYear}
                    </p>
                  )}

                  {book.isbn && (
                    <p className="book-isbn-google">
                      <strong>ISBN:</strong> {book.isbn}
                    </p>
                  )}

                  {book.pageCount && (
                    <p className="book-pages">
                      <strong>Strony:</strong> {book.pageCount}
                    </p>
                  )}

                  {book.categories && book.categories.length > 0 && (
                    <p className="book-categories">
                      <strong>Kategorie:</strong> {book.categories.join(", ")}
                    </p>
                  )}

                  {book.description && (
                    <p className="book-description">
                      {book.description.substring(0, 150)}
                      {book.description.length > 150 ? "..." : ""}
                    </p>
                  )}

                  <div className="book-card-actions">
                    {book.previewLink && (
                      <a
                        href={book.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-preview"
                      >
                        👁️ Podgląd
                      </a>
                    )}

                    <button
                      onClick={() => handleImport(book)}
                      className="btn-import"
                      disabled={importing === book.googleBooksId}
                    >
                      {importing === book.googleBooksId
                        ? "⏳ Importuję..."
                        : "📥 Importuj do bazy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchQuery && formStatus && results.length === 0 && (
        <div className="no-results">
          <p>Nie znaleziono książek dla zapytania: "{searchQuery}"</p>
          <p>Spróbuj zmienić kryteria wyszukiwania</p>
        </div>
      )}
    </div>
  );
};

export default GoogleBooksSearch;
