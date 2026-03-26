import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import Loader from "../../Components/Loader";

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

export default function AdminAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const centreChild = queryParams.get("childId");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [formState, setFormState] = useState({
    childName: "",
    childAge: "",
    parentName: "",
    parentId: null,
    email: "",
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
  const [doctors, setDoctors] = useState([]);
  const [centres, setCentres] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pdf, setPDF] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [timePeriod, setTimePeriod] = useState("morning");
  const [operationalMessage, setOperationalMessage] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");

  // Countdown effect for auto-navigation
  useEffect(() => {
    if (bookingSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [bookingSuccess, navigate]);

  const updateFormState = (key, value) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
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




  useEffect(() => {
    const fetchChildAndParentDetails = async () => {
      if (centreChild) {
        setIsLoading(true);
        try {
          const childResponse = await axios.get(`/api/data/parent/${centreChild}`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          });
          const childData = childResponse.data;

          let age = "";
          if (childData.dob) {
            const birthDate = new Date(childData.dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();

            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }

          setFormState((prevState) => ({
            ...prevState,
            childName: childData.name || "",
            childAge: age.toString(),
            dob: childData.dob
              ? new Date(childData.dob).toISOString().split("T")[0]
              : "",
            gender: childData.gender || "",
            schoolName: childData.schoolName || "",
            classGrade: childData.classGrade || "",
            schoolBoard: childData.schoolBoard || "",
            parentId: childData.parentId || null,
          }));

          if (childData.parentId) {
            const parentResponse = await axios.get(
              `/api/data/allUsers/${childData.parentId}`,
              {
                headers: { Authorization: sessionStorage.getItem("token") },
              }
            );
            const parentData = parentResponse.data;

            setFormState((prevState) => ({
              ...prevState,
              parentName: parentData.name || "",
              parentPhoneNo: parentData.mobilenumber || "",
              address: parentData.address || "",
              alternativeNumber: parentData.mobilenumber || "",
            }));
          }
        } catch {
          toast.error("Failed to fetch child or parent details");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchChildAndParentDetails();
  }, [centreChild]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const centreId = sessionStorage.getItem("centreId");
        const response = await axios.get(`/api/data/alldoctors/${centreId}`, {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setDoctors(response.data.doctors);
      } catch (err) {
        console.error('Error fetching centres:', err);
        toast.error("Error fetching centres");
      }
    };
    fetchAllDoctors();
    fetchDoctors();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split("T")[0];
    updateFormState("appointmentDate", formattedTomorrow);
  }, []);

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
          console.error("Error fetching slots:", error);
          toast.error("Error fetching available slots");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);
    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (pdf) {
        formData.append("pdf", pdf);
      }

      formData.append("centreId", sessionStorage.getItem("centreId"));

      if (formState.parentId) {
        formData.append("parentId", formState.parentId);
      }

      await axios.post("/api/admins/bookAppointment", formData, {
        headers: {
          Authorization: sessionStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Appointment Details", 10, 10);
      doc.setFontSize(12);
      doc.text(`Child Name: ${formState.childName}`, 10, 20);
      doc.text(`Child Age: ${formState.childAge}`, 10, 30);
      doc.text(`Parent Name: ${formState.parentName}`, 10, 40);

      doc.text(`Parent Phone Number: ${formState.parentPhoneNo}`, 10, 60);
      doc.text(`Appointment Date: ${formState.appointmentDate}`, 10, 70);
      doc.text(`Time: ${formState.time}`, 10, 80);
      doc.text(
        `Doctor: ${doctors.find((doc) => doc._id === formState.doctorId)?.name || "N/A"
        }`,
        10,
        90
      );
      doc.text(
        `Branch: ${centres.find((centre) => centre._id === formState.branch)?.name ||
        "N/A"
        }`,
        10,
        100
      );
      doc.text(`Consultation Type: ${formState.consultationType}`, 10, 110);
      doc.text(`Child Concerns: ${formState.childConcerns}`, 10, 120);
      doc.text(`Address: ${formState.address}`, 10, 130);
      doc.text(`School Name: ${formState.schoolName}`, 10, 140);
      doc.text(`Class/Grade: ${formState.classGrade}`, 10, 150);
      doc.text(`School Board: ${formState.schoolBoard}`, 10, 160);
      doc.text(`Referred By: ${formState.referredBy}`, 10, 170);

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfDownloadUrl(pdfUrl);

      toast.success("Appointment booked successfully!");
      setIsButtonLoading(false);
      setBookingSuccess(true);
      setCountdown(10);
    } catch (error) {
      toast.error(
        error.response?.data || "Failed to book appointment. Please try again."
      );
      setIsButtonLoading(false);
    }
  };

  const handleTimeSelect = (selectedTime) => {
    if (!bookedSlots.includes(selectedTime)) {
      updateFormState("time", selectedTime);
    }
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
    return requiredFields.every((field) => formState[field]);
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isTimeSlotPast = (timeString) => {
    if (!isToday(formState.appointmentDate)) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const [timePart, ampm] = timeString.split(" ");
    let [hour, minutes] = timePart.split(":").map(Number);

    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    if (hour < currentHour) return true;
    if (hour === currentHour && minutes <= currentMinutes) return true;
    return false;
  };

  const getAvailableTimes = () => {
    // Filter by morning/afternoon and availability
    return timeSlots
      .filter((slot) => slot.period === timePeriod)
      .filter((slot) => !bookedSlots.includes(slot.time))
      .filter((slot) => !isTimeSlotPast(slot.time))
      .map((slot) => slot.time);
  };

  const handleBookAnother = () => {
    setBookingSuccess(false);
    setPdfDownloadUrl(null);
    setFormState({
      childName: "",
      childAge: "",
      parentName: "",
      parentId: null,
      email: "",
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
    setPDF(null);
  };

  const handleBackToDashboard = () => {
    navigate(-1);
  };

  return (
    <div className="max-width mx-auto mt-4 mb-10 py-12 px-4">
      <ToastContainer />
      {isLoading ? (
        <Loader />
      ) : bookingSuccess ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg text-center p-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Booked Successfully!</h2>
            <p className="text-gray-600 mb-2">
              You will be redirected back in {countdown} seconds...
            </p>
            <p className="text-gray-600 mb-8">
              You can download the appointment details below.
            </p>

            {pdfDownloadUrl && (
              <div className="mb-8">
                <a
                  href={pdfDownloadUrl}
                  download="appointment_details.pdf"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 w-full"
                >
                  Download Appointment Details
                </a>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleBookAnother}
                className="px-6 py-3 border border-red-700 text-red-700 font-medium rounded-md hover:bg-red-50 flex-1"
              >
                Book Another Appointment
              </button>
              <button
                onClick={handleBackToDashboard}
                className="px-6 py-3 bg-red-700 text-white font-medium rounded-md hover:bg-red-800 flex-1"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full md:w-11/12 lg:w-5/6">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-red-700 border-b py-4 text-center">
                <h2 className="text-2xl font-semibold text-white">
                  Book Appointment
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800 pb-1">
                      Child Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.childName}
                        onChange={(e) =>
                          updateFormState("childName", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.dob}
                        onChange={(e) => {
                          const dobValue = e.target.value;
                          updateFormState("dob", dobValue);

                          // Calculate and update age when DOB changes
                          if (dobValue) {
                            const birthDate = new Date(dobValue);
                            const today = new Date();
                            let age =
                              today.getFullYear() - birthDate.getFullYear();

                            // Adjust age if birthday hasn't occurred yet this year
                            const m = today.getMonth() - birthDate.getMonth();
                            if (
                              m < 0 ||
                              (m === 0 && today.getDate() < birthDate.getDate())
                            ) {
                              age--;
                            }

                            updateFormState("childAge", age.toString());
                          } else {
                            updateFormState("childAge", "");
                          }
                        }}
                        max={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
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
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800  pb-1">
                        Parent Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.parentName}
                        onChange={(e) =>
                          updateFormState("parentName", e.target.value)
                        }
                        required
                      />
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Phone Number
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.parentPhoneNo}
                        onChange={(e) =>
                          updateFormState("parentPhoneNo", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.alternativeNumber}
                        onChange={(e) =>
                          updateFormState("alternativeNumber", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concerns<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        rows="3"
                        value={formState.childConcerns}
                        onChange={(e) =>
                          updateFormState("childConcerns", e.target.value)
                        }
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        rows="3"
                        value={formState.address}
                        onChange={(e) =>
                          updateFormState("address", e.target.value)
                        }
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800  pb-1">
                        School Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.schoolName}
                        onChange={(e) =>
                          updateFormState("schoolName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class/Grade
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.classGrade}
                        onChange={(e) =>
                          updateFormState("classGrade", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Board
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referred By
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.referredBy}
                        onChange={(e) =>
                          updateFormState("referredBy", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800  pb-1">
                        Appointment Details
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Appointment Date<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.appointmentDate}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          if (isSunday(selectedDate)) {
                            toast.error("Appointments cannot be scheduled on Sundays. Please select another date.");
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Doctor<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Branch<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.branch}
                        onChange={(e) => {
                          updateFormState("branch", e.target.value);
                          // Clear time when branch changes
                          updateFormState("time", "");
                        }}
                        required
                        disabled={!formState.doctorId}
                      >
                        <option value="">Select Branch</option>
                        {centres.map((centre) => (
                          <option key={centre._id} value={centre._id}>
                            {centre.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Consultation type
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
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
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time Period
                      </label>
                      <div className="flex items-center space-x-4 my-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-red-700"
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
                            className="form-radio text-red-700"
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
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
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
                                  ? "bg-red-700 text-white"
                                  : "border border-red-700 text-red-800 hover:bg-red-50"
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
                      {formState.appointmentDate &&
                        isToday(formState.appointmentDate) && (
                          <p className="mt-2 text-sm text-gray-500 italic">
                            Note: Time slots for today that have already passed
                            are not shown.
                          </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="font-[sans-serif] max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload previous reports (if any)
                        </label>
                        <input
                          type="file"
                          className="w-full text-gray-400 font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded"
                          onChange={(e) => setPDF(e.target.files[0])}
                          accept=".pdf"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Only PDFs are Allowed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isButtonLoading ? (
                    <Loader />
                  ) : (
                    <div className="mt-6">
                      <button
                        type="submit"
                        className={`w-full md:w-auto px-6 py-3 text-white font-medium rounded-md ${validateForm()
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-gray-400 cursor-not-allowed"
                          }`}
                        disabled={!validateForm()}
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}