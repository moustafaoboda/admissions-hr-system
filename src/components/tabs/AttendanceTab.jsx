import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AttendanceTab() {
  const { attendanceSessions, deleteAttendanceSession, setActiveModal } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const activeSession = attendanceSessions.find(s => s.id === selectedSessionId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Attendance</h2>
          <p className="text-xs text-slate-500">Log daily booth shifts, double/triple attendance credit days, orientations, and EDU Gate events.</p>
        </div>
        <button
          onClick={() => setActiveModal('addAttendance')}
          className="px-3.5 py-1.5 bg-[#002244] hover:bg-[#00162e] text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
        >
          <i className="fa-solid fa-calendar-check text-[#c59b27]"></i>
          <span>Create Attendance Roll Call</span>
        </button>
      </div>

      {/* Attendance Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendanceSessions.map(session => (
          <div
            key={session.id}
            onClick={() => setSelectedSessionId(selectedSessionId === session.id ? null : session.id)}
            className={`bg-white rounded-xl p-4 border shadow-sm space-y-3 cursor-pointer transition relative group ${
              selectedSessionId === session.id ? 'border-[#002244] ring-2 ring-[#002244]/10 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                  session.type === 'Double Attendance' || session.type === 'Triple Attendance' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  session.type === 'Orientation Day' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                  session.type === 'EDU Gate' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                  session.type === 'Event Day' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {session.type}
                </span>
                <h4 className="font-bold text-sm text-[#002244] mt-1.5">{session.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAttendanceSession(session.id);
                  }}
                  className="text-slate-300 hover:text-rose-600 transition p-1"
                  title="Delete Attendance Session"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
                <i className="fa-solid fa-calendar-day text-slate-400 text-base"></i>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
              <span><i className="fa-regular fa-clock mr-1 text-slate-400"></i> {session.dayName}, {session.date}</span>
              <span className="font-extrabold text-emerald-700">{session.presentCount} / {session.totalCount} Present</span>
            </div>

            {session.rollCall && session.rollCall.length > 0 && (
              <div className="text-[10px] text-blue-700 font-bold flex items-center justify-between pt-1">
                <span>{selectedSessionId === session.id ? 'Hide Details' : 'View Full Roll Call Log'}</span>
                <i className={`fa-solid ${selectedSessionId === session.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Session Roll Call Inspector */}
      {activeSession && activeSession.rollCall && activeSession.rollCall.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-[#002244]">{activeSession.title} Roll Call Inspector</h3>
              <p className="text-xs text-slate-500">{activeSession.dayName}, {activeSession.date} • Session Type: <span className="font-bold">{activeSession.type}</span></p>
            </div>
            <button onClick={() => setSelectedSessionId(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Close Details</button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-center">Attendance Status</th>
                  <th className="py-2.5 px-3">Excuse Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSession.rollCall.map((rc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{rc.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{rc.role}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        rc.isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rc.isPresent ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {!rc.isPresent ? (
                        rc.isExcused ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            Excused: {rc.excuseReason || 'Excuse recorded'}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold text-[11px]">Unexcused Absence</span>
                        )
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
