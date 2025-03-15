import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import adminApi from "../../../utils/axiosAdminInterceptor";


const AdminBookingDetail = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      const token = localStorage.getItem("adminAccessToken");

      if (!token) {
        setError("Unauthorized. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await adminApi.get(`/api/admin/bookings/${bookingId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response:", response.data);

        setBooking(response.data);
      } catch (err) {
        setError("Error fetching booking details.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId]);

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-4xl font-bold mb-8 text-gray-900">Booking Details</h2>

        {loading ? (
          <div className="flex justify-center items-center text-xl text-gray-700">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 text-xl">{error}</div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-8 space-y-6">
            <div className="border-b pb-4">
              <p className="text-2xl font-semibold text-gray-800">Booking ID: <span className="font-normal text-indigo-600">{booking.id}</span></p>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <p className="text-lg text-gray-700"><strong>User:</strong> {booking.user_name}</p>
                <p className="text-lg text-gray-700"><strong>Worker:</strong> {booking.worker_name}</p>
                <p className="text-lg text-gray-700"><strong>Service:</strong> {booking.service_name}</p>
                <p className="text-lg text-gray-700"><strong>Status:</strong> 
                  <span className={`px-3 py-1 rounded-full text-white text-xs ${booking.status === "cancelled" ? "bg-red-500" : booking.status === "pending" ? "bg-yellow-500" : "bg-green-500"}`}>
                    {booking.status}
                  </span>
                </p>
                <p className="text-lg text-gray-700"><strong>Transaction ID:</strong> {booking.transaction_id}</p>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-700"><strong>Total Price:</strong> ${booking.total_price}</p>
                <p className="text-lg text-gray-700"><strong>Platform Fee:</strong> ${booking.platform_fee}</p>
                <p className="text-lg text-gray-700"><strong>Remaining Balance:</strong> ${booking.remaining_balance}</p>
                <p className="text-lg text-gray-700"><strong>Created At:</strong> {new Date(booking.created_at).toLocaleString()}</p>
                {booking.completed_at && (
                  <p className="text-lg text-gray-700"><strong>Completed At:</strong> {new Date(booking.completed_at).toLocaleString()}</p>
                )}
                <p className="text-lg text-gray-700"><strong>Start Time:</strong> {new Date(booking.start_time).toLocaleString()}</p>
                <p className="text-lg text-gray-700"><strong>End Time:</strong> {new Date(booking.end_time).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-300">
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingDetail;
