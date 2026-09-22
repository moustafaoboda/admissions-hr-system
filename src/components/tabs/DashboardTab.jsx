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

  // KPI calculations
  const totalMembers = members.length;
  const avgAttendance = (members.reduce((acc, m) => acc + m.attendanceRate, 0) / (totalMembers || 1)).toFixed(1);
  const totalStrikes = members.reduce((acc, m) => acc + m.strikes, 0);
  const totalExtraShifts = members.reduce((acc, m) => acc + m.extraDays, 0);

  // Functional roles breakdown
  const rolesMap = {};
  members.forEach(m => {
    rolesMap[m.role] = (rolesMap[m.role] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
            <p className="text-2xl font-black text-[#002244] mt-1">{totalMembers}</p>
            <span className="text-[11px] text-emerald-600 font-semibold"><i class="fa-solid fa-building-circle-check"></i> Smart Village</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002244] flex items-center justify-center text-xl">
            <i className="fa-solid fa-id-badge"></i>
          </div>
        </div>

        {/* Avg Attendance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Attendance</p>
            <p className="text-2xl font-black text-[#002244] mt-1">{avgAttendance}%</p>
            <span className="text-[11px] text-blue-600 font-semibold">Meetings & Shifts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        {/* Warnings & Strikes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Strikes</p>
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

      {/* Quick Roles & Campus Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Committee Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-[#002244] mb-3 flex items-center gap-2">
            <i className="fa-solid fa-sitemap text-[#c59b27]"></i>
            <span>Functional Roles Breakdown</span>
          </h4>
          <div className="space-y-2.5 text-xs">
            {Object.entries(rolesMap).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700">{role}</span>
                <span className="bg-[#002244] text-[#c59b27] font-bold text-[10px] px-2 py-0.5 rounded-full">{count} Staff</span>
              </div>
            ))}
          </div>
        </div>

        {/* Faculties Active */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-[#002244] mb-3 flex items-center gap-2">
            <i className="fa-solid fa-graduation-cap text-[#002244]"></i>
            <span>Smart Village Campus Faculties</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="font-medium text-slate-700">Computing & Information Tech</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">6 Members</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="font-medium text-slate-700">Engineering & Technology</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">5 Members</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="font-medium text-slate-700">Management & Technology</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">4 Members</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="font-medium text-slate-700">International Transport & Logistics</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">2 Members</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="font-medium text-slate-700">Law & Legal Studies</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">1 Member</span>
            </div>
          </div>
        </div>

        {/* Daily Operations Log */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-[#002244] mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-[#c59b27]"></i>
              <span>Daily Operations Log</span>
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Active Shift:</span>
                <span className="font-bold text-slate-800">Admissions Welcome Hall</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Interview Venue:</span>
                <span className="font-bold text-blue-800">Meeting Room 007</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Extra Shifts Logged:</span>
                <span className="font-bold text-emerald-700">+{totalExtraShifts} Days</span>
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
