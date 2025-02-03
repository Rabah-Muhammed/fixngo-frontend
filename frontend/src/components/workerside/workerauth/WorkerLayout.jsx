import React from "react";
import WorkerSidebar from "./WorkerSidebar";
import WorkerNavbar from "./WorkerNavbar";

const WorkerLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white">
      <WorkerSidebar />
      <div className="flex-1 ml-64 bg-white">
        <WorkerNavbar />
        <div className="pt-20 px-8">{children}</div>
      </div>
    </div>
  );
};

export default WorkerLayout;
