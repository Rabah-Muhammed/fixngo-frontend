import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPerson, MdVideoCall, MdAccountBalanceWallet } from "react-icons/md";
import { FaTools, FaClipboardList, FaClipboardCheck, FaStar, FaComments } from "react-icons/fa";
import { RiCalendarCheckLine } from "react-icons/ri";

const WorkerSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg z-50 overflow-y-auto">
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
        <li>
          <Link
            to="/worker/completed-bookings"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/completed-bookings")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <FaClipboardCheck className="text-lg" />
            <span>Completed Bookings</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/wallet"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/wallet")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <MdAccountBalanceWallet className="text-lg" />
            <span>Wallet</span>
          </Link>
        </li>
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
        <li>
          <Link
            to="/worker/chat"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/chat")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <FaComments className="text-lg" />
            <span>Messages</span>
          </Link>
        </li>
        <li>
          <Link
            to="/worker/video-call"
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              isActive("/worker/video-call")
                ? "bg-indigo-600 shadow-md"
                : "hover:bg-indigo-500 hover:shadow-lg"
            }`}
          >
            <MdVideoCall className="text-lg" />
            <span>Connect</span>
          </Link>
        </li>
      </ul>

    </div>
  );
};

export default WorkerSidebar;