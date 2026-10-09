import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const {
    currentUser,
    logout,
    warnings,
    setActiveModal,
    setModalExtraData
  } = useAuth();

  if (!currentUser) return null;

  const isViceHead = currentUser.role === "HR Vice Head";
  const isHeadOrVice = currentUser.role === "HR Head" || isViceHead;
  const isHRMember = currentUser.role === "HR";
  const isDean = currentUser.role === "Admission's Dean";

  const initials = (currentUser?.name || "HR").split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("") || "HR";
  const confirmedWarningsCount = (warnings || []).filter(w => w.status !== 'Pending HR Approval').length;
  const pendingRequestsCount = (warnings || []).filter(w => w.status === 'Pending HR Approval').length;

  const handleOpenWarning = (mode) => {
    setModalExtraData({ mode });
    setActiveModal('warning');
  };

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-4">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-[#002244] to-[#00162e] text-white rounded-2xl p-4 border-2 border-[#c59b27] shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#c59b27] text-[#002244] font-black flex items-center justify-center text-base border-2 border-white shadow overflow-hidden flex-shrink-0">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-full block" />
            ) : (
              initials || 'HR'
            )}
          </div>
          <div className="flex-grow">
            <div className="font-extrabold text-sm text-white leading-tight">{currentUser.name}</div>
            <div className="text-xs text-[#dfb743] font-bold mt-0.5">{currentUser.role}</div>
            <div className="text-[10px] text-slate-300 font-medium">Smart Village Admissions</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveModal('profile')}
            className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200 font-bold transition flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-user-pen text-[#c59b27]"></i>
            <span>Edit Profile</span>
          </button>

          {isViceHead && (
            <button
              onClick={() => setActiveModal('systemUsers')}
              className="py-1.5 px-2.5 bg-[#c59b27] hover:bg-[#dfb743] text-[#002244] rounded-lg font-extrabold transition flex items-center justify-center gap-1"
              title="Manage Users & Passwords"
            >
              <i className="fa-solid fa-key"></i>
            </button>
          )}

          <button
            onClick={logout}
            className="py-1.5 px-3 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-1"
            title="Sign Out"
          >
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>

      {/* Warnings Card: Viewable by all users */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-base font-bold shadow-sm">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002244]">Warnings</h3>
              <p className="text-[10px] text-slate-500">Disciplinary Notifications</p>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-black rounded-full border border-rose-300">
            {confirmedWarningsCount}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={() => setActiveModal('warningsListModal')}
            className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-2 transition"
          >
            <i className="fa-solid fa-window-restore text-rose-600"></i>
            <span>Open Warnings ({confirmedWarningsCount})</span>
          </button>

          {isHeadOrVice ? (
            <button
              onClick={() => handleOpenWarning('issue')}
              className="w-full py-1.5 px-3 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] flex items-center justify-center gap-1.5 transition"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Issue New Warning</span>
            </button>
          ) : isHRMember ? (
            <button
              onClick={() => handleOpenWarning('request')}
              className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-300 flex items-center justify-center gap-1.5 transition"
            >
              <i className="fa-solid fa-paper-plane text-[10px] text-amber-600"></i>
              <span>Request Warning Strike</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Warning Requests Card: Under Warnings, Visible ONLY to HR Leadership (Hidden for HR Members and Dean) */}
      {isHeadOrVice && (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3 hover:border-amber-300 transition bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base font-bold shadow-sm border border-amber-200">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#002244]">Warning Requests</h3>
                <p className="text-[10px] text-slate-500">Staff Submissions</p>
              </div>
            </div>

            <span className={`px-2 py-0.5 text-xs font-black rounded-full border ${
              pendingRequestsCount > 0
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {pendingRequestsCount}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveModal('warningRequestsModal')}
              className="w-full py-2 px-3 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-xl border border-[#c59b27] flex items-center justify-center gap-2 transition shadow-sm"
            >
              <i className="fa-solid fa-list-check text-xs"></i>
              <span>Review Requests ({pendingRequestsCount})</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
