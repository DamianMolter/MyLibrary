import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Przykładowa trasa
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
