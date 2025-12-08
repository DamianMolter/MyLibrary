import { GoogleGenAI } from "@google/genai";
import Book from "../models/bookModel.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

class AIRecommendationService {
  // Chatbot - rozmowa z AI o książkach
  static async chat(
    userMessage,
    conversationHistory = [],
    availableBooks = null
  ) {
    try {
      // Jeśli nie przekazano książek, pobierz je
      if (!availableBooks) {
        availableBooks = await Book.getAll();
      }

      // Filtruj tylko dostępne książki
      const available = availableBooks.filter(
        (book) => book.available_copies > 0
      );

      // Przygotuj kontekst systemowy
      const systemContext = this.buildChatContext(available);

      // Zbuduj historię konwersacji
      const chatHistory = this.buildChatHistory(
        systemContext,
        conversationHistory,
        userMessage
      );

      // Rozpocznij czat

      const chat = genAI.chats.create({
        model: "gemini-2.5-flash",
        config: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        },
        history: chatHistory,
      });

      // Wyślij wiadomość użytkownika
      console.log(userMessage);
      const response = await chat.sendMessage({
        message: userMessage,
      });

      const text = await response.text;

      // Spróbuj wyodrębnić rekomendacje książek z odpowiedzi
      const recommendations = this.extractRecommendations(text, available);

      return {
        response: text,
        recommendations: recommendations,
        hasRecommendations: recommendations.length > 0,
      };
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw new Error("Błąd podczas komunikacji z AI");
    }
  }

  // Buduj kontekst systemowy dla chatbota
  static buildChatContext(availableBooks) {
    let context = `Jesteś przyjaznym asystentem bibliotecznym specjalizującym się w rekomendacjach książek. Twoje zadanie to pomóc użytkownikom znaleźć idealne książki do czytania.

DOSTĘPNE KSIĄŻKI W BIBLIOTECE:
`;

    availableBooks.forEach((book, index) => {
      context += `${index + 1}. [ID:${book.id}] "${book.title}" - ${
        book.author
      }`;
      if (book.publication_year) {
        context += ` (${book.publication_year})`;
      }
      if (book.isbn) {
        context += ` [ISBN: ${book.isbn}]`;
      }
      context += `\n`;
    });

    context += `

TWOJE ZASADY:
1. Bądź przyjazny, pomocny i entuzjastyczny w stosunku do książek
2. Zadawaj pytania, aby lepiej zrozumieć gusta użytkownika (ulubione gatunki, autorzy, tematyka)
3. Rekomenduj TYLKO książki z powyższej listy dostępnych w bibliotece
4. Gdy rekomenujesz książki, zawsze podawaj ich ID w formacie: [BOOK_ID:123]
5. Wyjaśniaj, dlaczego dane książki mogą się użytkownikowi spodobać
6. Jeśli użytkownik pyta o książkę, której nie ma w bibliotece, grzecznie poinformuj o tym i zaproponuj podobne dostępne tytuły
7. Możesz pytać o:
   - Ulubione gatunki (np. fantastyka, romans, kryminał, biografia)
   - Ulubione tematy (np. przygody, historia, nauka)
   - Ulubione autorzy
   - Nastrój czytania (np. coś lekkiego, coś głębokiego)
   - Długość książki (krótka vs długa)
8. Odpowiadaj po polsku
9. Bądź zwięzły - odpowiedzi do 150 słów, chyba że użytkownik pyta o więcej szczegółów
10. Jeżeli w bazie brakuje książki odpowiedniej do preferencji czytelnika, to koniecznie poinformuj go o tym.

PRZYKŁADOWE REKOMENDACJE:
"Polecam Ci [BOOK_ID:5] 'Wiedźmin: Ostatnie życzenie' - Andrzej Sapkowski. To fantastyczna polska fantasy z ciekawymi postaciami!"

Rozpocznij rozmowę od przywitania i zapytania o preferencje czytelnicze użytkownika.`;

    return context;
  }

  // Buduj historię konwersacji
  static buildChatHistory(systemContext, conversationHistory, currentMessage) {
    const history = [
      {
        role: "user",
        parts: [{ text: systemContext }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Rozumiem! Jestem gotowy pomagać użytkownikom w znalezieniu idealnych książek z naszej biblioteki. Zacznę od pytań o ich preferencje.",
          },
        ],
      },
    ];

    // Dodaj historię konwersacji
    conversationHistory.forEach((msg) => {
      history.push({
        role: msg.role,
        parts: [{ text: msg.content }],
      });
    });

    return history;
  }

  // Wyodrębnij rekomendacje książek z odpowiedzi AI
  static extractRecommendations(aiResponse, availableBooks) {
    const recommendations = [];

    // Szukaj wzorca [BOOK_ID:123]
    const bookIdPattern = /\[BOOK_ID:(\d+)\]/g;
    let match;

    while ((match = bookIdPattern.exec(aiResponse)) !== null) {
      const bookId = parseInt(match[1]);
      const book = availableBooks.find((b) => b.id === bookId);

      if (book && !recommendations.some((r) => r.id === bookId)) {
        recommendations.push(book);
      }
    }

    return recommendations;
  }

  // Szybki start - wygeneruj początkową wiadomość powitalną
  static async getWelcomeMessage() {
    return {
      response:
        "👋 Cześć! Jestem Twoim asystentem bibliotecznym. Pomogę Ci znaleźć idealną książkę do czytania!\n\nOpowiedz mi o swoich zainteresowaniach:\n• Jakie gatunki literackie lubisz? (np. fantasy, kryminał, romans, science fiction)\n• Czy masz ulubionego autora?\n• Jakiej książki szukasz - czegoś lekkiego czy może głębokiego?\n\nZacznijmy rozmowę! 📚",
      recommendations: [],
      hasRecommendations: false,
    };
  }

  // Sugestie szybkich odpowiedzi
  static getQuickReplies() {
    return [
      "Szukam fantasty",
      "Polecisz coś z polskiej literatury?",
      "Chcę coś lekkiego do czytania",
      "Lubię kryminały",
      "Polecasz klasykę?",
      "Coś współczesnego proszę",
    ];
  }
}

export default AIRecommendationService;
