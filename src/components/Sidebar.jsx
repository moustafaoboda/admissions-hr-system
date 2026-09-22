import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const {
    currentUser,
    logout,
    warnings,
    approveWarningRequest,
    dismissWarning,
    recruits,
    enlistRecruit,
    declineRecruit,
    requestRecruitRecommendation,
    setActiveModal,
    setModalExtraData
  } = useAuth();

  if (!currentUser) return null;

  const isViceHead = currentUser.role === "HR Vice Head";
  const isHeadOrVice = currentUser.role === "HR Head" || isViceHead;
  const isHRMember = currentUser.role === "HR";
  const isDean = currentUser.role === "Admission's Dean";

  const initials = currentUser.name.split(" ").map(n => n[0]).slice(0, 2).join("");

  const handleOpenWarning = (mode) => {
    setModalExtraData({ mode });
    setActiveModal('warning');
  };

  const handleOpenSchedule = (recruitId) => {
    setModalExtraData({ recruitId });
    setActiveModal('schedule');
  };

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-4">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-[#002244] to-[#00162e] text-white rounded-2xl p-4 border-2 border-[#c59b27] shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#c59b27] text-[#002244] font-black flex items-center justify-center text-base border-2 border-white shadow">
            {initials || 'HR'}
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

      {!isDean && (
        <>
          {/* Warnings Control Panel Button Card */}
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
                {warnings.length}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => setActiveModal('warningsListModal')}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-2 transition"
              >
                <i className="fa-solid fa-[#002244] fa-window-restore text-rose-600"></i>
                <span>Open Warnings ({warnings.length})</span>
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
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-paper-plane text-[10px]"></i>
                  <span>Request Warning</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Join Requests Control Panel Button Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#c59b27] flex items-center justify-center text-base font-bold shadow-sm">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002244]">Join Requests</h3>
                  <p className="text-[10px] text-slate-500">Meeting Room 007</p>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-xs font-black rounded-full border border-amber-300">
                {recruits.length}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => setActiveModal('recruitsListModal')}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#002244] font-bold text-xs rounded-xl border border-amber-200 flex items-center justify-center gap-2 transition"
              >
                <i className="fa-solid fa-folder-open text-[#c59b27]"></i>
                <span>Open Join Requests ({recruits.length})</span>
              </button>

              <button
                onClick={() => setActiveModal('addRecruit')}
                className="w-full py-1.5 px-3 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] flex items-center justify-center gap-1.5 transition"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Submit Join Request</span>
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
