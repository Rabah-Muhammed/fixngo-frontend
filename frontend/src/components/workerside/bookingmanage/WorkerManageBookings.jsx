import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerLayout from "../workerauth/WorkerLayout";
import Toast from "../../../utils/Toast";
import { FaClipboardList, FaCheckCircle } from "react-icons/fa";
import workerApi from "../../../utils/axiosWorkerInterceptor";


const WorkerManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [hoursWorked, setHoursWorked] = useState({});
  const [error, setError] = useState({});
  const token = localStorage.getItem("workerAccessToken");

  useEffect(() => {
    workerApi
      .get("/api/worker/manage-bookings/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error fetching bookings:", error));
  }, [token]);

  const handleHoursChange = (booking, hours) => {
    if (hours < 0) {
      setError((prev) => ({ ...prev, [booking.id]: "Hours worked cannot be negative." }));
      return;
    }
    if (hours > 8) {
      setError((prev) => ({ ...prev, [booking.id]: "Maximum allowed hours is 8." }));
      return;
    }

    setError((prev) => ({ ...prev, [booking.id]: null }));
    setHoursWorked((prev) => ({ ...prev, [booking.id]: hours }));
  };

  const calculateTotalCharge = (booking) => {
    const hours = hoursWorked[booking.id] || 0;
    const price = booking.price || 0;
    return (hours * price).toFixed(2);
  };

  const calculateUpdatedEndTime = (booking) => {
    const startTime = new Date(booking.start_time);
    const hours = hoursWorked[booking.id] || (booking.slot_duration || 0);
    if (isNaN(startTime.getTime())) {
      return "Invalid Start Time";
    }
    const newEndTime = new Date(startTime.getTime() + hours * 3600000);
    return newEndTime.toLocaleString();
  };

  const markAsCompleted = (bookingId) => {
    const hours = hoursWorked[bookingId];
    if (!hours || hours <= 0) {
      Toast("error", "Please enter valid hours worked.");
      return;
    }

    workerApi
      .patch(
        `/api/worker/bookings/${bookingId}/complete/`,
        { hours_worked: hours },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log("Completed Booking Response:", response.data);
        Toast("success", "Booking marked as completed!");
        setBookings((prevBookings) =>
          prevBookings
            .map((booking) => (booking.id === bookingId ? response.data : booking))
            .filter((booking) => booking.id !== bookingId)
        );
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.error || "Failed to mark booking as completed.";
        Toast("error", errorMsg);
      });
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
            {bookings.map((booking) => {
              const startTime = new Date(booking.start_time);
              const endTime = new Date(booking.end_time);
              const isValidStartTime = !isNaN(startTime.getTime());
              const isValidEndTime = !isNaN(endTime.getTime());

              return (
                <div key={booking.id} className="bg-white p-5 rounded-lg shadow-md border">
                  <h2 className="text-lg font-semibold text-gray-800">Service: {booking.service_name}</h2>
                  <p className="text-gray-600"><strong>Customer:</strong> {booking.user_name}</p>
                  <p className="text-gray-600">
                    <strong>Start Time:</strong>{" "}
                    {isValidStartTime ? startTime.toLocaleString() : "Invalid Start Time"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Original End Time:</strong>{" "}
                    {isValidEndTime ? endTime.toLocaleString() : "Invalid End Time"}
                  </p>
                  <p className="text-blue-600 font-semibold mt-2">Status: {booking.status}</p>

                  {booking.status === "started" && (
                    <div className="mt-3">
                      <label className="block text-gray-700 font-semibold mb-1">Hours Worked:</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter hours worked"
                        min="0"
                        max="8"
                        value={hoursWorked[booking.id] || ""}
                        onChange={(e) => handleHoursChange(booking, parseFloat(e.target.value))}
                      />
                      {error[booking.id] && <p className="text-red-600 mt-2">{error[booking.id]}</p>}

                      <p className="mt-2 font-semibold">Total Charge: ${calculateTotalCharge(booking)}</p>
                      <p className="mt-2 text-gray-700">
                        <strong>Updated End Time:</strong> {calculateUpdatedEndTime(booking)}
                      </p>

                      <button
                        onClick={() => markAsCompleted(booking.id)}
                        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition duration-300"
                      >
                        <FaCheckCircle />
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerManageBookings;