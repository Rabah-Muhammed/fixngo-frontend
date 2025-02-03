import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WorkerLayout from "../workerauth/WorkerLayout";
import { FaWrench } from "react-icons/fa";
import Toast from "../../../utils/Toast";

const ServiceSelection = () => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("workerAccessToken");

    if (!token) {
      navigate("/worker/login");
      return;
    }

    axios
      .get("http://localhost:8000/api/worker/services/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setServices(response.data.available_services);
        setSelectedServices(response.data.selected_services.map((s) => s.id));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        setLoading(false);
      });
  }, [navigate]);

  const handleServiceChange = (event) => {
    const value = parseInt(event.target.value);
    setSelectedServices((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((id) => id !== value)
        : [...prevSelected, value]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .put(
        "http://localhost:8000/api/worker/services/update/",
        { services: selectedServices },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("workerAccessToken")}` },
        }
      )
      .then(() => {
        Toast("success", "Services updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating services:", error);
        Toast("error", "Failed to update services.");
      });
  };

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  return (
    <WorkerLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 shadow-md">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
            <FaWrench className="text-xl" />
            Service Selection
          </h1>
          <p className="text-sm mt-1">Select the services you offer below.</p>
        </div>

        {/* Service List */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-3 rounded-lg shadow-md hover:shadow-lg transition-all text-sm ${
                  selectedServices.includes(service.id)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-50 border hover:border-blue-400 text-gray-800"
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={service.id}
                    checked={selectedServices.includes(service.id)}
                    onChange={handleServiceChange}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>{service.name}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Selected Services */}
          <div className="bg-white shadow-md rounded-lg p-4 text-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Selected Services:</h3>
            {selectedServices.length > 0 ? (
              <ul className="list-disc ml-4 text-gray-600">
                {selectedServices.map((id) => {
                  const service = services.find((s) => s.id === id);
                  return service ? <li key={id}>{service.name}</li> : null;
                })}
              </ul>
            ) : (
              <p className="text-gray-500">You haven’t selected any services yet.</p>
            )}
          </div>

          {/* Update Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-lg shadow-md text-sm transition-all"
            >
              Update Services
            </button>
          </div>
        </form>
      </div>
    </WorkerLayout>
  );
};

export default ServiceSelection;
