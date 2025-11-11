import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rentalsAPI, booksAPI, usersAPI } from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import "./HomePage.css";

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [rentalStats, booksRes, usersRes] = await Promise.all([
        rentalsAPI.getStats(),
        booksAPI.getAll(),
        usersAPI.getAll(),
      ]);

      setStats({
        rentals: rentalStats.data.data,
        totalBooks: booksRes.data.data.length,
        totalUsers: usersRes.data.data.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>📚 System Wypożyczania Książek</h1>
        <p>Zarządzaj biblioteką w prosty i efektywny sposób</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <h3>Książki w bazie</h3>
          <p className="stat-number">{stats?.totalBooks || 0}</p>
          <Link to="/books" className="stat-link">
            Zobacz wszystkie →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Użytkownicy</h3>
          <p className="stat-number">{stats?.totalUsers || 0}</p>
          <Link to="/users" className="stat-link">
            Zarządzaj →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <h3>Aktywne wypożyczenia</h3>
          <p className="stat-number">{stats?.rentals?.active || 0}</p>
          <Link to="/rentals" className="stat-link">
            Zobacz →
          </Link>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <h3>Przeterminowane</h3>
          <p className="stat-number">{stats?.rentals?.overdue || 0}</p>
          <Link to="/rentals" className="stat-link">
            Sprawdź →
          </Link>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Szybkie akcje</h2>
        <div className="actions-grid">
          <Link to="/books" className="action-button">
            ➕ Dodaj książkę
          </Link>
          <Link to="/users" className="action-button">
            👤 Dodaj użytkownika
          </Link>
          <Link to="/rentals" className="action-button">
            📤 Nowe wypożyczenie
          </Link>
          <Link to="/stats" className="action-button">
            📊 Statystyki
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
