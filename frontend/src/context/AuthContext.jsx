import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Verify token with server on application startup
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
        console.error("Auth session validation failed:", err);
        logout();
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
