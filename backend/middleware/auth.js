import jwt from "jsonwebtoken";
import User from "../models/userModel";

// Middleware do weryfikacji tokenu JWT
export const authenticate = async (req, res, next) => {
  try {
    // Pobierz token z nagłówka Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Brak tokenu autoryzacyjnego",
      });
    }

    const token = authHeader.substring(7); // Usuń "Bearer "

    // Zweryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pobierz użytkownika z bazy
    const user = await User.getById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Użytkownik nie istnieje",
      });
    }

    // Dodaj użytkownika do requesta
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Nieprawidłowy token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token wygasł",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Błąd autoryzacji",
    });
  }
};

// Middleware do sprawdzenia roli admina
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Brak uprawnień. Wymagana rola administratora.",
    });
  }
  next();
};

// Middleware do sprawdzenia roli czytelnika lub admina
export const isReader = (req, res, next) => {
  if (req.user.role !== "reader" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Brak uprawnień",
    });
  }
  next();
};

// Middleware opcjonalnej autentykacji (nie wymaga tokenu)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.getById(decoded.userId);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignoruj błędy, to opcjonalna autentykacja
    next();
  }
};
