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
import SystemUsersModal from './components/modals/SystemUsersModal';
import WarningsListModal from './components/modals/WarningsListModal';
import WarningRequestsModal from './components/modals/WarningRequestsModal';
import ExtraDaysModal from './components/modals/ExtraDaysModal';
import AddEventModal from './components/modals/AddEventModal';
import EditEventModal from './components/modals/EditEventModal';
import EditWarningModal from './components/modals/EditWarningModal';
import EditDischargedModal from './components/modals/EditDischargedModal';
import EditMonitoringNoteModal from './components/modals/EditMonitoringNoteModal';
import EditActivityModal from './components/modals/EditActivityModal';
import SystemIconModal from './components/modals/SystemIconModal';

// Tabs
import DashboardTab from './components/tabs/DashboardTab';
import DirectoryTab from './components/tabs/DirectoryTab';
import AttendanceTab from './components/tabs/AttendanceTab';
import MonitoringTab from './components/tabs/MonitoringTab';
import CopilotTab from './components/tabs/CopilotTab';
import ActivityLogTab from './components/tabs/ActivityLogTab';

export default function App() {
  const { currentUser, activeTab } = useAuth();

  const isHeadOrVice = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";
  const isHRMember = currentUser?.role === "HR";
  const isDean = currentUser?.role === "Admission's Dean";

  if (!currentUser) {
    return (
      <div className="bg-[#001428] bg-pattern min-h-screen flex flex-col justify-center items-center">
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

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Side Control Panel */}
          <Sidebar />

          {/* Main Active Tab Content */}
          <div className="flex-grow w-full min-w-0">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'directory' && <DirectoryTab />}
            {!isHRMember && activeTab === 'attendance' && <AttendanceTab />}
            {!isDean && activeTab === 'monitoring' && <MonitoringTab />}
            {!isHRMember && !isDean && activeTab === 'copilot' && <CopilotTab />}
            {isHeadOrVice && activeTab === 'activityLog' && <ActivityLogTab />}
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
      <SystemUsersModal />
      <WarningsListModal />
      <WarningRequestsModal />
      <ExtraDaysModal />
      <AddEventModal />
      <EditEventModal />
      <EditWarningModal />
      <EditDischargedModal />
      <EditMonitoringNoteModal />
      <EditActivityModal />
      <SystemIconModal />
    </div>
  );
}
