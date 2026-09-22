import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DischargeModal() {
  const { members, activeModal, modalExtraData, setActiveModal, dischargeMember } = useAuth();

  const [memberName, setMemberName] = useState('');
  const [dischargeType, setDischargeType] = useState('Voluntary Left');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (modalExtraData?.memberId) {
      const mem = members.find(m => m.id === modalExtraData.memberId);
      if (mem) {
        setMemberName(mem.name);
      }
    }
  }, [modalExtraData, members]);

  if (activeModal !== 'dischargeMember') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!modalExtraData?.memberId) return;

    dischargeMember(modalExtraData.memberId, dischargeType, reason);
    setReason('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-rose-900 p-4 text-white flex items-center justify-between border-b-2 border-rose-500">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-user-minus text-rose-300"></i>
            <span>Discharge Member</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-rose-300 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-900 font-medium">
            Are you sure you want to discharge <span className="font-bold">{memberName}</span>? This will move the member to the <span className="font-bold">Discharged Members</span> log.
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Discharge Category</label>
            <select
              value={dischargeType}
              onChange={(e) => setDischargeType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
            >
              <option value="Voluntary Left">Voluntary Left (Resigned/Graduated)</option>
              <option value="Discharged">Discharged (Administrative Action)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Discharge</label>
            <textarea
              rows="3"
              required
              placeholder="State the detailed reason for voluntary departure or administrative discharge..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-minus"></i>
              <span>Confirm Discharge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
