import React, { useEffect, useState } from "react";
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
  const { serviceId } = location.state || {}; // Get serviceId from state

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
        console.error("Failed to load data.", error);
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
        serviceId, // Pass serviceId to checkout
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center pt-20 pb-16">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Available Slots</h2>
        <p className="text-lg text-gray-600 text-center mb-6">for {serviceName}</p>

        {slots.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl"
          >
            {slots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} />
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-700 mt-8">No slots available for this worker.</p>
        )}

        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProceedToCheckout}
            disabled={!selectedSlot}
            className={`px-6 py-2 text-lg rounded-lg shadow-md transition ${
              !selectedSlot
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-700"
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

const SlotCard = ({ slot, selectedSlot, setSelectedSlot }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    onClick={() => setSelectedSlot(slot)}
    className={`p-4 bg-white rounded-lg shadow-md cursor-pointer transition ${
      selectedSlot?.id === slot.id ? "border-2 border-indigo-500 bg-indigo-100" : "hover:bg-gray-100"
    }`}
  >
    <p className="text-sm text-gray-700">
      {format(new Date(slot.start_time), "yyyy-MM-dd hh:mm a", { timeZone: "Asia/Kolkata" })}
    </p>
    <p className="text-sm text-gray-700">
      {format(new Date(slot.end_time), "yyyy-MM-dd hh:mm a", { timeZone: "Asia/Kolkata" })}
    </p>
    <p className={`text-xs ${slot.is_available ? "text-green-500" : "text-red-500"}`}>
      {slot.is_available ? "Available" : "Booked"}
    </p>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default WorkerSlotPage;
