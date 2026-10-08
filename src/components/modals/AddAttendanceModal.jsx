import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';

export default function AddAttendanceModal() {
  const { members, activeModal, setActiveModal, createAttendanceSession } = useAuth();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayName, setDayName] = useState('');
  const [sessionType, setSessionType] = useState('Normal Day');
  const [rollCall, setRollCall] = useState([]);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [filterByDay, setFilterByDay] = useState(true);

  useEffect(() => {
    if (date) {
      const d = new Date(date);
      setDayName(daysOfWeek[d.getDay()] || "Sunday");
    }
  }, [date]);

  useEffect(() => {
    if (members && members.length > 0) {
      let filtered = members;
      if (filterByDay && dayName) {
        filtered = members.filter(m => 
          (m.officialDays || []).includes(dayName) || 
          (m.extraDays || []).includes(dayName)
        );
      }
      setRollCall(filtered.map(m => ({
        memberId: m.id,
        name: m.name,
        role: m.role,
        isPresent: true,
        isExcused: false,
        excuseReason: ''
      })));
    }
  }, [members, activeModal, dayName, filterByDay]);

  if (activeModal !== 'addAttendance') return null;

  const togglePresence = (memberId) => {
    setRollCall(prev => prev.map(item => item.memberId === memberId ? {
      ...item,
      isPresent: !item.isPresent,
      isExcused: !item.isPresent ? false : item.isExcused,
      excuseReason: !item.isPresent ? '' : item.excuseReason
    } : item));
  };

  const toggleExcuse = (memberId) => {
    setRollCall(prev => prev.map(item => item.memberId === memberId ? {
      ...item,
      isExcused: !item.isExcused,
      excuseReason: !item.isExcused ? item.excuseReason : ''
    } : item));
  };

  const updateExcuseReason = (memberId, reason) => {
    setRollCall(prev => prev.map(item => item.memberId === memberId ? {
      ...item,
      excuseReason: reason
    } : item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    createAttendanceSession(title.trim(), date, sessionType, rollCall);
    setTitle('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-calendar-plus text-[#c59b27]"></i>
            <span>Create Attendance Roll Call</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col flex-grow overflow-hidden space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Title / Event</label>
              <input
                type="text"
                required
                placeholder="e.g. Morning Booth Shift"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date ({dayName})</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-[#002244]"
              >
                <option value="Normal Day">Normal Day</option>
                <option value="Double Attendance">Double Attendance</option>
                <option value="Triple Attendance">Triple Attendance</option>
                <option value="Orientation Day">Orientation Day</option>
                <option value="EDU Gate">EDU Gate</option>
                <option value="Event Day">Event Day</option>
              </select>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl">
            <div className="bg-slate-100 p-2.5 font-bold text-slate-700 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span>Member Roll Call List ({rollCall.filter(r=>r.isPresent).length} / {rollCall.length} Scheduled Present)</span>
              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#002244] bg-white px-2 py-1 rounded border border-slate-200">
                  <input
                    type="checkbox"
                    checked={filterByDay}
                    onChange={(e) => setFilterByDay(e.target.checked)}
                    className="rounded text-[#002244]"
                  />
                  <span>Show Only {dayName} Scheduled Members</span>
                </label>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {rollCall.map(item => (
                <div key={item.memberId} className="p-3 hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <MemberAvatar memberId={item.memberId} name={item.name} size="w-7 h-7 text-[10px]" />
                    <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-600">{item.role}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Status Button */}
                    <button
                      type="button"
                      onClick={() => togglePresence(item.memberId)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        item.isPresent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <i className={`fa-solid ${item.isPresent ? 'fa-check' : 'fa-xmark'}`}></i>
                      <span>{item.isPresent ? 'Present' : 'Absent'}</span>
                    </button>

                    {/* Excuse Options if Absent */}
                    {!item.isPresent && (
                      <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                        <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isExcused}
                            onChange={() => toggleExcuse(item.memberId)}
                            className="rounded text-amber-600 focus:ring-0"
                          />
                          <span>Excused?</span>
                        </label>

                        {item.isExcused && (
                          <input
                            type="text"
                            placeholder="Write excuse reason..."
                            value={item.excuseReason}
                            onChange={(e) => updateExcuseReason(item.memberId, e.target.value)}
                            className="px-2.5 py-1 text-xs bg-amber-50 border border-amber-300 rounded-lg text-slate-800 w-48 focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
