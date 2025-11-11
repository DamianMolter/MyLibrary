import { useState, useEffect } from "react";
import { booksAPI, usersAPI } from "../../services/api";
import "./RentalForm.css";

const RentalForm = ({ onSubmit, onCancel }) => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    book_id: "",
    user_id: "",
    rental_date: new Date().toISOString().split("T")[0],
    due_date: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Automatycznie ustaw termin zwrotu na 30 dni od daty wypożyczenia
    if (formData.rental_date) {
      const rentalDate = new Date(formData.rental_date);
      const dueDate = new Date(rentalDate);
      dueDate.setDate(dueDate.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        due_date: dueDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.rental_date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, usersRes] = await Promise.all([
        booksAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setBooks(booksRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Jeśli wybrano książkę, pokaż jej szczegóły
    if (name === "book_id") {
      const book = books.find((b) => b.id === parseInt(value));
      setSelectedBook(book);
    }

    // Wyczyść błąd dla tego pola
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.book_id) {
      newErrors.book_id = "Wybierz książkę";
    }

    if (!formData.user_id) {
      newErrors.user_id = "Wybierz użytkownika";
    }

    if (!formData.rental_date) {
      newErrors.rental_date = "Data wypożyczenia jest wymagana";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Termin zwrotu jest wymagany";
    }

    if (formData.rental_date && formData.due_date) {
      if (new Date(formData.due_date) <= new Date(formData.rental_date)) {
        newErrors.due_date =
          "Termin zwrotu musi być późniejszy niż data wypożyczenia";
      }
    }

    // Sprawdź dostępność książki
    if (selectedBook && selectedBook.available_copies <= 0) {
      newErrors.book_id = "Ta książka nie jest dostępna do wypożyczenia";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        ...formData,
        book_id: parseInt(formData.book_id),
        user_id: parseInt(formData.user_id),
      });
    }
  };

  if (loading) {
    return <div className="rental-form-loading">Ładowanie danych...</div>;
  }

  // Filtruj tylko dostępne książki
  const availableBooks = books.filter((book) => book.available_copies > 0);

  return (
    <div className="rental-form-container">
      <h2>📤 Nowe wypożyczenie</h2>

      <form onSubmit={handleSubmit} className="rental-form">
        <div className="form-group">
          <label htmlFor="book_id">Wybierz książkę *</label>
          <select
            id="book_id"
            name="book_id"
            value={formData.book_id}
            onChange={handleChange}
            className={errors.book_id ? "error" : ""}
          >
            <option value="">-- Wybierz książkę --</option>
            {availableBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author} (dostępne: {book.available_copies})
              </option>
            ))}
          </select>
          {errors.book_id && (
            <span className="error-message">{errors.book_id}</span>
          )}

          {selectedBook && (
            <div className="book-details">
              <h4>Szczegóły książki:</h4>
              <p>
                <strong>Tytuł:</strong> {selectedBook.title}
              </p>
              <p>
                <strong>Autor:</strong> {selectedBook.author}
              </p>
              {selectedBook.isbn && (
                <p>
                  <strong>ISBN:</strong> {selectedBook.isbn}
                </p>
              )}
              <p>
                <strong>Dostępne egzemplarze:</strong>{" "}
                {selectedBook.available_copies} / {selectedBook.total_copies}
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="user_id">Wybierz użytkownika *</label>
          <select
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className={errors.user_id ? "error" : ""}
          >
            <option value="">-- Wybierz użytkownika --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </option>
            ))}
          </select>
          {errors.user_id && (
            <span className="error-message">{errors.user_id}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rental_date">Data wypożyczenia *</label>
            <input
              type="date"
              id="rental_date"
              name="rental_date"
              value={formData.rental_date}
              onChange={handleChange}
              className={errors.rental_date ? "error" : ""}
            />
            {errors.rental_date && (
              <span className="error-message">{errors.rental_date}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Termin zwrotu *</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={errors.due_date ? "error" : ""}
            />
            {errors.due_date && (
              <span className="error-message">{errors.due_date}</span>
            )}
            <small className="form-hint">
              Domyślnie: 30 dni od daty wypożyczenia
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-cancel">
            Anuluj
          </button>
          <button type="submit" className="btn btn-submit">
            📤 Wypożycz książkę
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentalForm;
