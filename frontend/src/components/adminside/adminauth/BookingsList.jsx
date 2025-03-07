import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import Swal from "sweetalert2";

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("adminAccessToken");

    if (!accessToken) {
      setError("Access token is missing or expired.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8000/api/admin/bookings/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setBookings(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("adminAccessToken");
          window.location.href = "/admin/login";
        } else {
          setError("Failed to fetch bookings. Please try again.");
        }
        setLoading(false);
      });
  }, []);

  const handleCancel = (bookingId) => {
    const accessToken = localStorage.getItem("adminAccessToken");

    if (!accessToken) {
      Swal.fire("Error", "Access token is missing. Please log in again.", "error");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You are about to cancel this booking.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `http://localhost:8000/api/admin/bookings/cancel/${bookingId}/`,
            null,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
          .then(() => {
            Swal.fire("Cancelled", "The booking has been cancelled.", "success");
            setBookings((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
            );
          })
          .catch(() => {
            Swal.fire("Error", "Failed to cancel booking. Please try again.", "error");
          });
      }
    });
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bookings List</h1>

      {loading ? (
        <p className="text-center text-xl">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-xl">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-xl">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="w-full table-auto text-sm text-left text-gray-600">
            <thead className="text-xs text--700 uppercase bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Worker</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-700">
              {bookings.map((booking) => (
                <tr key={booking.id} className="bg-gray-50 border-b hover:bg-gray-100">
                  <td className="px-6 py-4">{booking.user.username}</td>
                  <td className="px-6 py-4">{booking.service.name}</td>
                  <td className="px-6 py-4">
                    {booking.worker ? booking.worker.user.username : "Unassigned"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs ${
                        booking.status === "cancelled"
                          ? "bg-red-500"
                          : booking.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(booking.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {booking.status === "cancelled" ? (
                      <span className="text-red-500">Cancelled</span>
                    ) : booking.status === "pending" ? (
                      <button
                        className="px-4 py-2 rounded-full bg-red-700 text-white hover:bg-opacity-80"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-gray-500">Not cancellable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default BookingsList;
