import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure you have it installed: npm install jwt-decode
import Toast from "./Toast";

const isDevelopment = import.meta.env.MODE === 'development';
const BaseUrl = isDevelopment ? 
  import.meta.env.VITE_API_BASE_URL_LOCAL : 
  import.meta.env.VITE_API_BASE_URL_DEPLOY;

// Create a single Axios instance for admin
const adminApi = axios.create({
  baseURL: BaseUrl, // Use environment variable for base URL
  timeout: 50000, // Add a timeout
  headers: {
    'Content-Type': 'application/json', // Default headers
    Accept: 'application/json',
  },
});

// Function to check if the token is expired
const isTokenExpired = (token) => {
  try {
    if (!token) return true; // No token = Expired
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // Compare token expiry with current time
  } catch (error) {
    return true; // If decoding fails, treat it as expired
  }
};

// Function to log out the admin
const adminLogout = () => {
  Toast("error", "Session expired. Please log in again.");
  localStorage.removeItem("adminAccessToken");
  localStorage.removeItem("adminRefreshToken");
  window.location.href = "/admin/login"; // Redirect to admin login page
};

// Request Interceptor - Attach token & check expiry before making requests
adminApi.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("adminAccessToken");

    if (!token || isTokenExpired(token)) {
      adminLogout();
      return Promise.reject(new Error("Admin token expired"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Unauthorized Errors (401, 403)
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      adminLogout();
    }
    return Promise.reject(error);
  }
);

export default adminApi;