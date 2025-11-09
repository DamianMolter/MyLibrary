import Book from "../models/bookModel.js";

// Pobierz wszystkie książki
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAll();
    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania książek",
    });
  }
};

// Pobierz książkę po ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.getById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Książka nie została znaleziona",
      });
    }
    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania książki",
    });
  }
};

// Dodaj nową książkę
export const createBook = async (req, res) => {
  try {
    console.log(req.body);
    const {
      title,
      author,
      isbn,
      publication_year,
      total_copies,
      available_copies,
      created_at,
    } = req.body;

    // Walidacja
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: "Tytuł i autor są wymagane",
      });
    }

    const bookId = await Book.create(req.body);
    const newBook = await Book.getById(bookId);

    res.status(201).json({
      success: true,
      message: "Książka została dodana",
      data: newBook,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas dodawania książki",
    });
  }
};

// Aktualizuj książkę
export const updateBook = async (req, res) => {
  try {
    const affectedRows = await Book.update(req.params.id, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Książka nie została znaleziona",
      });
    }

    const updatedBook = await Book.getById(req.params.id);
    res.json({
      success: true,
      message: "Książka została zaktualizowana",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas aktualizacji książki",
    });
  }
};

// Usuń książkę
export const deleteBook = async (req, res) => {
  try {
    const affectedRows = await Book.delete(req.params.id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Książka nie została znaleziona",
      });
    }

    res.json({
      success: true,
      message: "Książka została usunięta",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas usuwania książki",
    });
  }
};

// Wyszukaj książki
export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Zapytanie wyszukiwania jest wymagane",
      });
    }

    const books = await Book.search(q);
    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas wyszukiwania książek",
    });
  }
};
