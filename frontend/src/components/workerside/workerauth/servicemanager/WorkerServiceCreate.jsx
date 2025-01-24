import React, { useState, useEffect } from "react";
import axios from "axios";
import WorkerLayout from "../WorkerLayout";
import { FaDollarSign, FaClock } from "react-icons/fa"; // Icon imports for price and duration

const WorkerServiceCreate = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // State to track if the form is visible

  useEffect(() => {
    const token = localStorage.getItem("workerAccessToken");

    if (!token) {
      setError("You need to be logged in to view or add services.");
      return;
    }

    // Fetch the existing services
    axios
      .get("http://localhost:8000/api/worker/services/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setServices(response.data.services);
      })
      .catch((error) => {
        setError("Failed to fetch services.");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("workerAccessToken");

    if (!token) {
      setError("You need to be logged in to add a service.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/worker/service/create/",
        {
          title,
          description,
          price,
          duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(response.data.message);
      setTitle("");
      setDescription("");
      setPrice("");
      setDuration("");

      // Refresh the services list after adding a new service
      const servicesResponse = await axios.get("http://localhost:8000/api/worker/services/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(servicesResponse.data.services); // Update the list
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
      setShowForm(false); // Hide form after submission
    }
  };

  const handleCancel = () => {
    setShowForm(false); // Hide the form if user cancels
  };

  return (
    <WorkerLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-blue-600 mb-6">Manage Your Services</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            Add Service
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-semibold mb-2 text-gray-700">
                Service Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold mb-2 text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-semibold mb-2 text-gray-700">
                  Duration (in minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between space-x-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={loading}
              >
                {loading ? "Adding Service..." : "Add Service"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 focus:outline-none transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <h3 className="text-xl font-semibold text-gray-800 mt-12 mb-4">Your Services</h3>
        {services.length === 0 ? (
          <p className="text-gray-600">No services available. Add a new service!</p>
        ) : (
          <ul className="space-y-6">
            {services.map((service) => (
              <li
                key={service.id}
                className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                <p className="text-gray-700 mt-2">{service.description}</p>

                <div className="mt-4 flex items-center text-gray-600">
                  <div className="flex items-center mr-6">
                    <FaDollarSign className="text-green-500 mr-2" />
                    <span className="font-semibold">${service.price}</span>
                  </div>

                  <div className="flex items-center">
                    <FaClock className="text-yellow-500 mr-2" />
                    <span className="font-semibold">{service.duration} mins</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WorkerServiceCreate;
