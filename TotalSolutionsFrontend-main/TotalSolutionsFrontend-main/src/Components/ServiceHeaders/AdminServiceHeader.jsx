import React from "react";
import { Link } from "react-router-dom";
export default function AdminServiceHeader({ setIsMenuOpen }) {
  return (
    <>
      <ul className="items-stretch hidden font-bold  space-x-3 lg:flex">
        <li className="flex">
          <Link
            to="/admindashboard"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li>
        <li className="flex">
          <Link
            to="/admindashboard/register"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            Register
          </Link>
        </li>
        <li className="flex">
          <Link
            to="/admindashboard/existingusers"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            Import  
          </Link>
        </li>
        <li className="flex">
          <Link
            to="/admindashboard/viewappointment"
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            View Appointments
          </Link>
        </li>
        <li className="flex">
          <Link
            to={`/admindashboard/manageappointment`}
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            Manage Appointments
          </Link>
        </li>
        <li className="flex">
          <Link
            to={`/admindashboard/jwlenquiries`}
            className="flex items-center px-4 border-b-2 border-transparent hover:border-red-600 focus:border-red-600 focus:font-bold transition-colors duration-200"
          >
            JWL Enquiries
          </Link>
        </li>
      </ul>

      
      <ul className="lg:hidden w-full divide-y divide-gray-200">
        {/* <li>
          <Link
            to="/admindashboard"
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200 "
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
        </li> */}
        <li>
          <Link
            to="/admindashboard/register"
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200 "
            onClick={() => setIsMenuOpen(false)}
          >
            Register
          </Link>
        </li>
        <li>
          <Link
            to="/admindashboard/existingusers"
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200 "
            onClick={() => setIsMenuOpen(false)}
          >
            Import
          </Link>
        </li>
        <li>
          <Link
            to="/admindashboard/viewappointment"
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200 "
            onClick={() => setIsMenuOpen(false)}
          >
            View Appointments
          </Link>
        </li>
        <li>
          <Link
            to={`/admindashboard/manageappointment`}
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200 "
            onClick={() => setIsMenuOpen(false)}
          >
            Manage Appointments
          </Link>
        </li>
        <li>
          <Link
            to="/admindashboard/jwlenquiries"
            className="block py-3 text-lg font-semibold text-[#ab1c1c] hover:bg-red-50 transition-colors duration-200 "
            onClick={() => setIsMenuOpen(false)}
          >
            JWL Enquiries
          </Link>
        </li>
      </ul>
    </>
  );
}
