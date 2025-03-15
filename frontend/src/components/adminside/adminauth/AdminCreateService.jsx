import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import Swal from "sweetalert2";
import adminApi from "../../../utils/axiosAdminInterceptor";


const AdminCreateService = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hourly_rate: "",
    image: null,
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const accessToken = localStorage.getItem("adminAccessToken");
    try {
      const response = await adminApi.get("/api/admin/services/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      if (files[0]) reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "hourly_rate" ? value : value, // Keep as string
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.description || formData.hourly_rate === "" || parseFloat(formData.hourly_rate) <= 0) {
      setError("All fields are required and hourly rate must be a positive number.");
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("adminAccessToken");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("hourly_rate", parseFloat(formData.hourly_rate).toFixed(2)); // Convert correctly
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingService) {
        await adminApi.put(`/api/admin/services/${editingService.id}/`, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire("Success!", "Service updated successfully!", "success");
      } else {
        await adminApi.post("/api/admin/services/", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire("Success!", "Service created successfully!", "success");
      }

      setFormData({ name: "", description: "", hourly_rate: "", image: null });
      setImagePreview(null);
      setShowForm(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      setError("Error saving service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      hourly_rate: service.hourly_rate.toString(), // Convert to string for input
      image: null,
    });
    setImagePreview(service.image ? `${adminApi.defaults.baseURL}${service.image}` : null);
    setShowForm(true);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (serviceId) => {
    const accessToken = localStorage.getItem("adminAccessToken");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminApi.delete(`/api/admin/services/${serviceId}/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          Swal.fire("Deleted!", "The service has been removed.", "success");
          fetchServices();
        } catch (err) {
          Swal.fire("Error!", "Failed to delete service.", "error");
        }
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
            >
              + Add Service
            </button>
          )}
        </div>

        {showForm && (
          <div ref={formRef} className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{editingService ? "Edit Service" : "Create New Service"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Service Name" className="w-full p-3 border rounded-md" required />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded-md" required></textarea>
              <input type="text" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} placeholder="Hourly Rate" className="w-full p-3 border rounded-md" required />
              <input type="file" name="image" onChange={handleChange} className="w-full p-3 border rounded-md" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover" />}
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex gap-4">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700">
                  {loading ? "Saving..." : editingService ? "Update Service" : "Create Service"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-4 shadow-md rounded-lg">
              {service.image && <img src={`${adminApi.defaults.baseURL}${service.image}`} alt={service.name} className="w-full h-40 object-cover rounded-md" />}
              <h3 className="text-lg font-semibold mt-3">{service.name}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
              <p className="text-indigo-600 font-semibold mt-2">${parseFloat(service.hourly_rate).toFixed(2)}/hr</p>
              <div className="flex justify-between mt-3">
                <button onClick={() => handleEdit(service)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(service.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateService;
