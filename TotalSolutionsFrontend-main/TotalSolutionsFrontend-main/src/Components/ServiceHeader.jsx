import React from "react";
import { useSelector } from "react-redux";
import AdminServiceHeader from "./ServiceHeaders/AdminServiceHeader";
import ParentServiceHeader from "./ServiceHeaders/ParentServiceHeader";
import DoctorServiceHeader from "./ServiceHeaders/DoctorServiceHeader";
import TherapistServiceHeader from "./ServiceHeaders/TherapistServiceHeader";

export default function ServiceHeader({ isMobileMenuOpen }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = sessionStorage.getItem("role");

  return (
    <div>
      {isAuthenticated&& (role==="No-service-role") && (
        <div className="container lg:mx-auto lg:mt-1 lg:p-2">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between ">
            {role === "admin" && <AdminServiceHeader />}
            {/* {role === "parent" && <ParentServiceHeader />} */}
            {/* {role === "doctor" && <DoctorServiceHeader />} */}
            {/* {role === "therapist" && <TherapistServiceHeader />} */}
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden ">
              {role === "admin" && <AdminServiceHeader />}
              {/* {role === "parent" && <ParentServiceHeader />} */}
              {/* {role === "doctor" && <DoctorServiceHeader />} */}
              {/* {role === "therapist" && <TherapistServiceHeader />} */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
