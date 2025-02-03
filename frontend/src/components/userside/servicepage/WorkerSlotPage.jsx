import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Toast from "../../../utils/Toast";
import Footer from "../Footer";
import { format } from "date-fns-tz";  // Import date-fns-tz for time zone handling

const WorkerSlotPage = () => {
  const { workerId } = useParams(); // Get the workerId from the URL params
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      const token = localStorage.getItem("userAccessToken");

      if (!token) {
        Toast("error", "You need to be logged in to view worker's slots.");
        navigate("/login");
        return;
      }

      try {
        // Fetch available slots for the worker
        const slotsResponse = await axios.get(
          `http://localhost:8000/api/worker/${workerId}/slots/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSlots(slotsResponse.data.slots);
      } catch (error) {
        console.error("Failed to load worker slots.", error);
        Toast("error", "Failed to load worker slots. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [workerId, navigate]);

  const handleBooking = async () => {
    if (!selectedSlot) {
      Toast("error", "Please select a slot.");
      return;
    }

    const token = localStorage.getItem("userAccessToken");
    if (!token) {
      Toast("error", "You need to be logged in to book a service.");
      navigate("/login");
      return;
    }

    const serviceId = workerId; // Assuming serviceId is the same as workerId for now

    const bookingData = {
      worker: workerId,
      slot: selectedSlot,
      service: serviceId, // Ensure this field is included
    };

    try {
      // Send POST request to create a booking
      const response = await axios.post(
        "http://localhost:8000/api/bookings/", 
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Toast("success", "Booking confirmed!");
      setTimeout(() => navigate("/bookings"), 1500); // Navigate to bookings page after success
    } catch (error) {
      console.error("Booking failed", error.response?.data || error.message);
      Toast("error", "Failed to book slot. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-lg text-gray-700 py-10">
        <div className="w-12 h-12 border-4 border-t-4 border-indigo-500 rounded-full animate-spin"></div> Loading...
      </div>
    );
  }

  if (!slots.length) {
    return <p className="text-center text-gray-700">No slots available for this worker.</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center pt-20 pb-16">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">Available Slots</h2>

        {/* List of Available Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`p-4 bg-white rounded-lg shadow-md cursor-pointer transition ${
                selectedSlot === slot.id ? "border-2 border-indigo-500 bg-indigo-100" : "hover:bg-gray-100"
              }`}
            >
              <p className="text-sm text-gray-700">
                {/* Format start time and end time in AM/PM format */}
                {format(new Date(slot.start_time), "yyyy-MM-dd hh:mm a", { timeZone: "Asia/Kolkata" })}
              </p>
              <p className="text-sm text-gray-700">
                {format(new Date(slot.end_time), "yyyy-MM-dd hh:mm a", { timeZone: "Asia/Kolkata" })}
              </p>
              <p className={`text-xs ${slot.is_available ? 'text-green-500' : 'text-red-500'}`}>
                {slot.is_available ? "Available" : "Booked"}
              </p>
            </div>
          ))}
        </div>

        {/* Booking Confirmation Button */}
        <div className="mt-6">
          <button
            onClick={handleBooking}
            disabled={!selectedSlot || loading}
            className={`px-4 py-2 text-sm rounded-lg shadow-md ${!selectedSlot || loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 text-white hover:bg-indigo-700"}`}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkerSlotPage;
