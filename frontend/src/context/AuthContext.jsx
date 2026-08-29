import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Synchronously initialize user from localStorage for instant 0ms render on refresh
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("eduverse_user");
      const storedToken = localStorage.getItem("eduverse_token");
      if (storedUser && storedToken) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Failed to parse stored user:", e);
    }
    return null;
  });

  // If token and user exist in storage, do not block with loading screen
  const [loading, setLoading] = useState(() => {
    const storedToken = localStorage.getItem("eduverse_token");
    const storedUser = localStorage.getItem("eduverse_user");
    return !storedToken || !storedUser;
  });

  const logout = () => {
    localStorage.removeItem("eduverse_token");
    localStorage.removeItem("eduverse_user");
    setUser(null);
  };

  const login = (userData, token) => {
    const normalizedUser = {
      ...userData,
      id: (userData._id || userData.id || "").toString(),
    };
    localStorage.setItem("eduverse_token", token);
    localStorage.setItem("eduverse_user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  useEffect(() => {
    const syncUserSession = async () => {
      const storedToken = localStorage.getItem("eduverse_token");

      if (!storedToken) {
        logout();
        setLoading(false);
        return;
      }

      try {
        // Silently verify and refresh session in background without blocking the UI
        const res = await api.get("/auth/me");
        if (res.data && res.data.user) {
          const normalizedUser = {
            ...res.data.user,
            id: (res.data.user._id || res.data.user.id || "").toString(),
          };
          setUser(normalizedUser);
          localStorage.setItem("eduverse_user", JSON.stringify(normalizedUser));
        } else {
          logout();
        }
      } catch (err) {
        // Only log out on actual unauthorized 401/403 responses
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.error("Session expired or invalid:", err);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    syncUserSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

