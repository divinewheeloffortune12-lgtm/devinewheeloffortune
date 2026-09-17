import axios, { AxiosError } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://devinewheeloffortune.onrender.com";

export const api = axios.create({
  baseURL: API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Check if it's an admin route
  const isAdminRoute = config.url?.startsWith('/admin') || config.url?.startsWith('/auth/admin');
  const token = isAdminRoute ? localStorage.getItem("admin_token") : localStorage.getItem("token");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors and retries (for cold starts)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      const isApiAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/admin/login');
      if (!isApiAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        // We don't force redirect here to allow components to handle it gracefully,
        // but clearing the token ensures the next request doesn't use an expired one.
      }
    }

    // Retry logic for GET requests (specifically helpful for Render free tier cold starts)
    const config = error.config as any;
    
    // Only retry GET requests, and don't retry if it's a 4xx error (client error)
    if (
      !config ||
      config.method !== 'get' || 
      (error.response && error.response.status >= 400 && error.response.status < 500)
    ) {
      return Promise.reject(error);
    }

    config.retryCount = config.retryCount || 0;
    
    // Max 3 retries
    if (config.retryCount >= 3) {
      return Promise.reject(error);
    }

    config.retryCount += 1;
    
    // Exponential backoff: 1s, 2s, 4s
    const backoff = new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000 * Math.pow(2, config.retryCount - 1));
    });

    await backoff;
    return api(config);
  }
);

export const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.response?.data?.error?.message || fallback
    : fallback;

export default api;
