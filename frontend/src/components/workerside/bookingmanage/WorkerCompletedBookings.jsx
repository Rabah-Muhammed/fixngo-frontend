import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WorkerLayout from "../../workerside/workerauth/WorkerLayout";
import workerApi from "../../../utils/axiosWorkerInterceptor";



const WorkerCompletedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Adding error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedBookings = async () => {
      const token = localStorage.getItem("workerAccessToken");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const response = await workerApi.get(`/api/worker/completed-bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
      } catch (error) {
        setError("Error fetching completed bookings.");
        console.error("Error fetching completed bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBookings();
  }, []);

  return (
    <WorkerLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Completed Bookings</h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center space-x-3">
            <div className="w-8 h-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
            <span className="text-blue-600 font-semibold">Loading...</span>
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-lg">No completed bookings found. Please check back later.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
                onClick={() => navigate(`/worker/bookingdetail/${booking.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-800">Booking #{booking.id}</h3>
                  <p className="text-gray-600 mt-2"><strong>Service:</strong> {booking.service_name}</p>
                  <p className="text-gray-600 mt-1"><strong>User:</strong> {booking.user_name || "N/A"}</p>
                  <p className="text-gray-600 mt-1"><strong>Total Price:</strong> ${booking.total_price}</p>
                  <p className="text-gray-600 mt-1"><strong>Completed On:</strong> {new Date(booking.completed_at).toLocaleDateString()}</p>
                  <p className={`text-lg font-semibold mt-4 ${booking.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {booking.status === 'completed' ? "Completed" : "In Progress"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerCompletedBookings;
