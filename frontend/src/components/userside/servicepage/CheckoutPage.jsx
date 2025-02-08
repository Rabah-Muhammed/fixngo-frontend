"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js"; // No need for PayPalScriptProvider here
import { format } from "date-fns";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Toast from "../../../utils/Toast";

const BASE_URL = "http://localhost:8000";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { workerId, slot, serviceId } = location.state || {};

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId || !slot || !serviceId) {
      Toast("error", "Invalid checkout session. Please try again.");
      navigate("/");
      return;
    }

    const fetchService = async () => {
      const token = localStorage.getItem("userAccessToken");
      if (!token) {
        Toast("error", "You need to be logged in to proceed.");
        navigate("/login");
        return;
      }

      try {
        const serviceRes = await axios.get(`${BASE_URL}/api/services/${serviceId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setService(serviceRes.data);
      } catch (error) {
        console.error("Error fetching service details:", error);
        Toast("error", "Failed to load service details.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [workerId, slot, serviceId, navigate]);

  const handlePaymentSuccess = async (details) => {
    const token = localStorage.getItem("userAccessToken");
    if (!token) {
      Toast("error", "You need to be logged in to book a service.");
      navigate("/login");
      return;
    }

    const bookingData = {
      worker: workerId,
      slot: slot.id,
      service: serviceId,
      transaction_id: details.id,
    };

    try {
      await axios.post(`${BASE_URL}/api/bookings/`, bookingData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      Toast("success", "Booking confirmed!");
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (error) {
      console.error("Booking failed", error.response?.data || error.message);
      Toast("error", "Failed to book slot. Try again.");
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

  const serviceFee = Number(service?.price) || 0;
  const serviceImage = service?.image ? `${BASE_URL}${service.image}` : "/default-service.png";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8">Confirm Your Booking</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Service Image on the Left */}
            <div className="flex justify-center">
              <img
                src={serviceImage || "/placeholder.svg"}
                alt="Service"
                className="w-full max-w-md h-72 object-cover rounded-lg shadow-md"
              />
            </div>

            {/* Service Details on the Right */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{service?.name || "Unknown Service"}</h2>
              <p className="text-2xl font-bold text-gray-800 mb-4">
                ${serviceFee.toFixed(2)}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(slot.start_time), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>
                    {format(new Date(slot.start_time), "hh:mm a")} - {format(new Date(slot.end_time), "hh:mm a")}
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              {/* Payment Options */}
              <h3 className="text-lg font-medium mb-2">Payment Options</h3>
              <PayPalButtons
                style={{ layout: "vertical", color: "blue" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{ amount: { value: serviceFee.toFixed(2) } }],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then((details) => handlePaymentSuccess(details));
                }}
                onError={(err) => {
                  console.error("Payment error:", err);
                  Toast("error", "Payment failed. Try again.");
                }}
              />
              <button
                className="w-full mt-4 py-2 border rounded-md text-center text-gray-700 hover:bg-gray-200"
                onClick={() => navigate(-1)}
              >
                Cancel and Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
