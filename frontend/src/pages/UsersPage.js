import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import UserCard from "../components/Users/UserCard";
import UserForm from "../components/Users/UserForm";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRentals, setUserRentals] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filtruj użytkowników przy zmianie zapytania
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError("Błąd podczas pobierania użytkowników");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      await usersAPI.create(userData);
      await fetchUsers();
      setShowForm(false);
      setError(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Użytkownik z tym adresem email już istnieje");
      } else {
        setError("Błąd podczas dodawania użytkownika");
      }
      console.error("Error adding user:", err);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await usersAPI.update(editingUser.id, userData);
      await fetchUsers();
      setShowForm(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Użytkownik z tym adresem email już istnieje");
      } else {
        setError("Błąd podczas aktualizacji użytkownika");
      }
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      try {
        await usersAPI.delete(userId);
        await fetchUsers();
        setError(null);
      } catch (err) {
        if (err.response?.data?.message?.includes("aktywnymi wypożyczeniami")) {
          setError("Nie można usunąć użytkownika z aktywnymi wypożyczeniami");
        } else {
          setError("Błąd podczas usuwania użytkownika");
        }
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleViewRentals = async (user) => {
    try {
      const response = await usersAPI.getRentals(user.id);
      setUserRentals(response.data.data);
      setSelectedUser(user);
      setShowForm(false);
    } catch (err) {
      setError("Błąd podczas pobierania wypożyczeń użytkownika");
      console.error("Error fetching user rentals:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>👥 Zarządzanie Użytkownikami</h1>
        {!showForm && !selectedUser && (
          <button onClick={() => setShowForm(true)} className="btn-add">
            ➕ Dodaj użytkownika
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleAddUser}
          onCancel={handleCancel}
        />
      )}

      {selectedUser && (
        <div className="user-rentals-modal">
          <div className="modal-header">
            <h2>
              📚 Wypożyczenia - {selectedUser.first_name}{" "}
              {selectedUser.last_name}
            </h2>
            <button onClick={() => setSelectedUser(null)} className="btn-close">
              ✕
            </button>
          </div>

          {userRentals.length === 0 ? (
            <p className="no-rentals">Brak wypożyczeń</p>
          ) : (
            <div className="rentals-list">
              {userRentals.map((rental) => (
                <div key={rental.id} className="rental-item">
                  <div className="rental-info">
                    <h4>{rental.title}</h4>
                    <p>Autor: {rental.author}</p>
                    <p>
                      Wypożyczone:{" "}
                      {new Date(rental.rental_date).toLocaleDateString("pl-PL")}
                    </p>
                    <p>
                      Termin zwrotu:{" "}
                      {new Date(rental.due_date).toLocaleDateString("pl-PL")}
                    </p>
                    {rental.return_date && (
                      <p>
                        Zwrócone:{" "}
                        {new Date(rental.return_date).toLocaleDateString(
                          "pl-PL"
                        )}
                      </p>
                    )}
                  </div>
                  <span className={`status-badge status-${rental.status}`}>
                    {rental.status === "active" && "🟢 Aktywne"}
                    {rental.status === "returned" && "✅ Zwrócone"}
                    {rental.status === "overdue" && "🔴 Przeterminowane"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!showForm && !selectedUser && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Szukaj użytkownika (imię, nazwisko, email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="btn-clear">
                ✕ Wyczyść
              </button>
            )}
          </div>

          <div className="users-stats">
            <p>Znaleziono: {filteredUsers.length} użytkowników</p>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="no-users">
              <p>Brak użytkowników do wyświetlenia</p>
              {searchQuery && <p>Spróbuj zmienić kryteria wyszukiwania</p>}
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDeleteUser}
                  onViewRentals={handleViewRentals}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersPage;
