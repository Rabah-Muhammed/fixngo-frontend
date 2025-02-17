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
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 pb-16">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">Your Bookings</h2>

          {bookings.length === 0 ? (
            <p className="text-center text-gray-500">No bookings found.</p>
          ) : (
            <ul className="space-y-4">
              {bookings.map((booking) => {
                const startTime = new Date(booking.start_time).toLocaleString();
                const endTime = new Date(booking.end_time).toLocaleString();
                const statusLower = booking.status.toLowerCase();

                return (
                  <li
                    key={booking.id}
                    className="bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition duration-200"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.service_name} with {booking.worker_name}
                    </h3>
                    <p className="text-gray-600">
                      <strong>Slot:</strong> {startTime} - {endTime}
                    </p>
                    <p className="text-gray-600">
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          statusLower === "confirmed"
                            ? "text-green-500"
                            : statusLower === "cancelled"
                            ? "text-red-500"
                            : statusLower === "workdone"
                            ? "text-blue-500"
                            : statusLower === "completed"
                            ? "text-gray-500"
                            : "text-yellow-500"
                        }
                      >
                        {booking.status}
                      </span>
                    </p>

                    {/* ✅ Hide Cancel button for workdone, completed, or cancelled bookings */}
                    {!["completed", "cancelled", "workdone"].includes(statusLower) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelBooking(booking.id);
                        }}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700"
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
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
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
                        className={`mt-4 ${
                          booking.review ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-700"
                        } text-white px-4 py-2 rounded-md shadow-md`}
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
