"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactStars from "react-stars";
import Toast from "../../../utils/Toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { motion } from "framer-motion"; // Added for animations
import api from "../../../utils/axiosInterceptor";

const ReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    if (!token) {
      Toast("error", "You need to log in to write a review.");
      navigate("/login");
      return;
    }

    const fetchReview = async () => {
      try {
        const response = await api.get(`/api/reviews/booking/${bookingId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setExistingReview(response.data);
          setRating(response.data.rating);
          setReviewText(response.data.review || "");
        }
      } catch (error) {
        console.log("No existing review found.");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [bookingId, navigate]);

  const submitReview = async () => {
    if (rating === 0) {
      Toast("error", "Please select a rating before submitting.");
      return;
    }

    const token = localStorage.getItem("userAccessToken");
    if (!token) {
      Toast("error", "You need to log in to submit a review.");
      navigate("/login");
      return;
    }

    try {
      let response;
      const reviewData = {
        booking_id: bookingId,
        rating,
        review: reviewText,
      };

      if (existingReview) {
        response = await api.put(`/api/reviews/${existingReview.id}/`, reviewData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        Toast("success", "Review updated successfully!");
      } else {
        response = await api.post(`/api/reviews/`, reviewData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        Toast("success", "Review submitted successfully!");
      }

      navigate("/bookings");
    } catch (error) {
      console.error("Failed to submit review", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || "Failed to submit review.";
      Toast("error", errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100"> {/* Aligned with other pages */}
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10"> {/* Aligned padding */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8"
        >
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8" // Aligned card style
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Your Rating:</label> {/* Aligned typography */}
                <div className="flex justify-center mb-4">
                  <ReactStars
                    count={5}
                    value={rating}
                    onChange={(newRating) => setRating(newRating)}
                    size={32} // Slightly smaller for balance
                    color2={"#ffd700"}
                    half={false}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Your Review:</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800" // Aligned input style
                  rows={5}
                  placeholder="Write your experience here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitReview}
                  disabled={loading}
                  className={`w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`} // Aligned button style
                  aria-label={existingReview ? "Update review" : "Submit review"}
                >
                  {existingReview ? "Update Review" : "Submit Review"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/bookings")}
                  className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2" // Added back button
                  aria-label="Back to bookings"
                >
                  Back to Bookings
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
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
    className="flex flex-col justify-center items-center h-64" // Aligned with other pages
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-3 border-gray-200 border-t-gray-800 rounded-full mb-3" // Aligned with other pages
    />
    <p className="text-sm font-medium text-gray-600">Loading review details...</p> // Aligned typography
  </motion.div>
);

export default ReviewPage;