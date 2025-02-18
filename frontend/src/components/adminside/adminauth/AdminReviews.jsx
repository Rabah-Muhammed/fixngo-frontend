import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout"; // Import your AdminLayout component

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/admin/reviews/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminAccessToken")}`,
          },
        });
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleReadMore = (review) => {
    alert(review); // You can implement the "read more" functionality here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="loader"></div> {/* You can style the spinner here */}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Reviews</h1>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-indigo-100">
              <tr className="text-left">
                <th className="px-6 py-4 font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Worker</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Rating</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Review</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Service</th> {/* Added Service column */}
                <th className="px-6 py-4 font-semibold text-gray-700">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-gray-50">
              {reviews.map((review) => (
                <tr key={review.id} className="border-b hover:bg-indigo-50">
                  <td className="px-6 py-4">{review.user}</td>
                  <td className="px-6 py-4">{review.worker}</td>
                  <td className="px-6 py-4">{review.rating}</td>
                  <td className="px-6 py-4">
                    {review.review.length > 50 ? (
                      <>
                        <p>{review.review.substring(0, 50)}...</p>
                        <button
                          onClick={() => handleReadMore(review.review)}
                          className="text-indigo-600 mt-2 text-sm hover:underline"
                        >
                          Read More
                        </button>
                      </>
                    ) : (
                      review.review
                    )}
                  </td>
                  <td className="px-6 py-4">{review.service_name}</td> {/* Display Service Name */}
                  <td className="px-6 py-4">{new Date(review.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
