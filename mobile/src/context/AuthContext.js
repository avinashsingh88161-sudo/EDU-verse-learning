import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("eduverse_token");
      const storedUser = await AsyncStorage.getItem("eduverse_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify me endpoint
        const res = await apiClient.get("/auth/me");
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          await AsyncStorage.setItem("eduverse_user", JSON.stringify(res.data.user));
        }
      }
    } catch (error) {
      console.log("Auth session reload failed, clearing session.", error?.message);
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res.data?.success && res.data?.token) {
      const { user: userData, token: jwtToken } = res.data;
      setToken(jwtToken);
      setUser(userData);
      await AsyncStorage.setItem("eduverse_token", jwtToken);
      await AsyncStorage.setItem("eduverse_user", JSON.stringify(userData));
    }
    return res.data;
  };

  const signup = async (formData) => {
    const res = await apiClient.post("/auth/signup", formData);
    if (res.data?.success && res.data?.token) {
      const { user: userData, token: jwtToken } = res.data;
      setToken(jwtToken);
      setUser(userData);
      await AsyncStorage.setItem("eduverse_token", jwtToken);
      await AsyncStorage.setItem("eduverse_user", JSON.stringify(userData));
    }
    return res.data;
  };

  const logout = async () => {
    await clearSession();
  };

  const clearSession = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("eduverse_token");
    await AsyncStorage.removeItem("eduverse_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
