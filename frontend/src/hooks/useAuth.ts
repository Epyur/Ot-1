import { useState, useCallback } from "react";
import { setAdminToken } from "../api/admin.api";

export function useAuth() {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem("admin_token") || "";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("admin_token");
  });

  const login = useCallback((newToken: string) => {
    localStorage.setItem("admin_token", newToken);
    setAdminToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsAuthenticated(false);
  }, []);

  return { token, isAuthenticated, login, logout };
}