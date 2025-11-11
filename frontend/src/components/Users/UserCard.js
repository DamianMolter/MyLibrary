import "./UserCard.css";

const UserCard = ({ user, onEdit, onDelete, onViewRentals }) => {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {user.first_name[0]}
          {user.last_name[0]}
        </div>
        <div className="user-info">
          <h3>
            {user.first_name} {user.last_name}
          </h3>
          <p className="user-email">📧 {user.email}</p>
          {user.phone && <p className="user-phone">📱 {user.phone}</p>}
        </div>
      </div>

      <div className="user-card-footer">
        <button onClick={() => onViewRentals(user)} className="btn btn-rentals">
          📚 Wypożyczenia
        </button>
        <button onClick={() => onEdit(user)} className="btn btn-edit">
          ✏️ Edytuj
        </button>
        <button onClick={() => onDelete(user.id)} className="btn btn-delete">
          🗑️ Usuń
        </button>
      </div>
    </div>
  );
};

export default UserCard;
