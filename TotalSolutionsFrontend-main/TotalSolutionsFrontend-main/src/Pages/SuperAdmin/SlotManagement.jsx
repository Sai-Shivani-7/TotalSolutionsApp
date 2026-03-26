import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Loader from '../../Components/Loader';



const DEFAULT_TIME_SLOTS = [
  '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
];

// Utility function to check if a date is Sunday
const isSunday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString + 'T00:00:00');
  return date.getDay() === 0;
};

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

export default function SlotManagement() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slotConfiguration, setSlotConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotHour, setSlotHour] = useState('');
  const [slotMinute, setSlotMinute] = useState('');
  const [slotPeriod, setSlotPeriod] = useState('AM');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showOperationalModal, setShowOperationalModal] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [slotToConfirm, setSlotToConfirm] = useState('');
  const [confirmBlockReason, setConfirmBlockReason] = useState('');
  const [operationalStatus, setOperationalStatus] = useState(true);
  const [operationalReason, setOperationalReason] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  
  // Bulk blocking feature states
  const [bulkMode, setBulkMode] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctorForBulk, setSelectedDoctorForBulk] = useState('');
  const [doctorCenters, setDoctorCenters] = useState([]);
  const [selectedCentersForBlock, setSelectedCentersForBlock] = useState([]);
  const [selectedCentersForUnblock, setSelectedCentersForUnblock] = useState([]);
  const [bulkDate, setBulkDate] = useState('');
  const [showBulkBlockModal, setShowBulkBlockModal] = useState(false);
  const [bulkBlockReason, setBulkBlockReason] = useState('');
  const [centerStatuses, setCenterStatuses] = useState(null);
  const [showBulkUnblockModal, setShowBulkUnblockModal] = useState(false);
  const [bulkOperation, setBulkOperation] = useState('block'); // 'block' or 'unblock'
  
  // Get current selection based on operation mode
  const getCurrentSelection = () => bulkOperation === 'block' ? selectedCentersForBlock : selectedCentersForUnblock;
  const setCurrentSelection = (centers) => {
    if (bulkOperation === 'block') {
      setSelectedCentersForBlock(centers);
    } else {
      setSelectedCentersForUnblock(centers);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchCenters();
    fetchAllDoctors();
    
    // Parse URL query parameters for direct linking
    const searchParams = new URLSearchParams(location.search);
    const centreId = searchParams.get('centreId');
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    
    if (centreId) {
      setSelectedCenter(centreId);
      fetchCenterDoctors(centreId);
    }
    if (doctorId) setSelectedDoctor(doctorId);
    if (date) {
      // Convert ISO date to YYYY-MM-DD format for input
      const dateObj = new Date(date);
      const formattedDate = dateObj.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
    }
  }, [location.search]);

  // Fetch doctors when center changes
  useEffect(() => {
    if (selectedCenter) {
      fetchCenterDoctors(selectedCenter);
      setSelectedDoctor(''); // Reset selected doctor when center changes
    } else {
      setDoctors([]);
      setSelectedDoctor('');
    }
  }, [selectedCenter]);

  // Fetch center statuses when bulk doctor or date changes
  useEffect(() => {
    if (bulkMode && selectedDoctorForBulk && bulkDate) {
      fetchCenterStatuses();
    } else {
      setCenterStatuses(null);
    }
  }, [selectedDoctorForBulk, bulkDate, bulkMode]);

  // Reset holiday state when center, doctor, or date changes
  useEffect(() => {
    setIsHoliday(false);
    setHolidayName('');
    setSlotConfiguration(null);
  }, [selectedCenter, selectedDoctor, selectedDate]);

  const fetchCenters = async () => {
    try {
      const response = await axios.get('/api/superadmin/centres', {
        headers: { Authorization: sessionStorage.getItem('token') }
      });
      setCenters(response.data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
      // toast.error('Failed to fetch centers');
      setCenters([]);
    }
  };

  const fetchCenterDoctors = async (centreId) => {
    try {
      const response = await axios.get(`/api/superadmin/center-doctors/${centreId}`, {
        headers: { Authorization: sessionStorage.getItem('token') }
      });
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching center doctors:', error);
      // toast.error('Failed to fetch doctors for this center');
      setDoctors([]);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await axios.get('/api/superadmin/doctors', {
        headers: { Authorization: sessionStorage.getItem('token') }
      });
      setAllDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching all doctors:', error);
      // toast.error('Failed to fetch doctors');
      setAllDoctors([]);
    }
  };

  const fetchDoctorCenters = async (doctorId) => {
    try {
      const doctor = allDoctors.find(doc => doc._id === doctorId);
      if (doctor && doctor.centreIds) {
        setDoctorCenters(doctor.centreIds);
      } else {
        setDoctorCenters([]);
      }
    } catch (error) {
      console.error('Error fetching doctor centers:', error);
      setDoctorCenters([]);
    }
  };

  const fetchCenterStatuses = useCallback(async () => {
    if (!selectedDoctorForBulk || !bulkDate) {
      setCenterStatuses(null);
      return;
    }

    try {
      const response = await axios.get(
        `/api/superadmin/doctor-centers-status/${selectedDoctorForBulk}/${bulkDate}`,
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );
      setCenterStatuses(response.data);
    } catch (error) {
      console.error('Error fetching center statuses:', error);
      // toast.error('Failed to fetch center statuses');
      setCenterStatuses(null);
    }
  }, [selectedDoctorForBulk, bulkDate]);

  const handleBulkBlockSlots = async () => {
    if (!selectedDoctorForBulk || selectedCentersForBlock.length === 0 || !bulkDate) {
      toast.error('Please select doctor, centers, and date');
      return;
    }

    try {
      await axios.post(
        '/api/superadmin/bulk-block-slots',
        {
          doctorId: selectedDoctorForBulk,
          centreIds: selectedCentersForBlock,
          date: bulkDate,
          blockReason: bulkBlockReason || 'Bulk block operation',
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      toast.success(`Successfully blocked all slots for selected centers on ${bulkDate}`);
      setShowBulkBlockModal(false);
      setBulkBlockReason('');
      setSelectedCentersForBlock([]);
      // Refresh center statuses
      await fetchCenterStatuses();
    } catch (error) {
      console.error('Error bulk blocking slots:', error);
      toast.error('Failed to bulk block slots');
    }
  };

  const handleBulkUnblockSlots = async () => {
    if (!selectedDoctorForBulk || selectedCentersForUnblock.length === 0 || !bulkDate) {
      toast.error('Please select doctor, centers, and date');
      return;
    }

    try {
      await axios.post(
        '/api/superadmin/bulk-unblock-slots',
        {
          doctorId: selectedDoctorForBulk,
          centreIds: selectedCentersForUnblock,
          date: bulkDate,
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      toast.success(`Successfully unblocked all slots for selected centers on ${bulkDate}`);
      setShowBulkUnblockModal(false);
      setSelectedCentersForUnblock([]);
      // Refresh center statuses
      await fetchCenterStatuses();
    } catch (error) {
      console.error('Error bulk unblocking slots:', error);
      toast.error('Failed to bulk unblock slots');
    }
  };

  const fetchSlotConfiguration = async () => {
    if (!selectedCenter || !selectedDoctor || !selectedDate) {
      toast.error('Please select center, doctor and date');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `/api/superadmin/slot-config/${selectedCenter}/${selectedDoctor}?date=${selectedDate}`,
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );
      const config = response.data[0];
      
      // Check if it's a holiday
      if (config && config.isHoliday) {
        setIsHoliday(true);
        setHolidayName(config.holidayName);
        setSlotConfiguration(null);
      } else {
        setIsHoliday(false);
        setHolidayName('');
        setSlotConfiguration(config);
      }
    } catch (error) {
      console.error('Error fetching slot configuration:', error);
      toast.error('Failed to fetch slot configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!slotHour || !slotMinute) {
      toast.error('Please enter hour and minute');
      return;
    }

    // Build the time string in the format "H:MM AM/PM"
    const formattedTime = `${slotHour}:${slotMinute.padStart(2, '0')} ${slotPeriod}`;

    try {
      await axios.post(
        '/api/superadmin/add-slot',
        {
          doctorId: selectedDoctor,
          centreId: selectedCenter,
          date: selectedDate,
          slotTime: formattedTime
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      await fetchSlotConfiguration(); // Refresh the configuration
      setSlotHour('');
      setSlotMinute('');
      setSlotPeriod('AM');
      setShowAddSlotModal(false);
      // toast.success('Slot added successfully');
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot');
    }
  };

  const handleRemoveSlot = async (slotTime) => {
    try {
      await axios.post(
        '/api/superadmin/remove-slot',
        {
          doctorId: selectedDoctor,
          centreId: selectedCenter,
          date: selectedDate,
          slotTime: slotTime
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      await fetchSlotConfiguration(); // Refresh the configuration
    } catch (error) {
      console.error('Error removing slot:', error);
      toast.error('Failed to remove slot');
    }
  };

  const handleBlockSlot = async () => {
    if (!slotToConfirm) {
      toast.error('Please select a slot to block');
      return;
    }

    try {
      await axios.post(
        '/api/superadmin/block-slot',
        {
          doctorId: selectedDoctor,
          centreId: selectedCenter,
          date: selectedDate,
          slotTime: slotToConfirm,
          blockReason: confirmBlockReason || 'Blocked by admin',
          blockAllCenters: false // Block across all centers by default
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      await fetchSlotConfiguration(); // Refresh the configuration
      setShowBlockConfirmModal(false);
      setConfirmBlockReason('');
      setSlotToConfirm('');
    } catch (error) {
      console.error('Error blocking slot:', error);
      toast.error('Failed to block slot');
    }
  };

  const handleUnblockSlot = async (slotTime) => {
    try {
      await axios.post(
        '/api/superadmin/unblock-slot',
        {
          doctorId: selectedDoctor,
          centreId: selectedCenter,
          date: selectedDate,
          slotTime: slotTime
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      await fetchSlotConfiguration(); // Refresh the configuration
    } catch (error) {
      console.error('Error unblocking slot:', error);
      toast.error('Failed to unblock slot');
    }
  };

  const handleBlockAllSlots = async () => {
    if (!selectedCenter || !selectedDoctor || !selectedDate) {
      toast.error('Please select center, doctor and date');
      return;
    }

    if (window.confirm(`Are you sure you want to block ALL slots for this doctor in ${centers.find(c => c._id === selectedCenter)?.name} on ${selectedDate}?`)) {
      try {
        await axios.post(
          '/api/superadmin/block-all-slots',
          {
            doctorId: selectedDoctor,
            centreId: selectedCenter,
            date: selectedDate,
            blockReason: 'All slots blocked for the day'
          },
          {
            headers: { Authorization: sessionStorage.getItem('token') }
          }
        );

        await fetchSlotConfiguration(); // Refresh the configuration
        // toast.success('All slots blocked successfully');
      } catch (error) {
        console.error('Error blocking all slots:', error);
        toast.error('Failed to block all slots');
      }
    }
  };

  const handleOperationalStatusChange = async () => {
    try {
      await axios.post(
        '/api/superadmin/set-operational-status',
        {
          doctorId: selectedDoctor,
          centreId: selectedCenter,
          date: selectedDate,
          isOperational: operationalStatus,
          reason: operationalReason || undefined
        },
        {
          headers: { Authorization: sessionStorage.getItem('token') }
        }
      );

      await fetchSlotConfiguration(); // Refresh the configuration
      setShowOperationalModal(false);
      setOperationalReason('');
      // toast.success(`Operational status ${operationalStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating operational status:', error);
      toast.error('Failed to update operational status');
    }
  };

  const getSlotStatusColor = (slot) => {
    if (!slot.isActive) return 'bg-gray-100 text-gray-500 border-gray-300';
    if (slot.isBlocked) return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getSlotStatusText = (slot) => {
    if (!slot.isActive) return 'Inactive';
    if (slot.isBlocked) return 'Blocked';
    return 'Available';
  };

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#ab1c1c] mb-2">Slot Management</h1>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 mb-6">
            <div className="flex border-b border-red-200">
              <button
                onClick={() => setBulkMode(false)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  !bulkMode 
                    ? 'border-[#ab1c1c] text-[#ab1c1c] bg-red-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Individual Center Management
              </button>
              <button
                onClick={() => setBulkMode(true)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  bulkMode 
                    ? 'border-[#ab1c1c] text-[#ab1c1c] bg-red-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bulk Operations
              </button>
            </div>
          </div>

          {/* Bulk Operations Section */}
          {bulkMode && !isHoliday && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#ab1c1c]">Bulk Slot Operations</h2>
                
                {/* Operation Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setBulkOperation('block');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      bulkOperation === 'block'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Block Slots
                  </button>
                  <button
                    onClick={() => {
                      setBulkOperation('unblock');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      bulkOperation === 'unblock'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Unblock Slots
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                  <select
                    value={selectedDoctorForBulk}
                    onChange={(e) => {
                      setSelectedDoctorForBulk(e.target.value);
                      if (e.target.value) {
                        fetchDoctorCenters(e.target.value);
                      } else {
                        setDoctorCenters([]);
                        setSelectedCentersForBlock([]);
                        setSelectedCentersForUnblock([]);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  >
                    <option value="">Select Doctor</option>
                    {allDoctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (isSunday(selectedDate)) {
                        toast.error("Slots cannot be created on Sundays. Please select another date.");
                        return;
                      }
                      setBulkDate(selectedDate);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    min={getMinDateExcludingSundays()}
                  />
                </div>
              </div>

              {/* Centers Selection with Status */}
              {doctorCenters.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Centers for {bulkOperation === 'block' ? 'Blocking' : 'Unblocking'} *
                    </label>
                    <div className="flex items-center space-x-4">
                      {centerStatuses && (
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                            Blocked ({centerStatuses.summary.fullyBlocked})
                          </span>
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                            Partial ({centerStatuses.summary.partiallyBlocked})
                          </span>
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                            Available ({centerStatuses.summary.available})
                          </span>
                        </div>
                      )}
                      {doctorCenters.length > 0 && (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSelection(doctorCenters.map(center => center._id));
                            }}
                            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSelection([]);
                            }}
                            className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Unselect All
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg">
                    {doctorCenters.map((center) => {
                      const centerStatus = centerStatuses?.allCenters?.find(c => c.centreId === center._id);
                      const isBlocked = centerStatus?.status === 'fully_blocked';
                      const isPartial = centerStatus?.status === 'partially_blocked';
                      const isAvailable = centerStatus?.status === 'available';
                      
                      // Show all centers but with appropriate visual indicators
                      const currentSelection = getCurrentSelection();
                      
                      return (
                        <label key={center._id} className={`flex items-start p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${
                          isBlocked ? 'border-red-300 bg-red-50' :
                          isPartial ? 'border-yellow-300 bg-yellow-50' :
                          isAvailable ? 'border-green-300 bg-green-50' :
                          'border-gray-300 bg-gray-50'
                        }`}>
                          <input
                            type="checkbox"
                            checked={currentSelection.includes(center._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentSelection([...currentSelection, center._id]);
                              } else {
                                setCurrentSelection(currentSelection.filter(id => id !== center._id));
                              }
                            }}
                            className="mr-3 mt-1 h-4 w-4 text-[#ab1c1c] focus:ring-[#ab1c1c]"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{center.name}</div>
                            {centerStatus && (
                              <div className={`text-xs mt-1 font-medium ${
                                isBlocked ? 'text-red-600' :
                                isPartial ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {isBlocked && `Blocked (${centerStatus.blockedSlotsCount}/${centerStatus.totalSlotsCount} slots)`}
                                {isPartial && `Partial (${centerStatus.blockedSlotsCount}/${centerStatus.totalSlotsCount} slots)`}
                                {isAvailable && 'Available'}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  
                  {/* Execute Button */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      {getCurrentSelection().length > 0 ? (
                        <span className="font-medium">
                          {getCurrentSelection().length} center(s) selected for {bulkOperation}ing
                        </span>
                      ) : (
                        <span>
                          Select centers to {bulkOperation}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        if (bulkOperation === 'block') {
                          setShowBulkBlockModal(true);
                        } else {
                          setShowBulkUnblockModal(true);
                        }
                      }}
                      disabled={!selectedDoctorForBulk || getCurrentSelection().length === 0 || !bulkDate}
                      className={`px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                        bulkOperation === 'block'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {bulkOperation === 'block' ? 'Block' : 'Unblock'} Selected Centers
                    </button>
                  </div>
                </div>
              )}
              
              {/* Block Reason (only for block mode) */}
              {bulkOperation === 'block' && getCurrentSelection().length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Block Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={bulkBlockReason}
                    onChange={(e) => setBulkBlockReason(e.target.value)}
                    placeholder="e.g., Doctor on leave, Holiday, etc."
                    className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Holiday Message for Bulk Operations */}
          {bulkMode && isHoliday && (
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg shadow-sm mb-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🏖️</div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Bulk Operations Unavailable on Holiday
                </h3>
                <p className="text-orange-700">
                  Bulk slot operations are disabled during holidays. Please select a different date.
                </p>
              </div>
            </div>
          )}

          {/* Individual Center Management */}
          {!bulkMode && (
            <>
              {/* Selection Controls */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 mb-6">
            <h2 className="text-xl font-semibold text-[#ab1c1c] mb-4">Select Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center *</label>
                <select
                  value={selectedCenter}
                  onChange={(e) => {
                    const centreId = e.target.value;
                    setSelectedCenter(centreId);
                    if (centreId) {
                      fetchCenterDoctors(centreId);
                    } else {
                      setDoctors([]);
                      setSelectedDoctor('');
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                >
                  <option value="">Select Center</option>
                  {centers.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  disabled={!selectedCenter || doctors.length === 0}
                >
                  <option value="">{!selectedCenter ? 'Select Center First' : doctors.length === 0 ? 'No doctors available' : 'Select Doctor'}</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const selectedDateValue = e.target.value;
                    if (isSunday(selectedDateValue)) {
                      toast.error("Slots cannot be managed on Sundays. Please select another date.");
                      return;
                    }
                    setSelectedDate(selectedDateValue);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  min={getMinDateExcludingSundays()}
                />
              </div>
            </div>

            <button
              onClick={fetchSlotConfiguration}
              disabled={!selectedCenter || !selectedDoctor || !selectedDate || loading}
              className="bg-[#ab1c1c] text-white px-6 py-2 rounded-lg hover:bg-[#8a1717] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load Slots'}
            </button>
          </div>

          {/* Holiday Display */}
          {isHoliday && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-8 rounded-lg shadow-sm border-2 border-orange-300">
              <div className="text-center">
                <div className="text-6xl mb-4">🏖️</div>
                <h2 className="text-2xl font-bold text-orange-800 mb-2">
                  Holiday - {holidayName}
                </h2>
                <p className="text-lg text-orange-700 mb-4">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'No date selected'}
                </p>
                <div className="bg-white bg-opacity-70 rounded-lg p-4 inline-block">
                  <p className="text-orange-800 font-medium">
                    🚫 No slots are available on this holiday
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    All appointments and slot management are disabled
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slot Configuration Display */}
          {!isHoliday && slotConfiguration && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#ab1c1c]">
                    Slot Configuration - {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'No date selected'}
                  </h2>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600 mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slotConfiguration?.isOperational !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slotConfiguration?.isOperational !== false ? 'Operational' : 'Non-Operational'}
                    </span>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowAddSlotModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Slot
                  </button>
                  <button
                    onClick={() => handleBlockAllSlots()}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Block All Slots
                  </button>
                  <button
                    onClick={() => {
                      setOperationalStatus(slotConfiguration?.isOperational ?? true);
                      setShowOperationalModal(true);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      slotConfiguration?.isOperational !== false
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {slotConfiguration?.isOperational !== false ? 'Set Non-Operational' : 'Set Operational'}
                  </button>
                </div>
              </div>

              {/* Slots Grid */}
              {slotConfiguration && slotConfiguration.availableSlots && Array.isArray(slotConfiguration.availableSlots) && slotConfiguration.availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {slotConfiguration.availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${getSlotStatusColor(slot)}`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-xs mt-1">{getSlotStatusText(slot)}</div>
                        {slot.isBlocked && slot.blockReason && (
                          <div className="text-xs mt-1 text-red-600">
                            {slot.blockReason}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center mt-2 space-x-1">
                        {slot.isBlocked ? (
                          <button
                            onClick={() => handleUnblockSlot(slot.time)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSlotToConfirm(slot.time);
                              setShowBlockConfirmModal(true);
                            }}
                            className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                          >
                            Block
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSlotToConfirm(slot.time);
                            setShowRemoveConfirmModal(true);
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No slots configured for this combination. Add some slots to get started.
                </div>
              )}
            </div>
          )}

          {/* Add Slot Modal */}
          {showAddSlotModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Add New Slot</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Hour</label>
                      <select
                        value={slotHour}
                        onChange={(e) => setSlotHour(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      >
                        <option value="">Select</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Minute (00 to 59)</label>
                      <input
                        type="number"
                        value={slotMinute}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (e.target.value === '' || (value >= 0 && value <= 59)) {
                            setSlotMinute(e.target.value);
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="Enter minutes"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Period</label>
                      <select
                        value={slotPeriod}
                        onChange={(e) => setSlotPeriod(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  {slotHour && slotMinute && (
                    <p className="text-xs text-green-600 mt-2">
                      Preview: {slotHour}:{slotMinute.padStart(2, '0')} {slotPeriod}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAddSlotModal(false);
                      setSlotHour('');
                      setSlotMinute('');
                      setSlotPeriod('AM');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSlot}
                    className="px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8a1717]"
                  >
                    Add Slot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Block Confirmation Modal */}
          {showBlockConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-orange-600">Block Slot</h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to block the <strong>{slotToConfirm}</strong> slot?
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block Reason (Optional)</label>
                  <input
                    type="text"
                    value={confirmBlockReason}
                    onChange={(e) => setConfirmBlockReason(e.target.value)}
                    placeholder="e.g., Doctor unavailable"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowBlockConfirmModal(false);
                      setSlotToConfirm('');
                      setConfirmBlockReason('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBlockSlot}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Yes, Block Slot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Remove Confirmation Modal */}
          {showRemoveConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-red-600">Confirm Remove Slot</h3>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to <strong>permanently remove</strong> the <strong>{slotToConfirm}</strong> slot?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowRemoveConfirmModal(false);
                      setSlotToConfirm('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleRemoveSlot(slotToConfirm);
                      setShowRemoveConfirmModal(false);
                      setSlotToConfirm('');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Yes, Remove Permanently
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Operational Status Modal */}
          {showOperationalModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">
                  {operationalStatus ? 'Set Operational' : 'Set Non-Operational'}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operational Status</label>
                  <select
                    value={operationalStatus}
                    onChange={(e) => setOperationalStatus(e.target.value === 'true')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  >
                    <option value={true}>Operational</option>
                    <option value={false}>Non-Operational</option>
                  </select>
                </div>
                {!operationalStatus && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                    <input
                      type="text"
                      value={operationalReason}
                      onChange={(e) => setOperationalReason(e.target.value)}
                      placeholder="e.g., Doctor on leave"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowOperationalModal(false);
                      setOperationalReason('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOperationalStatusChange}
                    className="px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8a1717]"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* Bulk Block Confirmation Modal */}
          {showBulkBlockModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-red-600">Bulk Block All Slots</h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to block ALL slots for the selected doctor across{' '}
                  <strong>{selectedCentersForBlock.length} center(s)</strong> on{' '}
                  <strong>{bulkDate}</strong>?
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block Reason (Optional)</label>
                  <input
                    type="text"
                    value={bulkBlockReason}
                    onChange={(e) => setBulkBlockReason(e.target.value)}
                    placeholder="e.g., Doctor on leave"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowBulkBlockModal(false);
                      setBulkBlockReason('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkBlockSlots}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Yes, Block All Slots
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Unblock Confirmation Modal */}
          {showBulkUnblockModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4 text-blue-600">Confirm Bulk Unblock</h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to unblock ALL slots for the selected doctor across{' '}
                  <strong>{selectedCentersForUnblock.length} center(s)</strong> on{' '}
                  <strong>{bulkDate}</strong>?
                </p>
                
                {/* Show which centers will be unblocked */}
                {centerStatuses && selectedCentersForUnblock.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Centers to unblock:</h4>
                    <div className="space-y-1">
                      {selectedCentersForUnblock.map(centreId => {
                        const center = centerStatuses.allCenters?.find(c => c.centreId === centreId);
                        return center ? (
                          <div key={centreId} className="text-sm text-blue-700">
                            • {center.centreName} ({center.blockedSlotsCount}/{center.totalSlotsCount} slots blocked)
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBulkUnblockModal(false);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleBulkUnblockSlots();
                      setSelectedCentersForUnblock([]);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Unblock All Slots
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
}