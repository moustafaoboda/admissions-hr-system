import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { currentUser, activeTab, switchTab } = useAuth();

  if (!currentUser) return null;

  const isDean = currentUser.role === "Admission's Dean";

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

        {!isDean && (
          <>
            <button
              onClick={() => switchTab('directory')}
              className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'directory' ? 'active' : ''
              }`}
            >
              <i className="fa-solid fa-users"></i>
              <span>Team Members</span>
            </button>

            <button
              onClick={() => switchTab('attendance')}
              className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'attendance' ? 'active' : ''
              }`}
            >
              <i className="fa-solid fa-clipboard-user"></i>
              <span>Attendance</span>
            </button>

            <button
              onClick={() => switchTab('copilot')}
              className={`nav-tab py-2.5 px-3 sm:px-4 text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'copilot' ? 'active' : ''
              }`}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[#c59b27]"></i>
              <span>AI HR Copilot</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
