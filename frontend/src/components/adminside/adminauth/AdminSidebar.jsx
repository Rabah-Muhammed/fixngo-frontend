import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdWork, MdBook } from "react-icons/md"; // Added MdBook icon for bookings

const AdminSidebar = () => {
  const location = useLocation();

  // Add styles for active links
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 bottom-0 bg-gray-800 w-64 shadow-xl text-white">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center text-indigo-400 mb-8">
          Admin Panel
        </h2>
        <ul className="space-y-4">
          <li>
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                isActive("/admin/dashboard")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdDashboard className="text-xl" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                isActive("/admin/users")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdPeople className="text-xl" />
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/workers"
              className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                isActive("/admin/workers")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdWork className="text-xl" />
              Workers
            </Link>
          </li>
          <li>
            <Link
              to="/admin/services/create"
              className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                isActive("/admin/services/create")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdWork className="text-xl" />
              Create Service
            </Link>
          </li>
          <li>
            <Link
              to="/admin/bookings"
              className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                isActive("/admin/bookings")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdBook className="text-xl" /> {/* Added icon for bookings */}
              Bookings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
