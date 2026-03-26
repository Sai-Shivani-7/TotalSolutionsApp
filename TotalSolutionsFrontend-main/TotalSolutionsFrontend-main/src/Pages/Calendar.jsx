import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dustbin from "../assets/Delete.png";

// ---------------------------------------------
// --- LOADER COMPONENT ---
// ---------------------------------------------
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ab1c1c]"></div>
  </div>
);

// ---------------------------------------------
// --- CALENDAR GRID COMPONENT ---
// ---------------------------------------------
const CalendarGrid = ({ currentDate, setCurrentDate, handleDayClick, role, setShowEditHolidaysPopup, holidays = [] }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // --- Check if a date is a holiday ---
  const isHoliday = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
      return holidayDate === dateStr;
    });
  };

  // --- Generate Calendar Days ---
  const calendarDays = useMemo(() => {
    const totalSlots = [];
    const today = new Date();
    const todayDate = today.getDate();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    
    // Empty slots for previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      totalSlots.push({ day: null, isCurrentMonth: false });
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === todayDate;
      const isHolidayDay = isHoliday(day);
      totalSlots.push({ day, isCurrentMonth: true, isToday, isHoliday: isHolidayDay });
    }
    
    return totalSlots;
  }, [year, month, firstDayOfMonth, daysInMonth, holidays, isHoliday]);

  // --- Handle Month Navigation ---
  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-sm"> 
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <button
          onClick={handlePrevMonth}
          className="text-[#ab1c1c] text-xl p-1"
        >
          Prev
        </button>
        <h3 className="text-xl font-bold text-[#ab1c1c]">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="text-[#ab1c1c] text-xl p-1"
        >
          Next
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-700 mb-2 w-full">
        {days.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 text-center w-full">
        {calendarDays.map((slot, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition duration-150 mx-auto
              ${slot.day
                ? "cursor-pointer hover:bg-red-100" // Lighter hover
                : "text-gray-300"}
              ${slot.isToday && slot.isHoliday
                ? "bg-gradient-to-br from-[#ab1c1c] to-green-500 text-white font-bold ring-2 ring-yellow-400" // Today + Holiday: gradient with gold ring
                : slot.isToday
                ? "bg-[#ab1c1c] text-white font-bold ring-2 ring-red-300" // Today only
                : slot.isHoliday
                ? "bg-green-500 text-white font-semibold" // Holiday only
                : slot.day
                ? "text-gray-800"
                : ""}
            `}
            onClick={slot.day ? () => handleDayClick(slot.day) : null}
          >
            {slot.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-[#ab1c1c] rounded-full"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-br from-[#ab1c1c] to-green-500 rounded-full ring-1 ring-yellow-400"></div>
            <span className="text-gray-600">Today + Holiday</span>
          </div>
        </div>
      </div>

      {/* Edit Holidays Button */}
      {role === "superadmin" && (
        <button
          onClick={() => setShowEditHolidaysPopup(true)}
          className="mt-4 w-full bg-[#ab1c1c] hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition duration-150 shadow-lg"
        >
          Edit Holidays
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------
// --- HOLIDAYS LIST COMPONENT ---
// ---------------------------------------------
const HolidaysList = ({ holidays }) => {
  // Find the next upcoming holiday
  const today = new Date();
  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingHolidays = sortedHolidays.filter(
    (holiday) => new Date(holiday.date).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)
  );
  const nextHoliday = upcomingHolidays[0] || null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-4">Upcoming Holidays</h2>

      {/* Scrollable container */}
      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
        {upcomingHolidays.length > 0 ? (
          upcomingHolidays.map((holiday, index) => {
            const isNextHoliday = nextHoliday && holiday._id === nextHoliday._id;
            const cardClasses = isNextHoliday
              ? "bg-red-100 border-l-8 border-red-500 shadow-md transform scale-[1.02]" // Highlighted
              : "bg-red-50 border-l-4 border-[#ab1c1c] shadow-sm hover:bg-red-100"; // Normal

            return (
              <div
                key={holiday._id || index}
                className={`flex justify-between items-center p-3 rounded-lg transition duration-300 ${cardClasses}`}
              >
                <span className={`text-gray-800 ${isNextHoliday ? "font-bold" : "font-semibold"}`}>
                  {holiday.name}
                </span>
                <span className={`text-sm text-gray-700 ${isNextHoliday ? "font-bold" : ""}`}>
                  {formatDate(holiday.date)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No upcoming holidays scheduled.</p>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------
// --- EDIT HOLIDAYS POPUP COMPONENT ---
// ---------------------------------------------
const EditHolidaysPopup = ({ holidays, onSave, onClose }) => {
  const [editableHolidays, setEditableHolidays] = useState(holidays);
  const [newHolidayDateInput, setNewHolidayDateInput] = useState("");
  const [newHolidayOccasion, setNewHolidayOccasion] = useState("");
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [deletingHolidayId, setDeletingHolidayId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const token = sessionStorage.getItem("token");

  const handleDeleteHoliday = async (index) => {
    const holidayToDelete = editableHolidays[index];
    setDeletingHolidayId(holidayToDelete._id);

    if (holidayToDelete._id) {
      try {
        await axios.delete(`/api/superadmin/holidays/${holidayToDelete._id}`, {
          headers: { Authorization: `${token}` },
        });
      } catch (err) {
        console.error("Error deleting holiday:", err);
        alert("Failed to delete holiday.");
        setDeletingHolidayId(null);
        return;
      }
    }

    setEditableHolidays((prev) => prev.filter((_, i) => i !== index));
    setDeletingHolidayId(null);
  };

  const handleAddHoliday = async () => {
    if (newHolidayDateInput && newHolidayOccasion) {
      setIsAddingHoliday(true);
      try {
        await axios.post(
          "/api/superadmin/holidays",
          {
            name: newHolidayOccasion,
            date: newHolidayDateInput,
          },
          { headers: { Authorization: `${token}` } }
        );
        setNewHolidayDateInput("");
        setNewHolidayOccasion("");
        // Refresh the list from API to get the new _id and ensure data is correct
        const res = await axios.get("/api/superadmin/holidays", {
          headers: { Authorization: `${token}` },
        });
        setEditableHolidays(res.data.data);
      } catch (err) {
        console.error("Error adding holiday:", err);
        alert("Failed to add holiday.");
      } finally {
        setIsAddingHoliday(false);
      }
    } else {
      alert("Please enter both date and occasion for the new holiday.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      onClose();
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto relative border-t-4 border-[#ab1c1c]">
        <h3 className="text-xl font-bold text-[#ab1c1c] mb-4 text-center">Edit Holidays</h3>

        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
          {editableHolidays.length > 0 ? (
            editableHolidays.map((holiday, index) => (
              <div key={holiday._id || index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border-l-2 border-gray-300">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold text-gray-700">
                    {formatDate(holiday.date)}:
                  </span>{" "}
                  {holiday.name}
                </p>
                <button
                  onClick={() => handleDeleteHoliday(index)}
                  disabled={deletingHolidayId === holiday._id}
                  className="text-red-600 hover:text-red-800 p-1 rounded-full transition duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingHolidayId === holiday._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <img src={dustbin} alt="Delete" className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">No holidays added yet.</p>
          )}
        </div>

        <div className="mb-6 border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Add New Holiday</h4>
          <div className="grid grid-cols-3 gap-3 mb-3 items-end"> 
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={newHolidayDateInput}
                onChange={(e) => setNewHolidayDateInput(e.target.value)}
                disabled={isAddingHoliday}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#ab1c1c] focus:border-[#ab1c1c] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Occasion</label>
              <input
                type="text"
                value={newHolidayOccasion}
                onChange={(e) => setNewHolidayOccasion(e.target.value)}
                disabled={isAddingHoliday}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#ab1c1c] focus:border-[#ab1c1c] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Christmas"
              />
            </div>
            <button
              onClick={handleAddHoliday}
              disabled={isAddingHoliday || !newHolidayDateInput || !newHolidayOccasion}
              className="col-span-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-md transition duration-150 text-sm flex items-center justify-center"
            >
              {isAddingHoliday ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isAddingHoliday || deletingHolidayId}
          className="w-full bg-[#ab1c1c] hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 rounded-md transition duration-150 shadow-lg flex items-center justify-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------
// --- MAIN CALENDAR COMPONENT ---
// ---------------------------------------------
export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [showEditHolidaysPopup, setShowEditHolidaysPopup] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    setUserRole(role);
    fetchHolidays();
  }, [navigate]);

  const fetchHolidays = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = sessionStorage.getItem("token");
      const res = await axios.get("/api/superadmin/holidays", {
        headers: { Authorization: `${token}` },
      });
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#ab1c1c] mb-4">Calendar</h1>
      <div className="flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Calendar Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-xl p-4 flex justify-center min-w-[300px]">
          <CalendarGrid
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            handleDayClick={(day) => console.log("Clicked day:", day)}
            role={sessionStorage.getItem("role")}
            setShowEditHolidaysPopup={setShowEditHolidaysPopup}
            holidays={holidays}
          />
        </div>
        
        {/* Holidays Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-xl p-4 min-w-[300px]">
          <HolidaysList holidays={holidays} />
        </div>
      </div>

      {/* Edit Popup */}
      {userRole === "superadmin" && showEditHolidaysPopup && (
        <EditHolidaysPopup
          holidays={holidays}
          onSave={() => fetchHolidays(true)}
          onClose={() => setShowEditHolidaysPopup(false)}
        />
      )}
      
      {/* Refresh Loading Overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ab1c1c]"></div>
            <span className="text-gray-700 font-medium">Refreshing holidays...</span>
          </div>
        </div>
      )}
    </div>
  );
}