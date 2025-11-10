import express from "express";
const router = express.Router();
import {
  searchGoogleBooks,
  advancedSearch,
  searchByTitle,
  searchByAuthor,
  searchByISBN,
  getGoogleBookById,
  importFromGoogleBooks,
} from "../controllers/googleBooksController.js";

// GET /api/google-books/search?q=query - Wyszukaj w Google Books
router.get("/search", searchGoogleBooks);

// GET /api/google-books/advanced - Zaawansowane wyszukiwanie
router.get("/advanced", advancedSearch);

// GET /api/google-books/title?title=xyz - Wyszukaj po tytule
router.get("/title", searchByTitle);

// GET /api/google-books/author?author=xyz - Wyszukaj po autorze
router.get("/author", searchByAuthor);

// GET /api/google-books/isbn/:isbn - Wyszukaj po ISBN
router.get("/isbn/:isbn", searchByISBN);

// GET /api/google-books/:id - Pobierz książkę z Google Books po ID
router.get("/:id", getGoogleBookById);

// POST /api/google-books/:googleBooksId/import - Importuj książkę do bazy
router.post("/:googleBooksId/import", importFromGoogleBooks);

export default router;
