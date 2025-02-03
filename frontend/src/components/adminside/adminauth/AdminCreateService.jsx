import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import Swal from "sweetalert2";

const AdminCreateService = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingService, setEditingService] = useState(null); // Track the service being edited

  const formRef = useRef(null); // Create reference for the form

  const fetchServices = async () => {
    const accessToken = localStorage.getItem("adminAccessToken");
    try {
      const response = await axios.get("http://localhost:8000/api/admin/services/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const accessToken = localStorage.getItem("adminAccessToken");
      try {
        await axios.delete(`http://localhost:8000/api/admin/services/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        Swal.fire("Deleted!", "Your service has been deleted.", "success");
        fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err);
        Swal.fire("Failed", "There was an issue deleting the service.", "error");
      }
    }
  };

  const handleEdit = (service) => {
    setEditingService(service); // Set the service to be edited
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      image: null, // Keep the existing image if not editing
    });
    setImagePreview(service.image ? `http://localhost:8000${service.image}` : null); // Set image preview
    setShowForm(true); // Show the form in edit mode
    formRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to the form
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      if (files[0]) reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.description || !formData.price || formData.price <= 0) {
      setError("All fields are required and price must be a positive number.");
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("adminAccessToken");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingService) {
        // PUT request to update the service if editing
        await axios.put(`http://localhost:8000/api/admin/services/${editingService.id}/`, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire("Success!", "Service updated successfully!", "success");
      } else {
        // POST request to create a new service
        await axios.post("http://localhost:8000/api/admin/services/", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire("Success!", "Service created successfully!", "success");
      }

      setFormData({ name: "", description: "", price: "", image: null });
      setImagePreview(null);
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setError("Error saving service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="text-right mb-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
            >
              + Add Service
            </button>
          )}
        </div>

        {showForm && (
          <div ref={formRef} className="bg-white p-6 shadow-md rounded-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{editingService ? "Edit Service" : "Create New Service"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter service name"
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px]"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-3 w-24 h-24 object-cover rounded-md" />
                )}
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-md ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingService ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-md shadow-md border border-gray-200 p-5 flex flex-col space-y-3"
              >
                <div className="w-full h-36 bg-gray-100 rounded-md flex items-center justify-center">
                  {service.image ? (
                    <img
                      src={`http://localhost:8000${service.image}`}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-indigo-600">${service.price}</p>
                </div>
                <div className="flex justify-between mt-4 space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateService;
