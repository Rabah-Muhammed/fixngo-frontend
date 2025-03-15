"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { format } from "date-fns";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Toast from "../../../utils/Toast";
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
  const isRemainingPayment = Boolean(bookingId);

  useEffect(() => {
    console.log("Checkout Page State:", location.state);
    console.log("Slot Data:", slot);

    if (!workerId || !serviceId || (!slot && !bookingId)) {
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
        let slotData = slot;
        if (bookingId && !slot) {
          const bookingRes = await api.get(`${api.defaults.baseURL}/api/bookings/${bookingId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          slotData = {
            id: bookingRes.data.slot,
            start_time: bookingRes.data.start_time,
            end_time: bookingRes.data.end_time,
          };
        }

        const [serviceRes, workerRes, platformFeeRes, bookingRes] = await Promise.all([
          api.get(`${api.defaults.baseURL}/api/services/${serviceId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`${api.defaults.baseURL}/api/workers/${workerId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`${api.defaults.baseURL}/api/platform-fee/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          isRemainingPayment
            ? api.get(`${api.defaults.baseURL}/api/bookings/${bookingId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : null,
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
        console.error("Fetch error:", error);
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
      let paymentType = "Platform Fee";

      if (isRemainingPayment) {
        await api.patch(
          `${api.defaults.baseURL}/api/bookings/${bookingId}/pay-remaining/`,
          {},
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        paymentType = "Remaining Balance";
        Toast("success", "Remaining balance paid successfully! Booking is now completed.");
      } else {
        const bookingData = {
          worker: workerId,
          slot: slot.id,
          service: serviceId,
          transaction_id: details.id,
        };

        await api.post(`${api.defaults.baseURL}/api/bookings/`, bookingData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        Toast("success", "Booking confirmed! You will need to pay the remaining balance to the worker later.");
      }

      setTimeout(() => navigate("/success", { state: { paymentType } }), 1000);
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

  const serviceImage = service?.image ? `${api.defaults.baseURL}${service.image}` : "/default-service.png";
  const workerName = worker?.username || "Unknown Worker";

  const startTime = slot?.start_time ? new Date(slot.start_time) : null;
  const endTime = slot?.end_time ? new Date(slot.end_time) : null;
  const formattedTime =
    startTime && endTime && !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())
      ? `${format(startTime, "hh:mm a")} - ${format(endTime, "hh:mm a")}`
      : "N/A";

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
              <img
                src={serviceImage}
                alt="Service"
                className="w-full max-w-md h-72 object-cover rounded-xl shadow-md transition-transform duration-300 transform hover:scale-105"
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800">{service?.name || "Service Name"}</h2>
              <p className="text-lg text-gray-700 mt-2">
                <span className="font-semibold">Worker:</span> {workerName}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Service Area:</span> {worker?.service_area || "Not Available"}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {slot?.start_time ? format(new Date(slot.start_time), "MMM dd, yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Time:</span>
                  <span className="font-semibold">{formattedTime}</span>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

              <h3 className="text-xl font-semibold text-gray-800">Payment Breakdown</h3>
              <div className="space-y-2 mt-2">
                {!isRemainingPayment && (
                  <div className="flex justify-between">
                    <span>Platform Fee (Paid Now):</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Remaining Balance:</span>
                  <span>${remainingBalance}</span>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;