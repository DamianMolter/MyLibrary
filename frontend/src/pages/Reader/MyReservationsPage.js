import React, { useState, useEffect } from "react";
import { reservationsAPI } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorMessage from "../../components/Common/ErrorMessage";
import "./MyReservationsPage.css";

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, approved, rejected, completed, cancelled

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getMy();
      setReservations(response.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania rezerwacji");
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm("Czy na pewno chcesz anulować tę rezerwację?")) {
      return;
    }

    try {
      setCancellingId(id);
      await reservationsAPI.cancel(id);
      setSuccess("Rezerwacja została anulowana");
      await fetchReservations();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Błąd podczas anulowania rezerwacji"
      );
      console.error("Error cancelling reservation:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: "Oczekuje", color: "warning", icon: "⏳" },
      approved: { label: "Zatwierdzona", color: "success", icon: "✅" },
      rejected: { label: "Odrzucona", color: "danger", icon: "❌" },
      completed: { label: "Zrealizowana", color: "info", icon: "✔️" },
      cancelled: { label: "Anulowana", color: "secondary", icon: "🚫" },
    };
    return statuses[status] || { label: status, color: "default", icon: "❓" };
  };

  const filteredReservations =
    filterStatus === "all"
      ? reservations
      : reservations.filter((r) => r.status === filterStatus);

  if (loading) return <LoadingSpinner />;

  const stats = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    approved: reservations.filter((r) => r.status === "approved").length,
    rejected: reservations.filter((r) => r.status === "rejected").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  return (
    <div className="my-reservations-page">
      <div className="page-header">
        <h1>📅 Moje Rezerwacje</h1>
        <p>Zarządzaj swoimi rezerwacjami książek</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {success && <div className="success-message">✅ {success}</div>}

      {/* Filtry */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          Wszystkie ({stats.all})
        </button>
        <button
          className={`filter-tab ${filterStatus === "pending" ? "active" : ""}`}
          onClick={() => setFilterStatus("pending")}
        >
          ⏳ Oczekujące ({stats.pending})
        </button>
        <button
          className={`filter-tab ${
            filterStatus === "approved" ? "active" : ""
          }`}
          onClick={() => setFilterStatus("approved")}
        >
          ✅ Zatwierdzone ({stats.approved})
        </button>
        <button
          className={`filter-tab ${
            filterStatus === "rejected" ? "active" : ""
          }`}
          onClick={() => setFilterStatus("rejected")}
        >
          ❌ Odrzucone ({stats.rejected})
        </button>
      </div>

      {/* Lista rezerwacji */}
      {filteredReservations.length === 0 ? (
        <div className="empty-state">
          <p>Brak rezerwacji</p>
          {filterStatus !== "all" && (
            <p>Zmień filtr aby zobaczyć inne rezerwacje</p>
          )}
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map((reservation) => {
            const statusInfo = getStatusInfo(reservation.status);
            const canCancel = ["pending", "approved"].includes(
              reservation.status
            );

            return (
              <div
                key={reservation.id}
                className={`reservation-item status-${statusInfo.color}`}
              >
                <div className="reservation-header">
                  <div className="book-title-section">
                    <h3>{reservation.title}</h3>
                    <p className="book-author">{reservation.author}</p>
                  </div>
                  <span className={`status-badge badge-${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>

                <div className="reservation-details">
                  <div className="detail-item">
                    <span className="detail-label">Data rezerwacji:</span>
                    <span className="detail-value">
                      {formatDate(reservation.reservation_date)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      Preferowana data odbioru:
                    </span>
                    <span className="detail-value">
                      {formatDate(reservation.preferred_pickup_date)}
                    </span>
                  </div>
                  {reservation.status === "approved" &&
                    reservation.expires_at && (
                      <div className="detail-item">
                        <span className="detail-label">Ważna do:</span>
                        <span className="detail-value highlight">
                          {formatDate(reservation.expires_at)}
                        </span>
                      </div>
                    )}
                  {reservation.processed_date && (
                    <div className="detail-item">
                      <span className="detail-label">Data przetworzenia:</span>
                      <span className="detail-value">
                        {formatDate(reservation.processed_date)}
                      </span>
                    </div>
                  )}
                </div>

                {reservation.admin_notes && (
                  <div className="admin-notes">
                    <strong>💬 Notatka administratora:</strong>
                    <p>{reservation.admin_notes}</p>
                  </div>
                )}

                {reservation.status === "approved" && (
                  <div className="approved-info">
                    <p>✅ Twoja rezerwacja została zatwierdzona!</p>
                    <p>
                      Odbierz książkę w bibliotece do dnia:{" "}
                      <strong>{formatDate(reservation.expires_at)}</strong>
                    </p>
                  </div>
                )}

                {canCancel && (
                  <div className="reservation-actions">
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="btn-cancel-reservation"
                      disabled={cancellingId === reservation.id}
                    >
                      {cancellingId === reservation.id
                        ? "⏳ Anulowanie..."
                        : "🚫 Anuluj rezerwację"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
