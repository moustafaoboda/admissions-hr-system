import React from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

// Modals
import LoginModal from './components/modals/LoginModal';
import ProfileModal from './components/modals/ProfileModal';
import AddMemberModal from './components/modals/AddMemberModal';
import EditMemberModal from './components/modals/EditMemberModal';
import DischargeModal from './components/modals/DischargeModal';
import AddStarModal from './components/modals/AddStarModal';
import AddAttendanceModal from './components/modals/AddAttendanceModal';
import WarningModal from './components/modals/WarningModal';
import ScheduleModal from './components/modals/ScheduleModal';
import AddRecruitModal from './components/modals/AddRecruitModal';
import SystemUsersModal from './components/modals/SystemUsersModal';

// Tabs
import DashboardTab from './components/tabs/DashboardTab';
import DirectoryTab from './components/tabs/DirectoryTab';
import AttendanceTab from './components/tabs/AttendanceTab';
import CopilotTab from './components/tabs/CopilotTab';

export default function App() {
  const { currentUser, activeTab } = useAuth();

  const isDean = currentUser?.role === "Admission's Dean";

  if (!currentUser) {
    return (
      <div className="bg-pattern min-h-screen flex flex-col justify-center items-center">
        <Toast />
        <LoginModal />
      </div>
    );
  }

  return (
    <div className="bg-pattern flex flex-col min-h-screen">
      <Toast />

      {/* Navigation Header */}
      <Header />

      {/* Main Layout Grid with Side Control Panel */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Dean View-Only Notice Banner */}
        {isDean && (
          <div className="mb-6 bg-purple-50 border border-purple-300 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900 text-white flex items-center justify-center text-lg flex-shrink-0">
              <i className="fa-solid fa-eye"></i>
            </div>
            <div>
              <h4 className="font-bold text-purple-950 text-sm">Admission's Dean Oversight Mode</h4>
              <p className="text-xs text-purple-800">You are viewing high-level admissions metrics for Smart Village. Operational edits and disciplinary actions are restricted to HR leadership.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Side Control Panel */}
          <Sidebar />

          {/* Main Active Tab Content */}
          <div className="flex-grow w-full min-w-0">
            {activeTab === 'dashboard' && <DashboardTab />}
            {!isDean && activeTab === 'directory' && <DirectoryTab />}
            {!isDean && activeTab === 'attendance' && <AttendanceTab />}
            {!isDean && activeTab === 'copilot' && <CopilotTab />}
          </div>
        </div>
      </main>

      {/* Global Modals */}
      <ProfileModal />
      <AddMemberModal />
      <EditMemberModal />
      <DischargeModal />
      <AddStarModal />
      <AddAttendanceModal />
      <WarningModal />
      <ScheduleModal />
      <AddRecruitModal />
      <SystemUsersModal />
    </div>
  );
}
