import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReactStars from "react-stars";
import Toast from "../../../utils/Toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
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
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 pb-16">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              <label className="block text-gray-700 font-semibold mb-2">Your Rating:</label>
              <div className="flex justify-center mb-4">
                <ReactStars
                  count={5}
                  value={rating}
                  onChange={(newRating) => setRating(newRating)}
                  size={40}
                  color2={"#ffd700"} // Gold color for selected stars
                  half={false} // Disables half-stars
                />
              </div>

              <label className="block text-gray-700 font-semibold mb-2">Your Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                rows={4}
                placeholder="Write your experience here..."
              />

              <button
                onClick={submitReview}
                disabled={loading}
                className={`bg-green-500 text-white px-4 py-2 rounded-md shadow-md w-full ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {existingReview ? "Update Review" : "Submit Review"}
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewPage;
