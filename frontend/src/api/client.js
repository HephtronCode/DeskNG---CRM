import axios from "axios";

// API base URL comes from frontend/.env (defaults to local).
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("deskng_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize responses and errors for callers.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Clear an expired/invalid token so the app can re-login.
    if (error.response?.status === 401) {
      localStorage.removeItem("deskng_token");
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export default client;
