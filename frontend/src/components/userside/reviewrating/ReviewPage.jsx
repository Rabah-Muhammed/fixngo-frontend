import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Toast from "../../../utils/Toast";
import Navbar from "../Navbar";
import Footer from "../Footer";

const BASE_URL = "http://localhost:8000";

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
        const response = await axios.get(`${BASE_URL}/api/reviews/booking/${bookingId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setExistingReview(response.data);
          setRating(response.data.rating);
          setReviewText(response.data.review || ""); // ✅ Load existing review text properly
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
        review: reviewText, // ✅ Use "review" instead of "review_text"
      };

      if (existingReview) {
        response = await axios.put(`${BASE_URL}/api/reviews/${existingReview.id}/`, reviewData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        Toast("success", "Review updated successfully!");
      } else {
        response = await axios.post(`${BASE_URL}/api/reviews/`, reviewData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        Toast("success", "Review submitted successfully!");
      }

      navigate("/bookings");
    } catch (error) {
      console.error("Failed to submit review", error.response?.data || error.message);
      Toast("error", error.response?.data?.error || "Failed to submit review.");
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
              <label className="block text-gray-700 font-semibold mb-2">Rating (1-5):</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              >
                <option value={0}>Select a rating</option>
                <option value={1}>⭐ (1)</option>
                <option value={2}>⭐⭐ (2)</option>
                <option value={3}>⭐⭐⭐ (3)</option>
                <option value={4}>⭐⭐⭐⭐ (4)</option>
                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              </select>

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
                className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 w-full"
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
