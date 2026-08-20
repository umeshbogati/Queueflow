import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});


// ==================================
// REQUEST INTERCEPTOR
// ==================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ==================================
// RESPONSE INTERCEPTOR
// ==================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "Unauthorized request."
      );
    }

    return Promise.reject(error);
  }
);


export default api;