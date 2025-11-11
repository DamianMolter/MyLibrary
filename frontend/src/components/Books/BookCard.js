import "./BookCard.css";

const BookCard = ({ book, onEdit, onDelete }) => {
  const isAvailable = book.available_copies > 0;

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title">{book.title}</h3>
        <span
          className={`availability-badge ${
            isAvailable ? "available" : "unavailable"
          }`}
        >
          {isAvailable ? "✓ Dostępna" : "✗ Wypożyczona"}
        </span>
      </div>

      <div className="book-card-body">
        <p className="book-author">
          <strong>Autor:</strong> {book.author}
        </p>

        {book.isbn && (
          <p className="book-isbn">
            <strong>ISBN:</strong> {book.isbn}
          </p>
        )}

        {book.publication_year && (
          <p className="book-year">
            <strong>Rok wydania:</strong> {book.publication_year}
          </p>
        )}

        <div className="book-copies">
          <span>
            <strong>Dostępne:</strong> {book.available_copies} /{" "}
            {book.total_copies}
          </span>
        </div>
      </div>

      <div className="book-card-footer">
        <button onClick={() => onEdit(book)} className="btn btn-edit">
          ✏️ Edytuj
        </button>
        <button onClick={() => onDelete(book.id)} className="btn btn-delete">
          🗑️ Usuń
        </button>
      </div>
    </div>
  );
};

export default BookCard;
