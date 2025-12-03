import { createContext, useContext, useEffect, useState } from "react";
import { getToken, saveToken, removeToken } from "../lib/auth";
import api from "../lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on startup
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get("/auth/me"); // <-- api to get user from token
        setUser(res.data.user);
      } catch (e) {
        removeToken();
      }
      setLoading(false);
    })();
  }, []);

  const login = (token, user) => {
    saveToken(token);
    setUser(user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
