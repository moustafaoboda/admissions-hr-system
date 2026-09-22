import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DAYS_LIST = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function ExtraDaysModal() {
  const {
    activeModal,
    setActiveModal,
    modalExtraData,
    members,
    updateMemberExtraDays
  } = useAuth();

  const member = members.find(m => m.id === modalExtraData?.memberId);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    if (member) {
      setSelectedDays(member.extraDays || []);
    }
  }, [member, activeModal]);

  if (activeModal !== 'extraDays' || !member) return null;

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateMemberExtraDays(member.id, selectedDays);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#c59b27] flex items-center justify-center text-sm border border-blue-400/30">
              <i className="fa-solid fa-calendar-plus"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm">Assign Extra Attendance Days</h3>
              <p className="text-[10px] text-slate-300">Member: <span className="font-bold text-[#c59b27]">{member.name}</span></p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-slate-700 space-y-1">
            <div className="font-bold text-[#002244] text-xs">Official Work Days:</div>
            <div className="flex flex-wrap gap-1">
              {(member.officialDays || []).map(d => (
                <span key={d} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-bold">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              Extra days allow this member to appear in attendance roll call logs for non-official shift days.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-2">Select Additional / Extra Days:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAYS_LIST.map(day => {
                const isOfficial = (member.officialDays || []).includes(day);
                const isChecked = selectedDays.includes(day);

                return (
                  <label
                    key={day}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition select-none ${
                      isOfficial
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isChecked
                        ? 'bg-amber-50 border-[#c59b27] text-[#002244] font-bold shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isOfficial}
                      checked={isChecked || isOfficial}
                      onChange={() => !isOfficial && toggleDay(day)}
                      className="rounded text-[#002244] focus:ring-[#002244]"
                    />
                    <span className="text-xs">{day}</span>
                    {isOfficial && <span className="text-[9px] text-slate-400 ml-auto font-normal">(Official)</span>}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-lg shadow transition"
            >
              Save Extra Days
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
