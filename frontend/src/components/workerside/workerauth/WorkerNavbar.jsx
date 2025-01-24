import React from "react";
import { Link } from "react-router-dom";

const WorkerNavbar = () => {
  const handleLogout = () => {
    // Remove the worker tokens from local storage
    localStorage.removeItem("workerAccessToken");
    localStorage.removeItem("workerRefreshToken");
    window.location.href = "/worker/login"; // Redirect to the worker login page
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-8 h-8 mr-2"
            />
            <Link to="/" className="text-black text-2xl font-bold">
              FixNgo
            </Link>
          </div>

          <ul className="flex space-x-4 items-center">
            {/* Add logout button for worker */}
            <li>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
    </nav>
  );
};

export default WorkerNavbar;  // Default export
