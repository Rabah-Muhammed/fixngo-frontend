"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../../../utils/Toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

const BASE_URL = "http://localhost:8000";

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
        const response = await axios.get(`${BASE_URL}/api/user/bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch reviews for each booking
        const bookingsWithReviews = await Promise.all(
          response.data.map(async (booking) => {
            try {
              const reviewResponse = await axios.get(
                `${BASE_URL}/api/reviews/booking/${booking.id}/`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { ...booking, review: reviewResponse.data };
            } catch {
              return { ...booking, review: null };
            }
          })
        );

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

      const response = await axios.patch(
        `${BASE_URL}/api/bookings/cancel/${bookingId}/`,
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

  return (
    <div className="bg-gradient-to-t from-indigo-50 to-indigo-100">
      <Navbar />
      <div className="min-h-screen flex justify-center items-center py-16">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">Your Bookings</h2>

          {bookings.length === 0 ? (
            <p className="text-center text-gray-500">No bookings found.</p>
          ) : (
            <ul className="space-y-6">
              {bookings.map((booking) => {
                const startTime = new Date(booking.start_time).toLocaleString();
                const endTime = new Date(booking.end_time).toLocaleString();
                const statusLower = booking.status.toLowerCase();

                return (
                  <li
                    key={booking.id}
                    className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {booking.service_name} with {booking.worker_name}
                      </h3>
                      <span
                        className={`px-4 py-2 text-sm font-semibold rounded-full ${
                          statusLower === "confirmed"
                            ? "bg-green-100 text-green-500"
                            : statusLower === "cancelled"
                            ? "bg-red-100 text-red-500"
                            : statusLower === "workdone"
                            ? "bg-blue-100 text-blue-500"
                            : statusLower === "completed"
                            ? "bg-gray-200 text-gray-500"
                            : "bg-yellow-100 text-yellow-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 text-gray-600">
                      <p>
                        <strong>Slot:</strong> {startTime} - {endTime}
                      </p>
                    </div>

                    {/* ✅ Hide Cancel button for workdone, completed, or cancelled bookings */}
                    {!["completed", "cancelled", "workdone"].includes(statusLower) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelBooking(booking.id);
                        }}
                        className="mt-4 w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* ✅ Pay Remaining Balance Button */}
                    {statusLower === "workdone" && parseFloat(booking.remaining_balance) > 0 && (
                      <button
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
                        className="mt-4 w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition-colors"
                      >
                        Pay Remaining Balance (${booking.remaining_balance})
                      </button>
                    )}

                    {/* ✅ Write or Edit Review Button */}
                    {statusLower === "completed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/review/${booking.id}`);
                        }}
                        className={`mt-4 w-full sm:w-auto ${
                          booking.review
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white px-6 py-3 rounded-md shadow-md transition-colors`}
                      >
                        {booking.review ? "Edit Review" : "Write a Review"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserBookingsPage;
