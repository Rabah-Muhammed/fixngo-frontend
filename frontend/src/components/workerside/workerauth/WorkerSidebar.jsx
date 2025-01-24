import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdWork, MdPerson } from "react-icons/md"; // Worker-related icons
import { FaPlusCircle } from "react-icons/fa"; // Add a plus icon for service creation

const WorkerSidebar = () => {
  const location = useLocation();

  // Add styles for active links
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 bottom-0 bg-gray-800 w-64 shadow-xl text-white">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center text-indigo-400 mb-8">
          Worker Panel
        </h2>
        <ul className="space-y-4">
          <li>
            <Link
              to="/worker/dashboard"
              className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                isActive("/worker/dashboard")
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
              to="/worker/profile"
              className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                isActive("/worker/profile")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <MdPerson className="text-2xl" />
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/worker/service/create"
              className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                isActive("/worker/service/create")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
            >
              <FaPlusCircle className="text-2xl" />
              Services
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WorkerSidebar;
