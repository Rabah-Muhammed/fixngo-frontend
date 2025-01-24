import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { useDispatch } from "react-redux";
import { loginn } from "../../../features/userSlice"; // Import the login action
import Toast from "../../../utils/Toast"; // Import the custom Toast function
import GoogleLoginButton from "./GoogleLoginButton";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/login/", formData);

      // Dispatch login action to update Redux store
      dispatch(
        loginn({
          user: response.data.user,
          accessToken: response.data.access,
          refreshToken: response.data.refresh,
        })
      );

      // Save tokens with custom names
      localStorage.setItem("userAccessToken", response.data.access); // Custom token name
      localStorage.setItem("userRefreshToken", response.data.refresh); // Custom token name

      // Show success toast
      Toast("success", "Login successful! Redirecting...");

      navigate("/"); // Redirect to home page after successful login
    } catch (error) {
      // Extract error message from backend response or handle network error
      const errorMessage =
        error.response?.data?.error ||
        "Unable to connect to the server. Please try again later.";

      // Show appropriate toast message
      Toast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md sm:max-w-sm">
          <h2 className="text-3xl font-bold text-center text-black mb-6">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                aria-label="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold rounded-lg ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800 transition duration-300"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          
          {/* Google Login Button */}
          <div className="my-4">
            <GoogleLoginButton />
          </div>

          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-black hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Sign up
            </a>
          </p>
          <p className="text-center mt-2 text-sm text-gray-600">
            Forgot your password?{" "}
            <a
              href="/forgot-password"
              className="text-black hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Reset it here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
