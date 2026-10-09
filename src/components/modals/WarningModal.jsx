import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';

export default function WarningModal() {
  const { currentUser, members, activeModal, modalExtraData, setActiveModal, submitWarning } = useAuth();
  const [memberId, setMemberId] = useState('');
  const [level, setLevel] = useState('First Verbal Warning');
  const [reason, setReason] = useState('');

  const mode = modalExtraData?.mode || 'issue'; // 'issue' or 'request'
  const isLeadership = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";

  useEffect(() => {
    if (modalExtraData?.preselectedMemberId) {
      setMemberId(modalExtraData.preselectedMemberId);
    } else if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
  }, [modalExtraData, members]);

  const isHRMember = currentUser?.role === "HR";
  if (activeModal !== 'warning' || isHRMember) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) return;
    submitWarning(memberId, level, reason);
    setReason('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            {mode === 'request' || !isLeadership ? (
              <>
                <i className="fa-solid fa-paper-plane text-amber-500"></i>
                <span>Request Warning Issuance</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-triangle-exclamation text-rose-500"></i>
                <span>Issue Disciplinary Strike</span>
              </>
            )}
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Member</label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role} - {m.position})</option>
              ))}
            </select>

            {/* Member Preview Card */}
            {members.find(m => m.id === memberId) && (() => {
              const mem = members.find(m => m.id === memberId);
              return (
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg mt-2 shadow-xs">
                  <MemberAvatar member={mem} size="w-9 h-9 text-xs" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-slate-800 text-xs truncate">{mem.name}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">{mem.role}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{mem.college}</div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                    {mem.strikes || 0} Strikes
                  </span>
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Warning Level / Type</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="First Verbal Warning">First Verbal Warning</option>
              <option value="Official Written Strike">Official Written Strike</option>
              <option value="Final Hearing Notice">Final Hearing Notice</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Infraction Reason & Evidence</label>
            <textarea
              rows="3"
              required
              placeholder="Unexcused absence from assigned registration desk, dress code violation, or late arrival to Room 007..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={
                mode === 'request' || !isLeadership
                  ? "px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                  : "px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
              }
            >
              {mode === 'request' || !isLeadership ? 'Submit Request to HR Leadership' : 'Confirm Official Strike'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
