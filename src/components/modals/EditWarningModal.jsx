import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditWarningModal() {
  const { activeModal, modalExtraData, setActiveModal, warnings, updateWarning, dismissWarning } = useAuth();

  const [level, setLevel] = useState('First Verbal Warning');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Confirmed Strike');
  const [memberName, setMemberName] = useState('');

  const warningId = modalExtraData?.warningId;

  useEffect(() => {
    if (warningId && warnings) {
      const wrn = warnings.find(w => w.id === warningId);
      if (wrn) {
        setLevel(wrn.level || 'First Verbal Warning');
        setReason(wrn.reason || '');
        setDate(wrn.date || '');
        setStatus(wrn.status || 'Confirmed Strike');
        setMemberName(wrn.memberName || 'Member');
      }
    }
  }, [warningId, warnings]);

  if (activeModal !== 'editWarning' || !warningId) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    updateWarning(warningId, {
      level,
      reason: reason.trim(),
      date,
      status
    });

    setActiveModal('warningsListModal');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete warning record for ${memberName}?`)) {
      dismissWarning(warningId);
      setActiveModal('warningsListModal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-rose-500">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-rose-400"></i>
            <span>Edit Warning Record: {memberName}</span>
          </h3>
          <button onClick={() => setActiveModal('warningsListModal')} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Member</label>
            <input
              type="text"
              disabled
              value={memberName}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Disciplinary Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="First Verbal Warning">First Verbal Warning</option>
                <option value="Second Verbal Notice">Second Verbal Notice</option>
                <option value="Official Written Strike">Official Written Strike</option>
                <option value="Disciplinary Review Warning">Disciplinary Review Warning</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Confirmed Strike">Confirmed Strike</option>
                <option value="Pending HR Approval">Pending HR Approval</option>
                <option value="Under Appeal">Under Appeal</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Date Logged</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason & Incident Description</label>
            <textarea
              rows="3"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold transition flex items-center gap-1.5 border border-rose-200"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
              <span>Dismiss Warning</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal('warningsListModal')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-lg shadow transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check text-[#c59b27]"></i>
                <span>Save Warning</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
