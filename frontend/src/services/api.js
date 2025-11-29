import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

console.log("API Base URL:", API_BASE_URL); // Debug

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Interceptor - automatyczne dodawanie tokenu do requestów
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor - obsługa błędów autoryzacji
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token wygasł lub jest nieprawidłowy
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  changePassword: (passwords) => api.put("/auth/change-password", passwords),
};

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

// Recommendations API (Chatbot)
export const recommendationsAPI = {
  getWelcome: () => api.get("/recommendations/welcome"),
  chat: (message, conversationHistory) =>
    api.post("/recommendations/chat", {
      message,
      conversationHistory,
    }),
  sendFeedback: (bookId, helpful) =>
    api.post("/recommendations/feedback", {
      bookId,
      helpful,
    }),
};

export default api;
