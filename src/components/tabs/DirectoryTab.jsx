import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';
import { getMemberAttendanceRate } from '../../lib/attendanceUtils';

export default function DirectoryTab() {
  const {
    currentUser,
    members,
    warnings,
    attendanceSessions,
    dischargedMembers,
    updateMemberPerformance,
    updateExtraDaysCount,
    deleteMember,
    deleteDischargedMember,
    setActiveModal,
    setModalExtraData,
    switchTab,
    setMonitoringSelectedMemberId
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [tempScore, setTempScore] = useState('');

  const isDean = currentUser?.role === "Admission's Dean";
  const isHRMember = currentUser?.role === "HR";
  const isViceHead = currentUser?.role === "HR Vice Head";
  const isHeadOrVice = currentUser?.role === "HR Head" || isViceHead;

  const activeMembers = members.filter(m => m.status !== "Discharged");

  const filteredMembers = activeMembers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.studentId && m.studentId.includes(searchTerm)) ||
    (m.phone && m.phone.includes(searchTerm))
  );

  const handleEditInfo = (memberId) => {
    setModalExtraData({ memberId });
    setActiveModal('editMember');
  };

  const handleIssueWarning = (memberId) => {
    setModalExtraData({ preselectedMemberId: memberId });
    setActiveModal('warning');
  };

  const handleDischarge = (memberId) => {
    setModalExtraData({ memberId });
    setActiveModal('dischargeMember');
  };

  const handleScoreClick = (memberId, currentScore) => {
    if (isDean || isHRMember) return;
    setEditingScoreId(memberId);
    setTempScore(currentScore.toString());
  };

  const handleScoreBlur = (memberId) => {
    if (tempScore !== '') {
      updateMemberPerformance(memberId, tempScore);
    }
    setEditingScoreId(null);
  };

  return (
    <div className="space-y-6">
      {/* Active Team Members Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Team Members</h2>
          <p className="text-xs text-slate-500">Manage admissions ambassadors, official working days (Sat–Thu), performance scores, and discharge logs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, ID, phone, faculty..."
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none w-48 sm:w-64"
          />
          {isHeadOrVice && (
            <button
              onClick={() => setActiveModal('addMember')}
              className="px-3.5 py-1.5 bg-[#002244] hover:bg-[#00162e] text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-plus text-[#c59b27]"></i>
              <span>New Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Team Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role & Position</th>
                <th className="py-3 px-4">Faculty</th>
                {!isHRMember && (
                  <>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4 text-center">Attendance Count</th>
                    <th className="py-3 px-4 text-center">Attendance Rate</th>
                  </>
                )}
                <th className="py-3 px-4">Official Working Days</th>
                <th className="py-3 px-4 text-center">WARNINGS</th>
                {!isHRMember && (
                  <th className="py-3 px-4 text-center">Performance</th>
                )}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={isHRMember ? 5 : 11} className="text-center py-6 text-slate-400">
                    No team members matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const rate = getMemberAttendanceRate(m, attendanceSessions);
                  const memWarns = (warnings || []).filter(w =>
                    w.memberId === m.id ||
                    (w.memberName && w.memberName.toLowerCase().trim() === m.name.toLowerCase().trim())
                  );
                  const confirmedWarns = memWarns.filter(w => w.status === 'Confirmed Strike');
                  const pendingWarns = memWarns.filter(w => w.status === 'Pending HR Approval');
                  const totalStrikes = Math.max(m.strikes || 0, confirmedWarns.length);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <MemberAvatar member={m} size="w-8 h-8 text-xs" />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{m.name}</span>
                            {totalStrikes > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300" title={`${totalStrikes} Confirmed Strike(s)`}>
                                <i className="fa-solid fa-triangle-exclamation text-[9px] text-rose-600"></i>
                                {totalStrikes} Strike{totalStrikes > 1 ? 's' : ''}
                              </span>
                            )}
                            {pendingWarns.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 animate-pulse" title="Warning Request Pending Review">
                                <i className="fa-solid fa-clock text-[9px] text-amber-600"></i>
                                Req
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          m.role === 'PR' ? 'bg-purple-100 text-purple-800' :
                          m.role === 'HR' ? 'bg-amber-100 text-amber-900' :
                          m.role === 'Operations' ? 'bg-blue-100 text-blue-800' :
                          m.role === 'Digital Transformation' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.role}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">({m.position})</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{m.college}</td>

                      {!isHRMember && (
                        <>
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">{m.studentId || '2024000'}</td>

                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">{m.phone || '+20 100 000 0000'}</td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-block bg-blue-50 border border-blue-200 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-lg">
                          {m.attendanceCount} Sessions
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`font-bold ${rate >= 90 ? 'text-emerald-700' : rate >= 80 ? 'text-blue-700' : 'text-rose-600'}`}>
                          {rate}%
                        </span>
                      </td>
                        </>
                      )}

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center flex-wrap gap-1">
                          {m.officialDays && m.officialDays.length > 0 ? (
                            m.officialDays.map(day => (
                              <span key={day} className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {day.substring(0, 3)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">None set</span>
                          )}

                          {isHeadOrVice ? (
                            <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-lg px-2 py-0.5 ml-1 shadow-sm">
                              <span className="text-[10px] font-extrabold text-[#002244]">Extra:</span>
                              <button
                                type="button"
                                onClick={() => updateExtraDaysCount(m.id, -1)}
                                className="w-4 h-4 rounded bg-amber-200 hover:bg-amber-300 text-[#002244] font-black flex items-center justify-center text-xs transition leading-none"
                                title="Decrease Extra Days (-)"
                              >
                                -
                              </button>
                              <span className="font-black text-xs text-[#002244] min-w-[14px] text-center">
                                {m.extraDaysCount !== undefined ? m.extraDaysCount : (m.extraDays ? m.extraDays.length : 0)}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateExtraDaysCount(m.id, 1)}
                                className="w-4 h-4 rounded bg-amber-200 hover:bg-amber-300 text-[#002244] font-black flex items-center justify-center text-xs transition leading-none"
                                title="Increase Extra Days (+)"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            (m.extraDaysCount || (m.extraDays && m.extraDays.length)) ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded" title="Extra Assigned Days">
                                +{m.extraDaysCount !== undefined ? m.extraDaysCount : m.extraDays.length} Extra
                              </span>
                            ) : null
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            totalStrikes === 0 ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-700 border border-rose-300'
                          }`}>
                            {totalStrikes}
                          </span>
                          {pendingWarns.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded border border-amber-300" title="1 Warning Request Pending">
                              +{pendingWarns.length} req
                            </span>
                          )}
                        </div>
                      </td>

                      {!isHRMember && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {editingScoreId === m.id && isHeadOrVice ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            autoFocus
                            value={tempScore}
                            onChange={(e) => setTempScore(e.target.value)}
                            onBlur={() => handleScoreBlur(m.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScoreBlur(m.id)}
                            className="w-16 px-1 py-0.5 text-center bg-amber-50 border border-amber-300 font-bold rounded"
                          />
                        ) : (
                          <span
                            onClick={() => handleScoreClick(m.id, m.score)}
                            title={isHeadOrVice ? "Click to edit performance score" : "Performance score"}
                            className={`font-bold text-slate-700 px-2 py-0.5 rounded ${isHeadOrVice ? 'cursor-pointer hover:bg-slate-100 underline decoration-dotted' : ''}`}
                          >
                            {m.score}/100
                          </span>
                        )}
                      </td>
                      )}

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        {isHRMember ? (
                          <>
                            <button
                              onClick={() => {
                                setMonitoringSelectedMemberId(m.id);
                                switchTab('monitoring');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold transition inline-flex items-center gap-1 shadow-xs"
                              title="Write Monitoring Note"
                            >
                              <i className="fa-solid fa-clipboard-check text-[10px]"></i> Note
                            </button>
                            <button
                              onClick={() => {
                                setModalExtraData({ mode: 'request', preselectedMemberId: m.id });
                                setActiveModal('warning');
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold transition inline-flex items-center gap-1 ml-1"
                              title="Request Warning for Member"
                            >
                              <i className="fa-solid fa-triangle-exclamation text-[10px]"></i> Warning
                            </button>
                          </>
                        ) : isDean ? (
                          <span className="text-slate-400 italic">View only</span>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setMonitoringSelectedMemberId(m.id);
                                switchTab('monitoring');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold transition"
                              title="Write Monitoring Note"
                            >
                              <i className="fa-solid fa-clipboard-check"></i> Note
                            </button>
                            <button
                              onClick={() => handleEditInfo(m.id)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[11px] font-bold transition"
                              title="Edit Info"
                            >
                              <i className="fa-solid fa-pen"></i> Edit Info
                            </button>
                            <button
                              onClick={() => handleIssueWarning(m.id)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold transition"
                              title="Issue Warning"
                            >
                              <i className="fa-solid fa-triangle-exclamation"></i> Warning
                            </button>
                            <button
                              onClick={() => handleDischarge(m.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold transition"
                              title="Discharge Member"
                            >
                              <i className="fa-solid fa-user-minus"></i> Discharge
                            </button>
                            {isHeadOrVice && (
                              <button
                                onClick={() => deleteMember(m.id)}
                                className="px-2 py-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded text-[11px] font-bold transition"
                                title="Delete Member"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discharged Members Section */}
      {!isHRMember && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-[#002244] flex items-center gap-2">
                <i className="fa-solid fa-user-xmark text-rose-600"></i>
                <span>Discharged Ambassadors Archive</span>
              </h3>
              <p className="text-[11px] text-slate-500">Separation records and voluntary resignation logs.</p>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-xs">
              {dischargedMembers.length} Discharged
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Faculty</th>
                  <th className="py-2 px-3">Discharge Type</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Reason</th>
                  {isHeadOrVice && <th className="py-2 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dischargedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={isHeadOrVice ? 7 : 6} className="text-center py-4 text-slate-400">
                      No discharged ambassador records.
                    </td>
                  </tr>
                ) : (
                  dischargedMembers.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MemberAvatar member={d} size="w-7 h-7 text-[10px]" />
                          <span>{d.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{d.role}</td>
                      <td className="py-2 px-3 text-slate-600">{d.college}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.dischargeType === 'Voluntary Left' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {d.dischargeType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{d.date}</td>
                      <td className="py-2 px-3 text-slate-600 max-w-xs truncate" title={d.dischargeReason}>{d.dischargeReason}</td>
                      {isHeadOrVice && (
                        <td className="py-2 px-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setModalExtraData({ dischargedId: d.id });
                              setActiveModal('editDischarged');
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[#002244] border border-amber-300 rounded font-bold text-[10px] transition"
                            title="Edit Record / Reinstate"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => deleteDischargedMember(d.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-bold text-[10px] transition"
                            title="Permanently Delete Discharged Record"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      )}
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
