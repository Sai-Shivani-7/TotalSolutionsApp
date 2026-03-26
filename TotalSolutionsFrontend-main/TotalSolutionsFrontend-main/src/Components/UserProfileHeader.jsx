import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./redux/authSlice";
import { FiUser } from "react-icons/fi";

export default function UserProfileHeader({ menuRef }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const name = user?.details?.name;
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (menuRef?.current && !menuRef.current.contains(event.target)) ||
        (profileRef.current && !profileRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleLogout = () => {
    const role = sessionStorage.getItem("role");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(`${role}Id`);
    dispatch(logout());
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 py-2 border-b-2 border-transparent hover:border-[#ab1c1c] focus:border-[#ab1c1c] cursor-pointer"
        aria-label="User profile"
      >
        <FiUser className="text-[#ab1c1c] text-2xl" />
        <span className="text-[#ab1c1c] text-base lg:text-lg">
          {name || "User"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black/90 text-white rounded-lg shadow-lg z-50">
          <ul className="py-2">
            <li>
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-red-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-900 transition-colors"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
