import axios from "axios";
import { clearAccessToken, getAccessToken } from "./auth/token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const formData =
      config.data instanceof FormData
        ? "multipart/form-data"
        : "application/json";
    config.headers["Content-Type"] = formData;

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (config) => config,
  (error) => {
    if (error.response.status === 401) {
      clearAccessToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
