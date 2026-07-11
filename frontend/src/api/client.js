import axios from "axios";

if (!import.meta.env.VITE_API_URL) {
  throw new Error(
    "VITE_API_URL is required for the production deployment."
  );
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("embeera_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
