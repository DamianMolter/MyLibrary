import Reservation from "../models/reservationModel.js";

// Pobierz wszystkie rezerwacje (admin)
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getAll();
    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania rezerwacji",
    });
  }
};

// Pobierz rezerwację po ID
export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.getById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Rezerwacja nie została znaleziona",
      });
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania rezerwacji",
    });
  }
};

// Pobierz rezerwacje zalogowanego użytkownika
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getByUserId(req.user.id);
    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania rezerwacji",
    });
  }
};

// Pobierz oczekujące rezerwacje (admin)
export const getPendingReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getPending();
    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching pending reservations:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania oczekujących rezerwacji",
    });
  }
};

// Pobierz zatwierdzone rezerwacje (admin)
export const getApprovedReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getApproved();
    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching approved reservations:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania zatwierdzonych rezerwacji",
    });
  }
};

// Utwórz rezerwację (reader)
export const createReservation = async (req, res) => {
  try {
    const { book_id, preferred_pickup_date } = req.body;

    // Walidacja
    if (!book_id || !preferred_pickup_date) {
      return res.status(400).json({
        success: false,
        message: "ID książki i preferowana data odbioru są wymagane",
      });
    }

    // Sprawdź czy data odbioru nie jest w przeszłości
    const pickupDate = new Date(preferred_pickup_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      return res.status(400).json({
        success: false,
        message: "Data odbioru nie może być w przeszłości",
      });
    }

    const reservationId = await Reservation.create({
      book_id,
      user_id: req.user.id,
      preferred_pickup_date,
    });

    const newReservation = await Reservation.getById(reservationId);

    res.status(201).json({
      success: true,
      message: "Rezerwacja została utworzona i oczekuje na potwierdzenie",
      data: newReservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);

    if (
      error.message.includes("aktywną rezerwację") ||
      error.message.includes("wypożyczoną")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas tworzenia rezerwacji",
    });
  }
};

// Zatwierdź rezerwację (admin)
export const approveReservation = async (req, res) => {
  try {
    const { admin_notes } = req.body;

    await Reservation.approve(req.params.id, req.user.id, admin_notes);
    const updatedReservation = await Reservation.getById(req.params.id);

    res.json({
      success: true,
      message: "Rezerwacja została zatwierdzona",
      data: updatedReservation,
    });
  } catch (error) {
    console.error("Error approving reservation:", error);

    if (
      error.message.includes("nie została znaleziona") ||
      error.message.includes("oczekujące") ||
      error.message.includes("nie jest dostępna")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas zatwierdzania rezerwacji",
    });
  }
};

// Odrzuć rezerwację (admin)
export const rejectReservation = async (req, res) => {
  try {
    const { admin_notes } = req.body;

    if (!admin_notes || admin_notes.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Podaj powód odrzucenia rezerwacji",
      });
    }

    await Reservation.reject(req.params.id, req.user.id, admin_notes);
    const updatedReservation = await Reservation.getById(req.params.id);

    res.json({
      success: true,
      message: "Rezerwacja została odrzucona",
      data: updatedReservation,
    });
  } catch (error) {
    console.error("Error rejecting reservation:", error);

    if (
      error.message.includes("nie została znaleziona") ||
      error.message.includes("oczekujące")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas odrzucania rezerwacji",
    });
  }
};

// Anuluj rezerwację (user)
export const cancelReservation = async (req, res) => {
  try {
    await Reservation.cancel(req.params.id, req.user.id);
    const updatedReservation = await Reservation.getById(req.params.id);

    res.json({
      success: true,
      message: "Rezerwacja została anulowana",
      data: updatedReservation,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);

    if (
      error.message.includes("nie została znaleziona") ||
      error.message.includes("cudzej rezerwacji") ||
      error.message.includes("nie można anulować")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas anulowania rezerwacji",
    });
  }
};

// Zamień rezerwację na wypożyczenie (admin)
export const convertToRental = async (req, res) => {
  try {
    const { rental_date, due_date } = req.body;

    // Walidacja
    if (!rental_date || !due_date) {
      return res.status(400).json({
        success: false,
        message: "Data wypożyczenia i termin zwrotu są wymagane",
      });
    }

    if (new Date(due_date) <= new Date(rental_date)) {
      return res.status(400).json({
        success: false,
        message: "Termin zwrotu musi być późniejszy niż data wypożyczenia",
      });
    }

    await Reservation.convertToRental(req.params.id, rental_date, due_date);

    res.json({
      success: true,
      message: "Rezerwacja została zamieniona na wypożyczenie",
    });
  } catch (error) {
    console.error("Error converting reservation:", error);

    if (
      error.message.includes("nie została znaleziona") ||
      error.message.includes("zatwierdzone") ||
      error.message.includes("nie jest dostępna")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Błąd podczas zamiany rezerwacji na wypożyczenie",
    });
  }
};

// Statystyki rezerwacji (admin)
export const getStats = async (req, res) => {
  try {
    const stats = await Reservation.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching reservation stats:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania statystyk",
    });
  }
};
