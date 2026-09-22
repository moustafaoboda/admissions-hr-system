import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AddAttendanceModal() {
  const { members, activeModal, setActiveModal, createAttendanceSession } = useAuth();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('Normal Day Shift');
  const [selectedMembers, setSelectedMembers] = useState({});

  useEffect(() => {
    const initialSelected = {};
    members.forEach(m => {
      initialSelected[m.id] = true;
    });
    setSelectedMembers(initialSelected);
  }, [members, activeModal]);

  if (activeModal !== 'addAttendance') return null;

  const toggleMember = (id) => {
    setSelectedMembers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const presentCount = Object.values(selectedMembers).filter(Boolean).length;
    createAttendanceSession(title, date, type, presentCount);
    setTitle('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-calendar-plus text-[#c59b27]"></i>
            <span>Create Attendance List for Day</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Session Title / Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Village Registration Hall - Morning Shift"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Normal Day Shift">Normal Booth Shift</option>
                <option value="Official Meeting">Official HR Meeting</option>
                <option value="Special Open Day">Special Open Day Event</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block font-bold text-slate-700 mb-1">Attendance Roll Call</label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 p-2 space-y-1 custom-scrollbar">
              {members.map(m => (
                <label key={m.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <span className="text-slate-700 font-semibold">{m.name} <span className="text-slate-400 font-normal">({m.role})</span></span>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedMembers[m.id])}
                    onChange={() => toggleMember(m.id)}
                    className="rounded text-[#002244] focus:ring-0"
                  />
                </label>
              ))}
            </div>
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
              Save Attendance Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
