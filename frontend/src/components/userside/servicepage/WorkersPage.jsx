"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Toast from "../../../utils/Toast";
import Footer from "../Footer";
import { motion } from "framer-motion";
import api from "../../../utils/axiosInterceptor";

const WorkersPage = () => {
  const { serviceId } = useParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceName, setServiceName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkersAndService = async () => {
      const token = localStorage.getItem("userAccessToken");

      if (!token) {
        Toast("error", "You need to be logged in to view workers.");
        navigate("/login");
        return;
      }

      try {
        const [workersResponse, serviceResponse] = await Promise.all([
          api.get(`/api/services/${serviceId}/workers/`),
          api.get(`/api/services/${serviceId}/`),
        ]);

        setWorkers(workersResponse.data.workers);
        setServiceName(serviceResponse.data.name);
      } catch (error) {
        console.error("Failed to load data:", error.response?.data || error.message);
        Toast("error", "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkersAndService();
  }, [serviceId, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <br />
      <div className="container mx-auto px-4 pt-16 py-10">
        {workers.length > 0 ? (
          <>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4"
            >
              Select a Worker
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-gray-600 text-center mb-10"
            >
              for {serviceName}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {workers.map((worker, index) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  index={index}
                  navigate={navigate}
                  serviceId={serviceId}
                />
              ))}
            </motion.div>
          </>
        ) : (
          <NoWorkersFound serviceName={serviceName} navigate={navigate} />
        )}
      </div>
      <Footer />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full mb-3"
    />
    <p className="text-base font-medium text-gray-600">Loading workers...</p>
  </div>
);

const NoWorkersFound = ({ serviceName, navigate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md mx-auto mt-10"
  >
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Workers Available</h3>
    <p className="text-base text-gray-600 mb-4">
      We couldn't find any workers for the service:{" "}
      <span className="font-semibold text-gray-900">{serviceName}</span>
    </p>
    <p className="text-sm text-gray-600 mb-6">Please check back later or try a different service.</p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/services")}
      className="px-4 py-2 bg-black text-white rounded-lg font-medium text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
    >
      Back to Services
    </motion.button>
  </motion.div>
);

const WorkerCard = ({ worker, index, navigate, serviceId }) => {
  const profilePictureUrl = worker.profile_picture
    ? (worker.profile_picture.startsWith('http')
        ? worker.profile_picture
        : `${api.defaults.baseURL}${worker.profile_picture.startsWith('/') ? '' : '/'}${worker.profile_picture}`)
    : "/default-avatar.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-shadow duration-300"
    >
      <img
        src={profilePictureUrl}
        alt={`Profile picture of ${worker.username}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mb-3"
        onError={(e) => (e.target.src = "/default-avatar.png")}
      />
      <h3 className="text-base font-semibold text-gray-900 mb-2">{worker.username}</h3>
      <div className="flex items-center space-x-2 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-gray-600">{worker.service_area || "Not specified"}</p>
      </div>
      <div className="flex items-center text-yellow-400 text-sm mb-3">
        {'★'.repeat(4)}☆
        <span className="text-gray-600 ml-1 text-sm">4.8/5</span>
      </div>
      <div className="space-y-2 w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/worker/${worker.id}/visit`)}
          className="w-full bg-black text-white py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          View Profile
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/worker/${worker.id}/slots`, { state: { serviceId } })}
          className="w-full bg-black text-white py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          View Slots
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/worker/${worker.id}/reviews`)}
          className="w-full bg-black text-white py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          View Reviews
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WorkersPage;