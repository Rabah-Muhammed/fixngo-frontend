"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../../../utils/Toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { motion } from "framer-motion";
import api from "../../../utils/axiosInterceptor";

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const token = localStorage.getItem("userAccessToken");
      if (!token) {
        Toast("error", "You need to log in to view booking details.");
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/api/bookings/${bookingId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(response.data);
      } catch (error) {
        console.error("Failed to fetch booking details", error);
        Toast("error", "Failed to fetch booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate]);

  // PDF Download function with enhanced styling
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Booking Confirmation", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Booking ID: ${booking.id}`, 14, 30);

    doc.autoTable({
      head: [["Field", "Details"]],
      body: [
        ["Service", booking.service_name],
        ["Worker", booking.worker_name],
        [
          "Slot",
          `${new Date(booking.start_time).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            month: "short",
            day: "numeric",
            year: "numeric",
          })} - ${new Date(booking.end_time).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
        ],
        ["Status", booking.status],
        ["Payment Status", booking.payment_status],
        ["Total Price", `₹${totalPrice.toFixed(2)}`], // Changed $ to ₹
        ["Platform Fee Paid", `₹${platformFee.toFixed(2)}`], // Changed $ to ₹
        ["Remaining Balance", `₹${remainingBalance.toFixed(2)}`], // Changed $ to ₹
        ["Transaction ID", booking.transaction_id || "N/A"],
        [
          "Created At",
          new Date(booking.created_at).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        ],
      ],
      startY: 40,
      theme: "grid",
      margin: { top: 40, left: 10, right: 10 },
      headStyles: { fillColor: [31, 41, 55] }, // Matches bg-gray-800
      styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save(`booking-${booking.id}-confirmation.pdf`);
  };

  // Cancel booking function
  const cancelBooking = async () => {
    try {
      const token = localStorage.getItem("userAccessToken");
      const response = await api.patch(
        `/api/bookings/cancel/${bookingId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Toast("success", response.data.message);
      setBooking({ ...booking, status: "cancelled" });
    } catch (error) {
      console.error("Failed to cancel booking", error.response?.data || error.message);
      Toast("error", error.response?.data?.error || "Failed to cancel booking.");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center h-screen bg-gray-100"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-gray-200 border-t-gray-800 rounded-full mb-3"
        />
        <p className="text-sm font-medium text-gray-600">Loading booking details...</p>
      </motion.div>
    );
  }

  if (!booking) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md mx-auto mt-16"
      >
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Booking Not Found</h3>
        <p className="text-sm text-gray-600 mb-4">Unable to load booking details. Please try again.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/bookings")}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
          aria-label="Back to bookings"
        >
          Back to Bookings
        </motion.button>
      </motion.div>
    );
  }

  const platformFee = parseFloat(booking.platform_fee) || 0;
  const remainingBalance = parseFloat(booking.remaining_balance) || 0;
  const totalPrice = platformFee + remainingBalance;
  const statusLower = booking.status.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <a href="/bookings" className="hover:text-gray-900">Bookings</a>
          <span>&gt;</span>
          <span className="text-gray-900">Booking #{booking.id}</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
        >
          Booking #{booking.id}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Overview</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Service:</span> {booking.service_name}</p>
                <p><span className="font-medium">Worker:</span> {booking.worker_name}</p>
                <p>
                  <span className="font-medium">Slot:</span>{" "}
                  {new Date(booking.start_time).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} -{" "}
                  {new Date(booking.end_time).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      statusLower === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : statusLower === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : statusLower === "workdone"
                        ? "bg-blue-100 text-blue-600"
                        : statusLower === "completed"
                        ? "bg-gray-100 text-gray-600"
                        : statusLower === "started"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(booking.created_at).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Payment Status:</span> {booking.payment_status}</p>
                <p><span className="font-medium">Total Price:</span> ₹{totalPrice.toFixed(2)}</p> {/* Changed $ to ₹ */}
                <p><span className="font-medium">Platform Fee Paid:</span> ₹{platformFee.toFixed(2)}</p> {/* Changed $ to ₹ */}
                <p><span className="font-medium">Remaining Balance:</span> ₹{remainingBalance.toFixed(2)}</p> {/* Changed $ to ₹ */}
                <p><span className="font-medium">Transaction ID:</span> {booking.transaction_id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p><span className="font-medium">Service:</span> {booking.service_name}</p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(booking.start_time).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  {new Date(booking.start_time).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })} -{" "}
                  {new Date(booking.end_time).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                <p className="text-base font-semibold text-gray-900">
                  <span className="font-medium">Total:</span> ₹{totalPrice.toFixed(2)} {/* Changed $ to ₹ */}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadPDF}
                  className="w-full px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                  aria-label="Download booking details as PDF"
                >
                  Download PDF
                </motion.button>

                {statusLower === "workdone" && remainingBalance > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      navigate("/checkout", {
                        state: {
                          bookingId: booking.id,
                          remainingBalance,
                          workerId: booking.worker_id,
                          serviceId: booking.service_id,
                          slot: {
                            start_time: booking.start_time,
                            end_time: booking.end_time,
                          },
                        },
                      })
                    }
                    className="w-full px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                    aria-label="Pay remaining balance"
                  >
                    Pay Remaining Balance (₹{remainingBalance.toFixed(2)}) {/* Changed $ to ₹ */}
                  </motion.button>
                )}

                {!["completed", "cancelled", "workdone", "started"].includes(statusLower) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelBooking}
                    className="w-full px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                    aria-label="Cancel booking"
                  >
                    Cancel Booking
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/bookings")}
                  className="w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                  aria-label="Back to bookings"
                >
                  Back to Bookings
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingDetailPage;