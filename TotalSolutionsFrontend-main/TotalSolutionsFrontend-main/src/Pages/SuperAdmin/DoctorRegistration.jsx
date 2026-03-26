import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../Components/Loader";

export default function DoctorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    mobilenumber: "",
    password: "",
    confirmPassword: "",
    designation: "",
    qualification: "",
    centreIds: []
  });

  const [centers, setCenters] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCenters();
    fetchDoctors();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await axios.get("/api/superadmin/centres", {
        headers: { Authorization: sessionStorage.getItem("token") }
      });
      setCenters(response.data || []);
    } catch (error) {
      console.error("Error fetching centers:", error);
      toast.error("Failed to fetch centers");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("/api/superadmin/doctors-list", {
        headers: { Authorization: sessionStorage.getItem("token") }
      });
      setDoctors(response.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to fetch doctors");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleCenterSelection = (centerId, isChecked) => {
    let updatedCentreIds = [...formData.centreIds];
    
    if (isChecked) {
      if (!updatedCentreIds.includes(centerId)) {
        updatedCentreIds.push(centerId);
      }
    } else {
      updatedCentreIds = updatedCentreIds.filter(id => id !== centerId);
    }
    
    setFormData({
      ...formData,
      centreIds: updatedCentreIds
    });

    // Update select all state
    setSelectAll(updatedCentreIds.length === centers.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setFormData({
        ...formData,
        centreIds: []
      });
      setSelectAll(false);
    } else {
      // Select all
      setFormData({
        ...formData,
        centreIds: centers.map(center => center._id)
      });
      setSelectAll(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.mobilenumber)
      newErrors.mobilenumber = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobilenumber))
      newErrors.mobilenumber = "Mobile number must be 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (formData.centreIds.length === 0)
      newErrors.centreIds = "At least one center must be selected";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error("Please fix the validation errors before submitting");
        return;
      }

      await axios.post(
        "/api/superadmin/register-doctor",
        {
          name: formData.name,
          mobilenumber: formData.mobilenumber,
          password: formData.password,
          centreIds: formData.centreIds,
          designation: formData.designation,
          qualification: formData.qualification
        },
        {
          headers: { Authorization: sessionStorage.getItem("token") }
        }
      );

      toast.success("Doctor registered successfully!");
      setRegistrationSuccess(true);
      await fetchDoctors(); // Refresh doctors list

    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobilenumber: "",
      password: "",
      confirmPassword: "",
      designation: "",
      qualification: "",
      centreIds: []
    });
    setErrors({});
    setRegistrationSuccess(false);
    setSelectAll(false);
  };

  if (registrationSuccess) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-green-200">
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-xl font-medium text-gray-900">
              Doctor Registration Successful!
            </h3>
            <p className="mt-2 text-gray-600">
              Doctor account has been created successfully and assigned to selected centers.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={resetForm}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ab1c1c] hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c]"
              >
                Register Another Doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ab1c1c] mb-2">Doctor Registration</h1>
        <p className="text-gray-600">Register new doctors and assign them to centers</p>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 mb-8">
        <div className="px-6 py-8">
          <h2 className="text-xl font-semibold text-[#ab1c1c] mb-6">Register New Doctor</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                  placeholder="Doctor's full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="number"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.mobilenumber ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
                {errors.mobilenumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobilenumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  placeholder="e.g., Senior Consultant, Specialist"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                  placeholder="e.g., MBBS, MD, MS"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-3 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-3 border ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Center Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Assign Centers * 
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-[#ab1c1c] hover:text-[#8e1818] font-medium"
                >
                  {selectAll ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {centers.map((center) => (
                  <label
                    key={center._id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[#ab1c1c] hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.centreIds.includes(center._id)}
                      onChange={(e) => handleCenterSelection(center._id, e.target.checked)}
                      className="mr-3 h-4 w-4 text-[#ab1c1c] focus:ring-[#ab1c1c] border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{center.name}</div>
                      {center.location && (
                        <div className="text-xs text-gray-500">{center.location}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {formData.centreIds.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800">
                    <strong>{formData.centreIds.length}</strong> center(s) selected
                  </div>
                </div>
              )}

              {errors.centreIds && (
                <p className="mt-2 text-sm text-red-500">{errors.centreIds}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ab1c1c] hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c]"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering Doctor...
                  </div>
                ) : (
                  "Register Doctor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Registered Doctors List */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h2 className="text-xl font-semibold text-[#ab1c1c]">Registered Doctors</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <Loader />
          ) : doctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No doctors registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Centers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patients
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        {doctor.designation && (
                          <div className="text-sm text-gray-500">{doctor.designation}</div>
                        )}
                        {doctor.qualification && (
                          <div className="text-xs text-gray-400">{doctor.qualification}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">

                        <div className="text-sm text-gray-500">{doctor.mobilenumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {doctor.centreIds?.map((centre) => (
                            <span
                              key={centre._id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {centre.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.patients?.length || 0} patients
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {loading && <Loader />}
    </div>
  );
}