import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Sprawdź czy token jest ważny
  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Załaduj dane użytkownika z tokenu
  useEffect(() => {
    const loadUser = async () => {
      if (token && isTokenValid(token)) {
        try {
          // Ustaw token w axios
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Pobierz dane użytkownika
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(response.data.data);
        } catch (error) {
          console.error("Error loading user:", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Logowanie
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data.data;

      // Zapisz token
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      // Ustaw token w axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Błąd podczas logowania",
      };
    }
  };

  // Rejestracja
  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );

      const { token, user } = response.data.data;

      // Zapisz token
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      // Ustaw token w axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Błąd podczas rejestracji",
      };
    }
  };

  // Wylogowanie
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  // Sprawdź czy użytkownik jest adminem
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Sprawdź czy użytkownik jest czytelnikiem
  const isReader = () => {
    return user?.role === "reader";
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isReader,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
