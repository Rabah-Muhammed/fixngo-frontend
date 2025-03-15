import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerLayout from "../workerauth/WorkerLayout";
import Toast from "../../../utils/Toast";
import { FaStar, FaClipboardList } from "react-icons/fa";
import workerApi from "../../../utils/axiosWorkerInterceptor";


const WorkerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("workerAccessToken");

  useEffect(() => {
    workerApi
      .get("/api/worker/reviews/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setReviews(response.data))
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setError("Failed to fetch reviews.");
      });
  }, [token]);

  return (
    <WorkerLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-6">
        <div className="text-center bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-4 shadow-md">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
            <FaClipboardList className="text-xl" />
            Worker Reviews
          </h1>
        </div>

        {error && <p className="text-red-600 text-center mt-6">{error}</p>}

        {reviews.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">No reviews yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-5 rounded-lg shadow-md border">
                <h2 className="text-lg font-semibold text-gray-800">Review by: {review.user_name}</h2>
                <p className="text-gray-600"><strong>Rating:</strong> {review.rating} <FaStar className="inline text-yellow-500" /></p>
                <p className="text-gray-600"><strong>Review:</strong> {review.review}</p>
                <p className="text-gray-500 text-sm"><strong>Created At:</strong> {review.created_at}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerReviews;
