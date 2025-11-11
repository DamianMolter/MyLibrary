import {
  formatDate,
  daysUntilDue,
  isOverdue,
  getRentalStatusColor,
  getRentalStatusText,
} from "../../utils/helpers";
import "./RentalCard.css";

const RentalCard = ({ rental, onReturn, onExtend }) => {
  const daysLeft = daysUntilDue(rental.due_date);
  const overdue = isOverdue(rental.due_date);
  const statusColor = getRentalStatusColor(rental.status);

  return (
    <div className={`rental-card ${rental.status}`}>
      <div className="rental-card-header">
        <h3>{rental.title}</h3>
        <span className={`status-badge status-${statusColor}`}>
          {getRentalStatusText(rental.status)}
        </span>
      </div>

      <div className="rental-card-body">
        <div className="rental-info-grid">
          <div className="info-item">
            <strong>📚 Autor:</strong>
            <span>{rental.author}</span>
          </div>

          {rental.isbn && (
            <div className="info-item">
              <strong>📖 ISBN:</strong>
              <span>{rental.isbn}</span>
            </div>
          )}

          <div className="info-item">
            <strong>👤 Użytkownik:</strong>
            <span>
              {rental.first_name} {rental.last_name}
            </span>
          </div>

          <div className="info-item">
            <strong>📧 Email:</strong>
            <span>{rental.email}</span>
          </div>

          <div className="info-item">
            <strong>📅 Data wypożyczenia:</strong>
            <span>{formatDate(rental.rental_date)}</span>
          </div>

          <div className="info-item">
            <strong>⏰ Termin zwrotu:</strong>
            <span
              className={
                overdue && rental.status === "active" ? "overdue-text" : ""
              }
            >
              {formatDate(rental.due_date)}
            </span>
          </div>

          {rental.status === "active" && (
            <div className="info-item days-left">
              <strong>⏳ Pozostało dni:</strong>
              <span
                className={
                  overdue ? "overdue-text" : daysLeft <= 3 ? "warning-text" : ""
                }
              >
                {overdue
                  ? `Spóźnione o ${Math.abs(daysLeft)} dni`
                  : `${daysLeft} dni`}
              </span>
            </div>
          )}

          {rental.return_date && (
            <div className="info-item">
              <strong>✅ Data zwrotu:</strong>
              <span>{formatDate(rental.return_date)}</span>
            </div>
          )}
        </div>
      </div>

      {rental.status === "active" && (
        <div className="rental-card-footer">
          <button onClick={() => onExtend(rental)} className="btn btn-extend">
            🔄 Przedłuż
          </button>
          <button onClick={() => onReturn(rental)} className="btn btn-return">
            ✅ Zwróć książkę
          </button>
        </div>
      )}
    </div>
  );
};

export default RentalCard;
