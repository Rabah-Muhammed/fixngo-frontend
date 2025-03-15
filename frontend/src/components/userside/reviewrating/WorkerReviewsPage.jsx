import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
    <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center text-indigo-600 mb-4"
        >
          Reviews for Worker
        </motion.h2>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-800">{review.user_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`h-5 w-5 ${index < review.rating ? "text-yellow-500" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">{review.review || "No comment provided."}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No reviews for this worker yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default WorkerReviewsPage;
