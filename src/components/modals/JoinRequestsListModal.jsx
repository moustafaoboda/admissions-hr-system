import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function JoinRequestsListModal() {
  const {
    currentUser,
    activeModal,
    setActiveModal,
    setModalExtraData,
    recruits,
    enlistRecruit,
    declineRecruit,
    requestRecruitRecommendation
  } = useAuth();

  if (activeModal !== 'recruitsListModal') return null;

  const isViceHead = currentUser?.role === "HR Vice Head";
  const isHeadOrVice = currentUser?.role === "HR Head" || isViceHead;

  const handleOpenSchedule = (recruitId) => {
    setModalExtraData({ recruitId });
    setActiveModal('schedule');
  };

  const handleOpenAddRecruit = () => {
    setActiveModal('addRecruit');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#c59b27] flex items-center justify-center text-sm border border-amber-400/30">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Join Requests & Recruitment Applicants</h3>
              <p className="text-[10px] text-slate-300">Smart Village Admissions • Room 007 Interviews</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs font-semibold text-slate-600">
            Total Join Applicants: <span className="font-extrabold text-[#002244]">{recruits.length}</span>
          </div>
          <button
            onClick={handleOpenAddRecruit}
            className="px-3 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] flex items-center gap-1.5 transition shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Submit Join Request</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-grow text-xs">
          {recruits.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-id-card-clip text-3xl text-slate-300 mb-2 block"></i>
              No pending recruitment requests.
            </div>
          ) : (
            recruits.map(rec => (
              <div key={rec.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-slate-300 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#002244] text-sm">{rec.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {rec.college} • Term {rec.term} • Target: <span className="font-bold text-[#002244]">{rec.targetRole}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    rec.status === 'Interview Scheduled' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {rec.status}
                  </span>
                </div>

                {rec.interviewSchedule ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5">
                    <i className="fa-regular fa-clock text-emerald-600"></i>
                    <span><strong>{rec.interviewSchedule}</strong> ({rec.interviewVenue})</span>
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                    <i className="fa-solid fa-triangle-exclamation mr-1 text-amber-600"></i>
                    Interview pending schedule in Room 007.
                  </div>
                )}

                {rec.hrRecommendation && (
                  <div className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 p-1.5 rounded">
                    {rec.hrRecommendation}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isHeadOrVice ? (
                      <>
                        <button
                          onClick={() => handleOpenSchedule(rec.id)}
                          className="px-2.5 py-1 bg-[#002244] hover:bg-[#00162e] text-white font-bold text-[10px] rounded transition flex items-center gap-1"
                        >
                          <i className="fa-regular fa-calendar-plus"></i>
                          <span>Schedule</span>
                        </button>
                        <button
                          onClick={() => enlistRecruit(rec.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition flex items-center gap-1"
                        >
                          <i className="fa-solid fa-user-check"></i>
                          <span>Enlist to Team</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => requestRecruitRecommendation(rec.id, 'Accept')}
                          className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded hover:bg-emerald-200"
                        >
                          Recommend Accept
                        </button>
                        <button
                          onClick={() => requestRecruitRecommendation(rec.id, 'Reject')}
                          className="px-2 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded hover:bg-rose-200"
                        >
                          Recommend Reject
                        </button>
                      </>
                    )}
                  </div>

                  {isHeadOrVice && (
                    <button
                      onClick={() => declineRecruit(rec.id)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-[10px] rounded transition flex items-center gap-1"
                      title="Remove Request"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                      <span>Remove Request</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right flex-shrink-0">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
