import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RecruitmentTab() {
  const {
    currentUser,
    recruits,
    enlistRecruit,
    declineRecruit,
    requestRecruitRecommendation,
    setActiveModal,
    setModalExtraData
  } = useAuth();

  const isViceHead = currentUser?.role === "HR Vice Head";
  const isHeadOrVice = currentUser?.role === "HR Head" || isViceHead;
  const isHRMember = currentUser?.role === "HR";

  const handleOpenSchedule = (recruitId) => {
    setModalExtraData({ recruitId });
    setActiveModal('schedule');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Admissions Team Join Requests</h2>
          <p className="text-xs text-slate-500">Review student applications, schedule on-campus interviews in Room 007, and process enlistments.</p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="font-bold text-[#002244]">Interview Room:</span> Smart Village - Meeting Room 007
        </div>
      </div>

      {/* Recruitment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">SV College & Term</th>
                <th className="py-3 px-4">Scheduled Interview</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recruits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">
                    No pending join requests found.
                  </td>
                </tr>
              ) : (
                recruits.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm">{r.name}</div>
                      {r.hrRecommendation && (
                        <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                          <i className="fa-solid fa-tag"></i> {r.hrRecommendation}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                        {r.targetRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.college} (Term {r.term})</td>
                    <td className="py-3 px-4">
                      {r.interviewSchedule ? (
                        <div>
                          <div className="font-bold text-slate-700 text-xs">{r.interviewSchedule}</div>
                          <div className="text-[10px] text-amber-700 font-semibold">
                            <i className="fa-solid fa-location-dot"></i> {r.interviewVenue}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {isHeadOrVice ? (
                        <>
                          <button
                            onClick={() => handleOpenSchedule(r.id)}
                            title="Schedule in Room 007"
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold transition"
                          >
                            <i className="fa-solid fa-calendar-plus"></i> Schedule
                          </button>
                          <button
                            onClick={() => enlistRecruit(r.id)}
                            title="Enlist Member"
                            className="px-2.5 py-1 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] rounded text-[11px] font-bold transition"
                          >
                            <i className="fa-solid fa-check"></i> Enlist
                          </button>
                          <button
                            onClick={() => declineRecruit(r.id)}
                            title="Decline"
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold transition"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </>
                      ) : isHRMember ? (
                        <>
                          <button
                            onClick={() => requestRecruitRecommendation(r.id, 'Accept')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold transition"
                          >
                            Req Accept
                          </button>
                          <button
                            onClick={() => requestRecruitRecommendation(r.id, 'Decline')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded text-[11px] font-bold transition"
                          >
                            Req Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">View only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
