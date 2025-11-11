import { useState, useEffect } from "react";
import { isValidISBN } from "../../utils/helpers";
import "./BookForm.css";

const BookForm = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publication_year: "",
    total_copies: 1,
    available_copies: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData(book);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Wyczyść błąd dla tego pola
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tytuł jest wymagany";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Autor jest wymagany";
    }

    if (formData.isbn && !isValidISBN(formData.isbn)) {
      newErrors.isbn = "Nieprawidłowy format ISBN (10 lub 13 cyfr)";
    }

    if (formData.publication_year) {
      const year = parseInt(formData.publication_year);
      const currentYear = new Date().getFullYear();
      if (year < 1000 || year > currentYear) {
        newErrors.publication_year = `Rok musi być między 1000 a ${currentYear}`;
      }
    }

    if (formData.total_copies < 1) {
      newErrors.total_copies = "Liczba egzemplarzy musi być większa od 0";
    }

    if (formData.available_copies < 0) {
      newErrors.available_copies =
        "Liczba dostępnych egzemplarzy nie może być ujemna";
    }

    if (formData.available_copies > formData.total_copies) {
      newErrors.available_copies =
        "Liczba dostępnych nie może być większa niż całkowita";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // Konwertuj liczby przed wysłaniem
      const dataToSubmit = {
        ...formData,
        publication_year: formData.publication_year
          ? parseInt(formData.publication_year)
          : null,
        total_copies: parseInt(formData.total_copies),
        available_copies: parseInt(formData.available_copies),
      };
      onSubmit(dataToSubmit);
    }
  };

  return (
    <div className="book-form-container">
      <h2>{book ? "Edytuj książkę" : "Dodaj nową książkę"}</h2>

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Tytuł *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="author">Autor *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={errors.author ? "error" : ""}
          />
          {errors.author && (
            <span className="error-message">{errors.author}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="978-83-xxxx"
              className={errors.isbn ? "error" : ""}
            />
            {errors.isbn && (
              <span className="error-message">{errors.isbn}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="publication_year">Rok wydania</label>
            <input
              type="number"
              id="publication_year"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleChange}
              placeholder="2024"
              className={errors.publication_year ? "error" : ""}
            />
            {errors.publication_year && (
              <span className="error-message">{errors.publication_year}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="total_copies">Liczba egzemplarzy *</label>
            <input
              type="number"
              id="total_copies"
              name="total_copies"
              value={formData.total_copies}
              onChange={handleChange}
              min="1"
              className={errors.total_copies ? "error" : ""}
            />
            {errors.total_copies && (
              <span className="error-message">{errors.total_copies}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="available_copies">Dostępne egzemplarze *</label>
            <input
              type="number"
              id="available_copies"
              name="available_copies"
              value={formData.available_copies}
              onChange={handleChange}
              min="0"
              className={errors.available_copies ? "error" : ""}
            />
            {errors.available_copies && (
              <span className="error-message">{errors.available_copies}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-cancel">
            Anuluj
          </button>
          <button type="submit" className="btn btn-submit">
            {book ? "Zapisz zmiany" : "Dodaj książkę"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
