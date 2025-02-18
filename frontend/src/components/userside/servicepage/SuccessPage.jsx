"use client";

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paymentType = searchParams.get("paymentType");

  useEffect(() => {
    // Confetti effect
    const confetti = () => {
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
      for (let i = 0; i < 100; i++) {
        createConfettiParticle(colors[Math.floor(Math.random() * colors.length)]);
      }
    };

    const createConfettiParticle = (color) => {
      const particle = document.createElement("div");
      particle.style.width = "10px";
      particle.style.height = "10px";
      particle.style.backgroundColor = color;
      particle.style.position = "fixed";
      particle.style.top = "-10px";
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.borderRadius = "50%";
      particle.style.zIndex = "1000";
      document.body.appendChild(particle);

      const animation = particle.animate(
        [
          { transform: "translate3d(0, 0, 0)", opacity: 1 },
          { transform: `translate3d(${Math.random() * 100 - 50}px, 100vh, 0)`, opacity: 0 },
        ],
        {
          duration: Math.random() * 1000 + 1000,
          easing: "cubic-bezier(0, .9, .57, 1)",
          delay: Math.random() * 1000,
        }
      );

      animation.onfinish = () => particle.remove();
    };

    confetti();
  }, []);

  const handleRedirectToBookings = () => {
    navigate("/bookings");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-extrabold text-gray-800 mb-6"
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-600 mb-8"
        >
          {paymentType === "Platform Fee"
            ? "You have successfully paid the platform fee. Your booking is now confirmed. Please pay the remaining balance directly to the worker later."
            : paymentType === "Remaining Balance"
            ? "You have successfully paid the remaining balance. Your booking is now completed! Thank you for choosing our service."
            : "Your payment was successful. Thank you for using our service."}
        </motion.p>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
          <button
            onClick={handleRedirectToBookings}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            Go to My Bookings
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
