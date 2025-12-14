import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Common/Navbar";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import LoadingSpinner from "./components/Common/LoadingSpinner";

// Strony publiczne
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Strony admina
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import UsersPage from "./pages/UsersPage";
import RentalsPage from "./pages/RentalsPage";
import StatsPage from "./pages/StatsPage";

// Strony czytelnika
import ReaderDashboard from "./pages/Reader/ReaderDashboard";
import ReaderBrowsePage from "./pages/Reader/ReaderBrowsePage";
import MyReservationsPage from "./pages/Reader/MyReservationsPage"; // NOWE

import "./App.css";

// Komponent przekierowania do odpowiedniego dashboardu
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/reader" replace />;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Strony publiczne */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Przekierowanie główne */}
          <Route path="/" element={<DashboardRedirect />} />

          {/* Strony admina */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute adminOnly>
                <BooksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentals"
            element={
              <ProtectedRoute adminOnly>
                <RentalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute adminOnly>
                <StatsPage />
              </ProtectedRoute>
            }
          />

          {/* Strony czytelnika */}
          <Route
            path="/reader"
            element={
              <ProtectedRoute>
                <ReaderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reader/browse"
            element={
              <ProtectedRoute>
                <ReaderBrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reader/reservations"
            element={
              <ProtectedRoute>
                <MyReservationsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
