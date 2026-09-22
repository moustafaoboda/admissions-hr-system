import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AttendanceTab() {
  const { attendanceSessions, setActiveModal } = useAuth();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Daily Attendance Records</h2>
          <p className="text-xs text-slate-500">Manage daily booth shifts, open days, and official general assembly meeting rolls.</p>
        </div>
        <button
          onClick={() => setActiveModal('addAttendance')}
          className="px-3.5 py-1.5 bg-[#002244] hover:bg-[#00162e] text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
        >
          <i className="fa-solid fa-calendar-check text-[#c59b27]"></i>
          <span>Add Attendance List for Day</span>
        </button>
      </div>

      {/* Attendance Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendanceSessions.map(session => (
          <div key={session.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  session.type === 'Official Meeting' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                }`}>
                  {session.type}
                </span>
                <h4 className="font-bold text-sm text-[#002244] mt-1">{session.title}</h4>
              </div>
              <i className="fa-solid fa-calendar-day text-slate-400"></i>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span><i className="fa-regular fa-clock mr-1"></i> {session.date}</span>
              <span className="font-bold text-emerald-700">{session.presentCount} / {session.totalCount} Present</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
