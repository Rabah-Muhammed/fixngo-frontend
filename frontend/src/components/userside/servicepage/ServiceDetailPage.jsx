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
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
        console.log("Service Response:", response.data);
        setService(response.data);
      } catch (error) {
        console.error("Failed to load service details:", error.response?.data || error.message);
        Toast("error", "Failed to load service details. Please try interntry again.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!service) return <ServiceNotFound />;

  const serviceImageUrl = service.image
    ? (service.image.startsWith('http')
        ? service.image
        : `${api.defaults.baseURL}${service.image.startsWith('/') ? '' : '/'}${service.image}`)
    : "/default-service-image.jpg";

  console.log("Service Image URL:", serviceImageUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {!imageError ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              src={serviceImageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
              onError={() => {
                console.error("Failed to load image:", serviceImageUrl);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-base">Image not available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl mx-4 md:mx-6 text-left"
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                {service.name}
              </h1>
              <p className="text-base md:text-lg text-white/90 mb-4">{service.description}</p>
              <div className="flex items-center gap-4">
                <div className="bg-white/90 rounded-lg px-4 py-2">
                  <span className="text-lg font-bold text-gray-900">₹{service.hourly_rate}</span>
                  <span className="text-sm text-gray-600 ml-1">/hour</span>
                </div>
                <div className="flex items-center text-yellow-400 text-sm">
                  {'★'.repeat(4)}☆
                  <span className="text-white/90 ml-1 text-sm">4.8/5</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <nav className="flex gap-4">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'features', label: 'Features' },
                { id: 'reviews', label: 'Reviews' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-2 text-base font-medium ${
                    activeTab === tab.id ? 'text-black' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                    />
                  )}
                </button>
              ))}
            </nav>

          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Service</h2>
                <p className="text-base text-gray-700 leading-relaxed">{service.description}</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {[
                    { icon: "⚡", title: "Fast Service", desc: "Quick and efficient delivery" },
                    { icon: "🛡️", title: "Quality Assured", desc: "Professional standards maintained" },
                    { icon: "💬", title: "Support Available", desc: "Help when you need it" },
                    { icon: "🎯", title: "Skilled Workers", desc: "Experienced professionals" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg"
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'features' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                <div className="space-y-3">
                  {[
                    "Professional service delivery",
                    "High-quality materials",
                    "Experienced and vetted workers",
                    "Post-service cleanup",
                    "Customer-focused support",
                    "24/7 availability",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-base text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
                <ServiceReviews />
              </motion.div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-28 bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  ₹{service.hourly_rate}
                  <span className="text-sm text-gray-600">/hour</span>
                </div>
                <div className="flex items-center justify-center text-yellow-400 text-sm">
                  {'★'.repeat(4)}☆
                  <span className="text-gray-600 ml-1">4.8/5</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/services/${serviceId}/workers`)}
                className="w-full bg-black text-white py-2 rounded-lg font-medium text-base"
              >
                Book This Service
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Back Button */}
      <div className="container mx-auto px-4 pb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/services")}
          className="flex items-center text-base text-gray-600 hover:text-gray-900 font-medium"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </motion.button>
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
    <p className="text-base font-medium text-gray-600">Loading service details...</p>
  </div>
);

const ServiceNotFound = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-md"
    >
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Service Not Found</h2>
      <p className="text-base text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.history.back()}
        className="bg-black text-white px-4 py-2 rounded-lg font-medium text-base"
      >
        Go Back
      </motion.button>
    </motion.div>
  </div>
);

export default ServiceDetailPage;