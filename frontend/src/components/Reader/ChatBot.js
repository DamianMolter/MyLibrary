import React, { useState, useEffect, useRef } from "react";
import { recommendationsAPI } from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import "./ChatBot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [quickReplies, setQuickReplies] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadWelcomeMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadWelcomeMessage = async () => {
    try {
      const response = await recommendationsAPI.getWelcome();
      const { response: welcomeText, quickReplies: replies } =
        response.data.data;

      setMessages([
        {
          role: "assistant",
          content: welcomeText,
          timestamp: new Date(),
        },
      ]);
      setQuickReplies(replies || []);
    } catch (error) {
      console.error("Error loading welcome:", error);
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Cześć! Jestem Twoim asystentem bibliotecznym. Jak mogę Ci pomóc?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setQuickReplies([]); // Ukryj szybkie odpowiedzi po wysłaniu wiadomości

    try {
      // Przygotuj historię konwersacji dla API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content,
      }));

      const response = await recommendationsAPI.chat(
        messageText,
        conversationHistory
      );
      const {
        response: aiResponse,
        recommendations,
        hasRecommendations,
      } = response.data.data;

      const assistantMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        recommendations: hasRecommendations ? recommendations : [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Zaktualizuj listę rekomendowanych książek
      if (hasRecommendations && recommendations.length > 0) {
        setRecommendedBooks((prev) => {
          const newBooks = recommendations.filter(
            (newBook) =>
              !prev.some((existingBook) => existingBook.id === newBook.id)
          );
          return [...prev, ...newBooks];
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "😔 Przepraszam, wystąpił błąd podczas przetwarzania Twojej wiadomości. Spróbuj ponownie.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setRecommendedBooks([]);
    loadWelcomeMessage();
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <div className="bot-avatar">🤖</div>
          <div className="header-text">
            <h3>Asystent Biblioteczny AI</h3>
            <p className="status">
              <span className="status-dot"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="btn-clear-chat"
          title="Nowa rozmowa"
        >
          🔄 Nowa rozmowa
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${
              message.isError ? "error" : ""
            }`}
          >
            <div className="message-avatar">
              {message.role === "assistant" ? "🤖" : "👤"}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              {message.recommendations &&
                message.recommendations.length > 0 && (
                  <div className="message-recommendations">
                    <h4>📚 Polecane książki:</h4>
                    <div className="recommendations-grid">
                      {message.recommendations.map((book) => (
                        <div key={book.id} className="recommended-book">
                          <div className="book-info">
                            <strong>{book.title}</strong>
                            <span className="book-author">{book.author}</span>
                            {book.publication_year && (
                              <span className="book-year">
                                ({book.publication_year})
                              </span>
                            )}
                          </div>
                          <div className="book-availability">✓ Dostępna</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant typing">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="quick-replies">
          <p className="quick-replies-label">💡 Sugestie:</p>
          <div className="quick-replies-buttons">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="quick-reply-btn"
                disabled={loading}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chatbot-input">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Napisz wiadomość..."
          disabled={loading}
          rows="1"
          className="input-field"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="send-button"
        >
          {loading ? "⏳" : "📤"}
        </button>
      </form>

      {recommendedBooks.length > 0 && (
        <div className="chat-summary">
          <h4>📚 Wszystkie polecone książki ({recommendedBooks.length}):</h4>
          <div className="summary-books">
            {recommendedBooks.map((book) => (
              <div key={book.id} className="summary-book">
                <span className="book-title">{book.title}</span>
                <span className="book-author">{book.author}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
