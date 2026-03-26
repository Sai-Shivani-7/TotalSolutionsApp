import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "../../Components/ScrollTop";

const BRANCH_MAP = {
  Neredmet: "NE",
  Nacharam: "NA",
  "Banjara Hills": "BH",
  Bowenpally: "BP",
  Kukatpally: "KP",
  Barkatpura: "BR",
  Champapet: "P",
  Manikonda: "MK",
  Suchitra: "SH",
};

const DOCTOR_MAP = {
  "Pooja Jha": "PJ",
  "Gomathi Sharma": "GS",
  "Sophia Pirani": "SP",
  "Suma Singh": "SS",
  // Gayatri: "GG",
  "GVN Gayathri Gorthi": "GG",
};

const SCHOOL_BOARDS = [
  "CBSE",
  "SSC",
  "ICSE",
  "Cambridge (IB)",
  "NIOS",
  "Others",
];
const THERAPY_TYPES = [
  "Occupational Therapy",
  "Behavioural Therapy",
  "Remedial Therapy",
  "Speech Therapy",
];

export default function AdminExistingUsers() {
  const [step, setStep] = useState(1); 
  const [parentFormData, setParentFormData] = useState({
    name: "",
    mobilenumber: "",
    address: "",
    role: "Parent",
    password: "total12345678",
  });

  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedParentData, setSelectedParentData] = useState(null);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [formData, setFormData] = useState({
    childName: "",
    childDob: "",
    childGender: "",
    childSchoolName: "",
    childSchoolBoard: "",
    dateOfJoining: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [reportFiles, setReportFiles] = useState([]);
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

  const [uploadingReports, setUploadingReports] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [therapists, setTherapists] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [therapyDetails, setTherapyDetails] = useState([
  { therapyType: "", therapistId: "" },
]);
  const addTherapyRow = () => {
  setTherapyDetails((prev) => [
    ...prev,
    { therapyType: "", therapistId: "" },
  ]);
};

const removeTherapyRow = (index) => {
  setTherapyDetails((prev) => {
    if (prev.length === 1) {
      // Only one row → just clear values
      return [{ therapyType: "", therapistId: "" }];
    }
    // Multiple rows → remove the selected one
    return prev.filter((_, i) => i !== index);
  });
};


const updateTherapyField = (index, field, value) => {
  setTherapyDetails((prev) =>
    prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
  );
};

  useEffect(() => {
    fetchParents();
    fetchDoctors();
    fetchTherapists();
  }, []);

  const isValidRegId = (regId) => {
    // Pattern: MMYYDD/AA
    // Checks for 6 digits, a slash, and 2 uppercase letters
    const regex = /^\d{6}\/[A-Z]{2}$/;
    return regex.test(regId);
  };

  const isValidCaseId = (caseId) => {
    // Pattern: MMYYDD/AA/BB/NN
    // Checks for 6 digits, slash, 2 letters, slash, 1-2 letters, slash, 2 digits
    const regex = /^\d{6}\/[A-Z]{1,2}\/\d{2}$/;
    return regex.test(caseId);
  };

  const generateMMYY = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    return mm + yy;
  };

  const fetchParents = async () => {
    setIsLoadingParents(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("/api/data/parents", {
        headers: { Authorization: token },
      });
      setParents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setIsLoadingParents(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("/api/data/alldoctors", {
        headers: { Authorization: token },
      });
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchTherapists = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const decodedToken = jwtDecode(token);
      const centreId = decodedToken.user.centreId;
     console.log(centreId);
      const response = await axios.get(`/api/data/allTherapists/${centreId}`, {
        headers: { Authorization: token },
      });
      setTherapists(
        response.data.therapists.map((t) => ({
          id: t._id,
          name: t.name,
        }))
      );
      console.log("Fetched therapists:", response.data.therapists);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };
  const handleParentInputChange = (e) => {
    setParentFormData({ ...parentFormData, [e.target.name]: e.target.value });
  };

  const handleRegisterParent = async (e) => {
    e.preventDefault();
    if (!parentFormData.name || !parentFormData.mobilenumber) {
      toast.error("Please fill Parent Name and Mobile Number");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      let centreId = sessionStorage.getItem("centreId");
      if (!centreId && token) {
        const decoded = jwtDecode(token);
        centreId = decoded?.user?.centreId;
      }
      if (!centreId) {
        toast.error("Centre ID not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      const payload = {
        ...parentFormData,
        role: "parent", 
        centreId: centreId,
      };
      const response = await axios.post("/api/admins/register", payload, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      const newParent = response.data.user;
if (response.data.isExisting) {
  toast.info("Parent already exists. Using existing account.");
} else {
  toast.success("New Parent Created Successfully!");
}
      setParents((prev) => [...prev, newParent]);
      setSelectedParent(newParent._id);
      setSelectedParentData(newParent);

      setStep(2);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.response?.data || "Error creating parent";
      toast.error(
        typeof errorMsg === "string" ? errorMsg : "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParent(parentId);
    const parent = parents.find((p) => p._id === parentId);
    setSelectedParentData(parent);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addReportRow = () =>
    setReportFiles((prev) => [
      ...prev,
      { id: Date.now(), type: "", file: null },
    ]);
  const handleReportTypeChange = (id, value) =>
    setReportFiles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, type: value } : r))
    );
  const handleReportFileChange = (id, file) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Max 50MB");
      return;
    }
    setReportFiles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, file } : r))
    );
  };
  const removeReportRow = (id) =>
    setReportFiles((prev) => prev.filter((r) => r.id !== id));

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Profile picture size should not exceed 5MB");
      setProfilePicture(null);
      return;
    }
    setProfilePicture(file);
  };

  const uploadReportFile = async (file, reportType, childId) => {
    const formData = new FormData();
    console.log("Sending reports to backend");
    formData.append("report", file);
    formData.append("reportType", reportType);

    await axios.post(`/api/admins/uploadChildReport/${childId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `${sessionStorage.getItem("token")}`,
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedParent) {
      newErrors.parent = "Please select a parent";
    }

    if (!formData.childName.trim()) {
      newErrors.childName = "Child name is required";
    }

    if (!formData.childDob) {
      newErrors.childDob = "Date of birth is required";
    }

    if (!formData.childGender) {
      newErrors.childGender = "Gender is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidRegId(registrationId)) {
      toast.error("Invalid Registration ID format");
      return;
    }

    if (!isValidCaseId(caseId)) {
      toast.error("Invalid Case ID format");
      return;
    }

    if (!formData.childName || !formData.childDob || !formData.childGender) {
      toast.error("Please fill all child details");
      return;
    }

    setIsSubmitting(true);

    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        toast.error("Please fix the validation errors before submitting");
        return;
      }

      const centreId = sessionStorage.getItem("centreId");
      if (!centreId) {
        toast.error("Centre ID not found in session storage");
        setIsSubmitting(false);
        return;
      }
      let admitStatus = "pending";
      const validTherapies = therapyDetails.filter(
        (t) => t.therapyType && t.therapistId
      );
      if (selectedDoctor || validTherapies.length > 0) {
        admitStatus = "active";
      }


      const childData = {
        name: formData.childName,
        dob: formData.childDob,
        gender: formData.childGender,
        schoolName: formData.childSchoolName || "",
        schoolBoard: formData.childSchoolBoard || "",
        parentId: selectedParent,
        doctorId: selectedDoctor || null,
        dateOfJoining: formData.dateOfJoining || null,//Added inorder to store the DOJ 
        therapies: validTherapies,
        centreId: centreId,
        registrationId: registrationId,
        caseId: caseId,
        admitStatus: admitStatus,
      };

       const response = await axios.post(
      "/api/admins/addExistingChild",
      childData,
      {
        headers: {
          Authorization: sessionStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
      const childId = response.data.child._id;
      if (profilePicture) {
        const profilePicFormData = new FormData();
        profilePicFormData.append("profilePicture", profilePicture);
        await axios.post(`/api/admins/uploadProfilePicture/${childId}`, profilePicFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
      }

      // Upload report files if any
      setUploadingReports(true);
      try {
        for (const report of reportFiles) {
          if (!report.file || !report.type) continue;
          await uploadReportFile(report.file, report.type, childId);
        }
      } finally {
        setUploadingReports(false);
      }
      toast.success("Child registered successfully with all files!");
      setRegistrationSuccess(true);

      // Reset form
      setFormData({
        childName: "",
        childDob: "",
        childGender: "",
        childSchoolName: "",
        childSchoolBoard: "",
      });
      setReportFiles([]);
      setProfilePicture(null);
      setSelectedParent("");
      setSelectedParentData(null);
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Failed to register child");
    }catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Failed to register child");
    } 
     finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-red-800">
          <h3 className="text-2xl font-bold text-gray-900">
            Registration Complete!
          </h3>
          <button
            onClick={() => {
              setRegistrationSuccess(false);
              setStep(1);
            }}
            className="mt-6 bg-[#ab1c1c] text-white px-6 py-2 rounded-lg"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-xl overflow-hidden mb-20 border-2 border-red-800">
        <div className="px-6 py-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#ab1c1c]">
                  Register Parent for Existing Child
                </h2>
                <p className="text-sm text-gray-600">
                  Fill in the parent details to import child records
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="mobilenumber"
                  placeholder="Mobile Number"
                  onChange={handleParentInputChange}
                  className="p-2 border border-gray-300 rounded-lg w-full"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  onChange={handleParentInputChange}
                  className="p-2 border border-gray-300 rounded-lg w-full"
                />
                <select
                  disabled
                  className="p-2 border border-gray-300 rounded-lg bg-gray-100"
                >
                  <option>Role: Parent</option>
                </select>
                <input
                  type="text"
                  disabled
                  value="Password: total12345678"
                  className="p-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <textarea
                name="address"
                placeholder="Full Address"
                onChange={handleParentInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
              />

              <button
                onClick={handleRegisterParent}
                className="w-full bg-[#ab1c1c] text-white py-3 rounded-lg font-bold hover:bg-[#8e1818]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Parent..." : "Add Child"}
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-red-600 hover:underline decoration-red-600 transition-all"
              >
                Back
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#ab1c1c]">
                  Import Existing Child Record
                </h2>
              </div>

              {/* Parent Selection (Pre-filled) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Selected Parent Details
                </label>
                <p>
                  <strong>Name:</strong> {selectedParentData?.name}
                </p>
                <p>
                  <strong>Mobile:</strong> {selectedParentData?.mobilenumber}
                </p>
                <p>
                  <strong>Address:</strong> {selectedParentData?.address}
                </p>
              </div>
              {/* <div className="border-t pt-4">
                <h3 className="text-md font-medium text-[#ab1c1c] mb-4">
                  Case Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 mb-6">
                    <label className="text-sm font-medium text-gray-700">
                      Doctor
                    </label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Branch</option>
                      {Object.keys(BRANCH_MAP).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div> */}
              <div className="border-t pt-4">
  <h3 className="text-md font-medium text-[#ab1c1c] mb-4">
    Case Details
  </h3>

  {/* Doctor */}
  <div className="flex flex-col gap-1 mb-6">
    <label className="text-sm font-medium text-gray-700">
      Doctor
    </label>
    <select
      value={selectedDoctor}
      onChange={(e) => setSelectedDoctor(e.target.value)}
      className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-lg"
    >
      <option value="">Select Doctor</option>
      {doctors.map((d) => (
        <option key={d._id} value={d._id}>
          {d.name}
        </option>
      ))}
    </select>
  </div>

  {/* Therapist Details */}
  <div className="border-t pt-4">
    <h3 className="text-md font-medium text-[#ab1c1c] mb-4">
      Therapist Details
    </h3>

    {therapyDetails.map((item, index) => (
      <div
        key={index}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      >
        {/* Therapy Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Type of Therapy
          </label>
          <input
  list="therapy-types"
  value={item.therapyType}
  onChange={(e) =>
    updateTherapyField(index, "therapyType", e.target.value)
  }
  placeholder="Type or select therapy"
  className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-lg"
/>

<datalist id="therapy-types">
  {THERAPY_TYPES.map((type) => (
    <option key={type} value={type} />
  ))}
</datalist>

        </div>

        {/* Therapist + Remove */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Therapist
          </label>

          <div className="flex gap-2 items-center">
            <select
              value={item.therapistId}
              onChange={(e) =>
                updateTherapyField(index, "therapistId", e.target.value)
              }
              className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="">
                {item.therapyType
                  ? "Select Therapist"
                  : "Select Therapy First"}
              </option>

              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
                type="button"
                onClick={() => removeTherapyRow(index)}
                className="bg-[#ab1c1c] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#8e1818]"
              >
                Remove
              </button>
          </div>
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={addTherapyRow}
      className="mt-2 bg-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300"
    >
      + Add Therapy
    </button>
  </div>

  {/* Branch */}
  <div className="flex flex-col gap-1 mt-6">
    <label className="text-sm font-medium text-gray-700">
      Branch
    </label>
    <select
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
      className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-lg"
    >
      <option value="">Select Branch</option>
      {Object.keys(BRANCH_MAP).map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  </div>
</div>


              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-[#ab1c1c] mb-4">
                  Child Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Registration ID
                    </label>
                    <input
                      type="text"
                      placeholder="MMYY##/DR"
                      value={registrationId}
                      onChange={(e) =>
                        setRegistrationId(e.target.value.toUpperCase())
                      }
                      className="p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Case ID
                    </label>
                    <input
                      type="text"
                      placeholder="MMYY##/BR/##"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value.toUpperCase())}
                      className="p-2 border rounded-lg"
                    />
                  </div>

                  {/* Child Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Child Name
                    </label>
                    <input
                      type="text"
                      name="childName"
                      placeholder="Enter child name"
                      onChange={handleChange}
                      className="p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="childDob"
                      onChange={handleChange}
                      className="p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="childGender"
                      onChange={handleChange}
                      className="p-2 border rounded-lg"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  {/* Date of Joining */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    onChange={handleChange}
                    className="p-2 border rounded-lg"
                  />
                </div>


                  {/* Profile Picture */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-red-700 mb-3">
                  School Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="childSchoolName"
                    placeholder="School Name"
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />

                  <select
                    name="childSchoolBoard"
                    onChange={handleChange}
                    className="p-2 border rounded"
                  >
                    <option value="">Select Board (Optional)</option>
                    {SCHOOL_BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-[#ab1c1c] mb-4">
                  Associated Files
                </h3>

                {reportFiles.map((report) => (
                  <div key={report.id} className="flex gap-2 mb-2 items-end">
                    <div className="flex flex-col gap-1 w-1/4">
                      <label className="text-sm font-medium text-gray-700">
                        Report Type
                      </label>
                      <select
                        onChange={(e) =>
                          handleReportTypeChange(report.id, e.target.value)
                        }
                        className="p-2 border rounded"
                      >
                        <option value="">Select</option>
                        {REPORT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-sm font-medium text-gray-700">
                        Upload File
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleReportFileChange(report.id, e.target.files[0])
                        }
                        className="p-2 border rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeReportRow(report.id)}
                      className="text-red-600 mb-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addReportRow}
                  className="bg-gray-200 px-3 py-1 rounded"
                >
                  + Add File
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#ab1c1c] text-white rounded-lg font-bold mt-4"
              >
                {isSubmitting ? "Processing..." : "Register Child"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
