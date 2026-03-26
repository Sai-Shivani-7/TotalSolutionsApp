import React from "react";
import { Link } from "react-router-dom";

export default function ParentServiceHeader({ setIsMenuOpen }) {
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <ul className="items-stretch hidden font-bold space-x-3 lg:flex">
        <li className="flex">
          <Link
            to="/parentdashboard"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li>
        <li className="flex">
          <Link
            to="/parentdashboard/bookappointment"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            Book Appointment
          </Link>
        </li>
        <li className="flex">
          <Link
            to="/parentdashboard/viewappointments"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            View Appointments
          </Link>
        </li>
      </ul>

      {/* Mobile Navigation */}
      <ul className="lg:hidden w-full divide-y divide-gray-200">
        {/* <li>
          <Link
            to="/parentdashboard"
            onClick={handleLinkClick}
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li> */}
        <li>
          <Link
            to="/parentdashboard/bookappointment"
            onClick={handleLinkClick}
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200"
          >
            Book Appointment
          </Link>
        </li>
        <li>
          <Link
            to="/parentdashboard/viewappointments"
            onClick={handleLinkClick}
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200"
          >
            View Appointments
          </Link>
        </li>
      </ul>
    </>
  );
}
