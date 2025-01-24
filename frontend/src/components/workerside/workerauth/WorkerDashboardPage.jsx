import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import WorkerLayout from "./WorkerLayout";
import { FaUser, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'; // Add icons

const WorkerDashboard = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Initialize navigate

  useEffect(() => {
    const token = localStorage.getItem("workerAccessToken");

    if (!token) {
      // Redirect to login if no token is found
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
  }, [navigate]);  // Ensure navigate is included in dependency array

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <WorkerLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-16 max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="p-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaUser className="text-white text-3xl" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{workerData.username}</p>
        </div>

        {/* Email Card */}
        <div className="p-4 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-white text-3xl" />
            <h2 className="text-lg font-semibold text-white">Email</h2>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{workerData.email}</p>
        </div>

        {/* Phone Card */}
        <div className="p-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaPhoneAlt className="text-white text-3xl" />
            <h2 className="text-lg font-semibold text-white">Phone</h2>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{workerData.phone_number}</p>
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkerDashboard;
