"use client";

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Toast from "../../../utils/Toast";
import Footer from "../Footer";
import { format } from "date-fns-tz";
import { motion } from "framer-motion";
import api from "../../../utils/axiosInterceptor";

const WorkerSlotPage = () => {
  const { workerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = location.state || {};

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceName, setServiceName] = useState("");

  useEffect(() => {
    if (!serviceId) {
      Toast("error", "Invalid session. Service information missing.");
      navigate("/services");
      return;
    }

    const fetchSlotsAndService = async () => {
      const token = localStorage.getItem("userAccessToken");

      if (!token) {
        Toast("error", "You need to be logged in to view worker's slots.");
        navigate("/login");
        return;
      }

      try {
        const [slotsResponse, serviceResponse] = await Promise.all([
          api.get(`/api/worker/${workerId}/slots/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/api/services/${serviceId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSlots(slotsResponse.data.slots);
        setServiceName(serviceResponse.data.name);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load data:", error.response?.data || error.message);
        }
        Toast("error", "Failed to load worker slots. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlotsAndService();
  }, [workerId, serviceId, navigate]);

  const handleProceedToCheckout = () => {
    if (!selectedSlot) {
      Toast("error", "Please select a slot.");
      return;
    }

    navigate("/checkout", {
      state: {
        workerId,
        slot: selectedSlot,
        serviceId,
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <br />
      <div className="container mx-auto px-4 pt-16 py-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4"
        >
          Available Slots
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-gray-600 text-center mb-10"
        >
          for {serviceName}
        </motion.p>

        {slots.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {slots.map((slot, index) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                index={index}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
              />
            ))}
          </motion.div>
        ) : (
          <NoSlotsAvailable navigate={navigate} serviceName={serviceName} />
        )}

        <div className="mt-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProceedToCheckout}
            disabled={!selectedSlot}
            className={`px-6 py-2 rounded-lg font-medium text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              !selectedSlot ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Proceed to Checkout
          </motion.button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const SlotCard = ({ slot, index, selectedSlot, setSelectedSlot }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    onClick={() => slot.is_available && setSelectedSlot(slot)}
    className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition ${
      selectedSlot?.id === slot.id
        ? "border-2 border-black bg-gray-100"
        : slot.is_available
        ? "hover:bg-gray-100"
        : "opacity-50 cursor-not-allowed"
    }`}
    aria-label={`Select slot starting at ${format(new Date(slot.start_time), "yyyy-MM-dd hh:mm a", {
      timeZone: "Asia/Kolkata",
    })}`}
  >
    <p className="text-sm font-medium text-gray-900">
      {format(new Date(slot.start_time), "yyyy-MM-dd hh:mm a", { timeZone: "Asia/Kolkata" })}
    </p>
    <p className="text-sm text-gray-600">
      {format(new Date(slot.end_time), "yyyy-MM-dd hh:mm a", { timeZone: "Asia/Kolkata" })}
    </p>
    <p className={`text-xs font-semibold ${slot.is_available ? "text-green-500" : "text-red-500"}`}>
      {slot.is_available ? "Available" : "Booked"}
    </p>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full mb-3"
    />
    <p className="text-base font-medium text-gray-600">Loading slots...</p>
  </div>
);

const NoSlotsAvailable = ({ serviceName, navigate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md mx-auto mt-10"
  >
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Slots Available</h3>
    <p className="text-base text-gray-600 mb-4">
      No available slots for the service: <span className="font-semibold text-gray-900">{serviceName}</span>
    </p>
    <p className="text-sm text-gray-600 mb-6">Please check back later or try a different worker.</p>
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

export default WorkerSlotPage;