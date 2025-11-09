import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
} from "../controllers/bookController.js";

const router = express.Router();

// GET /api/books - Pobierz wszystkie książki
router.get("/", getAllBooks);

// GET /api/books/search?query=q - Wyszukaj książkę
router.get("/search", searchBooks);

// GET /api/books/:id - Wyszukaj książkę po id
router.get("/:id", getBookById);

// POST /api/books - Dodaj książkę
router.post("/", createBook);

// PATCH /api/books - Edytuj książkę
router.patch("/:id", updateBook);

// DELETE /api/books - Usuń książkę
router.delete("/:id", deleteBook);

export default router;
