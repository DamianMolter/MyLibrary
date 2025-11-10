// Formatowanie daty
export const formatDate = (dateString) => {
  if (!dateString) return "Brak daty";
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL");
};

// Oblicz dni do zwrotu
export const daysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Sprawdź czy przeterminowane
export const isOverdue = (dueDate) => {
  return daysUntilDue(dueDate) < 0;
};

// Kolor statusu wypożyczenia
export const getRentalStatusColor = (status) => {
  switch (status) {
    case "active":
      return "green";
    case "overdue":
      return "red";
    case "returned":
      return "gray";
    default:
      return "blue";
  }
};

// Status wypożyczenia po polsku
export const getRentalStatusText = (status) => {
  switch (status) {
    case "active":
      return "Aktywne";
    case "overdue":
      return "Przeterminowane";
    case "returned":
      return "Zwrócone";
    default:
      return status;
  }
};

// Walidacja email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Walidacja ISBN
export const isValidISBN = (isbn) => {
  if (!isbn) return true; // ISBN jest opcjonalny
  const cleanISBN = isbn.replace(/[- ]/g, "");
  return cleanISBN.length === 10 || cleanISBN.length === 13;
};
