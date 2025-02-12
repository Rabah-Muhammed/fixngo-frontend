import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerLayout from "../workerauth/WorkerLayout";
import Toast from "../../../utils/Toast";
import { FaClipboardList, FaCheckCircle } from "react-icons/fa";

const WorkerManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("workerAccessToken");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/worker/manage-bookings/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  const markAsCompleted = (bookingId) => {
    axios
      .patch(`http://localhost:8000/api/worker/bookings/${bookingId}/complete/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        Toast("success", "Booking marked as completed!");
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
      })
      .catch((error) => Toast("error", "Failed to mark booking as completed."));
  };

  return (
    <WorkerLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-6">
        <div className="text-center bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-4 shadow-md">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
            <FaClipboardList className="text-xl" />
            Manage Bookings
          </h1>
        </div>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">No active bookings.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-5 rounded-lg shadow-md border">
                <h2 className="text-lg font-semibold text-gray-800">Service: {booking.service_name}</h2>
                <p className="text-gray-600"><strong>Customer:</strong> {booking.user_name}</p>
                <p className="text-gray-600"><strong>Time Slot:</strong> {booking.slot_time}</p>
                <p className="text-blue-600 font-semibold mt-2">Status: {booking.status}</p>

                <button
                  onClick={() => markAsCompleted(booking.id)}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition duration-300"
                >
                  <FaCheckCircle />
                  Mark as Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerManageBookings;
