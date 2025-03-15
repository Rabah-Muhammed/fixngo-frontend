import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Install using: npm install jwt-decode
import { logout } from "../features/userSlice";
import store from "../store";
import Toast from "./Toast";

const isDevelopment = import.meta.env.MODE === 'development';
const BaseUrl = isDevelopment ? 
  import.meta.env.VITE_API_BASE_URL_LOCAL : 
  import.meta.env.VITE_API_BASE_URL_DEPLOY;

// Create a single Axios instance with all configurations
const api = axios.create({
  baseURL: BaseUrl,
  timeout: 50000, // Add a timeout
  headers: {
    'Content-Type': 'application/json', // Default headers
    Accept: 'application/json',
  },
});

// Function to check if the token is expired
const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Request interceptor to add the token to headers
api.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const token = state.user.accessToken;

    if (!token || isTokenExpired(token)) {
      Toast("error", "Session expired. Please log in again.");
      store.dispatch(logout());
      localStorage.removeItem("userAccessToken");
      localStorage.removeItem("userRefreshToken");
      window.location.href = "/login";
      return Promise.reject(new Error("Token expired"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      Toast("error", "Session expired. Please log in again.");
      store.dispatch(logout());
      localStorage.removeItem("userAccessToken");
      localStorage.removeItem("userRefreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;