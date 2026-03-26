import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import generateAppointmentPDF from "../AppointmentDetails";

export default function ChildAppointmentsView() {
  const { childId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching appointment data...');
        const [childResponse, appointmentsResponse] = await Promise.all([
          axios.get(`/api/superadmin/children/${childId}`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
          axios.get(`/api/superadmin/children/${childId}/appointments`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
        ]);

        setChildData(childResponse.data);
        console.log('Appointment response data:', appointmentsResponse.data);
        setAppointments(appointmentsResponse.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [childId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(197,27,28)]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link
        to={`/superadmin/children/${childId}`}
        className="inline-flex items-center text-gray-600 hover:text-[rgb(197,27,28)] mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Child Details
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-[rgb(197,27,28)] mb-2">
          Appointments for {childData.name}
        </h1>
        <p className="text-gray-600">
          Total Appointments: {appointments.length}
        </p>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-gray-600">Date</th>
              <th className="px-6 py-3 text-left text-gray-600">Time</th>
              <th className="px-6 py-3 text-left text-gray-600">Doctor</th>
              <th className="px-6 py-3 text-left text-gray-600">Therapist</th>
              <th className="px-6 py-3 text-left text-gray-600">Status</th>
              <th className="px-6 py-3 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((appointment) => {
              return (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{appointment.appointmentDate.split("T")[0] || "-"}</td>
                  <td className="px-6 py-4">{appointment.appointmentTime || "-"}</td>
                  <td className="px-6 py-4">{appointment.doctorId?.name || "-"}</td>
                  <td className="px-6 py-4">{appointment.therapistId?.name || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        generateAppointmentPDF({
                          ...appointment,
                          childName: childData.name,
                          parentName: childData.parentId?.name,
                          centreName: childData.centreId?.name,
                          doctorName: appointment.doctorId?.name,
                          appointmentDate: appointment.appointmentDate.split("T")[0] || "-",
                          appointmentTime: appointment.appointmentTime || "-",
                          consultationType: appointment.type,
                        });
                      }}
                      className="text-[rgb(197,27,28)] hover:text-red-700"
                    >
                      View PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {appointments.length > itemsPerPage && (
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
            Page {currentPage} of {Math.ceil(appointments.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(appointments.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(appointments.length / itemsPerPage)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(appointments.length / itemsPerPage)
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
