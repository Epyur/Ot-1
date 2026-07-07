import React, { useState, useEffect } from "react";
import { SurveyTable } from "../components/SurveyTable";
import { getAllResponses, downloadExcel, setAdminToken } from "../api/admin.api";
import { useAuth } from "../hooks/useAuth";
import { IAnswer } from "../types/survey.types";

export function AdminDashboard() {
  const { token, isAuthenticated, login, logout } = useAuth();
  const [tokenInput, setTokenInput] = useState("");
  const [surveys, setSurveys] = useState<IAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && token) {
      setAdminToken(token);
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllResponses();
      setSurveys(data);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
        if (axiosErr.response?.status === 403) {
          setError("Неверный токен. Пожалуйста, авторизуйтесь заново.");
          logout();
        } else {
          setError(axiosErr.response?.data?.error || "Ошибка загрузки данных");
        }
      } else {
        setError("Ошибка соединения с сервером");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      login(tokenInput.trim());
      setTokenInput("");
    }
  };

  const handleExport = async () => {
    try {
      await downloadExcel();
    } catch {
      setError("Ошибка при выгрузке Excel");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <h1>Панель сотрудника</h1>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="token">Введите токен доступа</label>
            <input
              id="token"
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Введите admin токен"
            />
          </div>
          <button type="submit" className="submit-btn">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Панель сотрудника</h1>
        <div className="admin-actions">
          <button onClick={handleExport} className="export-btn" disabled={surveys.length === 0}>
            Скачать Excel
          </button>
          <button onClick={fetchData} className="refresh-btn" disabled={loading}>
            {loading ? "Загрузка..." : "Обновить"}
          </button>
          <button onClick={logout} className="logout-btn">Выйти</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Загрузка данных...</p>
      ) : (
        <SurveyTable surveys={surveys} />
      )}
    </div>
  );
}