import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
} from "../controllers/bookController.js";
import { authenticate, isAdmin } from "../middleware/auth";

const router = express.Router();

// GET /api/books - Pobierz wszystkie książki
router.get("/", getAllBooks);

// GET /api/books/search?query=q - Wyszukaj książkę
router.get("/search", searchBooks);

// GET /api/books/:id - Wyszukaj książkę po id
router.get("/:id", getBookById);

// POST /api/books - Dodaj książkę
router.post("/", authenticate, isAdmin, createBook);

// PATCH /api/books - Edytuj książkę
router.patch("/:id", authenticate, isAdmin, updateBook);

// DELETE /api/books - Usuń książkę
router.delete("/:id", authenticate, isAdmin, deleteBook);

export default router;
