import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Books API
export const booksAPI = {
  getAll: () => api.get("/books"),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post("/books", bookData),
  update: (id, bookData) => api.patch(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  search: (query) => api.get(`/books/search?q=${query}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  search: (query) => api.get(`/users/search?q=${query}`),
  getRentals: (id) => api.get(`/users/${id}/rentals`),
  getActiveRentals: (id) => api.get(`/users/${id}/active-rentals`),
};

// Rentals API
export const rentalsAPI = {
  getAll: () => api.get("/rentals"),
  getById: (id) => api.get(`/rentals/${id}`),
  create: (rentalData) => api.post("/rentals", rentalData),
  returnBook: (id) => api.patch(`/rentals/${id}/return`),
  extend: (id, newDueDate) =>
    api.patch(`/rentals/${id}/extend`, { new_due_date: newDueDate }),
  getActive: () => api.get("/rentals/active"),
  getOverdue: () => api.get("/rentals/overdue"),
  getStats: () => api.get("/rentals/stats"),
  getMostRented: () => api.get(`/rentals/most-rented`),
};

// Google Books API
export const googleBooksAPI = {
  search: (query, maxResults = 10) =>
    api.get(`/google-books/search?q=${query}&maxResults=${maxResults}`),
  searchByTitle: (title) => api.get(`/google-books/title?title=${title}`),
  searchByAuthor: (author) => api.get(`/google-books/author?author=${author}`),
  searchByISBN: (isbn) => api.get(`/google-books/isbn/${isbn}`),
  getById: (id) => api.get(`/google-books/${id}`),
  import: (googleBooksId, copies) =>
    api.post(`/google-books/${googleBooksId}/import`, copies),
};

export default api;
