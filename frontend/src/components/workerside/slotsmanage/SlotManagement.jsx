import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import WorkerLayout from "../workerauth/WorkerLayout";
import Toast from "../../../utils/Toast";
import { format } from "date-fns-tz";
import Swal from "sweetalert2";
import workerApi from "../../../utils/axiosWorkerInterceptor";


const SlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // Track which slot is being edited
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("workerAccessToken");
    if (!token) {
      navigate("/worker/login");
      return;
    }

    workerApi
      .get("/api/worker/slots/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSlots(response.data.available_slots);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
        setLoading(false);
      });
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    const token = localStorage.getItem("workerAccessToken");
    const startTimeUTC = startTime.toISOString();
    const endTimeUTC = endTime.toISOString();

    if (editingSlot) {
      // Editing an existing slot
      workerApi
        .put(
          `/api/worker/slot/edit/${editingSlot.id}/`,
          {
            start_time: startTimeUTC,
            end_time: endTimeUTC,
            is_available: isAvailable,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          Toast("success", "Slot updated successfully!");
          setSlots(
            slots.map((slot) =>
              slot.id === editingSlot.id ? response.data : slot
            )
          );
          setShowForm(false);
          setEditingSlot(null);
          setError(null); // Reset error
        })
        .catch((error) => {
          console.error("Error updating slot:", error);
          Toast("error", error.response?.data?.error || "Failed to update slot.");
        });
    } else {
      // Adding a new slot
      workerApi
        .post(
          "/api/worker/slots/",
          {
            start_time: startTimeUTC,
            end_time: endTimeUTC,
            is_available: isAvailable,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          Toast("success", "Slot added successfully!");
          setSlots([...slots, response.data]);
          setShowForm(false);
          setError(null); // Reset error
        })
        .catch((error) => {
          console.error("Error creating slot:", error);
          Toast("error", error.response?.data?.error || "Failed to add slot.");
        });
    }
  };

  const handleDelete = (slotId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("workerAccessToken");

        workerApi
          .delete(`/api/worker/slot/delete/${slotId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() => {
            Swal.fire("Deleted!", "Your slot has been deleted.", "success");
            setSlots(slots.filter((slot) => slot.id !== slotId));
          })
          .catch((error) => {
            Swal.fire("Error!", "Failed to delete slot.", "error");
          });
      }
    });
  };

  const toggleForm = (slot = null) => {
    if (slot) {
      setEditingSlot(slot);
      setStartTime(new Date(slot.start_time));
      setEndTime(new Date(slot.end_time));
      setIsAvailable(slot.is_available);
    } else {
      setEditingSlot(null);
      setStartTime(null);
      setEndTime(null);
      setIsAvailable(true);
    }
    setShowForm(!showForm);
  };

  if (loading) {
    return (
      <div className="text-center text-lg text-gray-700 py-10">
        <span className="spinner-border animate-spin"></span> Loading...
      </div>
    );
  }

  const today = new Date();

  return (
    <WorkerLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-4 text-center text-indigo-700">
          Manage Your Slots
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => toggleForm()}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {showForm ? "Cancel" : "Add New Slot"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              {editingSlot ? "Edit Slot" : "Add New Slot"}
            </h2>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-600 mb-2">Start Date & Time</label>
                <DatePicker
                  selected={startTime}
                  onChange={(date) => setStartTime(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minDate={today}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">End Date & Time</label>
                <DatePicker
                  selected={endTime}
                  onChange={(date) => setEndTime(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minDate={today}
                />
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">Available</span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {editingSlot ? "Update Slot" : "Add Slot"}
              </button>
            </div>
          </form>
        )}

        <h2 className="text-lg font-medium text-gray-800 mb-4">Your Existing Slots</h2>
        {slots.length === 0 ? (
          <p className="text-center text-gray-500">You haven't added any slots yet.</p>
        ) : (
          <div className="space-y-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white shadow-lg p-4 rounded-lg flex justify-between items-center hover:shadow-xl transition-shadow"
              >
                <div>
                  <div className="text-gray-800 text-lg font-medium">
                    {format(new Date(slot.start_time), "yyyy-MM-dd hh:mm a", {
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    -{" "}
                    {format(new Date(slot.end_time), "yyyy-MM-dd hh:mm a", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </div>
                  <div
                    className={`mt-2 text-sm ${
                      slot.is_available ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {slot.is_available ? "Available" : "Unavailable"}
                  </div>
                </div>
                <div className="flex space-x-4"> {/* Add space between buttons */}
                  <button
                    onClick={() => toggleForm(slot)}
                    className="text-blue-600 hover:text-blue-700 font-semibold focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-600 hover:text-red-700 font-semibold focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default SlotManagement;
