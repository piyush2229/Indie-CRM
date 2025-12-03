// src/lib/axios.js
import axios from "axios";
import { getToken, removeToken } from "./auth";

/**
 * Axios instance for API requests.
 * Base URL points to the backend server.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 15000,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // token invalid/expired -> remove token to force re-login
      removeToken();
      // (optionally) you could redirect to /login here from the app
    }
    return Promise.reject(err);
  }
);

export default api;
