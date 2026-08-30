import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to gracefully support cloud cold-starts
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eduverse_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // When data is FormData, let browser/axios set multipart/form-data boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("eduverse_token");
      localStorage.removeItem("eduverse_user");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Pre-warm helper that pings the backend health endpoint in the background
let isWarmedUp = false;
export const warmupBackend = () => {
  if (isWarmedUp) return;
  isWarmedUp = true;
  api
    .get("/health")
    .then(() => {
      console.log("⚡ EduVerse Backend is active and warm.");
    })
    .catch(() => {
      // Retry once after 2 seconds if first ping failed during wake-up
      setTimeout(() => {
        api.get("/health").catch(() => {});
      }, 2000);
    });
};

export default api;
