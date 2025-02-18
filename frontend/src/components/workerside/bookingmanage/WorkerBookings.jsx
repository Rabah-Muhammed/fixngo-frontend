import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerLayout from "../workerauth/WorkerLayout";
import Toast from "../../../utils/Toast";
import { FaClipboardList, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("workerAccessToken");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/worker/bookings/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  const handleBookingAction = (bookingId, action) => {
    axios
      .patch(
        `http://localhost:8000/api/worker/bookings/${bookingId}/`,
        { status: action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        Toast("success", "Booking updated successfully!");
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: response.data.status }
              : booking
          )
        );
      })
      .catch(() => Toast("error", "Failed to update booking."));
  };

  return (
    <WorkerLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 shadow-md">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
            <FaClipboardList className="text-xl" />
            Booking Requests
          </h1>
        </div>

        {/* Booking List */}
        {bookings.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">No pending bookings.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-lg shadow-md border"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  Service: {booking.service_name}
                </h2>
                <p className="text-gray-600">
                  <strong>Customer:</strong> {booking.user_name}
                </p>

                {/* Updated Time Slot Display */}
                <p className="text-gray-600">
                  <strong>Time Slot:</strong>{" "}
                  {booking.start_time && booking.end_time ? (
                    <span>
                      {booking.start_time} - {booking.end_time}
                    </span>
                  ) : (
                    <span className="text-red-500">Not Assigned</span>
                  )}
                </p>

                {/* Status */}
                <p
                  className={`font-semibold mt-2 ${
                    booking.status === "pending"
                      ? "text-yellow-600"
                      : booking.status === "processing"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  Status: {booking.status}
                </p>

                {/* Accept/Reject Buttons */}
                {booking.status === "pending" && (
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => handleBookingAction(booking.id, "processing")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition duration-300"
                    >
                      <FaCheckCircle />
                      Accept
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, "cancelled")}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition duration-300"
                    >
                      <FaTimesCircle />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerBookings;
