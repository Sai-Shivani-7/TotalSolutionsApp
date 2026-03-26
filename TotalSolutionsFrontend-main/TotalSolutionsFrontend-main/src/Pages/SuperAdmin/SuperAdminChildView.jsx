import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SuperAdminChildView() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [centreFilter, setCentreFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get("/api/superadmin/children", {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setChildren(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch children data");
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const centres = [...new Set(children.map((child) => child.centreId?.name || "Unassigned"))];

  const filteredChildren = children.filter((child) => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCentre = centreFilter === "all" || child.centreId?.name === centreFilter;
    return matchesSearch && matchesCentre;
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
      <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-6">Children</h2>

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

      {/* Children Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-600">Name</th>
              <th className="px-6 py-3 text-gray-600">Age</th>
              <th className="px-6 py-3 text-gray-600">Parent</th>
              <th className="px-6 py-3 text-gray-600">Centre</th>
              <th className="px-6 py-3 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredChildren
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((child) => (
              <tr key={child._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{child.name}</td>
                <td className="px-6 py-4">
                  {Math.floor(
                    (new Date() - new Date(child.dob)) / (365.25 * 24 * 60 * 60 * 1000)
                  )}
                </td>
                <td className="px-6 py-4">{child.parentId?.name || "-"}</td>
                <td className="px-6 py-4">{child.centreId?.name || "-"}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/superadmin/children/${child._id}`)}
                    className="bg-[rgb(197,27,28)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(150,20,20)] transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredChildren.length > itemsPerPage && (
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
            Page {currentPage} of {Math.ceil(filteredChildren.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredChildren.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(filteredChildren.length / itemsPerPage)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(filteredChildren.length / itemsPerPage)
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
