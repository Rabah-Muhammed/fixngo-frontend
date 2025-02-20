"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Toast from "../../../utils/Toast";
import Footer from "../Footer";
import { motion } from "framer-motion";

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
          axios.get(`http://localhost:8000/api/services/${serviceId}/workers/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8000/api/services/${serviceId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setWorkers(workersResponse.data.workers);
        setServiceName(serviceResponse.data.name);
      } catch (error) {
        console.error("Failed to load data.", error);
        Toast("error", "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkersAndService();
  }, [serviceId, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        {workers.length > 0 ? (
          <>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center text-indigo-600 mb-4"
            >
              Select a Worker
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl text-center text-gray-600 mb-16"
            >
              for {serviceName}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {workers.map((worker, index) => (
                <WorkerCard key={worker.id} worker={worker} index={index} navigate={navigate} serviceId={serviceId} />
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
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
  </div>
);

const NoWorkersFound = ({ serviceName, navigate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center p-12 bg-white rounded-lg shadow-xl max-w-2xl mx-auto mt-16"
  >
    <h3 className="text-3xl font-semibold text-gray-800 mb-4">No Workers Available</h3>
    <p className="text-xl text-gray-600 mb-4">
      We couldn't find any workers for the service: <span className="font-semibold text-indigo-600">{serviceName}</span>
    </p>
    <p className="text-lg text-gray-600 mb-8">Please check back later or try a different service.</p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/services")}
      className="px-6 py-3 bg-indigo-600 text-white rounded-full text-lg font-medium transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Go Back to Services
    </motion.button>
  </motion.div>
);

const WorkerCard = ({ worker, index, navigate, serviceId }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300 w-full max-w-xs"
  >
    <img
      src={worker.profile_picture ? `http://localhost:8000${worker.profile_picture}` : "/default-avatar.png"}
      alt={worker.username}
      className="w-20 h-20 rounded-full object-cover border-4 border-indigo-400 mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{worker.username}</h3>
    <div className="flex items-center space-x-2 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-gray-600">{worker.service_area || "Not specified"}</p>
    </div>
    <div className="space-y-2 w-full">
    <button
      onClick={() => navigate(`/worker/${worker.id}/visit`)}
      className="px-4 py-2 w-full rounded-full text-sm font-medium transition bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      View Profile
    </button>
      <button
        onClick={() => navigate(`/worker/${worker.id}/slots`, { state: { serviceId } })}
        className="px-4 py-2 w-full rounded-full text-sm font-medium transition bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        View Slots
      </button>
      {/* New button to view reviews */}
      <button
        onClick={() => navigate(`/worker/${worker.id}/reviews`)} // Navigate to reviews page for the worker
        className="px-4 py-2 w-full rounded-full text-sm font-medium transition bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        View Reviews
      </button>
    </div>
  </motion.div>
);

export default WorkersPage;
