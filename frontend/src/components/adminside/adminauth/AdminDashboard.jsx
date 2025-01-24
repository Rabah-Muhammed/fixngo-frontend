import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("adminAccessToken");

    axios
      .get("http://localhost:8000/api/admin/dashboard/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-7xl">
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
          <p className="text-4xl font-bold text-indigo-600">{dashboardData.total_users}</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="text-lg font-semibold text-gray-700">Active Users</h2>
          <p className="text-4xl font-bold text-green-600">{dashboardData.active_users}</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="text-lg font-semibold text-gray-700">Total Workers</h2>
          <p className="text-4xl font-bold text-blue-600">{dashboardData.total_workers}</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="text-lg font-semibold text-gray-700">Active Workers</h2>
          <p className="text-4xl font-bold text-teal-600">{dashboardData.active_workers}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
