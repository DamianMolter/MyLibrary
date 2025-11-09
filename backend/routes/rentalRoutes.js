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

const router = express.Router();

// GET /api/rentals - Pobierz wszystkie wypożyczenia
router.get("/", getAllRentals);

// GET /api/rentals/active - Pobierz aktywne wypożyczenia
router.get("/active", getActiveRentals);

// GET /api/rentals/overdue - Pobierz przeterminowane wypożyczenia
router.get("/overdue", getOverdueRentals);

// GET /api/rentals/stats - Statystyki wypożyczeń
router.get("/stats", getStats);

// GET /api/rentals/most-rented - Najpopularniejsze książki
router.get("/most-rented", getMostRented);

// GET /api/rentals/:id - Pobierz wypożyczenie po ID
router.get("/:id", getRentalById);

// POST /api/rentals - Wypożycz książkę
router.post("/", createRental);

// PUT /api/rentals/:id/return - Zwróć książkę
router.put("/:id/return", returnBook);

// PUT /api/rentals/:id/extend - Przedłuż wypożyczenie
router.patch("/:id/extend", extendRental);

export default router;
