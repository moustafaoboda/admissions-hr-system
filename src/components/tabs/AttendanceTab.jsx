import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';

export default function AttendanceTab() {
  const {
    currentUser,
    members,
    attendanceSessions,
    deleteAttendanceSession,
    updateAttendanceSession,
    setActiveModal
  } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState('');
  const [editRollCall, setEditRollCall] = useState([]);

  const isHeadOrVice = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";
  const isDean = currentUser?.role === "Admission's Dean";

  // Helper to retrieve members scheduled for a given day
  const getScheduledMembersForDay = (dayName) => {
    const activeM = members.filter(m => m.status !== "Discharged");
    return activeM.filter(m =>
      (m.officialDays || []).includes(dayName) ||
      (m.extraDays || []).includes(dayName)
    );
  };

  // Helper to ensure a session's rollCall contains ONLY scheduled members
  const getSessionScheduledRollCall = (session) => {
    const day = session.dayName || 'Sunday';
    const scheduled = getScheduledMembersForDay(day);

    if (!session.rollCall || session.rollCall.length === 0) {
      return scheduled.map(m => ({
        memberId: m.id,
        name: m.name,
        role: m.role,
        isPresent: true,
        isExcused: false,
        excuseReason: ''
      }));
    }

    // Retain roll call records for scheduled members only
    const filtered = session.rollCall.filter(rc =>
      scheduled.some(m => m.id === rc.memberId || m.name === rc.name)
    );

    // Add any newly scheduled member if missing
    scheduled.forEach(m => {
      if (!filtered.some(rc => rc.memberId === m.id || rc.name === m.name)) {
        filtered.push({
          memberId: m.id,
          name: m.name,
          role: m.role,
          isPresent: true,
          isExcused: false,
          excuseReason: ''
        });
      }
    });

    return filtered;
  };

  const activeSession = attendanceSessions.find(s => s.id === selectedSessionId);

  const startEditing = () => {
    if (!activeSession || !isHeadOrVice) return;
    setEditTitle(activeSession.title);
    setEditDate(activeSession.date);
    setEditType(activeSession.type);
    setEditRollCall(JSON.parse(JSON.stringify(getSessionScheduledRollCall(activeSession))));
    setIsEditing(true);
  };

  const handleTogglePresent = (memberId) => {
    setEditRollCall(prev => prev.map(rc => rc.memberId === memberId ? {
      ...rc,
      isPresent: !rc.isPresent,
      isExcused: !rc.isPresent ? false : rc.isExcused,
      excuseReason: !rc.isPresent ? '' : rc.excuseReason
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

    const presentCount = editRollCall.filter(r => r.isPresent).length;
    const totalCount = editRollCall.length;

    updateAttendanceSession(activeSession.id, {
      title: editTitle.trim(),
      date: editDate,
      dayName,
      type: editType,
      rollCall: editRollCall,
      presentCount,
      totalCount
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Tab Header Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Attendance Log & Shifts</h2>
          <p className="text-xs text-slate-500">
            Log daily booth shifts, double/triple attendance credit days, orientations, and EDU Gate events. Roll calls display assigned members only.
          </p>
        </div>

        {isHeadOrVice && (
          <button
            onClick={() => setActiveModal('addAttendance')}
            className="px-3.5 py-1.5 bg-[#002244] hover:bg-[#00162e] text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-calendar-check text-[#c59b27]"></i>
            <span>Create Attendance Roll Call</span>
          </button>
        )}
      </div>

      {/* Attendance Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendanceSessions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <i className="fa-solid fa-calendar-xmark text-3xl mb-2 text-slate-300 block"></i>
            No attendance sessions logged.
          </div>
        ) : (
          attendanceSessions.map(session => {
            const scheduledRollCall = getSessionScheduledRollCall(session);
            const total = scheduledRollCall.length;
            const present = scheduledRollCall.filter(r => r.isPresent).length;
            const absent = total - present;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;

            const isSelected = selectedSessionId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  setSelectedSessionId(isSelected ? null : session.id);
                  setIsEditing(false);
                }}
                className={`bg-white rounded-xl p-4 border shadow-sm space-y-3 cursor-pointer transition relative group ${
                  isSelected ? 'border-[#002244] ring-2 ring-[#002244]/15 bg-amber-50/10' : 'border-slate-200 hover:border-[#002244]'
                }`}
              >
                {/* Header: Type + Title + Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      session.type.includes('Double') || session.type.includes('Triple') ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      session.type.includes('Orientation') ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                      session.type.includes('EDU Gate') ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {session.type}
                    </span>
                    <h4 className="font-bold text-sm text-[#002244] mt-1">{session.title}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    {isHeadOrVice && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSessionId(session.id);
                            startEditing();
                          }}
                          className="text-slate-400 hover:text-[#002244] hover:bg-amber-100 transition p-1.5 rounded"
                          title="Edit Session Details & Roll Call"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAttendanceSession(session.id);
                            if (selectedSessionId === session.id) setSelectedSessionId(null);
                          }}
                          className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition p-1.5 rounded"
                          title="Delete Session"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </>
                    )}
                    <i className="fa-solid fa-calendar-day text-slate-400 p-1"></i>
                  </div>
                </div>

                {/* Highlighted Attended Count Stats (Visible on Day View Card Face Directly) */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="border-r border-slate-200">
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Attended</div>
                    <div className="text-base font-black text-emerald-700">
                      {present} <span className="text-xs font-semibold text-slate-400">/ {total}</span>
                    </div>
                  </div>
                  <div className="border-r border-slate-200">
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Absent</div>
                    <div className={`text-base font-black ${absent > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                      {absent}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Rate</div>
                    <div className={`text-base font-black ${rate >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {rate}%
                    </div>
                  </div>
                </div>

                {/* Scheduled Members Preview on Card Face */}
                <div className="pt-1.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-bold text-slate-700">
                      <i className="fa-regular fa-clock mr-1 text-[#c59b27]"></i>
                      {session.dayName || 'Sunday'}, {session.date}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{total} Scheduled</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {scheduledRollCall.length > 0 ? (
                      scheduledRollCall.map(r => (
                        <span
                          key={r.memberId || r.name}
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
                            r.isPresent
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : (r.isExcused ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200')
                          }`}
                          title={r.isPresent ? 'Present' : (r.isExcused ? `Excused: ${r.excuseReason || 'Yes'}` : 'Absent')}
                        >
                          <MemberAvatar memberId={r.memberId} name={r.name} size="w-4 h-4 text-[8px]" />
                          <span>{r.name}</span>
                          {!r.isPresent && (
                            r.isExcused ? <span className="text-[9px] font-bold text-amber-600">(Exc)</span> : <span className="text-[9px] font-bold text-rose-600">(Abs)</span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No members assigned for {session.dayName}</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-blue-700 font-bold flex items-center justify-between pt-1">
                  <span>{isSelected ? 'Close Inspector' : 'Inspect Roll Call'}</span>
                  <i className={`fa-solid ${isSelected ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Session Roll Call Inspector / Editor */}
      {activeSession && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-base text-[#002244] flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check text-[#c59b27]"></i>
                <span>{activeSession.title} Roll Call Inspector</span>
              </h3>
              <p className="text-xs text-slate-500">
                {activeSession.dayName}, {activeSession.date} • Type: <strong className="text-[#002244]">{activeSession.type}</strong>
                <span className="ml-2 italic text-slate-400">(Showing members assigned to {activeSession.dayName} only)</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isHeadOrVice && (
                !isEditing ? (
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
                )
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
          {isEditing && isHeadOrVice && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-[#002244]">Editing Session Info:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Session Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Session Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Session Type</label>
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

          {/* Roll Call Table for Scheduled Members Only */}
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ambassador Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Excuse Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(isEditing ? editRollCall : getSessionScheduledRollCall(activeSession)).map((rc, idx) => (
                  <tr key={rc.memberId || idx} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <MemberAvatar memberId={rc.memberId} name={rc.name} size="w-7 h-7 text-[10px]" />
                        <span>{rc.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{rc.role}</td>

                    <td className="py-2.5 px-3 text-center">
                      {isEditing && isHeadOrVice ? (
                        <select
                          value={rc.isPresent ? 'present' : 'absent'}
                          onChange={() => handleTogglePresent(rc.memberId)}
                          className={`px-2 py-1 border rounded text-xs font-semibold ${
                            rc.isPresent ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          rc.isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rc.isPresent ? 'Present' : 'Absent'}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {isEditing && isHeadOrVice ? (
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rc.isExcused || false}
                              onChange={() => handleToggleExcuse(rc.memberId)}
                              className="rounded text-amber-600"
                            />
                            <span>Excused</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Excuse reason..."
                            value={rc.excuseReason || ''}
                            onChange={(e) => handleUpdateReason(rc.memberId, e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-xs w-48 bg-white"
                          />
                        </div>
                      ) : (
                        rc.isPresent ? (
                          <span className="text-slate-400">-</span>
                        ) : rc.isExcused ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            Excused: {rc.excuseReason || 'Recorded'}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">Unexcused</span>
                        )
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
