import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DirectoryTab() {
  const { currentUser, members, adjustExtraDays, setActiveModal, setModalExtraData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const isDean = currentUser?.role === "Admission's Dean";

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickStrike = (memberId) => {
    setModalExtraData({ preselectedMemberId: memberId });
    setActiveModal('warning');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Admissions Team Directory</h2>
          <p className="text-xs text-slate-500">Track staff roles, committee positions, performance scores, and extra off-schedule days.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role..."
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

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name & Details</th>
                <th className="py-3 px-4">Role & Position</th>
                <th className="py-3 px-4">SV Faculty</th>
                <th className="py-3 px-4 text-center">Extra Days (Off-Schedule)</th>
                <th className="py-3 px-4 text-center">Attendance Rate</th>
                <th className="py-3 px-4 text-center">Strikes</th>
                <th className="py-3 px-4 text-center">Performance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-400">
                    No members matched the criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm">{m.name}</div>
                      <div className="text-[11px] text-slate-500">Term {m.term} • Smart Village Campus</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        m.role === 'President' || m.role === 'Vice President' ? 'bg-purple-100 text-purple-800' :
                        m.role === 'HR' ? 'bg-amber-100 text-amber-900' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {m.role}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">({m.position})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.college}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <span className="font-bold text-emerald-700 text-xs">+{m.extraDays} Days</span>
                        {!isDean && (
                          <>
                            <button
                              onClick={() => adjustExtraDays(m.id, 1)}
                              title="Add attended non-normal day"
                              className="w-4 h-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] flex items-center justify-center font-black transition"
                            >
                              +
                            </button>
                            <button
                              onClick={() => adjustExtraDays(m.id, -1)}
                              title="Decrease"
                              className="w-4 h-4 bg-slate-400 hover:bg-slate-500 text-white rounded text-[10px] flex items-center justify-center font-black transition"
                            >
                              -
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${
                        m.attendanceRate >= 90 ? 'text-emerald-700' : m.attendanceRate >= 80 ? 'text-blue-700' : 'text-rose-600'
                      }`}>
                        {m.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                        m.strikes === 0 ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {m.strikes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{m.score}/100</td>
                    <td className="py-3 px-4 text-right">
                      {!isDean ? (
                        <button
                          onClick={() => handleQuickStrike(m.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold transition"
                        >
                          <i className="fa-solid fa-triangle-exclamation"></i> Strike
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">View only</span>
                      )}
                    </td>
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
