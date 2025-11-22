import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";

// POST /api/auth/register - Rejestracja
router.post("/register", authController.register);

// POST /api/auth/login - Logowanie
router.post("/login", authController.login);

// GET /api/auth/me - Pobierz dane zalogowanego użytkownika
router.get("/me", authenticate, authController.getMe);

// PUT /api/auth/change-password - Zmiana hasła
router.put("/change-password", authenticate, authController.changePassword);

export default router;
