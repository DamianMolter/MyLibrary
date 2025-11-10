import GoogleBooksService from "../services/googleBooksService.js";
import Book from "../models/bookModel.js";

// Wyszukaj książki w Google Books
export const searchGoogleBooks = async (req, res) => {
  try {
    const { q, maxResults = 10, startIndex = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Zapytanie wyszukiwania jest wymagane",
      });
    }

    const books = await GoogleBooksService.searchBooks(
      q,
      maxResults,
      startIndex
    );

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error searching Google Books:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Błąd podczas wyszukiwania książek",
    });
  }
};

// Pobierz szczegóły książki z Google Books
export const getGoogleBookById = async (req, res) => {
  try {
    const book = await GoogleBooksService.getBookById(req.params.id);

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error fetching Google Book:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Błąd podczas pobierania książki",
    });
  }
};

// Wyszukaj po ISBN
export const searchByISBN = async (req, res) => {
  try {
    const { isbn } = req.params;

    const book = await GoogleBooksService.searchByISBN(isbn);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Nie znaleziono książki o podanym ISBN",
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error searching by ISBN:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Błąd podczas wyszukiwania po ISBN",
    });
  }
};

// Wyszukaj po tytule
export const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    const maxResults = req.query.maxResults || 10;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Tytuł jest wymagany",
      });
    }

    const books = await GoogleBooksService.searchByTitle(title, maxResults);

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error searching by title:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Błąd podczas wyszukiwania po tytule",
    });
  }
};

// Wyszukaj po autorze
export const searchByAuthor = async (req, res) => {
  try {
    const { author } = req.query;
    const maxResults = req.query.maxResults || 10;

    if (!author) {
      return res.status(400).json({
        success: false,
        message: "Autor jest wymagany",
      });
    }

    const books = await GoogleBooksService.searchByAuthor(author, maxResults);

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error searching by author:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Błąd podczas wyszukiwania po autorze",
    });
  }
};

// Zaawansowane wyszukiwanie
export const advancedSearch = async (req, res) => {
  try {
    const books = await GoogleBooksService.advancedSearch(req.query);

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Błąd podczas wyszukiwania",
    });
  }
};

// Importuj książkę z Google Books do lokalnej bazy
export const importFromGoogleBooks = async (req, res) => {
  try {
    const { googleBooksId } = req.params;
    const { total_copies = 1, available_copies = 1 } = req.body;

    // Pobierz dane książki z Google Books
    const googleBook = await GoogleBooksService.getBookById(googleBooksId);

    // Sprawdź czy książka już istnieje w bazie (po ISBN)
    if (googleBook.isbn) {
      const existingBooks = await Book.search(googleBook.isbn);
      if (existingBooks.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Książka o tym ISBN już istnieje w bazie",
          data: existingBooks[0],
        });
      }
    }

    // Dodaj książkę do lokalnej bazy
    const bookData = {
      title: googleBook.title,
      author: googleBook.author,
      isbn: googleBook.isbn,
      publication_year: googleBook.publicationYear,
      total_copies: total_copies,
      available_copies: available_copies,
    };

    const bookId = await Book.create(bookData);
    const newBook = await Book.getById(bookId);

    res.status(201).json({
      success: true,
      message: "Książka została zaimportowana do bazy",
      data: {
        localBook: newBook,
        googleData: googleBook,
      },
    });
  } catch (error) {
    console.error("Error importing book:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Błąd podczas importowania książki",
    });
  }
};
