import React, { useState, useEffect } from "react";
import { rentalsAPI } from "../services/api";
import RentalCard from "../components/Rentals/RentalCard";
import RentalForm from "../components/Rentals/RentalForm";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import "./RentalsPage.css";

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, overdue, returned

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    filterRentals();
  }, [filterStatus, rentals]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalsAPI.getAll();
      setRentals(response.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania wypożyczeń");
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    let filtered = rentals;

    switch (filterStatus) {
      case "active":
        filtered = rentals.filter((r) => r.status === "active");
        break;
      case "overdue":
        filtered = rentals.filter(
          (r) =>
            r.status === "overdue" ||
            (r.status === "active" && new Date(r.due_date) < new Date())
        );
        break;
      case "returned":
        filtered = rentals.filter((r) => r.status === "returned");
        break;
      default:
        filtered = rentals;
    }

    setFilteredRentals(filtered);
  };

  const handleCreateRental = async (rentalData) => {
    try {
      await rentalsAPI.create(rentalData);
      await fetchRentals();
      setShowForm(false);
      setError(null);
      alert("Książka została wypożyczona pomyślnie!");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Błąd podczas wypożyczania książki");
      }
      console.error("Error creating rental:", err);
    }
  };

  const handleReturnBook = async (rental) => {
    if (window.confirm(`Czy na pewno zwracasz książkę "${rental.title}"?`)) {
      try {
        await rentalsAPI.returnBook(rental.id);
        await fetchRentals();
        setError(null);
        alert("Książka została zwrócona!");
      } catch (err) {
        setError("Błąd podczas zwracania książki");
        console.error("Error returning book:", err);
      }
    }
  };

  const handleExtendRental = async (rental) => {
    var dueDate = Date(rental.due_date);
    console.log(rental.due_date);
    const newDueDate = prompt(
      "Podaj nowy termin zwrotu (RRRR-MM-DD):",
      rental.due_date.slice(0, 10)
    );

    if (newDueDate) {
      // Walidacja daty
      const date = new Date(newDueDate);
      if (isNaN(date.getTime())) {
        alert("Nieprawidłowy format daty!");
        return;
      }

      if (date <= new Date(rental.due_date)) {
        alert("Nowy termin musi być późniejszy niż obecny!");
        return;
      }

      try {
        await rentalsAPI.extend(rental.id, newDueDate);
        await fetchRentals();
        setError(null);
        alert("Termin wypożyczenia został przedłużony!");
      } catch (err) {
        setError("Błąd podczas przedłużania wypożyczenia");
        console.error("Error extending rental:", err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  const stats = {
    total: rentals.length,
    active: rentals.filter((r) => r.status === "active").length,
    overdue: rentals.filter(
      (r) =>
        r.status === "overdue" ||
        (r.status === "active" && new Date(r.due_date) < new Date())
    ).length,
    returned: rentals.filter((r) => r.status === "returned").length,
  };

  return (
    <div className="rentals-page">
      <div className="rentals-header">
        <h1>📖 Zarządzanie Wypożyczeniami</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-add">
            ➕ Nowe wypożyczenie
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Statystyki */}
      <div className="rentals-stats-grid">
        <div className="stat-box">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Wszystkie</div>
        </div>
        <div className="stat-box active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Aktywne</div>
        </div>
        <div className="stat-box overdue">
          <div className="stat-number">{stats.overdue}</div>
          <div className="stat-label">Przeterminowane</div>
        </div>
        <div className="stat-box returned">
          <div className="stat-number">{stats.returned}</div>
          <div className="stat-label">Zwrócone</div>
        </div>
      </div>

      {showForm && (
        <RentalForm
          onSubmit={handleCreateRental}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && (
        <>
          {/* Filtry */}
          <div className="filter-bar">
            <label>Filtruj:</label>
            <div className="filter-buttons">
              <button
                onClick={() => setFilterStatus("all")}
                className={`filter-btn ${
                  filterStatus === "all" ? "active" : ""
                }`}
              >
                Wszystkie ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`filter-btn ${
                  filterStatus === "active" ? "active" : ""
                }`}
              >
                Aktywne ({stats.active})
              </button>
              <button
                onClick={() => setFilterStatus("overdue")}
                className={`filter-btn ${
                  filterStatus === "overdue" ? "active" : ""
                }`}
              >
                Przeterminowane ({stats.overdue})
              </button>
              <button
                onClick={() => setFilterStatus("returned")}
                className={`filter-btn ${
                  filterStatus === "returned" ? "active" : ""
                }`}
              >
                Zwrócone ({stats.returned})
              </button>
            </div>
          </div>

          {filteredRentals.length === 0 ? (
            <div className="no-rentals">
              <p>Brak wypożyczeń do wyświetlenia</p>
            </div>
          ) : (
            <div className="rentals-grid">
              {filteredRentals.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  onReturn={handleReturnBook}
                  onExtend={handleExtendRental}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RentalsPage;
