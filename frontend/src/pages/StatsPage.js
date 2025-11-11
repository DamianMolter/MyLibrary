import React, { useState, useEffect } from "react";
import { rentalsAPI, booksAPI, usersAPI } from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import "./StatsPage.css";

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [mostRented, setMostRented] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [rentalStatsRes, booksRes, usersRes, mostRentedRes] =
        await Promise.all([
          rentalsAPI.getStats(),
          booksAPI.getAll(),
          usersAPI.getAll(),
          rentalsAPI.getMostRented(10),
        ]);

      const books = booksRes.data.data;
      const availableBooks = books.filter((b) => b.available_copies > 0).length;
      const unavailableBooks = books.filter(
        (b) => b.available_copies === 0
      ).length;

      setStats({
        rentals: rentalStatsRes.data.data,
        totalBooks: books.length,
        availableBooks: availableBooks,
        unavailableBooks: unavailableBooks,
        totalUsers: usersRes.data.data.length,
      });

      setMostRented(mostRentedRes.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania statystyk");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="stats-page">
      <h1>📊 Statystyki Biblioteki</h1>

      {/* Główne statystyki */}
      <div className="main-stats">
        <div className="stats-section">
          <h2>📚 Książki</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-value">{stats.totalBooks}</div>
              <div className="stat-label">Łącznie książek</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.availableBooks}</div>
              <div className="stat-label">Dostępne</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">📤</div>
              <div className="stat-value">{stats.unavailableBooks}</div>
              <div className="stat-label">Wypożyczone</div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2>📖 Wypożyczenia</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{stats.rentals.total}</div>
              <div className="stat-label">Wszystkie</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">🟢</div>
              <div className="stat-value">{stats.rentals.active}</div>
              <div className="stat-label">Aktywne</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">⚠️</div>
              <div className="stat-value">{stats.rentals.overdue}</div>
              <div className="stat-label">Przeterminowane</div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">✔️</div>
              <div className="stat-value">{stats.rentals.returned}</div>
              <div className="stat-label">Zwrócone</div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2>👥 Użytkownicy</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Zarejestrowanych użytkowników</div>
            </div>
          </div>
        </div>
      </div>

      {/* Najpopularniejsze książki */}
      <div className="popular-books-section">
        <h2>🏆 Najpopularniejsze książki</h2>
        {mostRented.length === 0 ? (
          <p className="no-data">Brak danych o wypożyczeniach</p>
        ) : (
          <div className="popular-books-table">
            <table>
              <thead>
                <tr>
                  <th>Pozycja</th>
                  <th>Tytuł</th>
                  <th>Autor</th>
                  <th>ISBN</th>
                  <th>Liczba wypożyczeń</th>
                </tr>
              </thead>
              <tbody>
                {mostRented.map((book, index) => (
                  <tr key={book.id}>
                    <td className="rank">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && `${index + 1}.`}
                    </td>
                    <td className="book-title">{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn || "-"}</td>
                    <td className="rental-count">
                      <span className="badge">{book.rental_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dodatkowe wskaźniki */}
      <div className="additional-stats">
        <div className="stat-box">
          <h3>📈 Wskaźnik wypożyczeń</h3>
          <div className="progress-stat">
            <div className="progress-label">
              <span>Wypożyczone</span>
              <span>
                {stats.unavailableBooks} / {stats.totalBooks}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    stats.totalBooks > 0
                      ? (stats.unavailableBooks / stats.totalBooks) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="progress-percentage">
              {stats.totalBooks > 0
                ? `${Math.round(
                    (stats.unavailableBooks / stats.totalBooks) * 100
                  )}%`
                : "0%"}
            </div>
          </div>
        </div>

        <div className="stat-box">
          <h3>⚠️ Wskaźnik przeterminowań</h3>
          <div className="progress-stat">
            <div className="progress-label">
              <span>Przeterminowane</span>
              <span>
                {stats.rentals.overdue} / {stats.rentals.active}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill danger"
                style={{
                  width: `${
                    stats.rentals.active > 0
                      ? (stats.rentals.overdue / stats.rentals.active) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="progress-percentage">
              {stats.rentals.active > 0
                ? `${Math.round(
                    (stats.rentals.overdue / stats.rentals.active) * 100
                  )}%`
                : "0%"}
            </div>
          </div>
        </div>

        <div className="stat-box">
          <h3>✅ Wskaźnik zwrotów</h3>
          <div className="progress-stat">
            <div className="progress-label">
              <span>Zwrócone</span>
              <span>
                {stats.rentals.returned} / {stats.rentals.total}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill success"
                style={{
                  width: `${
                    stats.rentals.total > 0
                      ? (stats.rentals.returned / stats.rentals.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="progress-percentage">
              {stats.rentals.total > 0
                ? `${Math.round(
                    (stats.rentals.returned / stats.rentals.total) * 100
                  )}%`
                : "0%"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
