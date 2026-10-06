import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { currentUser, activeTab, switchTab } = useAuth();

  if (!currentUser) return null;

  const isHRMember = currentUser.role === "HR";
  const isHeadOrVice = currentUser.role === "HR Head" || currentUser.role === "HR Vice Head";

  return (
    <div className="bg-[#001830] border-t border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-4 overflow-x-auto text-xs sm:text-sm font-medium">
        <button
          onClick={() => switchTab('dashboard')}
          className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard' ? 'active' : ''
          }`}
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => switchTab('directory')}
          className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'directory' ? 'active' : ''
          }`}
        >
          <i className="fa-solid fa-users"></i>
          <span>Team Members</span>
        </button>

        {!isHRMember && (
          <button
            onClick={() => switchTab('attendance')}
            className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'attendance' ? 'active' : ''
            }`}
          >
            <i className="fa-solid fa-clipboard-user"></i>
            <span>Attendance</span>
          </button>
        )}

        <button
          onClick={() => switchTab('monitoring')}
          className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'monitoring' ? 'active' : ''
          }`}
        >
          <i className="fa-solid fa-clipboard-check text-[#c59b27]"></i>
          <span>Monitoring</span>
        </button>

        {!isHRMember && (
          <button
            onClick={() => switchTab('copilot')}
            className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'copilot' ? 'active' : ''
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-[#c59b27]"></i>
            <span>AI HR Copilot</span>
          </button>
        )}

        {isHeadOrVice && (
          <button
            onClick={() => switchTab('activityLog')}
            className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'activityLog' ? 'active' : ''
            }`}
          >
            <i className="fa-solid fa-clock-rotate-left text-amber-400"></i>
            <span>Activity Log</span>
          </button>
        )}
      </div>
    </div>
  );
}
