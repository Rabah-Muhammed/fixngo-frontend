import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { motion } from "framer-motion";
import Toast from "../../../utils/Toast";
import { loginn } from "../../../features/userSlice";
import api from "../../../utils/axiosInterceptor";

const VisitWorker = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.user);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        if (!accessToken) {
          setError("Please log in to view worker profiles.");
          navigate("/login");
          return;
        }
        const response = await api.get(`/api/worker/${workerId}/`);
        console.log("Worker Profile Response:", response.data); // Debug log
        setWorker(response.data);
      } catch (error) {
        setError("Failed to load worker profile: " + (error.response?.data?.detail || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, [workerId, navigate, accessToken]);

  const handleStartChat = async () => {
    try {
      if (!accessToken) {
        Toast("error", "Please log in to start a chat.");
        navigate("/login");
        return;
      }

      console.log("Attempting to start chat with Worker ID:", workerId); // Debug log
      const response = await api.post(
        `/api/chat/start-chat/`,
        { worker_id: workerId }
      );

      console.log("Chat started successfully:", response.data); // Debug log
      if (response.data.user_email) {
        dispatch(
          loginn({
            user: { email: response.data.user_email },
            accessToken: accessToken,
            refreshToken: null,
          })
        );
      }
      // Pass workerId to ChatPage via state
      navigate(`/chat/${response.data.chat_id}`, { state: { workerId } });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error("Failed to start chat:", errorMsg);
      Toast("error", `Failed to start chat: ${errorMsg}`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !worker) return <NoWorkerFound error={error} />;

  // Dynamically construct the profile picture URL
  const profilePictureUrl = worker.profile_picture
    ? (worker.profile_picture.startsWith('http')
        ? worker.profile_picture // Absolute URL (S3 in production)
        : `${api.defaults.baseURL}${worker.profile_picture}`) // Relative path (local dev)
    : "/default-avatar.png";



  return (
    <div className="bg-gradient-to-br from-indigo-100 via-white to-indigo-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl rounded-3xl p-8 max-w-2xl w-full text-center"
        >
          <div className="flex flex-col items-center">
            <img
              src={profilePictureUrl}
              alt={worker.username}
              className="w-28 h-28 rounded-full object-cover border-4 border-transparent shadow-lg"
              onError={(e) => {
                console.error("Profile picture failed to load:", profilePictureUrl);
                e.target.src = "/default-avatar.png"; // Fallback to default image
              }}
            />
            <h2 className="text-3xl font-extrabold text-gray-900 mt-4">{worker.username}</h2>
          </div>

          <div className="mt-6 space-y-4 text-left">
            <DetailRow label="Email" value={worker.user_email} />
            <DetailRow label="Phone" value={worker.phone_number || "Not Provided"} />
            <DetailRow
              label="Gender"
              value={
                worker.gender
                  ? worker.gender.charAt(0).toUpperCase() + worker.gender.slice(1)
                  : "Not Specified"
              }
            />
            <DetailRow label="Completed Jobs" value={worker.completed_jobs} />
            <DetailRow
              label="Availability"
              value={worker.availability_status ? "✅ Available" : "❌ Not Available"}
            />
            <DetailRow label="Service Area" value={worker.service_area || "Not Specified"} />
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/user/video-call")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-blue-600 transition duration-300"
            >
              Start Video Call
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChat}
              className="px-6 py-3 bg-green-500 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-green-600 transition duration-300"
            >
              Message
            </motion.button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2"
  >
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-800 font-semibold">{value}</span>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  </div>
);

const NoWorkerFound = ({ error }) => (
  <div className="flex flex-col justify-center items-center h-screen">
    <h2 className="text-3xl font-bold text-gray-800">Worker Not Found</h2>
    <p className="text-lg text-gray-600">{error || "The worker profile you're looking for does not exist."}</p>
  </div>
);

export default VisitWorker;