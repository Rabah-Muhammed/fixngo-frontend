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
  const { workerId, slot, serviceId } = location.state || {};

  const [service, setService] = useState(null);
  const [worker, setWorker] = useState(null);
  const [platformFee, setPlatformFee] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId || !slot || !serviceId) {
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
        const [serviceRes, workerRes, platformFeeRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/services/${serviceId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/workers/${workerId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/platform-fee/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setService(serviceRes.data);
        setWorker(workerRes.data);
        setPlatformFee(platformFeeRes.data.platform_fee);
      } catch (error) {
        Toast("error", "Failed to load details.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
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

      Toast("success", "Booking confirmed! You will need to pay the remaining balance to the worker later.");
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (error) {
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
  const totalPrice = serviceFee + platformFee;
  const remainingBalance = serviceFee;
  const serviceImage = service?.image ? `${BASE_URL}${service.image}` : "/default-service.png";
  const workerName = worker?.username || "Unknown Worker";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Confirm Your Booking</h1>

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
                  <span className="font-semibold">{format(new Date(slot.start_time), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Time:</span>
                  <span className="font-semibold">
                    {format(new Date(slot.start_time), "hh:mm a")} - {format(new Date(slot.end_time), "hh:mm a")}
                  </span>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

              <h3 className="text-xl font-semibold text-gray-800">Payment Breakdown</h3>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between"><span>Service Price:</span><span>${serviceFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Platform Fee (Paid Now):</span><span>${platformFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-gray-900"><span>Total Price:</span><span>${totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-red-600"><span>Remaining Balance (Pay Later):</span><span>${remainingBalance.toFixed(2)}</span></div>
              </div>

              <hr className="my-4 border-gray-300" />

              <h3 className="text-xl font-semibold text-gray-800 mb-2">Pay Now (Platform Fee Only)</h3>
              <PayPalButtons 
                style={{ layout: "vertical", color: "blue" }} 
                createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: platformFee.toFixed(2) } }] })} 
                onApprove={(data, actions) => actions.order.capture().then((details) => handlePaymentSuccess(details))} 
                onError={() => Toast("error", "Payment failed. Try again.")}
              />

              <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-200 transition duration-200" onClick={() => navigate(-1)}>Cancel and Go Back</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;