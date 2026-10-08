import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/Avatars';

export default function ActivityLogTab() {
  const {
    currentUser,
    activityLogs,
    toggleStarActivityLog,
    deleteActivityLog,
    setActiveModal,
    setModalExtraData
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [starredOnly, setStarredOnly] = useState(false);

  const isHeadOrVice = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";

  if (!isHeadOrVice) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
        <i className="fa-solid fa-lock text-4xl text-slate-300 mb-3 block"></i>
        <h3 className="font-bold text-slate-700 text-base">Restricted Area</h3>
        <p className="text-xs text-slate-500 mt-1">Activity logs are exclusively available to HR Leadership (HR Head & HR Vice Head).</p>
      </div>
    );
  }

  const filteredLogs = (activityLogs || []).filter(log => {
    if (starredOnly && !log.isStarred) return false;
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchAction = (log.action || '').toLowerCase().includes(term);
      const matchUser = (log.user || '').toLowerCase().includes(term);
      const matchDetails = (log.details || '').toLowerCase().includes(term);
      const matchCategory = (log.category || '').toLowerCase().includes(term);
      if (!matchAction && !matchUser && !matchDetails && !matchCategory) return false;
    }
    return true;
  });

  const starredCount = (activityLogs || []).filter(l => l.isStarred).length;

  const handleEdit = (log) => {
    setModalExtraData({ activityLogId: log.id });
    setActiveModal('editActivity');
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Attendance':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Warnings':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'Monitoring':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Members':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Events':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getExpiryLabel = (log) => {
    if (log.isStarred) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <i className="fa-solid fa-star text-[9px] text-amber-500"></i>
          <span>Starred (Permanent)</span>
        </span>
      );
    }
    const ageMs = Date.now() - new Date(log.timestamp).getTime();
    const daysLeft = Math.max(0, 7 - Math.floor(ageMs / (24 * 60 * 60 * 1000)));
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200" title="Auto-deletes after 7 days unless starred">
        <i className="fa-regular fa-clock text-[9px]"></i>
        <span>Expires in {daysLeft}d</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#002244]">Activity & System Audit Log</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#002244] text-[#c59b27] border border-[#c59b27]">
              HR Leadership Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks all operations, attendance sessions, warnings, and notes with author accountability. Auto-purged after 7 days unless starred.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
            <span className="text-slate-500">Total Entries:</span>
            <span className="font-extrabold text-[#002244] ml-1.5">{(activityLogs || []).length}</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium">
            <span className="text-amber-800">Starred:</span>
            <span className="font-extrabold text-amber-900 ml-1.5">{starredCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, author, details..."
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none w-full sm:w-64"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Attendance">Attendance</option>
            <option value="Warnings">Warnings</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Members">Members</option>
            <option value="Events">Events</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={starredOnly}
              onChange={(e) => setStarredOnly(e.target.checked)}
              className="rounded text-[#002244] focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-star text-amber-500 text-xs"></i>
              <span>Starred Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Activity Logs List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fa-solid fa-clock-rotate-left text-4xl text-slate-300 mb-2 block"></i>
            <div className="font-bold text-slate-600 text-sm">No activity records found</div>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-4 transition hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                log.isStarred ? 'bg-amber-50/20' : ''
              }`}
            >
              {/* Left Column: Star + Content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleStarActivityLog(log.id)}
                  className={`p-1.5 rounded-lg transition text-base mt-0.5 ${
                    log.isStarred
                      ? 'text-amber-500 hover:text-amber-600 bg-amber-100/60'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100'
                  }`}
                  title={log.isStarred ? "Starred (protected from 7-day auto-deletion). Click to unstar." : "Click star to keep permanently"}
                >
                  <i className={log.isStarred ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                </button>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getCategoryBadge(log.category)}`}>
                      {log.category || 'General'}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-[#002244] break-words">
                      {log.action}
                    </h4>
                  </div>

                  {log.details && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 font-normal">
                      {log.details}
                    </p>
                  )}

                  <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <UserAvatar user={log.user} name={log.user} size="w-5 h-5 text-[9px]" />
                      <span>{log.user}</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-normal text-slate-600">({log.role})</span>
                    </span>
                    <span>•</span>
                    <span><i className="fa-regular fa-calendar mr-1"></i>{log.date} {log.time}</span>
                    <span>•</span>
                    {getExpiryLabel(log)}
                  </div>
                </div>
              </div>

              {/* Right Column: Edit & Remove Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleEdit(log)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#002244] border border-amber-300 rounded font-bold text-xs inline-flex items-center gap-1 transition"
                  title="Edit Activity Log"
                >
                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this activity log entry?")) {
                      deleteActivityLog(log.id);
                    }
                  }}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-xs inline-flex items-center gap-1 transition"
                  title="Remove Activity Log"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
