import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardTab() {
  const {
    currentUser,
    members,
    starAmbassadors,
    removeStarAmbassador,
    recruits,
    setActiveModal
  } = useAuth();

  const isViceHead = currentUser?.role === "HR Vice Head";
  const isHeadOrVice = currentUser?.role === "HR Head" || isViceHead;

  const activeMembers = members.filter(m => m.status !== "Discharged");

  // KPI calculations
  const totalMembers = activeMembers.length;
  const avgAttendanceRate = totalMembers > 0
    ? (activeMembers.reduce((acc, m) => {
        const rate = m.attendanceCount > 0 ? Math.min(100, Math.round((m.attendanceCount / 12) * 100)) : 100;
        return acc + rate;
      }, 0) / totalMembers).toFixed(1)
    : '100.0';
  const totalStrikes = activeMembers.reduce((acc, m) => acc + m.strikes, 0);

  // Functional roles breakdown (Strictly: PR, HR, Operations, Digital Transformation, Innovation)
  const targetRoles = ["PR", "HR", "Operations", "Digital Transformation", "Innovation"];
  const rolesMap = {};
  targetRoles.forEach(r => rolesMap[r] = 0);
  activeMembers.forEach(m => {
    if (rolesMap[m.role] !== undefined) {
      rolesMap[m.role]++;
    }
  });

  // Faculties breakdown (Including Arts & Design)
  const facultiesList = [
    "Computing & IT",
    "Engineering & Tech",
    "Management & Tech",
    "Logistics & Transport",
    "Law",
    "Language & Comm",
    "Arts & Design"
  ];
  const facultyMap = {};
  facultiesList.forEach(f => facultyMap[f] = 0);
  activeMembers.forEach(m => {
    if (facultyMap[m.college] !== undefined) {
      facultyMap[m.college]++;
    } else {
      facultyMap[m.college] = 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Key KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
            <p className="text-2xl font-black text-[#002244] mt-1">{totalMembers}</p>
            <span className="text-[11px] text-emerald-600 font-semibold"><i className="fa-solid fa-building-circle-check"></i> Smart Village</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002244] flex items-center justify-center text-xl">
            <i className="fa-solid fa-id-badge"></i>
          </div>
        </div>

        {/* Avg Attendance Rate */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Attendance Rate</p>
            <p className="text-2xl font-black text-[#002244] mt-1">{avgAttendanceRate}%</p>
            <span className="text-[11px] text-blue-600 font-semibold">Overall Team Attendance</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        {/* Warnings & Strikes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Warnings Issued</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{totalStrikes}</p>
            <span className="text-[11px] text-slate-500 font-medium">Smart Village Roster</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

        {/* Pending Applicants */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Applicants</p>
            <p className="text-2xl font-black text-[#c59b27] mt-1">{recruits.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">Interviews in Rm 007</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c59b27] flex items-center justify-center text-xl">
            <i className="fa-solid fa-user-clock"></i>
          </div>
        </div>
      </div>

      {/* Star Admissions Ambassadors Showcase */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#c59b27] flex items-center justify-center text-base">
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#002244]">Star Admissions Ambassadors</h3>
              <p className="text-xs text-slate-500">Distinguished team members recognized by HR Head & HR Vice Head</p>
            </div>
          </div>

          {isHeadOrVice && (
            <button
              onClick={() => setActiveModal('addStar')}
              className="px-3 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg border border-[#c59b27] flex items-center gap-1.5 transition"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Assign Star Ambassador</span>
            </button>
          )}
        </div>

        {/* Ambassadors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {starAmbassadors.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No star ambassadors currently selected. HR Leadership can assign ambassadors anytime.
            </div>
          ) : (
            starAmbassadors.map(star => (
              <div key={star.id} className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 border border-amber-300 rounded-xl p-4 shadow-sm relative group">
                {isHeadOrVice && (
                  <button
                    onClick={() => removeStarAmbassador(star.id)}
                    title="Remove Star Recognition"
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#002244] text-[#c59b27] flex items-center justify-center font-bold text-sm border-2 border-[#c59b27]">
                    <i className="fa-solid fa-crown text-xs"></i>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#002244]">{star.name}</div>
                    <div className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wide">{star.awardTitle}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 italic">"{star.citation}"</p>
                <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span><i className="fa-solid fa-layer-group text-slate-400"></i> {star.role}</span>
                  <span className="text-slate-700 font-semibold">{star.college}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Roles Breakdown, Faculties, and Orientations / EDU Gate / Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Committee Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-[#002244] mb-3 flex items-center gap-2">
            <i className="fa-solid fa-sitemap text-[#c59b27]"></i>
            <span>Functional Roles Breakdown</span>
          </h4>
          <div className="space-y-2.5 text-xs">
            {targetRoles.map(role => (
              <div key={role} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700">{role}</span>
                <span className="bg-[#002244] text-[#c59b27] font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {rolesMap[role]} Members
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Faculties (Including Arts & Design) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-[#002244] mb-3 flex items-center gap-2">
            <i className="fa-solid fa-graduation-cap text-[#002244]"></i>
            <span>Faculties</span>
          </h4>
          <div className="space-y-2 text-xs">
            {facultiesList.map(faculty => (
              <div key={faculty} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-slate-700">{faculty}</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  {facultyMap[faculty]} Members
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orientations, EDU Gate, Meetings */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-[#002244] mb-3 flex items-center gap-2">
              <i className="fa-solid fa-[#c59b27] fa-calendar-check text-[#c59b27]"></i>
              <span>Events & Operational Logs</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                <div className="flex justify-between items-center font-bold text-[#002244]">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-[#c59b27] fa-compass text-amber-600"></i> Orientations
                  </span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px]">Active</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Campus tours & parent welcome briefings in Hall A.</p>
              </div>

              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center font-bold text-blue-950">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-school-flag text-blue-600"></i> EDU Gate
                  </span>
                  <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[10px]">Scheduled</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Annual admissions exhibition & university portal drive.</p>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                <div className="flex justify-between items-center font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-comments text-emerald-600"></i> Meetings
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px]">Weekly</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">General assembly & committee sync in Meeting Room 007.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => setActiveModal('addMember')}
              className="flex-1 py-2 bg-[#002244] hover:bg-[#00162e] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-user-plus text-[#c59b27]"></i>
              <span>Add Member</span>
            </button>
            <button
              onClick={() => setActiveModal('addAttendance')}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-300"
            >
              <i className="fa-solid fa-calendar-plus text-slate-600"></i>
              <span>Add Attendance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
