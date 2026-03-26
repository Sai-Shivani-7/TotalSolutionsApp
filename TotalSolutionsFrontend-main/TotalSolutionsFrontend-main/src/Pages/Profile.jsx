import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPropery, logout } from "../Components/redux/authSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultProfile from "../assets/defaultUser.webp"
import logger from "../utils/logger";

// require("dotenv").config();
export default function Profile() {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  // Add these new state variables after existing useState declarations
const [showPhotoModal, setShowPhotoModal] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);
const [photoPreview, setPhotoPreview] = useState(null);
const [uploadingPhoto, setUploadingPhoto] = useState(false);
const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const apiURL = import.meta.env.VITE_API_URL|| "https://totalapi.joywithlearning.com";
  console.log('API URL:', apiURL);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem(`${role}Id`);

    try {
      setLoading(true);
      const response = await axios.get(`/api/data/allUsers/${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setUser(response.data);
      setEditedUser(response.data);
      logger.info("User data fetched:", response.data);
    } catch (error) {
      logger.error("Error fetching user:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If currently editing, cancel and reset form
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSaveChanges = async () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem(`${role}Id`);

    try {
      const response = await axios.put(
        `/api/data/updateUser/${userId}`,
        editedUser,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
      dispatch(addPropery({ key: "name", value: response.data.name }));
    } catch (error) {
      logger.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem(`${role}Id`);

    try {
      await axios.put(
        `/api/data/changePassword/${userId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast(
        "Password changed successfully! \n You will be redirected to Login page",
        "success"
      );
      setTimeout(() => {
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem(role + "Id");
        dispatch(logout());
        navigate("/login");
      }, 3000);
    } catch (error) {
      logger.error("Error changing password:", error);
      showToast(
        error.response?.data?.message || "Failed to change password",
        "error"
      );
    }
  };

  const showToast = (message, type) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "info":
        toast.info(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  };
  // Add these new functions before the return statement
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Please select a valid image file (JPG, PNG, GIF, WebP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB", "error");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleUploadPhoto = async () => {
  if (!selectedFile) {
    showToast("Please select a file first", "error");
    return;
  }

  setUploadingPhoto(true);
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const userId = sessionStorage.getItem(`${role}Id`);

  try {
    const formData = new FormData();
    formData.append("profilePhoto", selectedFile);

    // Use generic endpoint with userId for all roles
    const response = await axios.put(
      `/api/data/updateProfilePhoto/${userId}`,
      formData,
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      setUser({ ...user, profilePhoto: response.data.profilePhoto });
      setShowPhotoModal(false);
      setSelectedFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      showToast("Profile photo updated successfully!", "success");
    }
  } catch (error) {
    logger.error("Upload error:", error);
    showToast(
      error.response?.data?.message || "Failed to upload profile photo",
      "error"
    );
  } finally {
    setUploadingPhoto(false);
  }
};

const handleCancelPhotoUpload = () => {
  setSelectedFile(null);
  setPhotoPreview(null);
  setShowPhotoModal(false);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 m-20 border-red-800"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-[#ab1c1c]">User not found</h1>
          <p className="mt-2 text-gray-600">Please try logging in again</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#ab1c1c] px-6 py-8 rounded-t-xl flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col justify-center md:items-start text-center md:text-left">
              <h1 className="text-3xl font-bold text-white">Your Profile</h1>
              <p className="mt-2 text-red-100">
                Hello, {user.name || user.mobilenumber || "User"}!
              </p>
            </div>

            {/* Profile photo (only for therapist) */}
{user.role === "therapist" && (
  <div className="mt-6 md:mt-0 md:ml-8 flex flex-col items-center">
    <div className="relative">
      <img
        src={
          user.profilePhoto
            ? `${apiURL}/uploads/profilePhotos/${user.profilePhoto}`
            : defaultProfile
        }
        alt="Profile"
        className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-xl"
      />
      <button
      onClick={() => setShowPhotoModal(true)}
      className="mt-3 px-4 py-1 text-sm bg-white text-[#ab1c1c] rounded-full shadow hover:bg-gray-100 transition"
    >
      {user.profilePhoto ? "Update Profile Photo" : "Add Profile Photo"}
    </button>
    </div>
  </div>
)}
          </div>


          {/* Profile Content */}
          <div className="p-6">
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#ab1c1c]">
                  Personal Information
                </h2>
                <button
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isEditing
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-[#ab1c1c] hover:bg-[#8e1818]"
                  } transition duration-300`}
                >
                  {isEditing ? "Cancel" : "Edit Information"}
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="w-32 font-medium text-gray-600">Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name || ""}
                      onChange={handleInputChange}
                      className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    />
                  ) : (
                    <span className="mt-1 md:mt-0 text-gray-800">
                      {user.name || "Not provided"}
                    </span>
                  )}
                </div>
                {/* Therapist Extra Fields */}
                {user.role === "therapist" && (
                  <>
                    {/* Designation */}
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="w-32 font-medium text-gray-600">Designation:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="designation"
                          value={editedUser.designation || ""}
                          onChange={handleInputChange}
                          className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                        />
                      ) : (
                        <span className="mt-1 md:mt-0 text-gray-800">
                          {user.designation || "Not provided"}
                        </span>
                      )}
                    </div>

                    {/* Qualification */}
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="w-32 font-medium text-gray-600">Qualification:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="qualification"
                          value={editedUser.qualification || ""}
                          onChange={handleInputChange}
                          className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                        />
                      ) : (
                        <span className="mt-1 md:mt-0 text-gray-800">
                          {user.qualification || "Not provided"}
                        </span>
                      )}
                    </div>

                    {/* RCI Number */}
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="w-32 font-medium text-gray-600">RCI Number:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="rciNumber"
                          value={editedUser.rciNumber || ""}
                          onChange={handleInputChange}
                          className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                        />
                      ) : (
                        <span className="mt-1 md:mt-0 text-gray-800">
                          {user.rciNumber || "Not provided"}
                        </span>
                      )}
                    </div>
                  </>
                )}



                {/* Phone */}
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="w-32 font-medium text-gray-600">Phone:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mobilenumber"
                      value={editedUser.mobilenumber || ""}
                      onChange={handleInputChange}
                      className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    />
                  ) : (
                    <span className="mt-1 md:mt-0 text-gray-800">
                      {user.mobilenumber || "Not provided"}
                    </span>
                  )}
                </div>

                {/* Address */}
                {user.role === "parent" ? (
                  <div className="flex flex-col md:flex-row md:items-center">
                    <span className="w-32 font-medium text-gray-600">
                      Address:
                    </span>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={editedUser.address || ""}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                      />
                    ) : (
                      <span className="mt-1 md:mt-0 text-gray-800">
                        {user.address || "Not provided"}
                      </span>
                    )}
                  </div>
                ) : null}

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-2 bg-[#8e1818] text-white rounded-lg hover:bg-red-700 transition duration-300"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* --- NEW: Feedback Section (Only for Therapist) --- */}
            {user.role === "therapist" && (
              <div className="bg-red-50 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold text-[#ab1c1c] mb-6">
                   Feedback 
                </h2>
                
                <div className="space-y-6">
                    {user.feedback && user.feedback.length > 0 ? (
                        user.feedback.map((feedbackItem, index) => (
                            <div key={feedbackItem._id || index} className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                                
                                {/* Date */}
                                <div className="flex justify-between items-center mb-2">
                                    {/* <span className="font-medium text-gray-600">Review {index + 1}</span> */}
                                    <span className="text-sm text-gray-500">
                                        {feedbackItem.date 
                                            ? new Date(feedbackItem.date).toLocaleDateString() 
                                            : 'Date N/A'}
                                    </span>
                                </div>
                                
                                {/* Content */}
                                <p className="text-gray-800 italic whitespace-pre-wrap">
                                    {feedbackItem.content || "No content provided."}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-700 text-center py-4">
                            No feedback available yet.
                        </p>
                    )}
                </div>
              </div>
            )}
            {/* --- END: Feedback Section --- */}



            {/* Password Management */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-[#ab1c1c] mb-6">
                Password Management
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-3 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition duration-300 w-full md:w-1/2"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#ab1c1c] mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition duration-300"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
        
      )}

{/* Profile Photo Upload Modal */}
{showPhotoModal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
      <button
        onClick={handleCancelPhotoUpload}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-[#ab1c1c] mb-6">
        Update Profile Photo
      </h2>

      {/* Preview Section */}
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-4">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile Preview"
              className="w-40 h-40 rounded-full object-cover border-4 border-[#ab1c1c]"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#ab1c1c]">
              <svg
                className="w-20 h-20 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          {selectedFile ? "New photo selected" : "Photo preview"}
        </p>
      </div>

      {/* File Input */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photoInput"
        />
        <label
          htmlFor="photoInput"
          className="block w-full bg-red-100 text-[#ab1c1c] border-2 border-dashed border-[#ab1c1c] rounded-lg p-4 text-center cursor-pointer hover:bg-red-200 transition duration-200"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="font-semibold">Click to select photo</p>
          <p className="text-sm text-gray-600">
            JPG, PNG, GIF, WebP (Max 5MB)
          </p>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUploadPhoto}
          disabled={!selectedFile || uploadingPhoto}
          className={`flex-1 py-2 rounded-lg font-semibold transition duration-200 ${
            selectedFile && !uploadingPhoto
              ? "bg-[#ab1c1c] text-white hover:bg-[#8e1818]"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {uploadingPhoto ? "Uploading..." : "Upload Photo"}
        </button>
        <button
          onClick={handleCancelPhotoUpload}
          disabled={uploadingPhoto}
          className="flex-1 py-2 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
