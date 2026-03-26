import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const apiURL =
  import.meta.env.VITE_API_URL || "https://totalapi.joywithlearning.com";

export default function ChildDetails() {
  // console.log("inside child details ... ");
  const navigate = useNavigate();
  const { childId } = useParams();
  const location = useLocation();
  const [selectedChild, setSelectedChild] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [error, setError] = useState(null);
  const child = location.state?.childData;

  const INACTIVE_REASON_LABELS = {
    "administrative-not-joined-after-registration":
      "Not joined after registration",
    "administrative-services-on-hold": "Services on hold",
    "administrative-timing-not-suitable": "Timing not suitable",

    "academic-school-schedule-conflict": "School schedule conflict",
    "academic-exam-period": "Exam period",

    "health-medical-reasons": "Medical reasons",
    "health-therapy-paused": "Therapy paused",
    "health-weaning-off": "Weaning-off phase",
    "health-under-observation": "Under observation",

    other: "Other",
  };

  // If child data is passed through location state, use it
  useEffect(() => {
    if (location.state && location.state.childData) {
      // console.log("Child data from location.state:", location.state.childData);
      setSelectedChild(location.state.childData);
      setSelectedDoctor(location.state.childData.doctorId || "");
      setLoading(false);
      fetchStaff();
    } else {
      // If no data is passed, fetch the child data by ID
      fetchChildData();
    }
  }, [childId, location.state]);

  const fetchChildData = async () => {
    try {
      // console.log("hiiiiiiii");
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(`/api/data/child/${childId}`, {
        headers: {
          Authorization: token,
        },
      });
      // console.log("child data : ",response.data);
      setSelectedChild(response.data);
      setSelectedDoctor(response.data.doctorId || "");
      setLoading(false);
      fetchStaff();
    } catch (err) {
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${err.response.statusText}`
        : err.message;
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const decodedToken = jwtDecode(token);
      const doctorsResponse = await axios.get(
        `/api/data/allDoctors/${decodedToken.user.centreId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      const therapistsResponse = await axios.get(
        `/api/data/allTherapists/${decodedToken.user.centreId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setDoctors(doctorsResponse.data.doctors);
      setTherapists(therapistsResponse.data.therapists);
      setLoadingStaff(false);
    } catch (err) {
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${err.response.statusText}`
        : err.message;
      setError(errorMessage);
      setLoadingStaff(false);
    }
  };
  const getDoctorName = () => {
    if (!selectedChild?.doctorId) return "Not Assigned";

    const doctor = doctors.find((d) => d._id === selectedChild.doctorId);
    return doctor ? doctor.name : "Assigned";
  };
  const getTherapyDetails = () => {
    if (!selectedChild?.therapies || selectedChild.therapies.length === 0) {
      return ["Not Assigned"];
    }

    return selectedChild.therapies.map((t) => {
      const therapist = therapists.find((th) => th._id === t.therapistId);
      return `${t.therapyType} – ${therapist ? therapist.name : "Assigned"}`;
    });
  };

  const handleViewReport = (filePath) => {
    window.open(`${apiURL}${filePath}`, "_blank");
  };

  const handleBookAppointment = () => {
    // e.preventDefault();
    navigate(`/admindashboard/appointment?childId=${selectedChild._id}`);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // const StatusBadge = ({ status }) => {
  const StatusBadge = ({ status }) => {
    const getStatusMeta = () => {
      if (!status) {
        return {
          label: "Pending",
          styles: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      }

      if (status === "active") {
        return {
          label: "Active",
          styles: "bg-green-100 text-green-800 border-green-200",
        };
      }

      if (status === "pending") {
        return {
          label: "Pending",
          styles: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      }

      if (status === "inactive" || status.startsWith("inactive-")) {
        return {
          label: "Inactive",
          styles: "bg-red-100 text-red-800 border-red-200",
        };
      }

      return {
        label: "Unknown",
        styles: "bg-gray-100 text-gray-800 border-gray-200",
      };
    };

    const { label, styles } = getStatusMeta();

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${styles}`}
      >
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          onClick={() => navigate("/admindashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        <p>Child data not found.</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => navigate("/admindashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 mt-16 max-w-7xl mx-auto">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Child Details</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 w-full sm:w-auto"
            onClick={handleBookAppointment}
          >
            Book Appointment
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() =>
              navigate(`/admindashboard/child/${selectedChild._id}/edit`, {
                state: { childData: selectedChild },
              })
            }
          >
            Edit Details
          </button>

          {/* <button
            className="px-4 py-2 bg-[#ab1c1c] text-white rounded-md hover:bg-[#8e1818] w-full sm:w-auto"
            onClick={() => {
              alert("Edit functionality to be implemented");
            }}
          >
            Edit Details
          </button> */}
        </div>
      </div>

      {/* Main Content - Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              Personal Information
            </h3>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex items-center gap-4 mb-4">
                <img
                  src={
                    selectedChild.profilePicture
                      ? `${apiURL}${selectedChild.profilePicture}`
                      : "https://via.placeholder.com/100?text=No+Image"
                  }
                  alt="Child Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#ab1c1c]"
                />
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedChild.name}
                </h2>
              </div>
              {/* Rest of the personal info goes here */}
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.name}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Date of Birth</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(selectedChild.dob)}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Age</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {calculateAge(selectedChild.dob)} years
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Gender</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.gender}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">
                  Registration Date
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(selectedChild.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Status</dt>
                <dd>
                  <StatusBadge status={selectedChild.admitStatus} />
                  {child.admitStatus === "inactive" && child.inactiveReason && (
                    <p className="text-xs text-gray-500 mt-1">
                      {INACTIVE_REASON_LABELS[child.inactiveReason] ||
                        "Inactive"}
                    </p>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Other Info */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">Other Info</h3>
          </div>

          <div className="p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b sm:border-b-0 pb-2">
                <dt className="text-sm text-gray-500 mb-1">School Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.schoolName || "N/A"}
                </dd>
              </div>

              <div className="border-b sm:border-b-0 pb-2">
                <dt className="text-sm text-gray-500 mb-1">School Board</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.schoolBoard || "N/A"}
                </dd>
              </div>

              <div className="border-b sm:border-b-0 pb-2">
                <dt className="text-sm text-gray-500 mb-1">Case ID</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.caseId || "N/A"}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 mb-1">Registration ID</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.registrationId || "N/A"}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Date of Joining</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.dateOfJoining
                    ? formatDate(selectedChild.dateOfJoining)
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              Parent/Guardian Information
            </h3>
          </div>

          <div className="p-4">
            <dl className="grid grid-cols-1 gap-4">
              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">
                  Parent/Guardian Name
                </dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId?.name || "Not provided"}
                </dd>
              </div>

              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">Contact Number</dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId?.mobilenumber || "Not provided"}
                </dd>
              </div>

              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">Email Address</dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId?.email || "Not provided"}
                </dd>
              </div>

              {/* ✅ NEW: Parent Address */}
              <div>
                <dt className="text-sm text-gray-500 mb-1">Address</dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId?.address || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {/* Staff Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">Staff</h3>
          </div>

          <div className="p-4">
            <dl className="grid grid-cols-1 gap-4">
              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">Doctor</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {loadingStaff ? "Loading..." : getDoctorName()}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 mb-1">Therapist</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {loadingStaff
                    ? "Loading..."
                    : getTherapyDetails().map((t, i) => <div key={i}>{t}</div>)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      {/* Reports Section */}
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
          <h3 className="text-lg font-medium text-[#ab1c1c]">
            Associated Files
          </h3>
        </div>

        <div className="p-4">
          {selectedChild.reports && selectedChild.reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Report Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Uploaded On
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {selectedChild.reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {report.type}
                      </td>

                      <td className="px-4 py-2 text-sm text-gray-600">
                        {formatDate(report.uploadedAt)}
                      </td>

                      <td className="px-4 py-2 text-sm space-x-2">
                        <button
                          onClick={() => handleViewReport(report.filePath)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No files uploaded for this child.
            </p>
          )}
        </div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="mt-8 flex justify-center sm:justify-start">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 w-full sm:w-auto max-w-xs"
          onClick={() => navigate("/admindashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
