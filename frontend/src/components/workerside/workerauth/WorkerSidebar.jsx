import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPerson } from "react-icons/md";
import { FaTools, FaClipboardList, FaClipboardCheck } from "react-icons/fa";
import { RiCalendarCheckLine } from "react-icons/ri";
import { FaStar } from "react-icons/fa"; // For the Reviews section

const WorkerSidebar = () => {
  const location = useLocation();

  // Active link style
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg z-50 overflow-y-auto">
      {/* Sidebar Links */}
      <ul className="py-6 px-4 space-y-3">
        <li>
          <Link
            to="/worker/dashboard"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/dashboard")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <MdDashboard className="text-lg" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/profile"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/profile")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <MdPerson className="text-lg" />
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/services"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/services")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <FaTools className="text-lg" />
            <span>Services</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/slot-management"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/slot-management")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <RiCalendarCheckLine className="text-lg" />
            <span>Manage Slots</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/bookings"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/bookings")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <FaClipboardList className="text-lg" />
            <span>Booking Requests</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/manage-bookings"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/manage-bookings")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <FaClipboardCheck className="text-lg" />
            <span>Manage Bookings</span>
          </Link>
        </li>

        {/* New Reviews Link */}
        <li>
          <Link
            to="/worker/reviews"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/reviews")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <FaStar className="text-lg" />
            <span>Reviews</span>
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        <p className="text-xs text-gray-500 text-center">
          © 2025 FixNgo. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default WorkerSidebar;
