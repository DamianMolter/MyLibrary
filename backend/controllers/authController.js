import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { isValidEmail } from "../utils/validation.js";

// Generuj JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Rejestracja
export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Walidacja
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Wszystkie pola są wymagane",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Nieprawidłowy format adresu email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Hasło musi mieć minimum 6 znaków",
      });
    }

    // Zarejestruj użytkownika (zawsze jako 'reader')
    const userId = await User.register({
      first_name,
      last_name,
      email,
      password,
      phone,
      role: "reader",
    });

    // Pobierz utworzonego użytkownika
    const user = await User.getById(userId);

    // Wygeneruj token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: "Rejestracja zakończona pomyślnie",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.message.includes("już istnieje")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas rejestracji",
    });
  }
};

// Logowanie
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Walidacja
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email i hasło są wymagane",
      });
    }

    // Pobierz użytkownika z hasłem
    const user = await User.getByEmailWithPassword(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Nieprawidłowy email lub hasło",
      });
    }

    // Zweryfikuj hasło
    const isPasswordValid = await User.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Nieprawidłowy email lub hasło",
      });
    }

    // Wygeneruj token
    const token = generateToken(user.id);

    // Usuń hasło z odpowiedzi
    delete user.password;

    res.json({
      success: true,
      message: "Logowanie zakończone pomyślnie",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas logowania",
    });
  }
};

// Pobierz dane zalogowanego użytkownika
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania danych użytkownika",
    });
  }
};

// Zmiana hasła
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Obecne i nowe hasło są wymagane",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Nowe hasło musi mieć minimum 6 znaków",
      });
    }

    // Pobierz użytkownika z hasłem
    const user = await User.getByEmailWithPassword(req.user.email);

    // Zweryfikuj obecne hasło
    const isPasswordValid = await User.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Nieprawidłowe obecne hasło",
      });
    }

    // Zaktualizuj hasło
    await User.update(req.user.id, { password: newPassword });

    res.json({
      success: true,
      message: "Hasło zostało zmienione",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas zmiany hasła",
    });
  }
};
