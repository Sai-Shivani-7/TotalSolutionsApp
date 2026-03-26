import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SuperAdminAppointmentView() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [centreFilter, setCentreFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [processingAppointment, setProcessingAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("/api/superadmin/appointments", {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch appointments data");
        setLoading(false);
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  const centres = [...new Set(appointments.map((apt) => apt.centreId?.name || "Unassigned"))];
  const statuses = [...new Set(appointments.map((apt) => apt.status))];

  const handleStatusChange = async (appointmentId, status) => {
    setProcessingAppointment(appointmentId);
    try {
      await axios.put(
        `/api/admins/manageAppointment/${appointmentId}`,
        { status },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status } : apt
      ));
      
      toast.success(`Appointment ${status} successfully!`);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      toast.error("Failed to update appointment status");
    } finally {
      setProcessingAppointment(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.childId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.therapistId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesCentre = centreFilter === "all" || apt.centreId?.name === centreFilter;
    return matchesSearch && matchesStatus && matchesCentre;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(197,27,28)]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-6">
        Appointments
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border rounded-lg"
          value={centreFilter}
          onChange={(e) => setCentreFilter(e.target.value)}
        >
          <option value="all">All Centres</option>
          {centres.map((centre) => (
            <option key={centre} value={centre}>
              {centre}
            </option>
          ))}
        </select>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-600">Date & Time</th>
              <th className="px-6 py-3 text-gray-600">Child</th>
              <th className="px-6 py-3 text-gray-600">Doctor</th>
              <th className="px-6 py-3 text-gray-600">Centre</th>
              <th className="px-6 py-3 text-gray-600">Consultation Type</th>
              <th className="px-6 py-3 text-gray-600">Status</th>
              <th className="px-6 py-3 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAppointments
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((apt) => (
              <tr key={apt._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {apt.appointmentDate.split("T")[0] || "-"} {apt.appointmentTime || "-"}
                </td>
                <td className="px-6 py-4">{apt.childId?.name || "-"}</td>
                <td className="px-6 py-4">{apt.doctorId?.name || "-"}</td>
                <td className="px-6 py-4">{apt.centreId?.name || "-"}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {apt.consultationType || "Not specified"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : apt.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : apt.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {apt.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {apt.status === "pending" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(apt._id, "approved")}
                        disabled={processingAppointment === apt._id}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                        title="Approve"
                      >
                        {processingAppointment === apt._id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt._id, "rejected")}
                        disabled={processingAppointment === apt._id}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                        title="Reject"
                      >
                        {processingAppointment === apt._id ? "..." : "Reject"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAppointments.length > itemsPerPage && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[rgb(197,27,28)] text-white hover:bg-red-700"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {Math.ceil(filteredAppointments.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAppointments.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(filteredAppointments.length / itemsPerPage)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(filteredAppointments.length / itemsPerPage)
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[rgb(197,27,28)] text-white hover:bg-red-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
