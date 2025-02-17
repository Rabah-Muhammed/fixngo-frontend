import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import Toast from "../../../utils/Toast";

const BASE_URL = "http://localhost:8000";

const ServiceReviews = () => {
  const { serviceId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/services/${serviceId}/reviews/`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        Toast("error", "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId]);

  if (loading) return <p className="text-center text-gray-500">Loading reviews...</p>;

  return (
    <div className="mt-12 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet for this service.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <p className="text-gray-700 font-semibold">
                {review.user_name || review.user_email} {/* Show name or email */}
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} className={`h-5 w-5 ${index < review.rating ? "text-yellow-500" : "text-gray-300"}`} />
                ))}
              </div>
              <p className="text-gray-600 mt-2">{review.review || "No comment provided."}</p>
              <p className="text-gray-400 text-sm">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceReviews;
