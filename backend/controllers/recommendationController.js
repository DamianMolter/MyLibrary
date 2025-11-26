import AIRecommendationService from "../services/aiRecommendationService.js";
import Book from "../models/bookModel.js";

// Chatbot - rozmowa z AI
export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Wiadomość jest wymagana",
      });
    }

    // Pobierz dostępne książki
    const allBooks = await Book.getAll();
    const availableBooks = allBooks.filter((book) => book.available_copies > 0);

    if (availableBooks.length === 0) {
      return res.json({
        success: true,
        data: {
          response:
            "Przepraszam, ale aktualnie nie mamy żadnych dostępnych książek w bibliotece. Sprawdź ponownie później!",
          recommendations: [],
          hasRecommendations: false,
        },
      });
    }

    // Wywołaj AI chatbot
    const result = await AIRecommendationService.chat(
      message,
      conversationHistory,
      availableBooks
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas komunikacji z asystentem AI",
    });
  }
};

// Pobierz wiadomość powitalną
export const getWelcome = async (req, res) => {
  try {
    const welcome = await AIRecommendationService.getWelcomeMessage();
    const quickReplies = AIRecommendationService.getQuickReplies();

    res.json({
      success: true,
      data: {
        ...welcome,
        quickReplies,
      },
    });
  } catch (error) {
    console.error("Error getting welcome:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas pobierania wiadomości powitalnej",
    });
  }
};

// Oceń rekomendację (feedback dla AI)
export const rateFeedback = async (req, res) => {
  try {
    const { bookId, helpful } = req.body;

    // Tu możesz zapisać feedback do bazy danych
    // aby w przyszłości poprawić rekomendacje

    res.json({
      success: true,
      message: "Dziękujemy za feedback!",
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({
      success: false,
      message: "Błąd podczas zapisywania feedbacku",
    });
  }
};
