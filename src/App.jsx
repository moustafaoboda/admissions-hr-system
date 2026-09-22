import React from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Toast from './components/Toast';

// Modals
import LoginModal from './components/modals/LoginModal';
import ProfileModal from './components/modals/ProfileModal';
import AddMemberModal from './components/modals/AddMemberModal';
import AddStarModal from './components/modals/AddStarModal';
import AddAttendanceModal from './components/modals/AddAttendanceModal';
import WarningModal from './components/modals/WarningModal';
import ScheduleModal from './components/modals/ScheduleModal';
import SystemUsersModal from './components/modals/SystemUsersModal';

// Tabs
import DashboardTab from './components/tabs/DashboardTab';
import DirectoryTab from './components/tabs/DirectoryTab';
import AttendanceTab from './components/tabs/AttendanceTab';
import WarningsTab from './components/tabs/WarningsTab';
import RecruitmentTab from './components/tabs/RecruitmentTab';
import CopilotTab from './components/tabs/CopilotTab';

export default function App() {
  const { currentUser, activeTab } = useAuth();

  const isDean = currentUser?.role === "Admission's Dean";
  const isViceHead = currentUser?.role === "HR Vice Head";

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

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Vice Head Credentials Banner */}
        {isViceHead && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-2 border-[#c59b27] rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#c59b27] text-[#002244] flex items-center justify-center text-xl shadow flex-shrink-0">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[#002244] text-sm sm:text-base">HR Vice Head Credentials & Security Console</h3>
                  <span className="bg-[#002244] text-white text-[10px] font-bold px-2 py-0.5 rounded">Exclusive Access</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">Directly inspect or modify all team passwords, change usernames, and register new system logins.</p>
              </div>
            </div>
            <button
              onClick={() => useAuth().setActiveModal('systemUsers')}
              className="w-full sm:w-auto px-4 py-2 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] hover:text-[#dfb743] border border-[#c59b27] font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <i className="fa-solid fa-users-gear"></i>
              <span>Manage Passwords & Users</span>
            </button>
          </div>
        )}

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

        {/* Render Selected Tab */}
        {activeTab === 'dashboard' && <DashboardTab />}
        {!isDean && activeTab === 'directory' && <DirectoryTab />}
        {!isDean && activeTab === 'attendance' && <AttendanceTab />}
        {!isDean && activeTab === 'warnings' && <WarningsTab />}
        {!isDean && activeTab === 'recruitment' && <RecruitmentTab />}
        {!isDean && activeTab === 'copilot' && <CopilotTab />}
      </main>

      {/* Global Modals */}
      <ProfileModal />
      <AddMemberModal />
      <AddStarModal />
      <AddAttendanceModal />
      <WarningModal />
      <ScheduleModal />
      <SystemUsersModal />
    </div>
  );
}
