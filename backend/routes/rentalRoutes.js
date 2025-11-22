import express from "express";

import {
  getAllRentals,
  getActiveRentals,
  getOverdueRentals,
  getStats,
  getMostRented,
  getRentalById,
  createRental,
  returnBook,
  extendRental,
} from "../controllers/rentalController.js";
import { authenticate, isAdmin, isReader } from "../middleware/auth";

const router = express.Router();

// GET /api/rentals - Pobierz wszystkie wypożyczenia
router.get("/", authenticate, getAllRentals);

// GET /api/rentals/active - Pobierz aktywne wypożyczenia
router.get("/active", authenticate, getActiveRentals);

// GET /api/rentals/overdue - Pobierz przeterminowane wypożyczenia
router.get("/overdue", authenticate, isAdmin, getOverdueRentals);

// GET /api/rentals/stats - Statystyki wypożyczeń
router.get("/stats", authenticate, isAdmin, getStats);

// GET /api/rentals/most-rented - Najpopularniejsze książki
router.get("/most-rented", authenticate, isAdmin, getMostRented);

// GET /api/rentals/:id - Pobierz wypożyczenie po ID
router.get("/:id", authenticate, isAdmin, getRentalById);

// POST /api/rentals - Wypożycz książkę
router.post("/", authenticate, isReader, createRental);

// PUT /api/rentals/:id/return - Zwróć książkę
router.patch("/:id/return", authenticate, isAdmin, returnBook);

// PUT /api/rentals/:id/extend - Przedłuż wypożyczenie
router.patch("/:id/extend", authenticate, isAdmin, extendRental);

export default router;
