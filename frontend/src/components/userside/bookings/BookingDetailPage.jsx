import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../../../utils/Toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import autoTable plugin

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

  // Ensure platform_fee and remaining_balance are treated as numbers
  const platformFee = parseFloat(booking.platform_fee) || 0;
  const remainingBalance = parseFloat(booking.remaining_balance) || 0;

  // Calculate total price as the sum of platform fee and remaining balance
  const totalPrice = platformFee + remainingBalance;

  // PDF Download function
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Title
    doc.text("Booking Details", 14, 20);
    doc.setFontSize(10);

    // Create Table Structure
    doc.autoTable({
      head: [["Field", "Details"]],
      body: [
        ["Booking ID", booking.id],
        ["Service", booking.service_name],
        ["Worker", booking.worker_name],
        [
          "Slot",
          `${new Date(booking.start_time).toLocaleString()} - ${new Date(
            booking.end_time
          ).toLocaleString()}`,
        ],
        ["Status", booking.status],
        ["Payment Status", booking.payment_status],
        ["Total Price", `$${totalPrice.toFixed(2)}`],
        ["Platform Fee Paid", `$${platformFee.toFixed(2)}`],
        ["Remaining Balance", `$${remainingBalance.toFixed(2)}`],
        ["Transaction ID", booking.transaction_id || "N/A"],
        ["Created At", new Date(booking.created_at).toLocaleString()],
      ],
      startY: 30, // Start the table after the title
      theme: "grid", // Optional: Use the 'grid' theme for better structure
      margin: { top: 30, left: 10, right: 10 }, // Add margin if needed
    });

    doc.save("booking-details.pdf");
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 pb-16">
        <div className="bg-white shadow-xl rounded-lg w-full max-w-4xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">
            Booking Details
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Booking Overview</h3>
              <div className="space-y-2 mt-4">
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Service:</strong> {booking.service_name}</p>
                <p><strong>Worker:</strong> {booking.worker_name}</p>
                <p><strong>Slot:</strong> {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}</p>
                <p><strong>Status:</strong>
                  <span className={booking.status === "completed" ? "text-green-500" : "text-yellow-500"}>
                    {booking.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Payment Information</h3>
              <div className="space-y-2 mt-4">
                <p><strong>Payment Status:</strong> {booking.payment_status}</p>
                <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
                <p><strong>Platform Fee Paid:</strong> ${platformFee.toFixed(2)}</p>
                <p><strong>Remaining Balance:</strong> ${remainingBalance.toFixed(2)}</p>
                <p><strong>Transaction ID:</strong> {booking.transaction_id || "N/A"}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Booking Created</h3>
              <div className="mt-4">
                <p><strong>Created At:</strong> {new Date(booking.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Back to Bookings
            </button>

            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingDetailPage;
