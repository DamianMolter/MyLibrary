import express from "express";
import {
  getAllUsers,
  searchUsers,
  getUserById,
  getUserRentalHistory,
  getUserActiveRentals,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// GET /api/users - Pobierz wszystkich użytkowników
router.get("/", getAllUsers);

// GET /api/users/search?q=query - Wyszukaj użytkowników
router.get("/search", searchUsers);

// GET /api/users/:id - Pobierz użytkownika po ID
router.get("/:id", getUserById);

// GET /api/users/:id/rentals - Historia wypożyczeń użytkownika
router.get("/:id/rentals", getUserRentalHistory);

// GET /api/users/:id/active-rentals - Aktywne wypożyczenia użytkownika
router.get("/:id/active-rentals", getUserActiveRentals);

// POST /api/users - Dodaj nowego użytkownika
router.post("/", createUser);

// PUT /api/users/:id - Aktualizuj użytkownika
router.patch("/:id", updateUser);

// DELETE /api/users/:id - Usuń użytkownika
router.delete("/:id", deleteUser);

export default router;
