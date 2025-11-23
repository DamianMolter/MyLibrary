import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../services/api";
import { formatDate, daysUntilDue, isOverdue } from "../../utils/helpers";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorMessage from "../../components/Common/ErrorMessage";
import ChatBot from "../../components/Reader/ChatBot";
import "./ReaderDashboard.css";

const ReaderDashboard = () => {
  const { user } = useAuth();
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // active, history, chatbot

  useEffect(() => {
    if (activeTab !== "chatbot") {
      fetchRentals();
    }
  }, [user, activeTab]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const [activeRes, historyRes] = await Promise.all([
        usersAPI.getActiveRentals(user.id),
        usersAPI.getRentals(user.id),
      ]);

      setActiveRentals(activeRes.data.data);
      setRentalHistory(historyRes.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania wypożyczeń");
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeTab !== "chatbot") return <LoadingSpinner />;

  const returnedRentals = rentalHistory.filter((r) => r.status === "returned");
  const overdueCount = activeRentals.filter((r) =>
    isOverdue(r.due_date)
  ).length;

  return (
    <div className="reader-dashboard">
      <div className="dashboard-header">
        <h1>👋 Witaj, {user.first_name}!</h1>
        <p>Zarządzaj swoimi wypożyczeniami i odkrywaj nowe książki</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Statystyki */}
      <div className="reader-stats">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{activeRentals.length}</div>
          <div className="stat-label">Aktywne wypożyczenia</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-label">Przeterminowane</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{returnedRentals.length}</div>
          <div className="stat-label">Zwrócone</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            📖 Aktywne ({activeRentals.length})
          </button>
          <button
            className={`tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📜 Historia ({rentalHistory.length})
          </button>
          <button
            className={`tab ${activeTab === "chatbot" ? "active" : ""}`}
            onClick={() => setActiveTab("chatbot")}
          >
            🤖 Asystent AI
          </button>
        </div>
      </div>

      {/* Chatbot Tab */}
      {activeTab === "chatbot" && (
        <div className="rentals-section chatbot-section">
          <ChatBot />
        </div>
      )}

      {/* Aktywne wypożyczenia */}
      {activeTab === "active" && (
        <div className="rentals-section">
          {activeRentals.length === 0 ? (
            <div className="empty-state">
              <p>📚 Nie masz aktywnych wypożyczeń</p>
              <p>
                Przejdź do <a href="/reader/browse">przeglądania książek</a> lub{" "}
                <button
                  onClick={() => setActiveTab("chatbot")}
                  className="link-button"
                >
                  zapytaj asystenta AI
                </button>{" "}
                o rekomendacje
              </p>
            </div>
          ) : (
            <div className="rentals-grid">
              {activeRentals.map((rental) => {
                const daysLeft = daysUntilDue(rental.due_date);
                const overdue = isOverdue(rental.due_date);

                return (
                  <div
                    key={rental.id}
                    className={`rental-card ${overdue ? "overdue" : ""}`}
                  >
                    <div className="rental-card-header">
                      <h3>{rental.title}</h3>
                      {overdue ? (
                        <span className="badge badge-danger">
                          🔴 Przeterminowane
                        </span>
                      ) : daysLeft <= 3 ? (
                        <span className="badge badge-warning">
                          ⚠️ {daysLeft} dni
                        </span>
                      ) : (
                        <span className="badge badge-success">✅ Aktywne</span>
                      )}
                    </div>

                    <div className="rental-card-body">
                      <p>
                        <strong>Autor:</strong> {rental.author}
                      </p>
                      {rental.isbn && (
                        <p>
                          <strong>ISBN:</strong> {rental.isbn}
                        </p>
                      )}
                      <p>
                        <strong>Data wypożyczenia:</strong>{" "}
                        {formatDate(rental.rental_date)}
                      </p>
                      <p>
                        <strong>Termin zwrotu:</strong>{" "}
                        {formatDate(rental.due_date)}
                      </p>

                      {overdue ? (
                        <div className="days-info overdue">
                          ⚠️ Spóźnione o {Math.abs(daysLeft)} dni
                        </div>
                      ) : (
                        <div
                          className={`days-info ${
                            daysLeft <= 3 ? "warning" : ""
                          }`}
                        >
                          ⏰ Pozostało {daysLeft} dni
                        </div>
                      )}
                    </div>

                    {overdue && (
                      <div className="rental-card-footer">
                        <p className="overdue-message">
                          ⚠️ Prosimy o jak najszybszy zwrot książki do
                          biblioteki
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Historia wypożyczeń */}
      {activeTab === "history" && (
        <div className="rentals-section">
          {rentalHistory.length === 0 ? (
            <div className="empty-state">
              <p>📜 Brak historii wypożyczeń</p>
            </div>
          ) : (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Tytuł</th>
                    <th>Autor</th>
                    <th>Data wypożyczenia</th>
                    <th>Termin zwrotu</th>
                    <th>Data zwrotu</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalHistory.map((rental) => (
                    <tr key={rental.id}>
                      <td className="book-title">{rental.title}</td>
                      <td>{rental.author}</td>
                      <td>{formatDate(rental.rental_date)}</td>
                      <td>{formatDate(rental.due_date)}</td>
                      <td>
                        {rental.return_date
                          ? formatDate(rental.return_date)
                          : "-"}
                      </td>
                      <td>
                        {rental.status === "returned" && (
                          <span className="badge badge-success">
                            ✅ Zwrócone
                          </span>
                        )}
                        {rental.status === "active" && (
                          <span className="badge badge-info">🔵 Aktywne</span>
                        )}
                        {rental.status === "overdue" && (
                          <span className="badge badge-danger">
                            🔴 Przeterminowane
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReaderDashboard;
