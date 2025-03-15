import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Install if not installed: npm install jwt-decode
import { workerLogout } from "../features/workerSlice"; // Worker slice for Redux
import store from "../store";
import Toast from "./Toast";

const isDevelopment = import.meta.env.MODE === 'development';
const BaseUrl = isDevelopment ? 
  import.meta.env.VITE_API_BASE_URL_LOCAL : 
  import.meta.env.VITE_API_BASE_URL_DEPLOY;

// Create a single Axios instance for workers
const workerApi = axios.create({
  baseURL: BaseUrl, // Use environment variable for base URL
  timeout: 50000, // Add a timeout
  headers: {
    'Content-Type': 'application/json', // Default headers
    Accept: 'application/json',
  },
});

// Function to check token expiry
const isTokenExpired = (token) => {
  try {
    if (!token) return true; // No token = Expired
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // Compare expiration time with current time
  } catch (error) {
    return true; // If decoding fails, consider it expired
  }
};

// Request Interceptor - Check worker token before request
workerApi.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const token = state.worker.accessToken; // Worker access token

    if (!token || isTokenExpired(token)) {
      Toast("error", "Session expired. Please log in again.");
      store.dispatch(workerLogout());
      localStorage.removeItem("workerAccessToken");
      localStorage.removeItem("workerRefreshToken");
      window.location.href = "/worker/login"; // Redirect to worker login page
      return Promise.reject(new Error("Worker token expired"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Unauthorized Errors
workerApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      Toast("error", "Session expired. Please log in again.");
      store.dispatch(workerLogout());
      localStorage.removeItem("workerAccessToken");
      localStorage.removeItem("workerRefreshToken");
      window.location.href = "/worker/login"; // Redirect to worker login
    }
    return Promise.reject(error);
  }
);

export default workerApi;