"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { format } from "date-fns";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Toast from "../../../utils/Toast";
import { motion } from "framer-motion";
import api from "../../../utils/axiosInterceptor";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { workerId, slot, serviceId, bookingId } = location.state || {};

  const [service, setService] = useState(null);
  const [worker, setWorker] = useState(null);
  const [platformFee, setPlatformFee] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isRemainingPayment = Boolean(bookingId);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Checkout Page State:", location.state);
      console.log("Slot Data:", slot);
    }

    if (!workerId || !serviceId || (!slot && !bookingId)) {
      Toast("error", "Invalid checkout session. Please try again.");
      navigate("/services");
      return;
    }

    const fetchDetails = async () => {
      const token = localStorage.getItem("userAccessToken");
      if (!token) {
        Toast("error", "You need to be logged in to proceed.");
        navigate("/login");
        return;
      }

      try {
        let slotData = slot;
        if (bookingId && !slot) {
          const bookingRes = await api.get(`/api/bookings/${bookingId}/`);
          slotData = {
            id: bookingRes.data.slot,
            start_time: bookingRes.data.start_time,
            end_time: bookingRes.data.end_time,
          };
        }

        const [serviceRes, workerRes, platformFeeRes, bookingRes] = await Promise.all([
          api.get(`/api/services/${serviceId}/`),
          api.get(`/api/workers/${workerId}/`),
          api.get(`/api/platform-fee/`),
          isRemainingPayment ? api.get(`/api/bookings/${bookingId}/`) : null,
        ]);

        const serviceData = serviceRes.data;
        setService(serviceData);
        setWorker(workerRes.data);
        setPlatformFee(Number(platformFeeRes.data.platform_fee));

        if (isRemainingPayment && bookingRes) {
          const bookingData = bookingRes.data;
          setRemainingBalance(bookingData.remaining_balance);
        } else {
          const startTime = new Date(slotData.start_time);
          const endTime = new Date(slotData.end_time);

          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error("Invalid slot time values");
          }

          const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
          const remainingAmount = Number(serviceData.hourly_rate) * durationInHours;
          setRemainingBalance(remainingAmount.toFixed(2));
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Fetch error:", error.response?.data || error.message);
        }
        Toast("error", "Failed to load checkout details.");
        navigate("/services");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [workerId, slot, serviceId, bookingId, navigate, isRemainingPayment]);

  const handlePaymentSuccess = async (details) => {
    const token = localStorage.getItem("userAccessToken");
    if (!token) {
      Toast("error", "You need to be logged in to proceed.");
      navigate("/login");
      return;
    }

    try {
      let paymentType = "Platform Fee";

      if (isRemainingPayment) {
        await api.patch(`/api/bookings/${bookingId}/pay-remaining/`, {});
        paymentType = "Remaining Balance";
        Toast("success", "Remaining balance paid successfully! Booking is now completed.");
      } else {
        const bookingData = {
          worker: workerId,
          slot: slot.id,
          service: serviceId,
          transaction_id: details.id,
        };

        await api.post(`/api/bookings/`, bookingData);
        Toast("success", "Booking confirmed! You will need to pay the remaining balance to the worker later.");
      }

      setTimeout(() => navigate("/success", { state: { paymentType } }), 1000);
    } catch (error) {
      Toast("error", "Payment failed. Try again.");
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!service || !worker) return <NoDataAvailable navigate={navigate} />;

  const serviceImageUrl = service?.image
    ? (service.image.startsWith("http")
        ? service.image
        : `${api.defaults.baseURL}${service.image.startsWith("/") ? "" : "/"}${service.image}`)
    : "/default-service.png";

  const workerName = worker?.username || "Unknown Worker";
  const startTime = slot?.start_time ? new Date(slot.start_time) : null;
  const endTime = slot?.end_time ? new Date(slot.end_time) : null;
  const formattedTime =
    startTime && endTime && !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())
      ? `${format(startTime, "hh:mm a")} - ${format(endTime, "hh:mm a")}`
      : "N/A";

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Progress Indicator */}


        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8"
        >
          {isRemainingPayment ? "Pay Remaining Balance" : "Confirm Your Booking"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Image Section */}
            <div className="flex justify-center items-center">
              {!imageError ? (
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={serviceImageUrl}
                  alt={`Image of ${service.name}`}
                  className="w-full h-80 md:h-96 object-cover rounded-lg border border-gray-200" // Increased image size
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-80 md:h-96 bg-gray-200 flex items-center justify-center rounded-lg border border-gray-200">
                  <span className="text-gray-500 text-base">Image not available</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{service?.name || "Service Name"}</h2>
              
              {/* Service Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Details</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Worker:</span> {workerName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Service Area:</span> {worker?.service_area || "Not Available"}
                </p>
              </div>

              {/* Booking Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {slot?.start_time ? format(new Date(slot.start_time), "MMM dd, yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900">{formattedTime}</span>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Payment Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Breakdown</h3>
                {!isRemainingPayment && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Platform Fee (Paid Now):</span>
                    <span className="text-gray-900">₹{platformFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900">
                  <span>Remaining Balance:</span>
                  <span>₹{remainingBalance}</span>
                </div>
              </div>

              {/* PayPal Button */}
              <PayPalButtons
                style={{ layout: "vertical", color: "blue" }}
                createOrder={(data, actions) =>
                  actions.order.create({
                    purchase_units: [
                      { amount: { value: isRemainingPayment ? remainingBalance : platformFee.toFixed(2) } },
                    ],
                  })
                }
                onApprove={(data, actions) =>
                  actions.order.capture().then((details) => handlePaymentSuccess(details))
                }
                onError={() => Toast("error", "Payment failed. Try again.")}
              />
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/services")}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            aria-label="Return to services page"
          >
            Back to Services
          </motion.button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-3 border-gray-200 border-t-gray-800 rounded-full mb-3"
    />
    <p className="text-base font-medium text-gray-600">Loading checkout details...</p>
  </div>
);

const NoDataAvailable = ({ navigate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md mx-auto mt-16"
  >
    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Checkout Unavailable</h3>
    <p className="text-sm text-gray-600 mb-4">
      Unable to load checkout details. Please try again.
    </p>
    <p className="text-sm text-gray-600 mb-6">Select a service to start a new booking.</p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/services")}
      className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
      aria-label="Return to services page"
    >
      Back to Services
    </motion.button>
  </motion.div>
);

export default CheckoutPage;