import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar, UserAvatar } from '../common/Avatars';

export default function WarningsListModal() {
  const {
    currentUser,
    activeModal,
    setActiveModal,
    setModalExtraData,
    warnings,
    approveWarningRequest,
    dismissWarning
  } = useAuth();

  const [subTab, setSubTab] = useState('confirmed'); // 'confirmed' | 'requests'

  if (activeModal !== 'warningsListModal') return null;

  const isViceHead = currentUser?.role === "HR Vice Head";
  const isHeadOrVice = currentUser?.role === "HR Head" || isViceHead;
  const isDean = currentUser?.role === "Admission's Dean";

  const confirmedWarnings = warnings.filter(w => w.status !== 'Pending HR Approval');

  const handleOpenIssueWarning = () => {
    setModalExtraData({ mode: isHeadOrVice ? 'issue' : 'request' });
    setActiveModal('warning');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center text-sm border border-rose-400/30">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Warnings Log</h3>
              <p className="text-[10px] text-slate-300">Smart Village Admissions Confirmed Disciplinary Strikes</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <i className="fa-solid fa-shield-halved text-rose-600"></i>
            <span>Confirmed Warnings Log:</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold border border-rose-200">
              {confirmedWarnings.length}
            </span>
          </div>

          {!isDean && isHeadOrVice && (
            <button
              onClick={handleOpenIssueWarning}
              className="px-3 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] flex items-center gap-1.5 transition shadow-sm"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Issue New Warning</span>
            </button>
          )}
        </div>

        {/* Warnings List Content */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-grow text-xs">
          {confirmedWarnings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-circle-check text-3xl text-emerald-500 mb-2 block"></i>
              No confirmed warning records logged.
            </div>
          ) : (
            confirmedWarnings.map(wrn => (
              <div
                key={wrn.id}
                className={`p-3.5 rounded-xl border transition ${
                  wrn.status === 'Pending HR Approval'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <MemberAvatar name={wrn.memberName} size="w-9 h-9 text-xs" className="border border-rose-300" />
                    <div>
                      <div className="font-bold text-[#002244] text-sm flex items-center gap-1.5">
                        <span>{wrn.memberName}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          wrn.status === 'Pending HR Approval' ? 'bg-amber-200 text-amber-900' : 'bg-rose-200 text-rose-900'
                        }`}>
                          {wrn.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-rose-700 mt-0.5">{wrn.level}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{wrn.date}</span>
                </div>

                <p className="text-slate-600 text-xs mt-2 italic bg-white/70 p-2 rounded-lg border border-slate-200/60">
                  "{wrn.reason}"
                </p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                    <UserAvatar user={wrn.reportedBy} name={wrn.reportedBy} size="w-4 h-4 text-[8px]" />
                    <span>Reported by: <span className="font-semibold text-slate-700">{wrn.reportedBy}</span></span>
                  </span>

                  <div className="flex items-center gap-2">
                    {isHeadOrVice && (
                      <button
                        onClick={() => {
                          setModalExtraData({ warningId: wrn.id });
                          setActiveModal('editWarning');
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#002244] border border-amber-300 font-bold text-[10px] rounded transition flex items-center gap-1"
                        title="Edit Warning"
                      >
                        <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                        <span>Edit</span>
                      </button>
                    )}
                    {isHeadOrVice && (
                      <button
                        onClick={() => dismissWarning(wrn.id)}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-[10px] rounded transition flex items-center gap-1"
                        title="Remove / Dismiss Warning"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
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
