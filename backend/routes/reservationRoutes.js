import express from "express";
const router = express.Router();
import {
  getMyReservations,
  createReservation,
  cancelReservation,
  getAllReservations,
  getPendingReservations,
  getApprovedReservations,
  getStats,
  getReservationById,
  approveReservation,
  rejectReservation,
  convertToRental,
} from "../controllers/reservationController.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

// Czytelnik i Admin
router.get("/my", authenticate, getMyReservations);
router.post("/", authenticate, createReservation);
router.put("/:id/cancel", authenticate, cancelReservation);

// Tylko Admin
router.get("/", authenticate, isAdmin, getAllReservations);
router.get("/pending", authenticate, isAdmin, getPendingReservations);
router.get("/approved", authenticate, isAdmin, getApprovedReservations);
router.get("/stats", authenticate, isAdmin, getStats);
router.get("/:id", authenticate, isAdmin, getReservationById);
router.put("/:id/approve", authenticate, isAdmin, approveReservation);
router.put("/:id/reject", authenticate, isAdmin, rejectReservation);
router.post("/:id/convert", authenticate, isAdmin, convertToRental);

export default router;
