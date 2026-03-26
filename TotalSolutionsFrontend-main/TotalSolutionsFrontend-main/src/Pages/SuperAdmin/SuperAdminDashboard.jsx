import { useState, useEffect } from "react";
import axios from "axios";
import UserProfileHeader from "../../Components/UserProfileHeader";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ab1c1c'];

  const formatUserRoleData = (usersByRole) => {
    return usersByRole?.map(role => ({
      name: role._id.charAt(0).toUpperCase() + role._id.slice(1),
      value: role.count
    })) || [];
  };

  const formatAppointmentData = (appointmentsByStatus) => {
    return appointmentsByStatus?.map(status => ({
      name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
      value: status.count
    })) || [];
  };

  const formatCentreData = (centreDistribution) => {
    return centreDistribution?.map(centre => ({
      name: centre.name,
      children: centre.childCount,
      staff: centre.staffCount
    })) || [];
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/superadmin/analytics", {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setAnalytics(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch analytics data");
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(197,27,28)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <UserProfileHeader /> */}
      
      {/* Dashboard Content */}
      <div className="p-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[rgb(197,27,28)] mb-8">
          Super Admin Dashboard
        </h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-[rgb(197,27,28)]">
              {analytics?.totalUsers || 0}
            </p>
            <div className="mt-4">
              {analytics?.usersByRole?.map((role) => (
                <div key={role._id} className="flex justify-between text-sm text-gray-600">
                  <span className="capitalize">{role._id}</span>
                  <span>{role.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Children
            </h3>
            <p className="text-3xl font-bold text-[rgb(197,27,28)]">
              {analytics?.totalChildren || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total IEPs</h3>
            <p className="text-3xl font-bold text-[rgb(197,27,28)]">
              {analytics?.totalIEPs || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Appointments
            </h3>
            <p className="text-3xl font-bold text-[rgb(197,27,28)]">
              {analytics?.totalAppointments || 0}
            </p>
            <div className="mt-4">
              {analytics?.appointmentsByStatus?.map((status) => (
                <div key={status._id} className="flex justify-between text-sm text-gray-600">
                  <span className="capitalize">{status._id}</span>
                  <span>{status.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Centres
            </h3>
            <p className="text-3xl font-bold text-[rgb(197,27,28)]">
              {analytics?.totalCentres || 0}
            </p>
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/superadmin/users")}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">View Users</h3>
          </button>
          <button
            onClick={() => navigate("/superadmin/children")}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">View Children</h3>
          </button>
          <button
            onClick={() => navigate("/superadmin/ieps")}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">View IEPs</h3>
          </button>
          <button
            onClick={() => navigate("/superadmin/appointments")}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              View Appointments
            </h3>
          </button>
        </div>
      </div>
    </div>
  );
}
