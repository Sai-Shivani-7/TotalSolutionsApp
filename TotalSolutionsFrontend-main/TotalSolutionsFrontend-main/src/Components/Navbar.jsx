import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaPlus,
  FaMinus,
  FaBullhorn,
} from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../assets/totalsolutions.webp";
import { AppointmentModal } from "./AppointmentModal";
import UserProfileHeader from "./UserProfileHeader";
import ServiceHeader from "./ServiceHeader";
import Scroller from "../Pages/Scroller";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timeoutRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = sessionStorage.getItem("role");
  const user = useSelector((state) => state.auth.user);
  const name = user?.details?.name;

  const aboutUsLinks = [
    { label: "Who we are?", path: "/aboutus/whoarewe" },
    { label: "Why Us?", path: "/aboutus/whyus" },
    { label: "Founder Messages", path: "/aboutus/foundermessages" },
    { label: "Goals of Total Solution", path: "/aboutus/goals" },
    { label: "Research Department", path: "/aboutus/research" },
  ];

  const servicesItems = [
    {
      label: "Assessment & Evaluation",
      path: "/services/assessment-evaluation",
    },
    { label: "Occupational Therapy", path: "/services/occupational-therapy" },
    { label: "Behaviour Therapy", path: "/services/behaviour-therapy" },
    { label: "Remedial Therapy", path: "/services/remedial-therapy" },
    {
      label: "Behaviour Modification",
      path: "/services/behaviour-modification",
    },
    { label: "Speech Therapy", path: "/services/speech-therapy" },
  ];

  const mediaItems = [
    { label: "Photo Gallery", path: "/media/photos" },
    { label: "Video Gallery", path: "/media/videos" },
  ];

  const toggleDropdown = useCallback((dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  }, []);

  const handleDesktopDropdownEnter = useCallback((dropdown) => {
    clearTimeout(timeoutRef.current);
    setOpenDropdown(dropdown);
  }, []);

  const handleDesktopDropdownLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 300);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !mobileMenuRef.current?.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Mobile menu user actions
  const handleMobileLogout = () => {
    const role = sessionStorage.getItem("role");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(`${role}Id`);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full shadow-md bg-white px-4 sm:px-6 py-3 flex items-center justify-between relative z-50">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Total Solution Logo"
              width="200"
              height="50"
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          <button
            ref={menuButtonRef}
            className="md:hidden text-[#ab1c1c] text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Conditionally Render Navigation */}
        {isAuthenticated ? (
          <>
            {/* Desktop Navigation for Authenticated Users */}
            <div className="hidden md:flex gap-4 items-center">
              {/* Announcements Link */}
              <Link
                to="/announcements"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#ab1c1c] hover:bg-[#8d1717] transition-all duration-300 shadow-md"
              >
                <FaBullhorn className="text-white text-xl" />

                {/* Tooltip on hover */}
                <span
                  className="absolute top-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 mt-2"
                >
                  Announcements
                </span>
              </Link>

              <Link
                to={
                  role === "superadmin"
                    ? "/superadmin/dashboard"
                    : `/${role}dashboard`
                }
                className="text-base lg:text-lg font-medium text-[#ab1c1c] border-b-2 py-2 border-transparent hover:border-[#ab1c1c] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {role.charAt(0).toUpperCase() + role.substring(1)} Dashboard
              </Link>

              {/* Calendar Link */}
              <Link
                to="/calendar"
                className="text-base lg:text-lg font-medium text-[#ab1c1c] border-b-2 py-2 border-transparent hover:border-[#ab1c1c] transition-colors"
              >
                Calendar
              </Link>

              {role === 'therapist' && (
                <>
                  <Link
                    to="/codeofconduct"
                    className="text-base lg:text-lg font-medium text-[#ab1c1c] border-b-2 py-2 border-transparent hover:border-[#ab1c1c] transition-colors"
                  >
                    Code of Conduct
                  </Link>
                </>
              )}

              <UserProfileHeader menuRef={mobileMenuRef} />
            </div>

            {/* Mobile Navigation for Authenticated Users */}
            {isMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 px-4 py-2 animate-fadeIn max-h-[calc(100vh-80px)] overflow-y-auto"
              >
                <Link
                  to={
                    role === "superadmin"
                      ? "/superadmin/dashboard"
                      : `/${role}dashboard`
                  }
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {role.charAt(0).toUpperCase() + role.substring(1)} Dashboard
                </Link>

                {/* Calendar Link */}
                <Link
                  to="/calendar"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Calendar
                </Link>

                {role === 'therapist' && (
                  <>
                    <Link
                      to="/code-of-conduct"
                      className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Code of Conduct
                    </Link>
                  </>
                )}

                {/* Mobile Announcements Link */}
                <Link
                  to="/announcements"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaBullhorn className="inline mr-2" />
                  Announcements
                </Link>

                <ServiceHeader
                  isMobileMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                />

                <div className="border-b py-3 flex items-center gap-2">
                  <FiUser className="text-[#ab1c1c] text-xl" />
                  <span className="text-lg font-medium text-[#ab1c1c]">
                    {name || "User"}
                  </span>
                </div>

                <Link
                  to="/profile"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  to="/login"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={handleMobileLogout}
                >
                  Logout
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Desktop Navigation (Unauthenticated) */}
            <div className="hidden md:flex gap-4 lg:gap-6 items-center relative">
              <Link
                to="/"
                className="text-base lg:text-lg font-medium text-[#ab1c1c] hover:text-white hover:bg-[#ab1c1c] px-2 py-1 rounded transition-colors"
              >
                Home
              </Link>

              <div
                className="relative"
                onMouseEnter={() => handleDesktopDropdownEnter("about")}
                onMouseLeave={handleDesktopDropdownLeave}
              >
                <button
                  className={`text-base lg:text-lg font-medium transition-colors px-2 py-1 rounded ${
                    openDropdown === "about"
                      ? "text-white bg-[#ab1c1c]"
                      : "text-[#ab1c1c] hover:text-white hover:bg-[#ab1c1c]"
                  }`}
                >
                  About Us
                </button>
                <div
                  className={`absolute ${
                    openDropdown === "about" ? "block" : "hidden"
                  } bg-white mt-2 rounded shadow-lg w-48 z-10 border border-gray-200`}
                >
                  {aboutUsLinks.map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      className="block px-4 py-2 text-[#ab1c1c] hover:bg-red-50 border-b last:border-none transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div
                className="relative"
                onMouseEnter={() => handleDesktopDropdownEnter("services")}
                onMouseLeave={handleDesktopDropdownLeave}
              >
                <button
                  className={`text-base lg:text-lg font-medium transition-colors px-2 py-1 rounded ${
                    openDropdown === "services"
                      ? "text-white bg-[#ab1c1c]"
                      : "text-[#ab1c1c] hover:text-white hover:bg-[#ab1c1c]"
                  }`}
                >
                  Services
                </button>
                <div
                  className={`absolute ${
                    openDropdown === "services" ? "block" : "hidden"
                  } bg-white mt-2 rounded shadow-lg w-48 z-10 border border-gray-200`}
                >
                  {servicesItems.map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      className="block px-4 py-2 text-[#ab1c1c] hover:bg-red-50 border-b last:border-none transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/training"
                className="text-base lg:text-lg font-medium text-[#ab1c1c] hover:text-white hover:bg-[#ab1c1c] px-2 py-1 rounded transition-colors"
              >
                Training
              </Link>

              <Link
                to="/ourbranches"
                className="text-base lg:text-lg font-medium text-[#ab1c1c] hover:text-white hover:bg-[#ab1c1c] px-2 py-1 rounded transition-colors"
              >
                Our Branches
              </Link>

              <div
                className="relative"
                onMouseEnter={() => handleDesktopDropdownEnter("media")}
                onMouseLeave={handleDesktopDropdownLeave}
              >
                <button
                  className={`text-base lg:text-lg font-medium transition-colors px-2 py-1 rounded ${
                    openDropdown === "media"
                      ? "text-white bg-[#ab1c1c]"
                      : "text-[#ab1c1c] hover:text-white hover:bg-[#ab1c1c]"
                  }`}
                >
                  Media
                </button>
                <div
                  className={`absolute ${
                    openDropdown === "media" ? "block" : "hidden"
                  } bg-white mt-2 rounded shadow-lg w-48 z-10 border border-gray-200`}
                >
                  {mediaItems.map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      className="block px-4 py-2 text-[#ab1c1c] hover:bg-red-50 border-b last:border-none transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="group flex items-center gap-2 hover:bg-[#ab1c1c] rounded transition-colors px-2 py-1">
                <Link
                  to="/contact"
                  className="text-base lg:text-lg font-medium text-[#ab1c1c] group-hover:text-white"
                >
                  Contact Us
                </Link>
                <FaMapMarkerAlt className="text-[#ab1c1c] text-xl group-hover:text-white" />
              </div>

              <button
                className="border border-[#ab1c1c] text-[#ab1c1c] font-semibold px-3 lg:px-4 py-1 rounded-full hover:bg-[#ab1c1c] hover:text-white transition-all text-sm lg:text-base"
                onClick={() => setIsModalOpen(true)}
              >
                Appointment
              </button>
            </div>

            {/* Mobile Navigation (Unauthenticated) */}
            {isMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 px-4 py-2 animate-fadeIn max-h-[calc(100vh-80px)] overflow-y-auto"
              >
                <Link
                  to="/"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>

                <div className="border-b">
                  <div
                    className="flex justify-between items-center py-3 cursor-pointer"
                    onClick={() => toggleDropdown("about")}
                  >
                    <span className="text-lg font-medium text-[#ab1c1c]">
                      About Us
                    </span>
                    {openDropdown === "about" ? <FaMinus /> : <FaPlus />}
                  </div>
                  {openDropdown === "about" && (
                    <div className="pb-2 pl-4">
                      {aboutUsLinks.map((item, i) => (
                        <Link
                          key={i}
                          to={item.path}
                          className="block py-2 text-gray-700 hover:text-[#ab1c1c] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-b">
                  <div
                    className="flex justify-between items-center py-3 cursor-pointer"
                    onClick={() => toggleDropdown("services")}
                  >
                    <span className="text-lg font-medium text-[#ab1c1c]">
                      Services
                    </span>
                    {openDropdown === "services" ? <FaMinus /> : <FaPlus />}
                  </div>
                  {openDropdown === "services" && (
                    <div className="pb-2 pl-4">
                      {servicesItems.map((item, i) => (
                        <Link
                          key={i}
                          to={item.path}
                          className="block py-2 text-gray-700 hover:text-[#ab1c1c] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/training"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Training
                </Link>

                <Link
                  to="/ourbranches"
                  className="block py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Our Branches
                </Link>

                <div className="border-b">
                  <div
                    className="flex justify-between items-center py-3 cursor-pointer"
                    onClick={() => toggleDropdown("media")}
                  >
                    <span className="text-lg font-medium text-[#ab1c1c]">
                      Media
                    </span>
                    {openDropdown === "media" ? <FaMinus /> : <FaPlus />}
                  </div>
                  {openDropdown === "media" && (
                    <div className="pb-2 pl-4">
                      {mediaItems.map((item, i) => (
                        <Link
                          key={i}
                          to={item.path}
                          className="block py-2 text-gray-700 hover:text-[#ab1c1c] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/contact"
                  className="flex items-center gap-2 py-3 text-lg font-medium text-[#ab1c1c] border-b"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us{" "}
                  <FaMapMarkerAlt className="text-[#ab1c1c] text-xl" />
                </Link>

                <button
                  className="w-full border border-[#ab1c1c] text-[#ab1c1c] font-semibold px-4 py-2 rounded-full my-3 hover:bg-[#ab1c1c] hover:text-white transition-colors"
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Appointment
                </button>
              </div>
            )}
          </>
        )}

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </nav>
      
      {/* Scroller for both public and authenticated users */}
      <Scroller userRole={isAuthenticated ? role : "public"} />
      
      {isAuthenticated && (
        <div className="z-40 bg-red-100 shadow-sm border-b-2 border-red-800">
          <ServiceHeader
            isMobileMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      )}
    </>
  );
}