import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import WorkerLayout from "../../workerside/workerauth/WorkerLayout";
import workerApi from "../../../utils/axiosWorkerInterceptor";


const WorkerBookingDetail = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      const token = localStorage.getItem("workerAccessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      try {
        const response = await workerApi.get(`/worker/bookingdetail/${bookingId}/`, {
          headers: { Authorization: `Bearer ${token}` }, // Correct header format
        });
        setBooking(response.data);
      } catch (error) {
        setError("Failed to fetch booking details");
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId]);

  if (loading) {
    return (
      <WorkerLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="spinner-border animate-spin w-16 h-16 border-4 border-t-4 border-gray-600 rounded-full"></div>
        </div>
      </WorkerLayout>
    );
  }

  if (error) {
    return (
      <WorkerLayout>
        <div className="p-6 flex justify-center items-center">
          <p className="text-red-500 font-semibold text-xl">{error}</p>
        </div>
      </WorkerLayout>
    );
  }

  if (!booking) {
    return (
      <WorkerLayout>
        <div className="p-6 flex justify-center items-center">
          <p className="text-red-500 font-semibold text-xl">No booking found with this ID.</p>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Booking Details</h2>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-lg text-gray-700"><strong>Booking ID:</strong> {booking.id}</p>
              <p className="text-lg text-gray-700"><strong>Service:</strong> {booking.service_name}</p>
              <p className="text-lg text-gray-700"><strong>User:</strong> {booking.user_name}</p>
              <p className="text-lg text-gray-700"><strong>Worker:</strong> {booking.worker_name}</p>
              <p className="text-lg text-gray-700"><strong>Status:</strong> {booking.status}</p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-gray-700"><strong>Start Time:</strong> {new Date(booking.start_time).toLocaleString()}</p>
              <p className="text-lg text-gray-700"><strong>End Time:</strong> {new Date(booking.end_time).toLocaleString()}</p>
              <p className="text-lg text-gray-700"><strong>Total Price:</strong> ${booking.total_price}</p>
              <p className="text-lg text-gray-700"><strong>Platform Fee:</strong> ${booking.platform_fee}</p>
              <p className="text-lg text-gray-700"><strong>Remaining Balance:</strong> ${booking.remaining_balance}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-lg text-gray-700"><strong>Payment Status:</strong> {booking.payment_status}</p>
            <p className="text-lg text-gray-700"><strong>Completed On:</strong> {new Date(booking.completed_at).toLocaleDateString()}</p>
            <p className="text-lg text-gray-700"><strong>Created At:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
            <p className="text-lg text-gray-700"><strong>Transaction ID:</strong> {booking.transaction_id}</p>
            <p className="text-lg text-gray-700"><strong>Notes:</strong> {booking.notes || "No additional notes"}</p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkerBookingDetail;
