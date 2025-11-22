import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config({ path: "./.env" });
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import googleBooksRoutes from "./routes/googleBooksRoutes.js";

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

app.use("/api/auth");
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/google-books", googleBooksRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Coś poszło nie tak!",
  });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
