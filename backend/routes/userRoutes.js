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
import { authenticate, isAdmin } from "../middleware/auth";

const router = express.Router();

// GET /api/users - Pobierz wszystkich użytkowników
router.get("/", authenticate, isAdmin, getAllUsers);

// GET /api/users/search?q=query - Wyszukaj użytkowników
router.get("/search", authenticate, isAdmin, searchUsers);

// GET /api/users/:id - Pobierz użytkownika po ID
router.get("/:id", authenticate, isAdmin, getUserById);

// GET /api/users/:id/rentals - Historia wypożyczeń użytkownika
router.get("/:id/rentals", authenticate, isAdmin, getUserRentalHistory);

// GET /api/users/:id/active-rentals - Aktywne wypożyczenia użytkownika
router.get("/:id/active-rentals", authenticate, isAdmin, getUserActiveRentals);

// POST /api/users - Dodaj nowego użytkownika
router.post("/", authenticate, isAdmin, createUser);

// PUT /api/users/:id - Aktualizuj użytkownika
router.patch("/:id", authenticate, isAdmin, updateUser);

// DELETE /api/users/:id - Usuń użytkownika
router.delete("/:id", authenticate, isAdmin, deleteUser);

export default router;
