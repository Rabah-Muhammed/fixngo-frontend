import React from "react";
import WorkerSidebar from "./WorkerSidebar";
import WorkerNavbar from "./WorkerNavbar";

const WorkerLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <WorkerSidebar />
      <div className="flex-1 ml-64 bg-gray-50">
        <WorkerNavbar />
        <div className="pt-20 px-8">{children}</div>
      </div>
    </div>
  );
};

export default WorkerLayout;
