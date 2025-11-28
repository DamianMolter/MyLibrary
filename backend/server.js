import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import googleBooksRoutes from "./routes/googleBooksRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const corsOptions = {
  origin: function (origin, callback) {
    // Pozwól na requesty bez origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // W development pozwól na wszystko
    if (NODE_ENV === "development") {
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/google-books", googleBooksRoutes);
app.use("/api/recommendations", recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Coś poszło nie tak!",
  });
});

// Uruchomienie serwera
app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log("=================================");
});
