import axios from "axios";

// Use the correct backend server URL - support both localhost and network access
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log(
    "🚀 API Request:",
    config.method?.toUpperCase(),
    config.url,
    config.baseURL,
  );
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.config?.url,
      error.message,
    );
    if (error.response?.data) {
      console.error("📄 Error Details:", error.response.data);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
