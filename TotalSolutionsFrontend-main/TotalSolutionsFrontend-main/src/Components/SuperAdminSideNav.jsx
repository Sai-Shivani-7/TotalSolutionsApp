import { useDispatch } from "react-redux";
import { logout } from "./redux/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function SuperAdminSideNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.clear();
    navigate("/login");
  };

  const isCurrentPath = (path) => {
    return window.location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-white shadow-md w-64 px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[rgb(197,27,28)] mb-2">
          SuperAdmin Panel
        </h2>
        <p className="text-sm text-gray-600">System Overview</p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        <Link
          to="/superadmin/dashboard"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/dashboard")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Dashboard</span>
        </Link>

        <Link
          to="/superadmin/users"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/users")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Users</span>
        </Link>

        <Link
          to="/superadmin/children"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/children")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Children</span>
        </Link>

        <Link
          to="/superadmin/appointments"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/appointments")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Appointments</span>
        </Link>

        <Link
          to="/superadmin/centres"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/centres")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Centres</span>
        </Link>

        <Link
          to="/superadmin/doctor-registration"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/doctor-registration")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Doctor Registration</span>
        </Link>

        <Link
          to="/superadmin/slot-management"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/slot-management")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>Slot Management</span>
        </Link>

        {/* System Health */}
        <Link
          to="/superadmin/system-health"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isCurrentPath("/superadmin/system-health")
              ? "bg-red-50 text-[rgb(197,27,28)]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>System Health</span>
        </Link>

        {/* Profile & Logout */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isCurrentPath("/profile")
                ? "bg-red-50 text-[rgb(197,27,28)]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
