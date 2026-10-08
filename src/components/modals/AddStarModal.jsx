import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';

export default function AddStarModal() {
  const { members, activeModal, setActiveModal, addStarAmbassador } = useAuth();
  const [memberId, setMemberId] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [citation, setCitation] = useState('');

  useEffect(() => {
    if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
  }, [members]);

  if (activeModal !== 'addStar') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) return;
    addStarAmbassador(memberId, awardTitle, citation);
    setAwardTitle('');
    setCitation('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-star text-[#c59b27]"></i>
            <span>Assign Star Admissions Ambassador</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Active Member</label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role} - {m.college})</option>
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
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Commendation Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Ambassador of the Month / High Shift Reliability"
              value={awardTitle}
              onChange={(e) => setAwardTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Recognition Citation / Reason</label>
            <textarea
              rows="3"
              required
              placeholder="Highlight exceptional handling of parents, zero absences, or extra open day hours..."
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
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
              className="px-4 py-1.5 bg-[#002244] text-[#c59b27] font-bold rounded-lg"
            >
              Confirm Recognition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
