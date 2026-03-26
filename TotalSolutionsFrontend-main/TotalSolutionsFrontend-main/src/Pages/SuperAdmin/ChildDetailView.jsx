import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import generateIEPPDF from "../IEPReportPDF";

export default function ChildDetailView() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ieps, setIeps] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        // Fetch child details, IEPs, and appointments in parallel
        const [childResponse, iepsResponse, appointmentsResponse] = await Promise.all([
          axios.get(`/api/superadmin/children/${childId}`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
          axios.get(`/api/superadmin/children/${childId}/ieps`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
          axios.get(`/api/superadmin/children/${childId}/appointments`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
        ]);

        setChildData(childResponse.data);
        setIeps(iepsResponse.data);
        setAppointments(appointmentsResponse.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch child data");
        setLoading(false);
      }
    };

    fetchChildData();
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
        to="/superadmin/children"
        className="inline-flex items-center text-gray-600 hover:text-[rgb(197,27,28)] mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Children List
      </Link>

      {/* Child Basic Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-[rgb(197,27,28)] mb-4">{childData.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Age</h3>
            <p className="text-lg">{Math.floor((new Date() - new Date(childData.dob)) / (365.25 * 24 * 60 * 60 * 1000))} years</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
            <p className="text-lg">{new Date(childData.dob).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Gender</h3>
            <p className="text-lg">{childData.gender}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Centre</h3>
            <p className="text-lg">{childData.centreId?.name || "Not Assigned"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Parent Name</h3>
            <p className="text-lg">{childData.parentId?.name || "Not Available"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Parent Contact</h3>
            <p className="text-lg">{childData.parentId?.mobilenumber || "Not Available"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">School Name</h3>
            <p className="text-lg">{childData.schoolName || "Not Specified"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">School Board</h3>
            <p className="text-lg">{childData.schoolBoard || "Not Specified"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Admit Status</h3>
            <p className="text-lg">{childData.admitStatus}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
            <p className="text-lg">{childData.doctorId?.name || "Not Assigned"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Joining</h3>
            <p className="text-lg">{childData.dateOfJoining ? new Date(childData.dateOfJoining).toLocaleDateString() : "Not Available"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Registration ID</h3>
            <p className="text-lg">{childData.registrationId || "Not Available"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Case ID</h3>
            <p className="text-lg">{childData.caseId || "Not Available"}</p>
          </div>
        </div>
      </div>

      {/* Therapies Section */}
      {childData.therapies && childData.therapies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[rgb(197,27,28)] mb-4">Therapies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childData.therapies.map((therapy, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <p className="text-lg"><strong>Type:</strong> {therapy.therapyType}</p>
                <p className="text-lg"><strong>Therapist:</strong> {therapy.therapistId?.name || "Not Assigned"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* IEPs Summary Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[rgb(197,27,28)]">IEPs</h2>
            <span className="text-sm bg-[rgb(197,27,28)] text-white px-3 py-1 rounded-full">
              {ieps.length} Total
            </span>
          </div>
          <div className="mb-4">
            <p className="text-gray-600">
              Latest IEP: {ieps[0] ? `${ieps[0].startingMonth}/${ieps[0].startingYear}` : 'None'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/superadmin/children/${childId}/ieps`)}
              className="bg-[rgb(197,27,28)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              View All IEPs
            </button>
            {ieps.length > 0 && (
              <button
                onClick={() => generateIEPPDF(ieps[0])}
                className="border border-[rgb(197,27,28)] text-[rgb(197,27,28)] px-4 py-2 rounded hover:bg-red-50 transition-colors"
              >
                View Latest IEP
              </button>
            )}
          </div>
        </div>

        {/* Appointments Summary Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[rgb(197,27,28)]">Appointments</h2>
            <span className="text-sm bg-[rgb(197,27,28)] text-white px-3 py-1 rounded-full">
              {appointments.length} Total
            </span>
          </div>
          <div className="mb-4">
            {appointments.length > 0 ? (
              <ul className="space-y-2">
                {appointments
                  .filter((a) => new Date(a.appointmentDate) >= new Date())
                  .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                  .slice(0, 3) // Display up to 3 upcoming appointments
                  .map((appointment, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-medium">Date:</span> {new Date(appointment.appointmentDate).toLocaleDateString()} - 
                      <span className="font-medium">Time:</span> {appointment.appointmentTime} - 
                      <span className="font-medium">Status:</span> {appointment.status}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-600">No upcoming appointments scheduled.</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/superadmin/children/${childId}/appointments`)}
            className="bg-[rgb(197,27,28)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  );
}
