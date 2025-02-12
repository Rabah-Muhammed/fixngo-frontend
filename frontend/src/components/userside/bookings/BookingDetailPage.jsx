import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../../../utils/Toast";
import Navbar from "../Navbar";
import Footer from "../Footer";

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
        const response = await axios.get(
          `http://localhost:8000/api/bookings/${bookingId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  if (loading) {
    return <div className="text-center mt-20">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="text-center mt-20 text-red-500">Booking not found.</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 pb-16">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            Booking Details
          </h2>

          <div className="space-y-4">
            <p><strong>Service:</strong> {booking.service_name}</p>
            <p><strong>Worker:</strong> {booking.worker_name}</p>
            <p><strong>Slot:</strong> {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}</p>
            <p><strong>Status:</strong> 
              <span className={booking.status === "completed" ? "text-green-500" : "text-yellow-500"}>
                {booking.status}
              </span>
            </p>
            <p><strong>Payment Status:</strong> {booking.payment_status}</p>
            <p><strong>Total Price:</strong> ${booking.total_price}</p>
            <p><strong>Platform Fee Paid:</strong> ${booking.platform_fee}</p>
            <p><strong>Remaining Balance:</strong> ${booking.remaining_balance}</p>
            <p><strong>Transaction ID:</strong> {booking.transaction_id || "N/A"}</p>
            <p><strong>Created At:</strong> {new Date(booking.created_at).toLocaleString()}</p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingDetailPage;
