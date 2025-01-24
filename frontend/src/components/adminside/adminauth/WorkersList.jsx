import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // SweetAlert2 for delete confirmation
import Toast from "../../../utils/Toast"; // Import the Toast utility
import AdminLayout from "./AdminLayout";

const WorkerList = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("adminAccessToken");

    if (!accessToken) {
      setError("Access token is missing or expired.");
      setLoading(false);
      Toast("error", "Access token is missing or expired.");
      return;
    }

    axios
      .get("http://localhost:8000/api/admin/workers/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setWorkers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching workers:", error);
        setError("Failed to fetch workers. Please try again.");
        setLoading(false);
      });
  }, []);

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Block/Unblock worker
  const handleBlockUnblock = (workerId, isActive) => {
    const accessToken = localStorage.getItem("adminAccessToken");

    if (!accessToken) {
      setError("Access token is missing or expired.");
      Toast("error", "Access token is missing or expired.");
      return;
    }

    const url = `http://localhost:8000/api/admin/${isActive ? "block" : "unblock"}/${workerId}/`;

    axios
      .post(url, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        setWorkers((prevWorkers) =>
          prevWorkers.map((worker) =>
            worker.id === workerId ? { ...worker, is_active: !isActive } : worker
          )
        );
        Toast(
          "success",
          `Worker has been ${isActive ? "blocked" : "unblocked"} successfully.`
        );
      })
      .catch((error) => {
        console.error("Error updating worker status:", error);
        setError("Failed to update worker status.");
        Toast("error", "Failed to update worker status.");
      });
  };

  // Delete worker with SweetAlert2 confirmation
  const handleDelete = (workerId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const accessToken = localStorage.getItem("adminAccessToken");

        if (!accessToken) {
          setError("Access token is missing or expired.");
          Toast("error", "Access token is missing or expired.");
          return;
        }

        axios
          .delete(`http://localhost:8000/api/admin/delete-worker/${workerId}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then(() => {
            setWorkers((prevWorkers) =>
              prevWorkers.filter((worker) => worker.id !== workerId)
            );
            Swal.fire("Deleted!", "The worker has been deleted.", "success");
            Toast("success", "Worker deleted successfully.");
          })
          .catch((error) => {
            console.error("Error deleting worker:", error);
            Swal.fire(
              "Error!",
              "Failed to delete the worker. Please try again.",
              "error"
            );
            Toast("error", "Failed to delete the worker.");
          });
      }
    });
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Workers List</h1>

      {loading ? (
        <p className="text-center text-xl">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-xl">{error}</p>
      ) : workers.length === 0 ? (
        <p className="text-center text-xl">No workers found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="w-full table-auto text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-indigo-600">
              <tr>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Username</th>
                <th scope="col" className="px-6 py-3">Phone Number</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Date Joined</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-700">
              {workers.map((worker) => (
                <tr
                  key={worker.id}
                  className="bg-gray-50 border-b hover:bg-gray-100"
                >
                  <td className="px-6 py-4">{worker.email}</td>
                  <td className="px-6 py-4">{worker.username}</td>
                  <td className="px-6 py-4">{worker.phone_number}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`${
                        worker.is_active
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      } px-3 py-1 rounded-full text-xs`}
                    >
                      {worker.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(worker.date_joined)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleBlockUnblock(worker.id, worker.is_active)
                      }
                      className={`px-4 py-2 rounded-full text-white ${
                        worker.is_active ? "bg-red-500" : "bg-green-500"
                      } hover:bg-opacity-80 mr-2`}
                    >
                      {worker.is_active ? "Block" : "Unblock"}
                    </button>
                    <button
                      onClick={() => handleDelete(worker.id)}
                      className="px-4 py-2 rounded-full bg-red-700 text-white hover:bg-opacity-80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default WorkerList;
