import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 Biblioteka
        </Link>

        <ul className="navbar-menu">
          {isAdmin() ? (
            // Menu dla admina
            <>
              <li className="navbar-item">
                <Link to="/" className="navbar-link">
                  Strona główna
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/books" className="navbar-link">
                  Książki
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/users" className="navbar-link">
                  Użytkownicy
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/rentals" className="navbar-link">
                  Wypożyczenia
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/stats" className="navbar-link">
                  Statystyki
                </Link>
              </li>
            </>
          ) : (
            // Menu dla czytelnika
            <>
              <li className="navbar-item">
                <Link to="/reader" className="navbar-link">
                  Moje wypożyczenia
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/reader/browse" className="navbar-link">
                  Przeglądaj książki
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-user">
          <span className="user-info">
            👤 {user.first_name} {user.last_name}
            <span className="user-role">
              ({isAdmin() ? "Admin" : "Czytelnik"})
            </span>
          </span>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Wyloguj
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
