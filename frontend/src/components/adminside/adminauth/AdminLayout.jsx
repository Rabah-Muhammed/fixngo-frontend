import React from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 bg-gray-50">
        <AdminNavbar />
        <div className="pt-20 px-8">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
