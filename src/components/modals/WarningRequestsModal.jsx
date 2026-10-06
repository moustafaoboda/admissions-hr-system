import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function WarningRequestsModal() {
  const {
    currentUser,
    activeModal,
    setActiveModal,
    warnings,
    approveWarningRequest,
    dismissWarning
  } = useAuth();

  if (activeModal !== 'warningRequestsModal') return null;

  const isHeadOrVice = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";
  const requests = warnings.filter(w => w.status === 'Pending HR Approval');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm border border-amber-400/30">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Warning Requests Review</h3>
              <p className="text-[10px] text-slate-300">Staff-Submitted Disciplinary Requests Awaiting Leadership Approval</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <span>Pending Approvals:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
              {requests.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 italic">
            HR Members submit requests; HR Leadership confirms or dismisses.
          </div>
        </div>

        {/* Requests List */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-grow text-xs">
          {requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-circle-check text-4xl text-emerald-500 mb-3 block"></i>
              <div className="font-bold text-slate-700 text-sm">No Pending Warning Requests</div>
              <p className="text-xs text-slate-500 mt-1">All ambassador warning requests have been reviewed.</p>
            </div>
          ) : (
            requests.map(wrn => (
              <div
                key={wrn.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#002244]">{wrn.memberName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        {wrn.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span><i className="fa-regular fa-calendar mr-1"></i>{wrn.date}</span>
                      <span>•</span>
                      <span><i className="fa-solid fa-user-pen mr-1"></i>Reported by: <strong className="text-slate-700">{wrn.reportedBy}</strong></span>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                    Pending
                  </span>
                </div>

                <div className="p-3 bg-white/90 rounded-lg border border-amber-200/80 text-slate-800 text-xs leading-relaxed">
                  <span className="font-bold text-slate-600 block text-[10px] uppercase tracking-wider mb-1">Reason:</span>
                  {wrn.reason}
                </div>

                {isHeadOrVice && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => dismissWarning(wrn.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition border border-slate-300 flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-xmark text-slate-500"></i>
                      <span>Dismiss Request</span>
                    </button>
                    <button
                      onClick={() => approveWarningRequest(wrn.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition shadow flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Approve & Issue Warning</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
