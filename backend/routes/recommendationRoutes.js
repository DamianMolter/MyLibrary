import express from "express";
const router = express.Router();
import {
  getWelcome,
  chat,
  rateFeedback,
} from "../controllers/recommendationController.js";
import { authenticate } from "../middleware/auth.js";

// GET /api/recommendations/welcome - Pobierz wiadomość powitalną
router.get("/welcome", authenticate, getWelcome);

// POST /api/recommendations/chat - Chatbot konwersacja
router.post("/chat", authenticate, chat);

// POST /api/recommendations/feedback - Wyślij feedback o rekomendacji
router.post("/feedback", authenticate, rateFeedback);

export default router;
