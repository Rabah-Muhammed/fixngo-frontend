import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import Toast from "../../../../utils/Toast";
import WorkerLayout from "../WorkerLayout";

const WorkerProfile = () => {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("workerAccessToken");
        const response = await axios.get(`${BASE_URL}/api/worker/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileData = response.data;
        setProfile(profileData);
        setFormData({
          ...profileData,
          profile_picture: profileData.profile_picture
            ? `${BASE_URL}${profileData.profile_picture}`
            : null,
          gender: profileData.gender || "",
          date_of_birth: profileData.date_of_birth || "",
        });
        setImagePreview(
          profileData.profile_picture
            ? `${BASE_URL}${profileData.profile_picture}`
            : "default-avatar.jpg"
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
        Toast("error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.size > 2 * 1024 * 1024) {
      Toast("error", "File size must be less than 2MB.");
      return;
    }

    setFormData({ ...formData, profile_picture: selectedFile });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedFormData = new FormData();

    if (!formData.profile_picture && profile.profile_picture) {
      updatedFormData.append("profile_picture", profile.profile_picture);
    } else if (formData.profile_picture instanceof File) {
      updatedFormData.append("profile_picture", formData.profile_picture);
    }

    Object.keys(formData).forEach((key) => {
      if (key !== "profile_picture" && formData[key]) {
        updatedFormData.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem("workerAccessToken");
      const response = await axios.put(
        `${BASE_URL}/api/worker/profile/`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedProfile = response.data;
      setProfile(updatedProfile);
      setFormData({
        ...updatedProfile,
        profile_picture: updatedProfile.profile_picture
          ? `${BASE_URL}${updatedProfile.profile_picture}`
          : null,
      });
      setImagePreview(
        updatedProfile.profile_picture
          ? `${BASE_URL}${updatedProfile.profile_picture}`
          : "default-avatar.jpg"
      );

      Toast("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      Toast("error", "Error saving changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );

  return (
    <WorkerLayout>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-xl rounded-lg p-6 sm:p-8 md:max-w-3xl mx-auto"
          >
            {!isEditing ? (
              <div className="text-center">
                <motion.img
                  src={imagePreview}
                  alt="Profile"
                  className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-blue-500 shadow-md"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <h2 className="text-xl font-bold mt-4 text-gray-800">
                  {profile.username}
                </h2>
                <p className="text-gray-600 text-sm">{profile.email}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-6">
                  {[
                    { label: "Phone", value: profile.phone_number },
                    { label: "Address", value: profile.address },
                    { label: "Skills", value: profile.skills },
                    { label: "Service Area", value: profile.service_area },
                    { label: "Gender", value: profile.gender || "N/A" },
                    { label: "Date of Birth", value: profile.date_of_birth || "N/A" },
                    { label: "Date Joined", value: new Date(profile.date_joined).toLocaleDateString() },
                    { label: "Availability Status", value: profile.availability_status ? "Available" : "Unavailable" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-md p-3 shadow-sm"
                    >
                      <span className="block text-sm font-semibold text-gray-700">
                        {item.label}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.button
                  className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition duration-300"
                  onClick={() => setIsEditing(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 className="mr-2 inline-block" />
                  Edit Profile
                </motion.button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center">
                  <motion.img
                    src={imagePreview}
                    alt="Profile"
                    className="w-28 h-28 rounded-full mx-auto object-cover mb-4 border-4 border-blue-500 shadow-md"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <label className="block">
                    <input
                      name="profile_picture"
                      type="file"
                      onChange={handleFileChange}
                      className="text-sm text-gray-600 file:bg-blue-50 file:text-blue-600 file:px-3 file:py-1.5 file:rounded-full file:border-none hover:file:bg-blue-100 transition duration-200"
                      accept="image/png, image/jpeg"
                    />
                  </label>
                </div>
                {[
                  { name: "username", label: "Username", type: "text" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "phone_number", label: "Phone", type: "text" },
                  { name: "address", label: "Address", type: "textarea" },
                  { name: "skills", label: "Skills (comma separated)", type: "text" },
                  { name: "service_area", label: "Service Area", type: "text" },
                  {
                    name: "availability_status",
                    label: "Availability Status",
                    type: "select",
                    options: [
                      { value: true, label: "Available" },
                      { value: false, label: "Unavailable" },
                    ],
                  },
                  {
                    name: "gender",
                    label: "Gender",
                    type: "select",
                    options: [
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ],
                  },
                  { name: "date_of_birth", label: "Date of Birth", type: "date" },
                ].map((field, index) => (
                  <div key={field.name} className="flex flex-col">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-gray-700 mb-1"
                    >
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md p-2 text-sm"
                      ></textarea>
                    ) : field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md p-2 text-sm"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md p-2 text-sm"
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-400 transition duration-300"
                    onClick={() => setIsEditing(false)}
                  >
                    <FiX className="mr-2 inline-block" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition duration-300"
                  >
                    <FiSave className="mr-2 inline-block" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkerProfile;
