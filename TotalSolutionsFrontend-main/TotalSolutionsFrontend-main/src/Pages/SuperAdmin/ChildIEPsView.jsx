import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import generateIEPPDF from "../IEPReportPDF";

export default function ChildIEPsView() {
  const { childId } = useParams();
  const [ieps, setIeps] = useState([]);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [childResponse, iepsResponse] = await Promise.all([
          axios.get(`/api/superadmin/children/${childId}`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
          axios.get(`/api/superadmin/children/${childId}/ieps`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          }),
        ]);

        setChildData(childResponse.data);
        setIeps(iepsResponse.data);
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
          IEPs for {childData.name}
        </h1>
        <p className="text-gray-600">
          Total IEPs: {ieps.length}
        </p>
      </div>

      {/* IEPs Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-gray-600">Starting Date</th>
              <th className="px-6 py-3 text-left text-gray-600">Therapy</th>
              <th className="px-6 py-3 text-left text-gray-600">Doctor</th>
              <th className="px-6 py-3 text-left text-gray-600">Therapist</th>
              <th className="px-6 py-3 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ieps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((iep) => (
              <tr key={iep._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {iep.startingMonth}/{iep.startingYear}
                </td>
                <td className="px-6 py-4">{iep.therapy}</td>
                <td className="px-6 py-4">{iep.doctorId?.name || "-"}</td>
                <td className="px-6 py-4">{iep.therapistName || "-"}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => generateIEPPDF(iep)}
                    className="text-[rgb(197,27,28)] hover:text-red-700"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {ieps.length > itemsPerPage && (
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
            Page {currentPage} of {Math.ceil(ieps.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(ieps.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(ieps.length / itemsPerPage)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(ieps.length / itemsPerPage)
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
