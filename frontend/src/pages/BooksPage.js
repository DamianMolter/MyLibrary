import React, { useState, useEffect } from "react";
import { booksAPI } from "../services/api";
import BookCard from "../components/Books/BookCard";
import BookForm from "../components/Books/BookForm";
import GoogleBooksSearch from "../components/Books/GoogleBooksSearch";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import "./BooksPage.css";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showGoogleSearch, setShowGoogleSearch] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    // Filtruj książki przy zmianie zapytania
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.isbn && book.isbn.includes(query))
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAll();
      setBooks(response.data.data);
      setFilteredBooks(response.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania książek");
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      await booksAPI.create(bookData);
      await fetchBooks();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError("Błąd podczas dodawania książki");
      console.error("Error adding book:", err);
    }
  };

  const handleUpdateBook = async (bookData) => {
    try {
      await booksAPI.update(editingBook.id, bookData);
      await fetchBooks();
      setShowForm(false);
      setEditingBook(null);
      setError(null);
    } catch (err) {
      setError("Błąd podczas aktualizacji książki");
      console.error("Error updating book:", err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę książkę?")) {
      try {
        await booksAPI.delete(bookId);
        await fetchBooks();
        setError(null);
      } catch (err) {
        setError("Błąd podczas usuwania książki");
        console.error("Error deleting book:", err);
      }
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowForm(true);
    setShowGoogleSearch(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBook(null);
  };

  const handleShowGoogleSearch = () => {
    setShowGoogleSearch(true);
    setShowForm(false);
    setEditingBook(null);
  };

  const handleImportSuccess = () => {
    fetchBooks(); // Odśwież listę książek po imporcie
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>📚 Zarządzanie Książkami</h1>
        <div className="header-buttons">
          {!showForm && !showGoogleSearch && (
            <>
              <button onClick={handleShowGoogleSearch} className="btn-google">
                🔍 Szukaj w Google Books
              </button>
              <button onClick={() => setShowForm(true)} className="btn-add">
                ➕ Dodaj ręcznie
              </button>
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {showGoogleSearch && (
        <GoogleBooksSearch
          onImport={handleImportSuccess}
          onClose={() => setShowGoogleSearch(false)}
        />
      )}

      {showForm && (
        <BookForm
          book={editingBook}
          onSubmit={editingBook ? handleUpdateBook : handleAddBook}
          onCancel={handleCancel}
        />
      )}

      {!showForm && !showGoogleSearch && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Szukaj w lokalnej bazie (tytuł, autor, ISBN)..."
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

          <div className="books-stats">
            <p>Znaleziono: {filteredBooks.length} książek</p>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="no-books">
              <p>Brak książek do wyświetlenia</p>
              {searchQuery && <p>Spróbuj zmienić kryteria wyszukiwania</p>}
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={handleEdit}
                  onDelete={handleDeleteBook}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;
