import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 Biblioteka
        </Link>
        <ul className="navbar-menu">
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
