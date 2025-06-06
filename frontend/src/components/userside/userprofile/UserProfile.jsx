import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import Toast from "../../../utils/Toast";
import api from '../../../utils/axiosInterceptor';
import Navbar from "../Navbar";

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/");
        const profileData = response.data;
        console.log("Profile Data:", profileData);
        console.log("Raw Profile Picture:", profileData.profile_picture);

        const profilePictureUrl = profileData.profile_picture
          ? (profileData.profile_picture.startsWith('http')
              ? profileData.profile_picture
              : `${api.defaults.baseURL}${profileData.profile_picture}`)
          : null;

        console.log("Constructed Profile Picture URL:", profilePictureUrl);
        setProfile(profileData);
        setFormData({
          ...profileData,
          profile_picture: profilePictureUrl,
        });
        setImagePreview(profilePictureUrl || "/default-avatar.jpg");
        console.log("Image Preview Set To:", profilePictureUrl || "/default-avatar.jpg");
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          Toast("error", "Please log in to view your profile.");
        } else {
          Toast("error", "Failed to load profile data");
        }
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
      console.log("Image Preview Updated (File):", reader.result);
    };
    if (selectedFile) reader.readAsDataURL(selectedFile);
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
      const response = await api.put("/api/profile/", updatedFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = response.data;
      console.log("Updated Profile Data:", updatedProfile);

      const updatedProfilePictureUrl = updatedProfile.profile_picture
        ? (updatedProfile.profile_picture.startsWith('http')
            ? updatedProfile.profile_picture
            : `${api.defaults.baseURL}${updatedProfile.profile_picture}`)
        : null;

      console.log("Constructed Updated Profile Picture URL:", updatedProfilePictureUrl);
      setProfile(updatedProfile);
      setFormData({
        ...updatedProfile,
        profile_picture: updatedProfilePictureUrl,
      });
      setImagePreview(updatedProfilePictureUrl || "/default-avatar.jpg");
      console.log("Image Preview Set To (Post-Update):", updatedProfilePictureUrl || "/default-avatar.jpg");

      Toast("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        Toast("error", "Please log in to update your profile.");
      } else {
        Toast("error", "Error saving changes. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-700-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl"
        >
          {!isEditing ? (
            <div className="text-center">
              <motion.img
                src={imagePreview}
                alt="Profile"
                className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-gray-500 shadow-lg"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <h2 className="text-3xl font-bold mt-6 text-gray-800">{profile.username}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
                {[
                  { label: "Email", value: profile.email },
                  { label: "Phone", value: profile.phone_number },
                  { label: "Address", value: profile.address },
                  { label: "Gender", value: profile.gender },
                  { label: "Date of Birth", value: profile.date_of_birth },
                  { label: "Date Joined", value: new Date(profile.date_joined).toLocaleDateString() },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <span className="font-semibold text-gray-700 block mb-1">{item.label}</span>
                    <span className="text-gray-600">{item.value || "N/A"}</span>
                  </motion.div>
                ))}
              </div>
              <motion.button
                className="mt-8 px-6 py-2 bg-gray-950 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center mx-auto"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEdit2 className="mr-2" />
                Edit Profile
              </motion.button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <motion.img
                  src={imagePreview}
                  alt="Profile"
                  className="w-40 h-40 rounded-full mx-auto object-cover mb-4 border-4 border-blue-500 shadow-lg"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <label className="block">
                  <span className="sr-only">Choose File</span>
                  <input
                    name="profile_picture"
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/png, image/jpeg"
                  />
                </label>
              </div>
              {[
                { name: "username", label: "Username", type: "text" },
                { name: "phone_number", label: "Phone", type: "text" },
                { name: "address", label: "Address", type: "textarea" },
                { name: "gender", label: "Gender", type: "select", options: ["male", "female", "other"] },
                { name: "date_of_birth", label: "Date of Birth", type: "date" },
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    />
                  ) : field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      disabled={field.disabled}
                    />
                  )}
                </motion.div>
              ))}
              <div className="flex justify-between">
                <motion.button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-800 font-semibold rounded-lg py-2 px-4 hover:bg-gray-400 transition duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiX className="mr-2" />
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="bg-gray-950 text-white font-semibold rounded-lg py-2 px-4 hover:bg-gray-600 transition duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  <FiSave className="mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;