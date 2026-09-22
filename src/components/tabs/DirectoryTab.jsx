import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DirectoryTab() {
  const {
    currentUser,
    members,
    dischargedMembers,
    updateMemberPerformance,
    setActiveModal,
    setModalExtraData
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [tempScore, setTempScore] = useState('');

  const isDean = currentUser?.role === "Admission's Dean";

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
    if (isDean) return;
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
          {!isDean && (
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
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4 text-center">Attendance Count</th>
                <th className="py-3 px-4 text-center">Attendance Rate</th>
                <th className="py-3 px-4">Official Working Days</th>
                <th className="py-3 px-4 text-center">WARNINGS</th>
                <th className="py-3 px-4 text-center">Performance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-slate-400">
                    No team members matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const rate = m.attendanceCount > 0 ? Math.min(100, Math.round((m.attendanceCount / 12) * 100)) : 100;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800 text-sm whitespace-nowrap">{m.name}</td>

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

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {m.officialDays && m.officialDays.length > 0 ? (
                            m.officialDays.map(day => (
                              <span key={day} className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {day.substring(0, 3)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">None set</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                          m.strikes === 0 ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {m.strikes}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {editingScoreId === m.id ? (
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
                            title={isDean ? "View only" : "Click to edit performance score"}
                            className={`font-bold text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded ${!isDean ? 'underline decoration-dotted' : ''}`}
                          >
                            {m.score}/100
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        {!isDean ? (
                          <>
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
                          </>
                        ) : (
                          <span className="text-slate-400 italic">View only</span>
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
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold">
            <i className="fa-solid fa-user-slash"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-950">Discharged Members</h3>
            <p className="text-xs text-slate-500">Historical records of voluntary departures and administrative discharges</p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Member Name</th>
                <th className="py-2.5 px-3">Role & Faculty</th>
                <th className="py-2.5 px-3">ID & Phone</th>
                <th className="py-2.5 px-3">Discharge Category</th>
                <th className="py-2.5 px-3">Reason for Departure</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dischargedMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-slate-400">
                    No discharged member logs found.
                  </td>
                </tr>
              ) : (
                dischargedMembers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{d.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{d.role} • {d.college}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{d.studentId || '2024000'} | {d.phone || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.dischargeType === 'Voluntary Left' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                      }`}>
                        {d.dischargeType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 italic max-w-xs truncate">{d.dischargeReason}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-mono">{d.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
