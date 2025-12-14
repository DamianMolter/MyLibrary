import React, { useState, useEffect } from "react";
import { reservationsAPI } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ErrorMessage from "../../components/Common/ErrorMessage";
import "./AdminReservationsPage.css";

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending"); // all, pending, approved, rejected
  const [processingId, setProcessingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // approve, reject, convert
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [filterStatus, reservations]);

  useEffect(() => {
    // Ustaw domyślne daty dla konwersji
    const today = new Date().toISOString().split("T")[0];
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

    setRentalDate(today);
    setDueDate(twoWeeksLater.toISOString().split("T")[0]);
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getAll();
      setReservations(response.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania rezerwacji");
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    if (filterStatus === "all") {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(
        reservations.filter((r) => r.status === filterStatus)
      );
    }
  };

  const openModal = (action, reservation) => {
    setModalAction(action);
    setSelectedReservation(reservation);
    setAdminNotes("");
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction(null);
    setSelectedReservation(null);
    setAdminNotes("");
  };

  const handleApprove = async () => {
    try {
      setProcessingId(selectedReservation.id);
      await reservationsAPI.approve(selectedReservation.id, adminNotes || null);
      setSuccess(
        `Rezerwacja dla "${selectedReservation.title}" została zatwierdzona`
      );
      await fetchReservations();
      closeModal();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Błąd podczas zatwierdzania rezerwacji"
      );
      console.error("Error approving reservation:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      setError("Podaj powód odrzucenia");
      return;
    }

    try {
      setProcessingId(selectedReservation.id);
      await reservationsAPI.reject(selectedReservation.id, adminNotes);
      setSuccess(
        `Rezerwacja dla "${selectedReservation.title}" została odrzucona`
      );
      await fetchReservations();
      closeModal();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Błąd podczas odrzucania rezerwacji"
      );
      console.error("Error rejecting reservation:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConvert = async () => {
    if (!rentalDate || !dueDate) {
      setError("Podaj datę wypożyczenia i termin zwrotu");
      return;
    }

    if (new Date(dueDate) <= new Date(rentalDate)) {
      setError("Termin zwrotu musi być późniejszy niż data wypożyczenia");
      return;
    }

    try {
      setProcessingId(selectedReservation.id);
      await reservationsAPI.convertToRental(
        selectedReservation.id,
        rentalDate,
        dueDate
      );
      setSuccess(
        `Rezerwacja zamieniona na wypożyczenie - książka "${selectedReservation.title}" wypożyczona`
      );
      await fetchReservations();
      closeModal();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Błąd podczas zamiany na wypożyczenie"
      );
      console.error("Error converting reservation:", err);
    } finally {
      setProcessingId(null);
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

  if (loading) return <LoadingSpinner />;

  const stats = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    approved: reservations.filter((r) => r.status === "approved").length,
    rejected: reservations.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="admin-reservations-page">
      <div className="page-header">
        <h1>📅 Zarządzanie Rezerwacjami</h1>
        <p>Przetwarzaj i zarządzaj rezerwacjami książek</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {success && <div className="success-message">✅ {success}</div>}

      {/* Statystyki */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.all}</div>
          <div className="stat-label">Wszystkie rezerwacje</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Oczekujące</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Zatwierdzone</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Odrzucone</div>
        </div>
      </div>

      {/* Filtry */}
      <div className="filter-tabs">
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
          className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          📋 Wszystkie ({stats.all})
        </button>
      </div>

      {/* Lista rezerwacji */}
      {filteredReservations.length === 0 ? (
        <div className="empty-state">
          <p>Brak rezerwacji do wyświetlenia</p>
          {filterStatus !== "all" && (
            <p>Zmień filtr aby zobaczyć inne rezerwacje</p>
          )}
        </div>
      ) : (
        <div className="reservations-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Książka</th>
                <th>Użytkownik</th>
                <th>Data rezerwacji</th>
                <th>Preferowana data odbioru</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => {
                const statusInfo = getStatusInfo(reservation.status);

                return (
                  <tr key={reservation.id}>
                    <td>#{reservation.id}</td>
                    <td>
                      <div className="book-info-cell">
                        <strong>{reservation.title}</strong>
                        <span className="author-small">
                          {reservation.author}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <strong>
                          {reservation.first_name} {reservation.last_name}
                        </strong>
                        <span className="email-small">{reservation.email}</span>
                      </div>
                    </td>
                    <td>{formatDate(reservation.reservation_date)}</td>
                    <td>{formatDate(reservation.preferred_pickup_date)}</td>
                    <td>
                      <span
                        className={`status-badge badge-${statusInfo.color}`}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {reservation.status === "pending" && (
                          <>
                            <button
                              onClick={() => openModal("approve", reservation)}
                              className="btn-action btn-approve"
                              title="Zatwierdź"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => openModal("reject", reservation)}
                              className="btn-action btn-reject"
                              title="Odrzuć"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {reservation.status === "approved" && (
                          <button
                            onClick={() => openModal("convert", reservation)}
                            className="btn-action btn-convert"
                            title="Zamień na wypożyczenie"
                          >
                            📤
                          </button>
                        )}
                        {["completed", "rejected", "cancelled"].includes(
                          reservation.status
                        ) && <span className="no-actions">-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedReservation && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalAction === "approve" && "✅ Zatwierdź rezerwację"}
                {modalAction === "reject" && "❌ Odrzuć rezerwację"}
                {modalAction === "convert" && "📤 Zamień na wypożyczenie"}
              </h2>
              <button onClick={closeModal} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="reservation-info-modal">
                <h3>{selectedReservation.title}</h3>
                <p>
                  <strong>Autor:</strong> {selectedReservation.author}
                </p>
                <p>
                  <strong>Użytkownik:</strong> {selectedReservation.first_name}{" "}
                  {selectedReservation.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedReservation.email}
                </p>
                <p>
                  <strong>Preferowana data odbioru:</strong>{" "}
                  {formatDate(selectedReservation.preferred_pickup_date)}
                </p>
              </div>

              {modalAction === "approve" && (
                <div className="form-group">
                  <label htmlFor="admin_notes">Notatka (opcjonalna):</label>
                  <textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Dodaj notatkę dla użytkownika..."
                    rows="3"
                    className="textarea-input"
                  />
                  <small className="form-hint">
                    Użytkownik będzie miał 7 dni na odbiór książki po
                    zatwierdzeniu
                  </small>
                </div>
              )}

              {modalAction === "reject" && (
                <div className="form-group">
                  <label htmlFor="admin_notes">Powód odrzucenia: *</label>
                  <textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Podaj powód odrzucenia rezerwacji..."
                    rows="3"
                    className="textarea-input"
                    required
                  />
                  <small className="form-hint text-danger">
                    Powód jest wymagany - użytkownik zobaczy tę wiadomość
                  </small>
                </div>
              )}

              {modalAction === "convert" && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="rental_date">Data wypożyczenia: *</label>
                      <input
                        type="date"
                        id="rental_date"
                        value={rentalDate}
                        onChange={(e) => setRentalDate(e.target.value)}
                        className="date-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="due_date">Termin zwrotu: *</label>
                      <input
                        type="date"
                        id="due_date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="date-input"
                      />
                    </div>
                  </div>

                  <div className="info-box">
                    <p>
                      <strong>ℹ️ Akcja:</strong>
                    </p>
                    <ul>
                      <li>Rezerwacja zostanie oznaczona jako "zrealizowana"</li>
                      <li>Utworzone zostanie nowe wypożyczenie</li>
                      <li>Liczba dostępnych egzemplarzy zmniejszy się o 1</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cancel">
                Anuluj
              </button>
              <button
                onClick={
                  modalAction === "approve"
                    ? handleApprove
                    : modalAction === "reject"
                    ? handleReject
                    : handleConvert
                }
                className={`btn-confirm ${
                  modalAction === "approve"
                    ? "btn-success"
                    : modalAction === "reject"
                    ? "btn-danger"
                    : "btn-primary"
                }`}
                disabled={processingId === selectedReservation.id}
              >
                {processingId === selectedReservation.id
                  ? "⏳ Przetwarzanie..."
                  : modalAction === "approve"
                  ? "✓ Zatwierdź"
                  : modalAction === "reject"
                  ? "✕ Odrzuć"
                  : "📤 Zamień na wypożyczenie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsPage;
