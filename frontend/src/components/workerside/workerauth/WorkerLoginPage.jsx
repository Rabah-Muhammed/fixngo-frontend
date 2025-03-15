import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import Navbar from "../../userside/Navbar";
import { workerLogin } from "../../../features/workerSlice";
import apiInstance from '../../../utils/apiInstance'

const WorkerLoginPage = () => {
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
      const response = await apiInstance.post("/api/worker/login/", formData);
      const { access, refresh } = response.data;

      // Include both email and username in Redux
      const workerData = {
        email: formData.email, // Keep email as before
        username: response.data.user.username, // Add username from backend
      };

      // Dispatch worker login data to Redux
      dispatch(
        workerLogin({
          worker: workerData,
          accessToken: access,
          refreshToken: refresh,
        })
      );

      // Keep localStorage as is
      localStorage.setItem("workerAccessToken", access);
      localStorage.setItem("workerRefreshToken", refresh);
      localStorage.setItem("workerEmail", formData.email); // Keep for other features
      localStorage.setItem("workerUsername", workerData.username); // Optional: add for consistency

      console.log("Worker logged in, username:", workerData.username, "email:", workerData.email);
      navigate("/worker/dashboard");
    } catch (error) {
      alert("Invalid credentials. Please try again.");
      console.error("Login error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-black mb-6">Worker Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 text-white font-bold rounded-lg ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 transition duration-300"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                className="text-black hover:underline cursor-pointer"
                onClick={() => navigate("/worker/signup")}
              >
                Sign up here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerLoginPage;