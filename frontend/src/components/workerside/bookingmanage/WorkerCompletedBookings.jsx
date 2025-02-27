import { useEffect, useState } from "react";
import axios from "axios";
import WorkerLayout from "../../workerside/workerauth/WorkerLayout";

const BASE_URL = "http://localhost:8000";

const WorkerCompletedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedBookings = async () => {
      const token = localStorage.getItem("workerAccessToken");
      if (!token) return;

      try {
        const response = await axios.get(`${BASE_URL}/api/worker/completed-bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching completed bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBookings();
  }, []);

  return (
    <WorkerLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed Bookings</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No completed bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-2 px-4 text-left">Booking ID</th>
                  <th className="py-2 px-4 text-left">Service</th>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Total Price</th>
                  <th className="py-2 px-4 text-left">Completed On</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-100">
                    <td className="py-2 px-4">{booking.id}</td>
                    <td className="py-2 px-4">{booking.service_name}</td>
                    <td className="py-2 px-4">{booking.user_name}</td>
                    <td className="py-2 px-4">${booking.total_price}</td>
                    <td className="py-2 px-4">{new Date(booking.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerCompletedBookings;
