import express from "express";
const router = express.Router();
import {
  register,
  login,
  getMe,
  changePassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

// POST /api/auth/register - Rejestracja
router.post("/register", register);

// POST /api/auth/login - Logowanie
router.post("/login", login);

// GET /api/auth/me - Pobierz dane zalogowanego użytkownika
router.get("/me", authenticate, getMe);

// PUT /api/auth/change-password - Zmiana hasła
router.put("/change-password", authenticate, changePassword);

export default router;
