import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // SweetAlert2 for delete confirmation
import Toast from "../../../utils/Toast"; // Import your Toast utility
import AdminLayout from "./AdminLayout";
import { FiEdit, FiTrash2, FiLock, FiUnlock } from "react-icons/fi"; // Import icons
import adminApi from "../../../utils/axiosAdminInterceptor";


const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("adminAccessToken");

    if (!accessToken) {
      setError("Access token is missing or expired.");
      setLoading(false);
      return;
    }

    adminApi
      .get("/api/admin/users/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
        setLoading(false);
      });
  }, []);

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Block/Unblock user
  const handleBlockUnblock = (userId, isActive) => {
    const accessToken = localStorage.getItem("adminAccessToken");

    if (!accessToken) {
      setError("Access token is missing or expired.");
      Toast("error", "Access token is missing or expired.");
      return;
    }

    const url = `${adminApi.defaults.baseURL}/api/admin/${isActive ? "block" : "unblock"}/${userId}/`;

    axios
      .post(url, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, is_active: !isActive } : user
          )
        );
        Toast("success", `User has been ${isActive ? "blocked" : "unblocked"} successfully.`);
      })
      .catch((error) => {
        console.error("Error updating user status:", error);
        setError("Failed to update user status.");
        Toast("error", "Failed to update user status.");
      });
  };

  // Delete user with SweetAlert2 confirmation
  const handleDelete = (userId) => {
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

        adminApi
          .delete(`/api/admin/delete/${userId}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then(() => {
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== userId)
            );
            Swal.fire("Deleted!", "The user has been deleted.", "success");
            Toast("success", "User deleted successfully.");
          })
          .catch((error) => {
            console.error("Error deleting user:", error);
            Swal.fire(
              "Error!",
              "Failed to delete the user. Please try again.",
              "error"
            );
            Toast("error", "Failed to delete the user.");
          });
      }
    });
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Users List</h1>

      {loading ? (
        <p className="text-center text-xl">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-xl">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center text-xl">No users found.</p>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-lg bg-white">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-100 uppercase bg-indigo-600">
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
              {users.map((user) => (
                <tr key={user.id} className="bg-gray-50 border-b hover:bg-gray-100">
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">{user.phone_number}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`${
                        user.is_active
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      } px-3 py-1 rounded-full text-xs`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(user.date_joined)}</td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleBlockUnblock(user.id, user.is_active)}
                      className={`px-5 py-2 rounded-full text-white ${
                        user.is_active ? "bg-red-500" : "bg-green-500"
                      } hover:bg-opacity-80 flex items-center`}
                    >
                      {user.is_active ? (
                        <FiLock className="inline-block mr-2" />
                      ) : (
                        <FiUnlock className="inline-block mr-2" />
                      )}
                      {user.is_active ? "Block" : "Unblock"}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-5 py-2 rounded-full bg-red-700 text-white hover:bg-opacity-80 flex items-center"
                    >
                      <FiTrash2 className="inline-block mr-2" />
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

export default UsersList;
