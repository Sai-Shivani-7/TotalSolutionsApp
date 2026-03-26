import { useState, useEffect } from "react";
import axios from "axios";

export default function SuperAdminCentreView() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const response = await axios.get("/api/superadmin/centres", {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setCentres(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch centres data");
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

  const filteredCentres = centres.filter((centre) =>
    centre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-6">Centres</h2>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search centres..."
          className="px-4 py-2 border rounded-lg w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Centres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentres.map((centre) => (
          <div key={centre._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{centre.name}</h3>
              <div className="text-gray-600">
                <p className="mb-2">
                  <span className="font-semibold">Address: </span>
                  {centre.address}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Phone:</span> {centre.contactNumber}
                </p>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Staff Details</h4>
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Doctors</p>
                        <p className="text-lg font-bold text-[rgb(197,27,28)]">
                          {centre.doctorCount || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Therapists</p>
                        <p className="text-lg font-bold text-[rgb(197,27,28)]">
                          {centre.therapistCount || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Admins</p>
                        <p className="text-lg font-bold text-[rgb(197,27,28)]">
                          {centre.adminCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-center bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Children</p>
                      <p className="text-2xl font-bold text-[rgb(197,27,28)]">
                        {centre.childrenCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
