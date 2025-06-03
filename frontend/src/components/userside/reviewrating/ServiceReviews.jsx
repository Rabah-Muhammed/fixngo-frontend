"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import Toast from "../../../utils/Toast";
import { motion } from "framer-motion"; // Added for animations
import api from "../../../utils/axiosInterceptor";

const ServiceReviews = () => {
  const { serviceId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/api/services/${serviceId}/reviews/`);
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center h-64" // Aligned with other pages
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-gray-200 border-t-gray-800 rounded-full mb-3" // Aligned with LoadingSpinner
        />
        <p className="text-sm font-medium text-gray-600">Loading reviews...</p> {/* Aligned typography */}
      </motion.div>
    );
  }

  return (
    <div className="py-6"> {/* Removed bg-white, adjusted padding */}


      {reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center" // Aligned empty state
        >
          <p className="text-sm text-gray-600">No reviews yet for this service.</p> {/* Aligned typography */}
        </motion.div>
      ) : (
        <div className="space-y-4"> {/* Adjusted spacing */}
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md" // Aligned card style
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-lg font-semibold text-gray-900">
                  {review.user_name || review.user_email}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {review.worker_name && (
                <p className="text-sm text-gray-600 mt-1 italic">
                  Review for worker: {review.worker_name}
                </p>
              )}

              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`h-4 w-4 ${
                      index < review.rating ? "text-yellow-500" : "text-gray-200"
                    }`} // Aligned star styling
                  />
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-2 italic">
                {review.review || "No comment provided."}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceReviews;