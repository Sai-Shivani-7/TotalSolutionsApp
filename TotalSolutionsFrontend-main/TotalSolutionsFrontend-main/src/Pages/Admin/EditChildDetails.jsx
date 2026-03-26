import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const apiURL =
  import.meta.env.VITE_API_URL || "https://totalapi.joywithlearning.com";

const REPORT_TYPES = [
  "Case History",
  "Prescription",
  "IEP",
  "IQ Report",
  "OT Report",
  "Speech Report",
  "Admission Form",
  "Parent Feed Back",
  "Child Observatory Sheets",
  "IEP OT",
  "IEP BT",
  "IEP ST",
  "IEP RT",
  "Other",
];
const THERAPY_TYPES = [
  "Occupational Therapy",
  "Behavioural Therapy",
  "Remedial Therapy",
  "Speech Therapy",
];

export default function EditChildDetails() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [therapists, setTherapists] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [therapyDetails, setTherapyDetails] = useState([
    { therapyType: "", therapistId: "" },
  ]);

  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePictureCleared, setProfilePictureCleared] = useState(false);

  const [changeReason, setChangeReason] = useState("");
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    admitStatus: "active",
    schoolName: "",
    schoolBoard: "",
    caseId: "",
    registrationId: "",
    parentName: "",
    parentMobile: "",
    parentEmail: "",
    parentAddress: "",
    dateOfJoining: "",
    inactiveReason: "",
  });

  const [existingReports, setExistingReports] = useState([]);
  const [newReports, setNewReports] = useState([]); // Dynamic upload rows
  const [reportsToDelete, setReportsToDelete] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const addTherapyRow = () => {
    setTherapyDetails((prev) => [
      ...prev,
      { therapyType: "", therapistId: "" },
    ]);
  };
  const removeTherapyRow = (index) => {
    setTherapyDetails((prev) => {
      if (prev.length === 1) {
        return [{ therapyType: "", therapistId: "" }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };
  const updateTherapyField = (index, field, value) => {
    setTherapyDetails((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const mapInitialData = (data) => {
    let initialAdmitStatus = data.admitStatus || "active";

    setFormData({
      name: data.name || "",
      dob: data.dob ? data.dob.split("T")[0] : "",
      gender: data.gender || "",
      admitStatus: initialAdmitStatus,
      inactiveReason: data.inactiveReason || "",
      schoolName: data.schoolName || "",
      schoolBoard: data.schoolBoard || "",
      caseId: data.caseId || "",
      registrationId: data.registrationId || "",
      parentName: data.parentId?.name || "",
      parentMobile: data.parentId?.mobilenumber || "",
      parentEmail: data.parentId?.email || "",
      parentAddress: data.parentId?.address || "",
      profilePicture: data.profilePicture || "",
      dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split("T")[0] : "",
    });

    setSelectedDoctor(data.doctorId || "");
    setProfilePictureCleared(false);
    setTherapyDetails(
      data.therapies && data.therapies.length > 0
        ? data.therapies.map((t) => ({
            therapyType: t.therapyType,
            therapistId: t.therapistId?._id || t.therapistId,
          }))
        : [{ therapyType: "", therapistId: "" }],
    );

    setExistingReports(data.reports || []);
    setLoading(false);

    fetchStaff(); // 👈 important

    setOriginalData(data);
  };

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`/api/data/child/${childId}`, {
        headers: { Authorization: token },
      });
      mapInitialData(response.data);
    } catch (err) {
      setError("Failed to load child data.");
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const centreId = location.state?.childData?.centreId || formData.centreId;
      if (!centreId) return;

      const [doctorsRes, therapistsRes] = await Promise.all([
        axios.get(`/api/data/allDoctors/${centreId || ""}`, {
          headers: { Authorization: token },
        }),
        axios.get(`/api/data/allTherapists/${centreId || ""}`, {
          headers: { Authorization: token },
        }),
      ]);

      setDoctors(doctorsRes.data.doctors || []);
      setTherapists(therapistsRes.data.therapists || []);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "admitStatus" && value !== "inactive"
        ? { inactiveReason: "" }
        : {}),
    }));
  };

  // --- Dynamic Report Logic ---

  const addReportRow = () => {
    setNewReports((prev) => [
      ...prev,
      { id: Date.now(), type: "", file: null },
    ]);
  };

  const handleReportTypeChange = (e, id) => {
    setNewReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, type: e.target.value } : r)),
    );
  };

  const handleReportFileChange = (e, id) => {
    const file = e.target.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
      alert("File size should not exceed 50MB");
      return;
    }
    setNewReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, file } : r)),
    );
  };

  const removeReportRow = (id) => {
    setNewReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleNewProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Profile picture size should not exceed 5MB");
        setNewProfilePicture(null);
        setProfilePicturePreview(null);
        setProfilePictureCleared(false);
        return;
      }
      setNewProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setProfilePictureCleared(false);
    } else {
      setNewProfilePicture(null);
      setProfilePicturePreview(null);
      setProfilePictureCleared(true);
    }
  };

  const markExistingForDeletion = (reportId) => {
    if (
      window.confirm(
        "Remove this existing report? It will be deleted when you save.",
      )
    ) {
      setReportsToDelete([...reportsToDelete, reportId]);
      setExistingReports(existingReports.filter((r) => r._id !== reportId));
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;

    const coreChanges =
      formData.admitStatus !== originalData.admitStatus ||
      formData.inactiveReason !== (originalData.inactiveReason || "") ||
      selectedDoctor !== (originalData.doctorId?._id || "") ||
      JSON.stringify(therapyDetails) !==
        JSON.stringify(originalData.therapies || []);

    const fileChanges =
      newReports.length > 0 ||
      reportsToDelete.length > 0 ||
      newProfilePicture !== null ||
      profilePictureCleared === true;

    return coreChanges || fileChanges;
  };

  // --- Submit Logic ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmSave = window.confirm(
      "Are you sure you want to save all changes?",
    );
    if (!confirmSave) return;

    try {
      setSaving(true);
      const token = sessionStorage.getItem("token");
      const data = new FormData();
      const validTherapies = therapyDetails.filter(
        (t) => t.therapyType && t.therapistId,
      );

      data.set("admitStatus", formData.admitStatus);
      if (formData.admitStatus === "inactive") {
        data.append("inactiveReason", formData.inactiveReason);
      }

      // Append Text Fields (including potentially updated admitStatus)
      // Append Text Fields, excluding profilePicture as it's handled separately
      Object.keys(formData).forEach((key) => {
        if (
          key !== "profilePicture" &&
          key !== "admitStatus" &&
          key !== "inactiveReason"
        ) {
          data.append(key, formData[key]);
        }
      });

      // data.set("admitStatus", updatedAdmitStatus); // Ensure the updated status is sent

      // Handle profile picture: send new file, existing path, or clear instruction
      if (newProfilePicture) {
        data.append("profilePicture", newProfilePicture);
      } else if (profilePictureCleared && formData.profilePicture) {
        // User explicitly removed the picture
        data.append("clearProfilePicture", "true");
      } else if (formData.profilePicture) {
        // No new picture, and not explicitly cleared, so keep existing.
        // Send the existing path under a different field name for backend to process.
        data.append("existingProfilePicturePath", formData.profilePicture);
      }

      // ✅ 3. APPEND STAFF HERE (THIS IS THE PLACE)
      data.append("doctorId", selectedDoctor);
      data.append("therapies", JSON.stringify(validTherapies));

      // Append Deletions
      if (reportsToDelete.length > 0) {
        data.append("reportsToDelete", JSON.stringify(reportsToDelete));
      }

      // Append New Files & Their Types
      newReports.forEach((item) => {
        if (item.file && item.type) {
          data.append("newReports", item.file);
          data.append("reportTypes", item.type);
        }
      });

      const trimmedReason = (changeReason || "").trim();
      if (!trimmedReason) {
        // Prevent submission if reason is empty or whitespace-only
        window.alert("Please provide a valid reason for the changes.");
        return;
      }
      data.append("reason", trimmedReason);

      await axios.put(`/api/admins/edit-child/${childId}`, data, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/admindashboard`);
      setOriginalData({
        ...originalData,
        ...formData,
      });

      alert("Updated successfully!");
    } catch (err) {
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ab1c1c]"></div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 mt-16 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Child Profile
          </h1>
          {/* <p className="text-sm text-gray-500">Updating ID: {childId}</p> */}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !changeReason.trim() || !hasChanges()}
            className="px-6 py-2 bg-[#ab1c1c] text-white rounded-md shadow-md disabled:bg-red-300"
          >
            {saving ? "Processing Request..." : "Save All Changes"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1 & 2: Personal & School Info (Simplified for brevity) */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden border-l-4 border-[#ab1c1c]">
            <div className="bg-red-50 px-4 py-3">
              <h3 className="text-lg font-medium text-[#ab1c1c]">
                Personal Information
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col items-center gap-4 mb-4">
                <img
                  src={
                    profilePicturePreview ||
                    (formData.profilePicture
                      ? `${apiURL}${formData.profilePicture}`
                      : "https://via.placeholder.com/150?text=No+Image")
                  }
                  alt="Child Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-[#ab1c1c]"
                />
                <label className="block text-xs font-semibold text-gray-500 uppercase mt-2">
                  Upload New Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewProfilePictureChange}
                  className="mt-1 w-full p-1.5 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-800 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- Staff Section --- */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden border-l-4 border-[#ab1c1c]">
            <div className="bg-red-50 px-4 py-3">
              <h3 className="text-lg font-medium text-[#ab1c1c]">Staff</h3>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Doctor */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Assigned Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Therapist Details */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Therapist Details
                </label>

                {therapyDetails.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"
                  >
                    {/* Therapy Type */}
                    <input
                      list="therapy-types"
                      value={item.therapyType}
                      onChange={(e) =>
                        updateTherapyField(index, "therapyType", e.target.value)
                      }
                      placeholder="Type or select therapy"
                      className="p-2 border border-gray-300 rounded"
                    />

                    <datalist id="therapy-types">
                      {THERAPY_TYPES.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>

                    {/* Therapist */}
                    <div className="flex gap-2">
                      <select
                        value={item.therapistId}
                        onChange={(e) =>
                          updateTherapyField(
                            index,
                            "therapistId",
                            e.target.value,
                          )
                        }
                        className="flex-1 p-2 border border-gray-300 rounded"
                      >
                        <option value="">Select Therapist</option>
                        {therapists.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => removeTherapyRow(index)}
                        className="px-3 bg-red-100 text-red-600 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTherapyRow}
                  className="mt-2 px-3 py-1 bg-gray-100 rounded text-sm"
                >
                  + Add Therapy
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden border-l-4 border-[#ab1c1c]">
            <div className="bg-red-50 px-4 py-3">
              <h3 className="text-lg font-medium text-[#ab1c1c]">
                Other Information
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Case ID
                </label>
                <input
                  type="text"
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Registration ID
                </label>
                <input
                  type="text"
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Admit Status
                </label>

                <select
                  name="admitStatus"
                  value={formData.admitStatus}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {formData.admitStatus === "inactive" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">
                    Reason for Inactive <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="inactiveReason"
                    value={formData.inactiveReason || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">Select reason</option>

                    {/* Administrative */}
                    <option value="administrative-not-joined-after-registration">
                      Not joined after registration
                    </option>
                    <option value="administrative-services-on-hold">
                      Services on hold
                    </option>
                    <option value="administrative-timing-not-suitable">
                      Timing not suitable
                    </option>

                    {/* Academic */}
                    <option value="academic-school-schedule-conflict">
                      School schedule conflict
                    </option>
                    <option value="academic-exam-period">Exam period</option>

                    {/* Health */}
                    <option value="health-medical-reasons">
                      Medical reasons
                    </option>
                    <option value="health-therapy-paused">
                      Therapy paused
                    </option>
                    <option value="health-weaning-off">Weaning off</option>
                    <option value="health-under-observation">
                      Under observation
                    </option>

                    {/* Explicit */}
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Manage Reports Section --- */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border-l-4 border-[#ab1c1c]">
          <div className="bg-red-50 px-4 py-3">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              Manage Reports & Documents
            </h3>
          </div>
          <div className="p-4 space-y-6">
            {/* Existing Files */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Currently Stored Files:
              </p>
              {existingReports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {existingReports.map((report) => (
                    <div
                      key={report._id}
                      className="flex items-center justify-between p-3 border rounded bg-gray-50"
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {report.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(`${apiURL}${report.filePath}`, "_blank")
                          }
                          className="text-blue-600 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => markExistingForDeletion(report._id)}
                          className="text-red-600 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No reports attached.
                </p>
              )}
            </div>

            <hr />

            {/* Dynamic New File Uploads (Ported Feature) */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Upload New Files:
              </p>
              <div className="space-y-3">
                {newReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-gray-50 p-3 rounded-md border border-dashed border-gray-300"
                  >
                    <div className="w-full sm:w-1/3">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Report Type
                      </label>
                      <select
                        value={report.type}
                        onChange={(e) => handleReportTypeChange(e, report.id)}
                        className="mt-1 w-full p-2 border rounded text-sm bg-white"
                        required
                      >
                        <option value="">Select Type</option>
                        {REPORT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Select File
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleReportFileChange(e, report.id)}
                        className="mt-1 w-full p-1.5 border rounded text-sm bg-white"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeReportRow(report.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addReportRow}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
              >
                + Add File
              </button>
            </div>
          </div>
        </div>

        {/* --- Reason for Change (MANDATORY) --- */}
        <div className="bg-white shadow-md rounded-lg border-l-4 border-[#ab1c1c] p-4 mt-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Reason for Change <span className="text-red-500">*</span>
          </label>
          <textarea
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            rows={3}
            placeholder="Explain why these changes are being made..."
            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-800"
            required
          />
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={saving || !changeReason.trim() || !hasChanges()}
            className="w-full sm:w-auto px-12 py-3 bg-[#ab1c1c] text-white font-bold rounded-lg hover:bg-[#8e1818] shadow-lg disabled:bg-red-300 uppercase"
          >
            {saving ? "Processing Request..." : "Save All Changes"}
          </button>
        </div>

        {/* --- Change History (READ ONLY, AT VERY BOTTOM) --- */}
        <div className="bg-white shadow-md rounded-lg border-l-4 border-[#ab1c1c] p-4 mt-10">
          <h3 className="text-lg font-medium text-[#ab1c1c] mb-3">
            Change History
          </h3>

          {originalData?.changeHistory?.length ? (
            <div className="space-y-3">
              {[...originalData.changeHistory].reverse().map((item, idx) => (
                <div key={idx} className="p-3 border rounded bg-gray-50">
                  {/* <p className="text-sm font-semibold">{item.field} changed</p> */}
                  <ul className="ml-4 list-disc text-sm">
                    {item.changes.map((c, i) => (
                      <li key={i}>
                        changed <b>{c.field}</b>
                      </li>
                    ))}
                  </ul>

                  <p className="text-sm text-gray-700">{item.reason}</p>
                  <p className="text-xs text-gray-500">
                    {item.changedBy?.name || item.changedByRole} ·{" "}
                    {new Date(item.changedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No changes recorded yet.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
