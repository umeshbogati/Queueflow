import axios from "axios";

// The base URL for the API is determined by the VITE_API_URL environment variable.
const rawBaseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
const cleanURL = rawBaseURL.replace(/\/+$/, "");
const baseURL = cleanURL.endsWith("/api") ? cleanURL : `${cleanURL}/api`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized request.");
    }

    return Promise.reject(error);
  }
);

export default api;