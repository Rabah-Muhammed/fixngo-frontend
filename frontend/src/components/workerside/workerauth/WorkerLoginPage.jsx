import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Added Redux hook
import axios from "axios";
import Navbar from "../../userside/Navbar";
import { workerLogin } from "../../../features/workerSlice"; // Import workerLogin action

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
      const response = await axios.post("http://localhost:8000/api/worker/login/", formData);
      const { access, refresh } = response.data;

      // Dispatch worker login data to Redux
      dispatch(workerLogin({
        worker: { email: formData.email }, // Use form email; adjust if API returns email
        accessToken: access,
        refreshToken: refresh,
      }));

      // Optional: Keep localStorage for backward compatibility (remove if fully using Redux)
      localStorage.setItem("workerAccessToken", access);
      localStorage.setItem("workerRefreshToken", refresh);
      localStorage.setItem("workerEmail", formData.email); // Set for fallback

      console.log("Worker logged in, email set:", formData.email);
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