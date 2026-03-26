import React from "react";
import SuperAdminSideNav from "../../Components/SuperAdminSideNav";
import { Route, Routes } from "react-router-dom";
import SuperAdminDashboard from "./SuperAdminDashboard";
import UsersView from "./UsersView";
import SuperAdminChildView from "./SuperAdminChildView";
import ChildDetailView from "./ChildDetailView";
import ChildIEPsView from "./ChildIEPsView";
import ChildAppointmentsView from "./ChildAppointmentsView";
import SuperAdminAppointmentView from "./SuperAdminAppointmentView";
import SuperAdminCentreView from "./SuperAdminCentreView";
import SuperAdminSystemHealth from "./SuperAdminSystemHealth";
import SlotManagement from "./SlotManagement";
import DoctorRegistration from "./DoctorRegistration";
export default function SuperAdminWrapper() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* <UserProfileHeader /> */}
      <div className="flex min-h-screen">
        <SuperAdminSideNav />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="/children" element={<SuperAdminChildView />} />
            <Route path="/children/:childId" element={<ChildDetailView />} />
            <Route path="/children/:childId/ieps" element={<ChildIEPsView />} />
            <Route path="/children/:childId/appointments" element={<ChildAppointmentsView />} />
            <Route path="/appointments" element={<SuperAdminAppointmentView />} />
            <Route path="/centres" element={<SuperAdminCentreView />} />
            <Route path="/doctor-registration" element={<DoctorRegistration />} />
            <Route path="/slot-management" element={<SlotManagement />} />
            <Route path="/system-health" element={<SuperAdminSystemHealth />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
