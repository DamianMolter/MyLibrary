import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Common/Navbar";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import UsersPage from "./pages/UsersPage";
import RentalsPage from "./pages/RentalsPage";
import StatsPage from "./pages/StatsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
