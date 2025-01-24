import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdWork } from "react-icons/md"; // Icons from react-icons

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
              className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                isActive("/admin/dashboard")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdDashboard className="text-2xl" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                isActive("/admin/users")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdPeople className="text-2xl" />
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/workers"
              className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                isActive("/admin/workers")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdWork className="text-2xl" />
              Workers
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
