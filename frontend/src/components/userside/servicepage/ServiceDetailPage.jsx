"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Toast from "../../../utils/Toast";
import Footer from "../Footer";
import { motion } from "framer-motion";
import ServiceReviews from "../reviewrating/ServiceReviews";
import api from "../../../utils/axiosInterceptor";

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      const token = localStorage.getItem("userAccessToken");

      if (!token) {
        Toast("error", "You need to be logged in to view service details.");
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/api/services/${serviceId}/`);
        console.log("Service Response:", response.data); // Debug log
        setService(response.data);
      } catch (error) {
        console.error("Failed to load service details:", error.response?.data || error.message);
        Toast("error", "Failed to load service details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!service) return <ServiceNotFound />;

  // Dynamically construct the service image URL
  const serviceImageUrl = service.image
    ? (service.image.startsWith('http')
        ? service.image // Absolute URL (S3 in production)
        : `${api.defaults.baseURL}${service.image}`) // Relative path (local dev)
    : null;



  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {serviceImageUrl && (
            <div className="relative h-80 overflow-hidden">
              <img
                src={serviceImageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <h2 className="absolute bottom-6 left-6 text-4xl font-bold text-white">{service.name}</h2>
            </div>
          )}

          <div className="p-8">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">{service.description}</p>
            <div className="flex items-center justify-between mb-8">
              <p className="text-2xl font-bold text-indigo-700">
                Hourly Charge: <span className="text-3xl text-indigo-600">${service.hourly_rate}</span>/hr
              </p>
              <div className="text-gray-500">
                <span>Available Workers</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/services")}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-200 transition duration-300"
              >
                Back to Services
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/services/${serviceId}/workers`)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-indigo-700 transition duration-300"
              >
                View Workers
              </motion.button>
            </div>

            {/* Display Service Reviews Below Service Details */}
            <ServiceReviews />
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ServiceNotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <p className="text-2xl text-gray-700 font-semibold">Service not found.</p>
  </div>
);

export default ServiceDetailPage;