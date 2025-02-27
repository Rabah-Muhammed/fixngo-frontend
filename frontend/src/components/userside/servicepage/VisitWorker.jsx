"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:8000"; // Update with backend URL

const VisitWorker = () => {
    const { workerId } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);

    useEffect(() => {
        const fetchWorkerProfile = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/worker/${workerId}/`);
                setWorker(response.data);
            } catch (error) {
                console.error("Failed to load worker profile", error);
            }
        };

        fetchWorkerProfile();
    }, [workerId]);

    const handleStartChat = async () => {
        try {
            const token = localStorage.getItem("userAccessToken");
            const response = await axios.post(
                `${BASE_URL}/chat/start-chat/`,
                { worker_id: workerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(`/chat/${response.data.chat_id}`);
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    if (!worker) return <NoWorkerFound />;

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
                    {/* Worker Profile Section */}
                    <div className="flex flex-col items-center">
                        <img
                            src={worker.profile_picture ? `${BASE_URL}${worker.profile_picture}` : "/default-avatar.png"}
                            alt={worker.username}
                            className="w-28 h-28 rounded-full object-cover border-4 border-transparent shadow-lg"
                        />
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">{worker.username}</h2>
                    </div>

                    {/* Worker Details */}
                    <div className="mt-6 space-y-4 text-left">
                        <DetailRow label="Email" value={worker.user_email} />
                        <DetailRow label="Phone" value={worker.phone_number || "Not Provided"} />
                        <DetailRow label="Gender" value={worker.gender ? worker.gender.charAt(0).toUpperCase() + worker.gender.slice(1) : "Not Specified"} />
                        <DetailRow label="Completed Jobs" value={worker.completed_jobs} />
                        <DetailRow label="Availability" value={worker.availability_status ? "✅ Available" : "❌ Not Available"} />
                        <DetailRow label="Service Area" value={worker.service_area || "Not Specified"} />
                    </div>

                    {/* Video Call & Message Buttons */}
                    <div className="mt-6 flex justify-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/user/video-call`)}
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

// Reusable DetailRow Component
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

// No Worker Found Component
const NoWorkerFound = () => (
    <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-3xl font-bold text-gray-800">Worker Not Found</h2>
        <p className="text-lg text-gray-600">The worker profile you're looking for does not exist.</p>
    </div>
);

export default VisitWorker;
