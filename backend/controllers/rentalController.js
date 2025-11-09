import Rental from "../models/rentalModel.js";

// Pobierz wszystkie wypożyczenia
export const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.getAll();
    res.json({
      success: true,
      data: rentals,
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania wypożyczeń",
    });
  }
};

// Pobierz wypożyczenie po ID
export const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.getById(req.params.id);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Wypożyczenie nie zostało znalezione",
      });
    }
    res.json({
      success: true,
      data: rental,
    });
  } catch (error) {
    console.error("Error fetching rental:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania wypożyczenia",
    });
  }
};

// Pobierz aktywne wypożyczenia
export const getActiveRentals = async (req, res) => {
  try {
    const rentals = await Rental.getActive();
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

// Pobierz przeterminowane wypożyczenia
export const getOverdueRentals = async (req, res) => {
  try {
    const rentals = await Rental.getOverdue();
    res.json({
      success: true,
      data: rentals,
    });
  } catch (error) {
    console.error("Error fetching overdue rentals:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania przeterminowanych wypożyczeń",
    });
  }
};

// Wypożycz książkę
export const createRental = async (req, res) => {
  try {
    const { book_id, user_id, rental_date, due_date } = req.body;

    // Walidacja
    if (!book_id || !user_id || !rental_date || !due_date) {
      return res.status(400).json({
        success: false,
        message: "Wszystkie pola są wymagane",
      });
    }

    // Sprawdź czy data zwrotu jest późniejsza niż data wypożyczenia
    if (new Date(due_date) <= new Date(rental_date)) {
      return res.status(400).json({
        success: false,
        message: "Data zwrotu musi być późniejsza niż data wypożyczenia",
      });
    }

    const rentalId = await Rental.create(req.body);
    const newRental = await Rental.getById(rentalId);

    res.status(201).json({
      success: true,
      message: "Książka została wypożyczona",
      data: newRental,
    });
  } catch (error) {
    console.error("Error creating rental:", error);

    if (
      error.message.includes("nie jest dostępna") ||
      error.message.includes("już wypożyczył")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas wypożyczania książki",
    });
  }
};

// Zwróć książkę
export const returnBook = async (req, res) => {
  try {
    await Rental.returnBook(req.params.id);
    const updatedRental = await Rental.getById(req.params.id);

    res.json({
      success: true,
      message: "Książka została zwrócona",
      data: updatedRental,
    });
  } catch (error) {
    console.error("Error returning book:", error);

    if (
      error.message.includes("nie zostało znalezione") ||
      error.message.includes("już zwrócona")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas zwracania książki",
    });
  }
};

// Przedłuż wypożyczenie
export const extendRental = async (req, res) => {
  try {
    const { new_due_date } = req.body;

    if (!new_due_date) {
      return res.status(400).json({
        success: false,
        message: "Nowa data zwrotu jest wymagana",
      });
    }

    await Rental.extend(req.params.id, new_due_date);
    const updatedRental = await Rental.getById(req.params.id);

    res.json({
      success: true,
      message: "Wypożyczenie zostało przedłużone",
      data: updatedRental,
    });
  } catch (error) {
    console.error("Error extending rental:", error);

    if (
      error.message.includes("nie zostało znalezione") ||
      error.message.includes("aktywne wypożyczenia")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas przedłużania wypożyczenia",
    });
  }
};

// Statystyki
export const getStats = async (req, res) => {
  try {
    const stats = await Rental.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania statystyk",
    });
  }
};

// Najpopularniejsze książki
export const getMostRented = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const books = await Rental.getMostRented(limit);
    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching most rented books:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania popularnych książek",
    });
  }
};
