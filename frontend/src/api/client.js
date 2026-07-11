import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/api" : "");

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is required for production."
  );
}

const apiClient = axios.create({
  baseURL: API_URL.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("embeera_token") ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
