"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { format } from "date-fns";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Toast from "../../../utils/Toast";

const BASE_URL = "http://localhost:8000";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { workerId, slot, serviceId, bookingId } = location.state || {};

  const [service, setService] = useState(null);
  const [worker, setWorker] = useState(null);
  const [platformFee, setPlatformFee] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const isRemainingPayment = Boolean(bookingId); // Check if it's a remaining payment

  useEffect(() => {
    console.log("Checkout Page State:", location.state); // Debugging log

    if (!workerId || !serviceId || !slot) {
      Toast("error", "Invalid checkout session. Please try again.");
      navigate("/");
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
        const [serviceRes, workerRes, platformFeeRes, bookingRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/services/${serviceId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/workers/${workerId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/platform-fee/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          isRemainingPayment
            ? axios.get(`${BASE_URL}/api/bookings/${bookingId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : null,
        ]);

        const serviceData = serviceRes.data;
        setService(serviceData);
        setWorker(workerRes.data);
        setPlatformFee(Number(platformFeeRes.data.platform_fee));

        if (isRemainingPayment && bookingRes) {
          // ✅ Fetch the actual remaining balance from the backend
          const bookingData = bookingRes.data;
          setRemainingBalance(bookingData.remaining_balance);
        } else {
          // ✅ Calculate slot duration and the remaining balance if it's an initial payment
          const startTime = new Date(slot.start_time);
          const endTime = new Date(slot.end_time);
          const durationInHours = (endTime - startTime) / (1000 * 60 * 60); // Convert ms to hours
          const remainingAmount = Number(serviceData.hourly_rate) * durationInHours;
          setRemainingBalance(remainingAmount.toFixed(2)); // Format to 2 decimal places
        }
      } catch (error) {
        Toast("error", "Failed to load details.");
        navigate("/");
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
      if (isRemainingPayment) {
        // Pay remaining balance
        await axios.patch(`${BASE_URL}/api/bookings/${bookingId}/pay-remaining/`, {}, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        Toast("success", "Remaining balance paid successfully! Booking is now completed.");
      } else {
        // Initial platform fee payment
        const bookingData = {
          worker: workerId,
          slot: slot.id,
          service: serviceId,
          transaction_id: details.id,
        };

        await axios.post(`${BASE_URL}/api/bookings/`, bookingData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        Toast("success", "Booking confirmed! You will need to pay the remaining balance to the worker later.");
      }

      setTimeout(() => navigate("/bookings"), 1500);
    } catch (error) {
      Toast("error", "Payment failed. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  const serviceImage = service?.image ? `${BASE_URL}${service.image}` : "/default-service.png";
  const workerName = worker?.username || "Unknown Worker";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            {isRemainingPayment ? "Pay Remaining Balance" : "Confirm Your Booking"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <img src={serviceImage} alt="Service" className="w-full max-w-md h-72 object-cover rounded-xl shadow-md transition-transform duration-300 transform hover:scale-105" />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800">{service?.name || "Service Name"}</h2>
              <p className="text-lg text-gray-700 mt-2"><span className="font-semibold">Worker:</span> {workerName}</p>
              <p className="text-lg text-gray-700"><span className="font-semibold">Service Area:</span> {worker?.service_area || "Not Available"}</p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="font-semibold">{slot ? format(new Date(slot.start_time), "MMM dd, yyyy") : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Time:</span>
                  <span className="font-semibold">
                    {slot ? `${format(new Date(slot.start_time), "hh:mm a")} - ${format(new Date(slot.end_time), "hh:mm a")}` : "N/A"}
                  </span>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

              <h3 className="text-xl font-semibold text-gray-800">Payment Breakdown</h3>
              <div className="space-y-2 mt-2">
                {!isRemainingPayment && <div className="flex justify-between"><span>Platform Fee (Paid Now):</span><span>${platformFee.toFixed(2)}</span></div>}
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Remaining Balance:</span>
                  <span>${remainingBalance}</span>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

              <PayPalButtons 
                style={{ layout: "vertical", color: "blue" }} 
                createOrder={(data, actions) => actions.order.create({ 
                  purchase_units: [{ amount: { value: isRemainingPayment ? remainingBalance : platformFee.toFixed(2) } }]
                })} 
                onApprove={(data, actions) => actions.order.capture().then((details) => handlePaymentSuccess(details))} 
                onError={() => Toast("error", "Payment failed. Try again.")}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
