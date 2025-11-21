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
