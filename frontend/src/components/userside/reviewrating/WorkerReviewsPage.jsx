"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa"; // Added for star ratings
import Navbar from "../Navbar";
import Footer from "../Footer";
import Toast from "../../../utils/Toast";
import { motion } from "framer-motion";
import api from "../../../utils/axiosInterceptor";

const WorkerReviewsPage = () => {
  const { workerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("userAccessToken");

      if (!token) {
        Toast("error", "You need to be logged in to view reviews.");
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/api/workers/${workerId}/reviews/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to load reviews.", error);
        Toast("error", "Failed to load reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [workerId, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100"> {/* Aligned with other pages */}
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10"> {/* Aligned padding */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" // Aligned typography
        >
          Reviews for Worker
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto" // Aligned container width
        >
          {reviews.length > 0 ? (
            <div className="space-y-4"> {/* Aligned spacing */}
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md" // Aligned card style
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.user_name || "Anonymous"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center" // Aligned empty state
            >
              <p className="text-sm text-gray-600">No reviews for this worker yet.</p> {/* Aligned typography */}
            </motion.div>
          )}
        </motion.div>

        {/* Back Button */}
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2" // Aligned button style
            aria-label="Go back"
          >
            Go Back
          </motion.button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col justify-center items-center h-screen bg-gray-100" // Aligned with other pages
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-3 border-gray-200 border-t-gray-800 rounded-full mb-3" // Aligned with other pages
    />
    <p className="text-sm font-medium text-gray-600">Loading reviews...</p> {/* Aligned typography */}
  </motion.div>
);

export default WorkerReviewsPage;