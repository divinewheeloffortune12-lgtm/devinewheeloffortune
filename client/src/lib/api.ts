import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://devinewheeloffortune.onrender.com";

export const api = axios.create({
  baseURL: API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Check for admin token first (for admin routes), then fall back to normal user token
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.response?.data?.error?.message || fallback
    : fallback;

export default api;
