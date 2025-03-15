import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../../../utils/Toast"; // Importing the Toast function
import apiInstance from "../../../utils/apiInstance";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await apiInstance.post("/api/verify-otp/", { email, otp });
      Toast("success", "OTP verified successfully!");
      navigate("/login");
    } catch (error) {
      Toast("error", "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await apiInstance.post("/api/resend-otp/", { email });
      Toast("success", "OTP resent successfully.");
    } catch (error) {
      Toast("error", "Unable to resend OTP. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-black mb-6">OTP Verification</h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          Please enter the OTP sent to your email: <span className="font-medium">{email}</span>
        </p>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-4"
        />
        <button
          onClick={handleVerifyOtp}
          disabled={loading}
          className={`w-full py-2 text-white font-bold rounded-lg ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-black hover:bg-gray-800 transition duration-300"
          }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <button
          onClick={handleResendOtp}
          className="w-full py-2 mt-4 text-black font-bold rounded-lg border border-black hover:bg-gray-100 transition duration-300"
        >
          Resend OTP
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          Didn’t receive the OTP? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
