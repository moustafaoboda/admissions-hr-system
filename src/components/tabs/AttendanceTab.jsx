import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AttendanceTab() {
  const { attendanceSessions, deleteAttendanceSession, updateAttendanceSession, setActiveModal } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState('');
  const [editRollCall, setEditRollCall] = useState([]);

  const activeSession = attendanceSessions.find(s => s.id === selectedSessionId);

  const startEditing = () => {
    if (!activeSession) return;
    setEditTitle(activeSession.title);
    setEditDate(activeSession.date);
    setEditType(activeSession.type);
    setEditRollCall(JSON.parse(JSON.stringify(activeSession.rollCall || [])));
    setIsEditing(true);
  };

  const handleTogglePresent = (memberId) => {
    setEditRollCall(prev => prev.map(rc => rc.memberId === memberId ? {
      ...rc,
      isPresent: !rc.isPresent,
      isExcused: !rc.isPresent ? false : rc.isExcused
    } : rc));
  };

  const handleToggleExcuse = (memberId) => {
    setEditRollCall(prev => prev.map(rc => rc.memberId === memberId ? {
      ...rc,
      isExcused: !rc.isExcused,
      excuseReason: !rc.isExcused ? rc.excuseReason : ''
    } : rc));
  };

  const handleUpdateReason = (memberId, reason) => {
    setEditRollCall(prev => prev.map(rc => rc.memberId === memberId ? {
      ...rc,
      excuseReason: reason
    } : rc));
  };

  const handleSaveSessionEdit = () => {
    if (!editTitle.trim() || !editDate) return;
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(editDate);
    const dayName = daysOfWeek[d.getDay()] || "Sunday";

    updateAttendanceSession(activeSession.id, {
      title: editTitle.trim(),
      date: editDate,
      dayName,
      type: editType,
      rollCall: editRollCall
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Attendance Log & Shifts</h2>
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
            onClick={() => {
              setSelectedSessionId(selectedSessionId === session.id ? null : session.id);
              setIsEditing(false);
            }}
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSessionId(session.id);
                    setIsEditing(true);
                    setEditTitle(session.title);
                    setEditDate(session.date);
                    setEditType(session.type);
                    setEditRollCall([...(session.rollCall || [])]);
                  }}
                  className="text-slate-400 hover:text-[#002244] hover:bg-amber-100 transition p-1 rounded"
                  title="Edit Session Details & Roll Call"
                >
                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAttendanceSession(session.id);
                  }}
                  className="text-slate-300 hover:text-rose-600 transition p-1 rounded"
                  title="Delete Attendance Session"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
                <i className="fa-solid fa-calendar-day text-slate-400 text-base ml-1"></i>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
              <span><i className="fa-regular fa-clock mr-1 text-slate-400"></i> {session.dayName}, {session.date}</span>
              <span className="font-extrabold text-emerald-700">{session.presentCount} / {session.totalCount} Present</span>
            </div>

            {session.rollCall && session.rollCall.length > 0 && (
              <div className="text-[10px] text-blue-700 font-bold flex items-center justify-between pt-1">
                <span>{selectedSessionId === session.id ? 'Hide Details' : 'View / Edit Roll Call Log'}</span>
                <i className={`fa-solid ${selectedSessionId === session.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Session Roll Call Inspector / Editor */}
      {activeSession && activeSession.rollCall && activeSession.rollCall.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-base text-[#002244] flex items-center gap-2">
                <i className="fa-solid fa-[#002244] fa-calendar-check text-[#c59b27]"></i>
                <span>{activeSession.title} Roll Call Inspector</span>
              </h3>
              <p className="text-xs text-slate-500">{activeSession.dayName}, {activeSession.date} • Type: <span className="font-bold text-[#002244]">{activeSession.type}</span></p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="px-3 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] flex items-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                  <span>Edit Details & Roll Call</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveSessionEdit}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-check text-xs"></i>
                  <span>Save Attendance Edits</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedSessionId(null);
                  setIsEditing(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>

          {/* Editable Session Header Fields when in Edit Mode */}
          {isEditing && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-[#002244]">Editing Session Info:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
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
            </div>
          )}

          {/* Roll Call Table / Form */}
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
                {!isEditing ? (
                  activeSession.rollCall.map((rc, idx) => (
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
                  ))
                ) : (
                  editRollCall.map((rc, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{rc.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rc.role}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePresent(rc.memberId)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 mx-auto ${
                            rc.isPresent
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          <i className={`fa-solid ${rc.isPresent ? 'fa-check' : 'fa-xmark'}`}></i>
                          <span>{rc.isPresent ? 'Present' : 'Absent'}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        {!rc.isPresent ? (
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rc.isExcused}
                                onChange={() => handleToggleExcuse(rc.memberId)}
                                className="rounded text-amber-600"
                              />
                              <span>Excused?</span>
                            </label>
                            {rc.isExcused && (
                              <input
                                type="text"
                                placeholder="Excuse reason..."
                                value={rc.excuseReason}
                                onChange={(e) => handleUpdateReason(rc.memberId, e.target.value)}
                                className="px-2 py-1 text-xs bg-white border border-amber-300 rounded text-slate-800 w-44"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
