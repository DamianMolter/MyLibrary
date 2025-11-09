import User from "../models/userModel.js";

// Pobierz wszystkich użytkowników
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania użytkowników",
    });
  }
};

// Pobierz użytkownika po ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Użytkownik nie został znaleziony",
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania użytkownika",
    });
  }
};

// Dodaj nowego użytkownika
export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    // Walidacja
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Imię, nazwisko i email są wymagane",
      });
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Nieprawidłowy format adresu email",
      });
    }

    const userId = await User.create(req.body);
    const newUser = await User.getById(userId);

    res.status(201).json({
      success: true,
      message: "Użytkownik został dodany",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.message.includes("już istnieje")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas dodawania użytkownika",
    });
  }
};

// Aktualizuj użytkownika
export const updateUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Walidacja email jeśli jest podany
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Nieprawidłowy format adresu email",
        });
      }
    }

    const affectedRows = await User.update(req.params.id, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Użytkownik nie został znaleziony",
      });
    }

    const updatedUser = await User.getById(req.params.id);
    res.json({
      success: true,
      message: "Użytkownik został zaktualizowany",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.message.includes("już istnieje")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas aktualizacji użytkownika",
    });
  }
};

// Usuń użytkownika
export const deleteUser = async (req, res) => {
  try {
    const affectedRows = await User.delete(req.params.id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Użytkownik nie został znaleziony",
      });
    }

    res.json({
      success: true,
      message: "Użytkownik został usunięty",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error.message.includes("aktywnymi wypożyczeniami")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas usuwania użytkownika",
    });
  }
};

// Wyszukaj użytkowników
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Zapytanie wyszukiwania jest wymagane",
      });
    }

    const users = await User.search(q);
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas wyszukiwania użytkowników",
    });
  }
};

// Pobierz historię wypożyczeń użytkownika
export const getUserRentalHistory = async (req, res) => {
  try {
    const rentals = await User.getRentalHistory(req.params.id);
    res.json({
      success: true,
      data: rentals,
    });
  } catch (error) {
    console.error("Error fetching rental history:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania historii wypożyczeń",
    });
  }
};

// Pobierz aktywne wypożyczenia użytkownika
export const getUserActiveRentals = async (req, res) => {
  try {
    const rentals = await User.getActiveRentals(req.params.id);
    res.json({
      success: true,
      data: rentals,
    });
  } catch (error) {
    console.error("Error fetching active rentals:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania aktywnych wypożyczeń",
    });
  }
};
