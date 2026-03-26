import { useState, useEffect } from "react";
import axios from "axios";

export default function SuperAdminSystemHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await axios.get("/api/superadmin/system-health", {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setHealthData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch system health data");
        setLoading(false);
      }
    };
    fetchHealthData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-6">
        System Health
      </h2>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            System Status
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                healthData?.status === "operational"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="capitalize">{healthData?.status}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Database Status
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                healthData?.dbStatus === "connected"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="capitalize">{healthData?.dbStatus}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uptime</h3>
          <p className="text-2xl font-bold text-[rgb(197,27,28)]">
            {formatUptime(healthData?.metrics?.uptime)}
          </p>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Memory Usage
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(healthData?.metrics?.memoryUsage || {}).map(
            ([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-sm text-gray-600 capitalize">
                  {key.replace("Memory", "")}
                </p>
                <p className="text-lg font-bold text-[rgb(197,27,28)]">
                  {formatBytes(value)}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          API Endpoints Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData?.endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-600">
                {endpoint.path}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  endpoint.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {endpoint.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
