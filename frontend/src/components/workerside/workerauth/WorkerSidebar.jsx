import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPerson } from "react-icons/md";
import { FaTools } from "react-icons/fa";
import { RiCalendarCheckLine } from "react-icons/ri";

const WorkerSidebar = () => {
  const location = useLocation();

  // Active link style
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg z-50">
      {/* Sidebar Header */}
      <div className="py-6 px-4 text-center border-b border-gray-700">
        <h2 className="text-2xl font-extrabold text-indigo-400">FixNgo Worker</h2>
        <p className="text-sm text-gray-400 mt-1">Your Services Dashboard</p>
      </div>

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
              isActive("/worker/slots")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <RiCalendarCheckLine className="text-lg" />
            <span>Manage Slots</span>
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
