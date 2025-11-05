const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

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
