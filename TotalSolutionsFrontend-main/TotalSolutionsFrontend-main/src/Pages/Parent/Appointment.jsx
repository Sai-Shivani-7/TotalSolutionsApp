import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Loader from "../../Components/Loader";

// Helper components
const FormSection = ({ title, children }) => (
  <div className="md:col-span-2">
    <h3 className="text-lg font-medium text-gray-800 mb-2 border-b pb-1">
      {title}
    </h3>
    {children}
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// Utility function to get minimum date that's not a Sunday
const getMinDateExcludingSundays = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // If tomorrow is Sunday (0), set to Monday (add 1 more day)
  if (tomorrow.getDay() === 0) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  
  return tomorrow.toISOString().split('T')[0];
};

// Utility function to check if a date is Sunday
const isSunday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString + 'T00:00:00');
  return date.getDay() === 0;
};

// Utility function to get maximum date (2 weeks from today)
const getMaxDate = () => {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14); // 2 weeks = 14 days
  return maxDate.toISOString().split('T')[0];
};

export default function Appointment() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [centres, setCentres] = useState([]);
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [buttonLoading, setButtonLoading] = useState(false);

  const [formState, setFormState] = useState({
    childId: "",
    childName: "",
    childAge: "",
    parentName: "",
    parentId: null,
    dob: "",
    parentPhoneNo: "",
    appointmentDate: "",
    time: "",
    doctorId: "",
    schoolName: "",
    classGrade: "",
    schoolBoard: "",
    childConcerns: "",
    branch: "",
    gender: "",
    alternativeNumber: "",
    address: "",
    consultationType: "",
    referredBy: "",
  });

  const [allDoctors, setAllDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pdf, setPDF] = useState(null);
  const [parentData, setParentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("morning");
  const [dateConflictWarning, setDateConflictWarning] = useState("");
  const [operationalMessage, setOperationalMessage] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");

  const updateFormState = (key, value) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await axios.get("/api/data/alldoctors", {
        headers: { Authorization: sessionStorage.getItem("token") },
      });
      setAllDoctors(response.data);
    } catch (error) {
      toast.error("Error fetching doctors");
      console.error("Error fetching doctors:", error);
    }
  };



  const initializeParent = () => {
    const token = sessionStorage.getItem("token");
    if (sessionStorage.getItem("role") === "parent" && token) {
      try {
        const decodedToken = jwtDecode(token);
        const parentId = decodedToken.user._id;
        updateFormState("parentId", parentId);
      } catch (error) {
        console.error("Error decoding token:", error);
        updateFormState("parentId", null);
      }
    } else {
      updateFormState("parentId", null);
    }
  };

  const fetchChildrenForParent = async () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (role === "parent" && token) {
      try {
        const response = await axios.get(`/api/parents/children`, {
          headers: { Authorization: token },
        });

        if (response.data && Array.isArray(response.data)) {
          setChildren(response.data);
        }
      } catch (error) {
        console.error("Error fetching children:", error);
        toast.error("Could not retrieve your children's information");
      }
    }
  };

  // Auto-fill parent details when data is fetched
  useEffect(() => {
    if (parentData && sessionStorage.getItem("role") === "parent") {
      const getParentIdFromToken = () => {
        const token = sessionStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwtDecode(token);
            return decoded.user._id;
          } catch (e) {
            console.error("Error decoding token:", e);
            return null;
          }
        }
        return null;
      };

      const parentId = parentData._id || getParentIdFromToken();

      setFormState((prevState) => ({
        ...prevState,
        parentId: parentId,
        parentName: parentData.name || "",
        parentPhoneNo: parentData.mobilenumber || "",
        address: parentData.address || "",
        alternativeNumber: parentData.mobilenumber || "",
      }));

      // Optional notification
      toast.success("Your details have been automatically filled");
    }
  }, [parentData]);

  // Fetch parent details if logged in
  useEffect(() => {
    const fetchParentDetails = async () => {
      const token = sessionStorage.getItem("token");
      const role = sessionStorage.getItem("role");

      if (role === "parent" && token) {
        setIsLoading(true);
        try {
          const decodedToken = jwtDecode(token);
          const parentId = decodedToken.user._id;
          const response = await axios.get(`/api/data/allUsers/${parentId}`, {
            headers: { Authorization: token },
          });

          if (response.data) {
            setParentData(response.data);
          }
          await fetchChildrenForParent();
        } catch (error) {
          console.error("Error fetching parent details:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAllDoctors();
    fetchParentDetails();
    initializeParent();

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split("T")[0];
    updateFormState("appointmentDate", formattedTomorrow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChildSelect = (selectedId) => {
    if (selectedId === "new") {
      setFormState((prevState) => ({
        ...prevState,
        childId: "new",
        childName: "",
        childAge: "",
        dob: "",
        gender: "",
        schoolName: "",
        classGrade: "",
        schoolBoard: "",
      }));

      // Update URL with new childId
      const newUrl = new URL(window.location);
      newUrl.searchParams.set("childId", "new");
      window.history.pushState({}, "", newUrl);
    } else {
      const selectedChild = children.find((child) => child._id === selectedId);
      if (selectedChild) {
        setFormState((prevState) => ({
          ...prevState,
          childId: selectedId,
          childName: selectedChild.name || "",
          childAge: calculateAge(selectedChild.dob),
          dob: selectedChild.dob
            ? new Date(selectedChild.dob).toISOString().split("T")[0]
            : "",
          gender: selectedChild.gender || "",
          schoolName: selectedChild.schoolName || "",
          classGrade: selectedChild.classGrade || "",
          schoolBoard: selectedChild.schoolBoard || "",
        }));

        // Update URL with new childId
        const newUrl = new URL(window.location);
        newUrl.searchParams.set("childId", selectedId);
        window.history.pushState({}, "", newUrl);
      }
    }
  };

  useEffect(() => {
    if (formState.doctorId && formState.doctorId.trim() !== "") {
      const selectedDoctor = allDoctors.find(doctor => doctor._id === formState.doctorId);
      if (selectedDoctor && selectedDoctor.centreIds) {
        setCentres(selectedDoctor.centreIds);
      } else {
        setCentres([]);
      }
    } else {
      setCentres([]);
    }
  }, [formState.doctorId, allDoctors]);

  useEffect(() => {
    const fetchSlotsAndBookings = async () => {
      if (formState.doctorId && formState.appointmentDate && formState.consultationType && formState.branch) {
        try {
          // Use the consultation type-specific route that handles slot filtering with centreId
          const response = await axios.get(
            `/api/admins/getAvailableSlots/${formState.branch}/${formState.doctorId}/${formState.appointmentDate}/${formState.consultationType}`,
            { headers: { Authorization: sessionStorage.getItem("token") } }
          );

          // Convert available slots to the expected format with period categorization
          const availableSlots = response.data.availableSlots || [];
          
          // Check if it's a holiday
          if (response.data.isHoliday) {
            setIsHoliday(true);
            setHolidayName(response.data.holidayName);
            setOperationalMessage("");
            setTimeSlots([]);
            setBookedSlots([]);
            return;
          }

          // Check if response indicates non-operational status
          if (response.data.message) {
            setIsHoliday(false);
            setHolidayName("");
            setOperationalMessage(response.data.message);
            setTimeSlots([]);
            setBookedSlots([]);
            return;
          }

          // Clear holiday state for normal operation
          setIsHoliday(false);
          setHolidayName("");

          const configuredSlots = availableSlots.map(time => {
            const hour = parseInt(time.split(':')[0]);
            const period = time.includes('AM') 
              ? (hour < 12 ? 'morning' : 'afternoon')
              : 'afternoon';
            return { time, period };
          });

          setTimeSlots(configuredSlots);
          setBookedSlots([]); // The route already excludes booked slots
          setOperationalMessage(""); // Clear any previous message
        } catch (error) {
          toast.error("Error fetching slots");
          console.error("Error fetching slots:", error);
          setOperationalMessage("");
          // Fallback to default slots
          setTimeSlots([
            { time: "10:30 AM", period: "morning" },
            { time: "11:30 AM", period: "morning" },
            { time: "12:30 PM", period: "afternoon" },
            { time: "2:00 PM", period: "afternoon" },
            { time: "3:00 PM", period: "afternoon" },
            { time: "3:30 PM", period: "afternoon" },
            { time: "4:30 PM", period: "afternoon" },
            { time: "5:30 PM", period: "afternoon" },
          ]);
        }
      } else {
        setTimeSlots([]);
        setBookedSlots([]);
        setOperationalMessage("");
      }
    };

    fetchSlotsAndBookings();
  }, [formState.doctorId, formState.appointmentDate, formState.consultationType, formState.branch]);

  useEffect(() => {
    const childIdFromURL = queryParams.get("childId");

    if (childIdFromURL && children.length > 0) {
      const selectedChild = children.find(
        (child) => child._id === childIdFromURL
      );

      if (selectedChild) {
        setFormState((prevState) => ({
          ...prevState,
          childId: childIdFromURL,
          childName: selectedChild.name || "",
          childAge: calculateAge(selectedChild.dob),
          dob: selectedChild.dob
            ? new Date(selectedChild.dob).toISOString().split("T")[0]
            : "",
          gender: selectedChild.gender || "",
          schoolName: selectedChild.schoolName || "",
          classGrade: selectedChild.classGrade || "",
          schoolBoard: selectedChild.schoolBoard || "",
        }));
      }
    }
  }, [children, queryParams]);

  // Check for existing appointments on selected date
  useEffect(() => {
    const checkDateConflicts = async () => {
      if (formState.appointmentDate && formState.parentId) {
        try {
          const response = await axios.get(
            `/api/parents/getappointments/${formState.parentId}`,
            {
              headers: { Authorization: sessionStorage.getItem("token") },
            }
          );
          
          const selectedDate = new Date(formState.appointmentDate);
          const existingAppointment = response.data.appointments.find(appointment => {
            const appointmentDate = new Date(appointment.appointmentDate);
            return appointmentDate.toDateString() === selectedDate.toDateString() &&
                   (appointment.status === 'pending' || appointment.status === 'approved');
          });

          if (existingAppointment) {
            setDateConflictWarning(
              `You already have an appointment scheduled for ${existingAppointment.childId.name} on this date. Only one appointment per day is allowed.`
            );
          } else {
            setDateConflictWarning("");
          }
        } catch (error) {
          console.error("Error checking appointment conflicts:", error);
          setDateConflictWarning("");
        }
      } else {
        setDateConflictWarning("");
      }
    };

    checkDateConflicts();
  }, [formState.appointmentDate, formState.parentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    initializeParent();
    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        if (key !== "childId") {
          formData.append(key, value);
        }
      });
      if (pdf) {
        formData.append("pdf", pdf);
      }

      formData.append("centreId", formState.branch);

      await axios.post("/api/admins/bookAppointment", formData, {
        headers: {
          Authorization: sessionStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Appointment booked successfully!");
      setButtonLoading(false);
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      const errorMessage = error.response?.data || "Failed to book appointment. Please try again.";
      toast.error(errorMessage);
      console.error("Error booking appointment:", error);
      setButtonLoading(false);
    }
  };

  const handleTimeSelect = (selectedTime) => {
    if (!bookedSlots.includes(selectedTime)) {
      updateFormState("time", selectedTime);
    }
  };

  const isTimeInPast = (time) => {
    if (formState.appointmentDate === new Date().toISOString().split("T")[0]) {
      const [hourStr, minuteStr] = time
        .replace(/(AM|PM)/, "")
        .trim()
        .split(":");
      const isPM = time.includes("PM") && hourStr !== "12";
      const hour = isPM ? parseInt(hourStr) + 12 : parseInt(hourStr);
      const minute = parseInt(minuteStr);

      const appointmentTime = new Date();
      appointmentTime.setHours(hour, minute, 0);

      return appointmentTime <= new Date();
    }
    return false;
  };

  const getAvailableTimes = () => {
    // Filter by morning/afternoon and availability
    return timeSlots
      .filter((slot) => slot.period === timePeriod)
      .filter((slot) => !bookedSlots.includes(slot.time))
      .filter((slot) => !isTimeInPast(slot.time))
      .map((slot) => slot.time);
  };

  const validateForm = () => {
    const requiredFields = [
      "childName",
      "childAge",
      "parentName",
      "parentPhoneNo",
      "appointmentDate",
      "time",
      "doctorId",
    ];
    const requiredFieldsValid = requiredFields.every((field) => formState[field]);
    const noDateConflict = !dateConflictWarning;
    return requiredFieldsValid && noDateConflict;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <ToastContainer />
      <div className="flex justify-center">
        <div className="w-full md:w-4/5 lg:w-2/3">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-[#ab1c1c] border-b py-4 text-center">
              <h2 className="text-2xl font-semibold text-white">
                Book Appointment
              </h2>
            </div>

            {sessionStorage.getItem("role") === "parent" && isLoading && (
              <div className="bg-red-50 px-6 py-3 flex justify-center items-center">
                <div className="flex items-center">
                  {/* <Loader size={1} /> */}
                  <p className="text-[#ab1c1c] ml-2">Loading your details...</p>
                </div>
              </div>
            )}

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <FormSection title="Child Information" />

                {sessionStorage.getItem("role") === "parent" &&
                  children.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select a Child
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                        onChange={(e) => handleChildSelect(e.target.value)}
                        value={formState.childId || ""}
                      >
                        <option value="">-- Select a Child --</option>
                        {children.map((child) => (
                          <option key={child._id} value={child._id}>
                            {child.name || "Unnamed Child"}
                          </option>
                        ))}
                        <option value="new">+ Add a New Child</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Select an existing child or enter details for a new
                        child below
                      </p>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Child Name" required>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.childName}
                      onChange={(e) =>
                        updateFormState("childName", e.target.value)
                      }
                      required
                    />
                  </FormField>

                  <FormField label="Child Age" required>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] bg-gray-50"
                      value={formState.childAge}
                      readOnly
                      disabled
                      tabIndex="-1"
                      placeholder="Age will be calculated from Date of Birth"
                    />
                  </FormField>

                  <FormField label="Date of Birth" required>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.dob}
                      onChange={(e) => {
                        const dobValue = e.target.value;
                        updateFormState("dob", dobValue);

                        if (dobValue) {
                          const age = calculateAge(dobValue);
                          updateFormState("childAge", age);
                        } else {
                          updateFormState("childAge", "");
                        }
                      }}
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.gender}
                      onChange={(e) =>
                        updateFormState("gender", e.target.value)
                      }
                      required
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Other</option>
                    </select>
                  </FormField>

                  <FormSection title="Parent Information" />

                  <FormField label="Parent Name" required>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.parentName}
                      onChange={(e) =>
                        updateFormState("parentName", e.target.value)
                      }
                      required
                    />
                  </FormField>



                  <FormField label="Parent Phone Number" required>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.parentPhoneNo}
                      onChange={(e) =>
                        updateFormState("parentPhoneNo", e.target.value)
                      }
                      required
                    />
                  </FormField>

                  <FormField label="Alternate Number">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.alternativeNumber}
                      onChange={(e) =>
                        updateFormState("alternativeNumber", e.target.value)
                      }
                    />
                  </FormField>

                  <FormField label="Concerns" required>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      rows="3"
                      value={formState.childConcerns}
                      onChange={(e) =>
                        updateFormState("childConcerns", e.target.value)
                      }
                      required
                    ></textarea>
                  </FormField>

                  <FormField label="Address">
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      rows="3"
                      value={formState.address}
                      onChange={(e) =>
                        updateFormState("address", e.target.value)
                      }
                    ></textarea>
                  </FormField>

                  <FormSection title="School Information" />

                  <FormField label="School Name">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.schoolName}
                      onChange={(e) =>
                        updateFormState("schoolName", e.target.value)
                      }
                    />
                  </FormField>

                  <FormField label="Class/Grade">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.classGrade}
                      onChange={(e) =>
                        updateFormState("classGrade", e.target.value)
                      }
                    />
                  </FormField>

                  <FormField label="School Board">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.schoolBoard}
                      onChange={(e) =>
                        updateFormState("schoolBoard", e.target.value)
                      }
                    >
                      <option value="">Select School Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="SSC">SSC</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Camebridge (IB)">Cambridge (IB)</option>
                      <option value="NIOS">NIOS</option>
                      <option value="Others">Others</option>
                    </select>
                  </FormField>

                  <FormField label="Referred By">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.referredBy}
                      onChange={(e) =>
                        updateFormState("referredBy", e.target.value)
                      }
                    />
                  </FormField>

                  <FormSection title="Appointment Details" />

                  <FormField label="Appointment Date" required>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.appointmentDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        if (isSunday(selectedDate)) {
                          alert("Appointments cannot be scheduled on Sundays. Please select another date.");
                          return;
                        }
                        updateFormState("appointmentDate", selectedDate);
                        // Clear time selection when date changes
                        updateFormState("time", "");
                      }}
                      min={getMinDateExcludingSundays()}
                      max={getMaxDate()}
                      required
                    />
                  </FormField>

                  {dateConflictWarning && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Warning:</span>
                      </div>
                      <p className="mt-1 text-sm">{dateConflictWarning}</p>
                    </div>
                  )}

                  <FormField label="Select Doctor" required>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.doctorId}
                      onChange={(e) => {
                        updateFormState("doctorId", e.target.value);
                        // Clear branch and time when doctor changes
                        updateFormState("branch", "");
                        updateFormState("time", "");
                      }}
                      required
                    >
                      <option value="">-- Select a Doctor --</option>
                      {allDoctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Select Branch" required>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      value={formState.branch}
                      onChange={(e) => {
                        updateFormState("branch", e.target.value);
                        // Clear time when branch changes
                        updateFormState("time", "");
                      }}
                      required
                      disabled={!formState.doctorId}
                    >
                      <option value="">-- Select a Branch --</option>
                      {centres.map((centre) => (
                        <option key={centre._id} value={centre._id}>
                          {centre.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <div className="md:col-span-2">
                    <FormField label="Select Consultation type" required>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                        value={formState.consultationType}
                        onChange={(e) =>
                          updateFormState("consultationType", e.target.value)
                        }
                        required
                      >
                        <option value="">Select Consultation Type</option>
                        <option value="New Consultation">
                          New Consultation Rs.700/-
                        </option>
                        <option value="Assessment(IQ)">
                          Assessment (IQ) Rs.6000/-
                        </option>
                        <option value="For IB board Assessment(IQ)">
                          For IB board Assessment (IQ) Rs.12000/-
                        </option>
                      </select>
                    </FormField>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Select Time Period">
                      <div className="flex items-center space-x-4 my-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-[#ab1c1c]"
                            name="timePeriod"
                            value="morning"
                            checked={timePeriod === "morning"}
                            onChange={() => {
                              setTimePeriod("morning");
                              updateFormState("time", "");
                            }}
                          />
                          <span className="ml-2">
                            Morning (10:30 AM - 11:30 AM)
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-[#ab1c1c]"
                            name="timePeriod"
                            value="afternoon"
                            checked={timePeriod === "afternoon"}
                            onChange={() => {
                              setTimePeriod("afternoon");
                              updateFormState("time", "");
                            }}
                          />
                          <span className="ml-2">
                            Afternoon/Evening (12:30 PM - 5:30 PM)
                          </span>
                        </label>
                      </div>
                    </FormField>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Available Time Slots" required>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {isHoliday ? (
                          <div className="w-full p-6 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-lg">
                            <div className="text-center">
                              <p className="text-orange-800 font-bold text-lg mb-2">
                                Holiday - {holidayName}
                              </p>
                              <p className="text-orange-700">
                                No appointments can be booked on this holiday. Please select a different date.
                              </p>
                            </div>
                          </div>
                        ) : operationalMessage ? (
                          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div>
                                <p className="text-red-800 font-medium">Center Not Operational</p>
                                <p className="text-red-700 text-sm mt-1">
                                  The selected center is not operational on this date. Please choose a different date or contact the center for more information.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : getAvailableTimes().length > 0 ? (
                          getAvailableTimes().map((time) => (
                            <button
                              type="button"
                              key={time}
                              className={`px-4 py-2 rounded-md ${
                                formState.time === time
                                  ? "bg-[#ab1c1c] text-white"
                                  : "border border-[#ab1c1c] text-[#ab1c1c] hover:bg-red-50"
                              }`}
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </button>
                          ))
                        ) : (
                          <p className="text-orange-600 italic">
                            {!formState.doctorId || !formState.appointmentDate
                              ? "Please select a doctor and date to see available time slots"
                              : "No time slots available for the selected period. Please try another date or time period."}
                          </p>
                        )}
                      </div>
                    </FormField>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Upload Previous Reports (Optional)">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                        onChange={(e) => setPDF(e.target.files[0])}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Upload previous medical reports or assessments (PDF,
                        DOC, DOCX)
                      </p>
                    </FormField>
                  </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <button
                    type="button"
                    className="w-full md:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`w-full md:w-auto px-6 py-2 rounded-md text-white bg-[#ab1c1c] hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] ${
                      !validateForm() || buttonLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!validateForm() || buttonLoading}
                  >
                    {buttonLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader size={5} />
                        <span className="ml-2">Booking...</span>
                      </div>
                    ) : (
                      "Book Appointment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
