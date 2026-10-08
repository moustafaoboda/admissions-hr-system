import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';

export default function EditDischargedModal() {
  const {
    activeModal,
    modalExtraData,
    setActiveModal,
    dischargedMembers,
    updateDischargedMember,
    reinstateMember,
    deleteDischargedMember
  } = useAuth();

  const [name, setName] = useState('');
  const [dischargeType, setDischargeType] = useState('Voluntary Left');
  const [dischargeReason, setDischargeReason] = useState('');
  const [date, setDate] = useState('');

  const dischargedId = modalExtraData?.dischargedId;

  useEffect(() => {
    if (dischargedId && dischargedMembers) {
      const d = dischargedMembers.find(m => m.id === dischargedId);
      if (d) {
        setName(d.name || 'Member');
        setDischargeType(d.dischargeType || 'Voluntary Left');
        setDischargeReason(d.dischargeReason || '');
        setDate(d.date || '');
      }
    }
  }, [dischargedId, dischargedMembers]);

  if (activeModal !== 'editDischarged' || !dischargedId) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateDischargedMember(dischargedId, {
      dischargeType,
      dischargeReason: dischargeReason.trim(),
      date
    });
    setActiveModal(null);
  };

  const handleReinstate = () => {
    reinstateMember(dischargedId);
    setActiveModal(null);
  };

  const handleDeleteDischarged = () => {
    deleteDischargedMember(dischargedId);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-rose-600">
          <div className="flex items-center gap-2.5">
            <MemberAvatar memberId={dischargedId} name={name} size="w-9 h-9 text-xs" className="border border-rose-400" />
            <div>
              <h3 className="font-bold text-sm">Edit Discharged Log: {name}</h3>
              <p className="text-[10px] text-slate-300">Update discharge record or reinstate ambassador</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Member Name</label>
            <input
              type="text"
              disabled
              value={name}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Departure Category</label>
              <select
                value={dischargeType}
                onChange={(e) => setDischargeType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Voluntary Left">Voluntary Left</option>
                <option value="Discharged">Discharged</option>
                <option value="Graduated">Graduated</option>
                <option value="Academic Leave">Academic Leave</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discharge Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Departure / Discharge</label>
            <textarea
              rows="3"
              required
              value={dischargeReason}
              onChange={(e) => setDischargeReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReinstate}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold transition flex items-center gap-1.5 border border-emerald-300"
                title="Reinstate to Active Directory"
              >
                <i className="fa-solid fa-user-plus text-emerald-600"></i>
                <span>Reinstate</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteDischarged}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold transition flex items-center gap-1.5 border border-rose-300"
                title="Permanently Delete Discharged Record"
              >
                <i className="fa-solid fa-trash-can text-rose-600"></i>
                <span>Delete</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-lg shadow transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check text-[#c59b27]"></i>
                <span>Save Log</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
