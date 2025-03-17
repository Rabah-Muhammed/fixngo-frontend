import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import AdminLayout from "./AdminLayout";
import "chart.js/auto";
import adminApi from "../../../utils/axiosAdminInterceptor"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("adminAccessToken");

    adminApi
      .get("/api/admin/dashboard/", {
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
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-lg font-semibold mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold mt-10">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-500 font-semibold mt-10">No data available.</div>;
  }

  // 📊 Line Chart Data for Monthly Bookings
  const lineChartData = {
    labels: Object.keys(dashboardData.booking_trend_data),
    datasets: [
      {
        label: "Bookings per Month",
        data: Object.values(dashboardData.booking_trend_data),
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.1,
      },
    ],
  };

  // 🥧 Pie Chart Data for Booking Status
  const pieChartData = {
    labels: ["Pending", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          dashboardData.pending_bookings,
          dashboardData.completed_bookings,
          dashboardData.cancelled_bookings,
        ],
        backgroundColor: ["#facc15", "#22c55e", "#ef4444"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-center mb-8">Dashboard</h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto max-w-7xl">
        <DashboardCard title="Total Users" value={dashboardData.total_users || 0} color="indigo" />
        <DashboardCard title="Active Users" value={dashboardData.active_users || 0} color="green" />
        <DashboardCard title="Total Workers" value={dashboardData.total_workers || 0} color="blue" />
        <DashboardCard title="Active Workers" value={dashboardData.active_workers || 0} color="teal" />
        <DashboardCard title="Total Services" value={dashboardData.total_services || 0} color="purple" />
        <DashboardCard title="Total Bookings" value={dashboardData.total_bookings || 0} color="orange" />
        <DashboardCard title="Pending Bookings" value={dashboardData.pending_bookings || 0} color="yellow" />
        <DashboardCard title="Completed Bookings" value={dashboardData.completed_bookings || 0} color="green" />
        <DashboardCard title="Cancelled Bookings" value={dashboardData.cancelled_bookings || 0} color="red" />
        <DashboardCard title="Total Earnings" value={`$${dashboardData.total_earnings || 0}`} color="blue" />
        <DashboardCard title="Platform Earnings" value={`$${dashboardData.platform_earnings || 0}`} color="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-7xl mx-auto">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Booking Trend</h2>
          <Line data={lineChartData} />
        </div>

        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Booking Status Distribution</h2>
          <Pie data={pieChartData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Worker</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recent_bookings.length > 0 ? (
                dashboardData.recent_bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="p-3">{booking.user}</td>
                    <td className="p-3">{booking.worker}</td>
                    <td className="p-3">{booking.service}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-white ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3">${booking.amount}</td>
                    <td className="p-3">{new Date(booking.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">No recent bookings</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

// 📌 Status Badge Colors
const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "bg-yellow-500";
    case "processing": return "bg-blue-500";
    case "started": return "bg-indigo-500";
    case "workdone": return "bg-teal-500";
    case "completed": return "bg-green-500";
    case "cancelled": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

// 📌 Dashboard Card Component
const DashboardCard = ({ title, value, color }) => (
  <div className={`p-6 bg-white shadow-lg rounded-xl border-t-4 border-${color}-500`}>
    <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    <p className={`text-4xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

export default AdminDashboard;
