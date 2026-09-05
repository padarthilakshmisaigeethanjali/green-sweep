import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

const normalizeUser = (userData) => {
  if (!userData) {
    return null;
  }

  return {
    ...userData,
    id: userData.id || userData._id,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return normalizeUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    const normalizedUser = normalizeUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");

      const normalizedUser = normalizeUser(response.data.user);

      localStorage.setItem("user", JSON.stringify(normalizedUser));

      setUser(normalizedUser);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser().finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
