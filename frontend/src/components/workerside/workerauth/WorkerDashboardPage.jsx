import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WorkerLayout from "./WorkerLayout";
import { FaUser, FaEnvelope, FaWallet, FaBriefcase, FaStar } from "react-icons/fa";

const WorkerDashboardPage = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("workerAccessToken");

    if (!token) {
      navigate("/worker/login");
      return;
    }

    axios
      .get("http://localhost:8000/api/worker/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setWorkerData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching worker data:", error);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <WorkerLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-16 max-w-5xl mx-auto">
        {/* Wallet Balance */}
        <div className="p-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 shadow-lg rounded-xl">
          <div className="flex items-center space-x-3">
            <FaWallet className="text-white text-3xl" />
            <h2 className="text-lg font-semibold text-white">Wallet Balance</h2>
          </div>
          <p className="text-2xl font-bold text-white mt-3">${workerData.wallet_balance}</p>
        </div>

        {/* Total Completed Jobs */}
        <div className="p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 shadow-lg rounded-xl">
          <div className="flex items-center space-x-3">
            <FaBriefcase className="text-white text-3xl" />
            <h2 className="text-lg font-semibold text-white">Completed Jobs</h2>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{workerData.total_completed_jobs}</p>
        </div>

        {/* Average Rating */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-400 shadow-lg rounded-xl">
          <div className="flex items-center space-x-3">
            <FaStar className="text-white text-3xl" />
            <h2 className="text-lg font-semibold text-white">Average Rating</h2>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{workerData.avg_rating} / 5</p>
        </div>
      </div>

      {/* Recent Completed Bookings */}
      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Completed Bookings</h2>
        <ul className="mt-3">
          {workerData.recent_bookings.map((booking, index) => (
            <li key={index} className="bg-white p-4 shadow-md rounded-lg mt-2">
              {booking.service_name} - ${booking.remaining_balance}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Reviews */}
      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Reviews</h2>
        <ul className="mt-3">
          {workerData.recent_reviews.map((review, index) => (
            <li key={index} className="bg-white p-4 shadow-md rounded-lg mt-2">
              "{review.review}" - ⭐ {review.rating} / 5
            </li>
          ))}
        </ul>
      </div>
    </WorkerLayout>
  );
};

export default WorkerDashboardPage;
