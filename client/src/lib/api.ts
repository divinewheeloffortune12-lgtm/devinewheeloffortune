import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://devinewheeloffortune.onrender.com";

export const api = axios.create({
  baseURL: API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.response?.data?.error?.message || fallback
    : fallback;

export default api;
