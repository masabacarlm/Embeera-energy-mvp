import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL is missing");
}

const apiClient = axios.create({
  baseURL: apiUrl.replace(/\/$/, ""),
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
