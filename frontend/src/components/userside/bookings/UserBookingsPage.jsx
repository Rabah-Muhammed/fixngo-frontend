"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Toast from "../../../utils/Toast";
import api from "../../../utils/axiosInterceptor";
import { motion } from "framer-motion"; // Added for animations to match CheckoutPage

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("userAccessToken");
      if (!token) {
        Toast("error", "You need to log in to view your bookings.");
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/api/user/bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch reviews for each booking
        const bookingsWithReviews = await Promise.all(
          response.data.map(async (booking) => {
            try {
              const reviewResponse = await api.get(
                `/api/reviews/booking/${booking.id}/`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { ...booking, review: reviewResponse.data };
            } catch {
              return { ...booking, review: null };
            }
          })
        );

        // Sort bookings in descending order based on created_at
        bookingsWithReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setBookings(bookingsWithReviews);
      } catch (error) {
        console.error("Failed to fetch bookings.", error);
        Toast("error", "Failed to fetch bookings.");
      }
    };

    fetchBookings();
  }, [navigate]);

  const cancelBooking = async (bookingId) => {
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

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
        )
      );
    } catch (error) {
      console.error("Failed to cancel booking", error.response?.data || error.message);
      Toast("error", error.response?.data?.error || "Failed to cancel booking.");
    }
  };

  // Helper function to format date/time in 12-hour format
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100"> {/* Updated to match CheckoutPage */}
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10"> {/* Aligned with CheckoutPage */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8"
        >
          Your Bookings
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8" // Aligned with CheckoutPage
        >
          {bookings.length === 0 ? (
            <p className="text-center text-gray-600 text-sm">No bookings found.</p> // Aligned typography
          ) : (
            <ul className="space-y-6">
              {bookings.map((booking) => {
                const startTime = formatDateTime(booking.start_time);
                const endTime = formatDateTime(booking.end_time);
                const createdTime = formatDateTime(booking.created_at);
                const statusLower = booking.status.toLowerCase();

                return (
                  <motion.li
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow" // Updated to match CheckoutPage card style
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                        {booking.service_name} with {booking.worker_name}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full mt-2 sm:mt-0 ${
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
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Slot:</span> {startTime} - {endTime}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span> {createdTime}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                      {!["completed", "cancelled", "workdone", "started"].includes(statusLower) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelBooking(booking.id);
                          }}
                          className="w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2" // Aligned with CheckoutPage
                        >
                          Cancel Booking
                        </motion.button>
                      )}

                      {statusLower === "workdone" && parseFloat(booking.remaining_balance) > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/checkout", {
                              state: {
                                bookingId: booking.id,
                                remainingBalance: booking.remaining_balance,
                                workerId: booking.worker_id,
                                serviceId: booking.service_id,
                                slot: {
                                  start_time: booking.start_time,
                                  end_time: booking.end_time,
                                },
                              },
                            });
                          }}
                          className="w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2" // Aligned with CheckoutPage
                        >
                          Pay Remaining Balance (${booking.remaining_balance})
                        </motion.button>
                      )}

                      {statusLower === "completed" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/review/${booking.id}`);
                          }}
                          className="w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2" // Aligned with CheckoutPage
                        >
                          {booking.review ? "Edit Review" : "Write a Review"}
                        </motion.button>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default UserBookingsPage;