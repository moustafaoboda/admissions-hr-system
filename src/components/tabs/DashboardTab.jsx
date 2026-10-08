import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar } from '../common/Avatars';

export default function DashboardTab() {
  const {
    currentUser,
    members,
    starAmbassadors,
    removeStarAmbassador,
    events,
    setActiveModal,
    setModalExtraData,
    deleteEvent
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

        {/* Operational Events */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Events</p>
            <p className="text-2xl font-black text-[#c59b27] mt-1">{events.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">Orientations & EDU Gate</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c59b27] flex items-center justify-center text-xl">
            <i className="fa-solid fa-calendar-check"></i>
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
                  <div className="relative flex-shrink-0">
                    <MemberAvatar
                      memberId={star.memberId}
                      name={star.name}
                      size="w-11 h-11 text-xs"
                      className="border-2 border-[#c59b27]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#c59b27] text-[#002244] flex items-center justify-center text-[10px] font-black shadow-xs">
                      <i className="fa-solid fa-crown"></i>
                    </div>
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-[#002244] flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-[#c59b27]"></i>
                <span>Events & Operational Logs</span>
              </h4>
              {isHeadOrVice && (
                <button
                  onClick={() => setActiveModal('addEvent')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  <span>Add Event</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {events.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No events logged.</div>
              ) : (
                events.map(evt => {
                  const colorClasses = evt.color === 'amber'
                    ? 'bg-amber-50/80 border-amber-200 text-[#002244]'
                    : evt.color === 'emerald'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : evt.color === 'rose'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : evt.color === 'purple'
                    ? 'bg-purple-50/80 border-purple-200 text-purple-950'
                    : 'bg-blue-50/80 border-blue-200 text-blue-950';

                  const badgeClasses = evt.color === 'amber'
                    ? 'bg-amber-100 text-amber-900'
                    : evt.color === 'emerald'
                    ? 'bg-emerald-100 text-emerald-900'
                    : evt.color === 'rose'
                    ? 'bg-rose-100 text-rose-900'
                    : evt.color === 'purple'
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-blue-100 text-blue-900';

                  return (
                    <div key={evt.id} className={`p-3 border rounded-lg transition ${colorClasses}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1.5">
                          <i className={`fa-solid ${
                            evt.type === 'Orientations' ? 'fa-compass text-amber-600' :
                            evt.type === 'EDU Gate' ? 'fa-school-flag text-blue-600' :
                            evt.type === 'Meetings' ? 'fa-comments text-emerald-600' : 'fa-calendar-day text-purple-600'
                          }`}></i>
                          <span>{evt.title}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`${badgeClasses} px-2 py-0.5 rounded text-[10px]`}>{evt.status}</span>
                          {isHeadOrVice && (
                            <button
                              onClick={() => {
                                setModalExtraData({ eventId: evt.id });
                                setActiveModal('editEvent');
                              }}
                              className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] shadow-sm transition"
                              title="Edit Event"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{evt.description || 'No description added.'}</p>
                      <div className="mt-2 pt-1 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <span><i className="fa-solid fa-location-dot mr-1"></i>{evt.location || 'Campus'}</span>
                        <span><i className="fa-solid fa-clock mr-1"></i>{evt.date || 'Scheduled'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
