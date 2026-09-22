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
          {/* Warnings Control Panel */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002244]">Warnings</h3>
                  <p className="text-[10px] text-slate-500">Disciplinary Logs</p>
                </div>
              </div>

              {isHeadOrVice ? (
                <button
                  onClick={() => handleOpenWarning('issue')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  <span>Issue</span>
                </button>
              ) : isHRMember ? (
                <button
                  onClick={() => handleOpenWarning('request')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1"
                >
                  <i className="fa-solid fa-paper-plane text-[10px]"></i>
                  <span>Request</span>
                </button>
              ) : null}
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1 text-xs">
              {warnings.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs">No active warning notifications.</div>
              ) : (
                warnings.map(w => (
                  <div key={w.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{w.memberName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                        w.level.includes('Final') ? 'bg-purple-100 text-purple-900' :
                        w.level.includes('Written') ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {w.level}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] italic leading-tight">"{w.reason}"</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{w.date} • {w.reportedBy.split(' ')[0]}</span>
                      <span className={`font-bold ${w.status === 'Confirmed Strike' ? 'text-rose-700' : 'text-amber-700'}`}>
                        {w.status}
                      </span>
                    </div>

                    {isHeadOrVice && w.status === 'Pending HR Approval' && (
                      <div className="flex gap-1.5 pt-1.5">
                        <button
                          onClick={() => approveWarningRequest(w.id)}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px]"
                        >
                          Approve Warning
                        </button>
                        <button
                          onClick={() => dismissWarning(w.id)}
                          className="py-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-[10px]"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Join Requests Control Panel */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#c59b27] flex items-center justify-center text-sm">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002244]">Join Requests</h3>
                  <p className="text-[10px] text-slate-500">Meeting Room 007</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('addRecruit')}
                className="px-2.5 py-1 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] transition flex items-center gap-1"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Submit</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1 text-xs">
              {recruits.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs">No pending join requests.</div>
              ) : (
                recruits.map(r => (
                  <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{r.name}</span>
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">{r.targetRole}</span>
                    </div>

                    <div className="text-[10px] text-slate-600">{r.college} (Term {r.term})</div>

                    {r.interviewSchedule ? (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-calendar-check text-[#c59b27]"></i>
                        <span>{r.interviewSchedule}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">Interview Not Scheduled</div>
                    )}

                    {r.hrRecommendation && (
                      <div className="text-[10px] text-amber-700 font-bold">
                        <i className="fa-solid fa-tag"></i> {r.hrRecommendation}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200/60">
                      {isHeadOrVice ? (
                        <>
                          <button
                            onClick={() => handleOpenSchedule(r.id)}
                            className="flex-1 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[10px] flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-calendar-plus text-[9px]"></i> Schedule Rm 007
                          </button>
                          <button
                            onClick={() => enlistRecruit(r.id)}
                            className="py-1 px-2.5 bg-[#002244] text-[#c59b27] font-bold rounded text-[10px]"
                            title="Enlist Member"
                          >
                            Enlist
                          </button>
                          <button
                            onClick={() => declineRecruit(r.id)}
                            className="py-1 px-2 bg-rose-100 text-rose-700 font-bold rounded text-[10px]"
                            title="Decline"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </>
                      ) : isHRMember ? (
                        <>
                          <button
                            onClick={() => requestRecruitRecommendation(r.id, 'Accept')}
                            className="flex-1 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]"
                          >
                            Req Accept
                          </button>
                          <button
                            onClick={() => requestRecruitRecommendation(r.id, 'Decline')}
                            className="flex-1 py-1 bg-rose-100 text-rose-800 font-bold rounded text-[10px]"
                          >
                            Req Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">View only</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
