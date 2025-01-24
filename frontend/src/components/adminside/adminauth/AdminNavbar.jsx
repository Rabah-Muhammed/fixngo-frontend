// src/components/adminside/navbar/AdminNavbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the tokens from localStorage
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");

    // Redirect to login page
    navigate("/admin/login");
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-black text-2xl font-bold">Admin Panel</span>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
