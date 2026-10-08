import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditActivityModal() {
  const {
    activeModal,
    setActiveModal,
    modalExtraData,
    activityLogs,
    updateActivityLog,
    deleteActivityLog
  } = useAuth();

  const [action, setAction] = useState('');
  const [category, setCategory] = useState('General');
  const [isStarred, setIsStarred] = useState(false);
  const [details, setDetails] = useState('');

  const targetLog = (activityLogs || []).find(l => l.id === modalExtraData.activityLogId);

  useEffect(() => {
    if (targetLog) {
      setAction(targetLog.action || '');
      setCategory(targetLog.category || 'General');
      setIsStarred(!!targetLog.isStarred);
      setDetails(targetLog.details || '');
    }
  }, [targetLog]);

  if (activeModal !== 'editActivity' || !targetLog) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!action.trim()) return;

    updateActivityLog(targetLog.id, {
      action: action.trim(),
      category,
      isStarred,
      details: details.trim()
    });
    setActiveModal(null);
  };

  const handleDelete = () => {
    deleteActivityLog(targetLog.id);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-[#c59b27]"></i>
            <span>Edit Activity Log Entry</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Action text */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Action Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none font-medium"
              >
                <option value="Attendance">Attendance</option>
                <option value="Warnings">Warnings</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Members">Members</option>
                <option value="Events">Events</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Star Retention */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Retention Status
              </label>
              <select
                value={isStarred ? "starred" : "unstarred"}
                onChange={(e) => setIsStarred(e.target.value === "starred")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none font-bold"
              >
                <option value="unstarred">Auto-delete after 7 days</option>
                <option value="starred">Starred (Keep Permanently)</option>
              </select>
            </div>
          </div>

          {/* Details / Notes */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Details / Notes
            </label>
            <textarea
              rows="3"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional operational context or audit notes..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Read-only metadata */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px] flex justify-between items-center">
            <span>Author: <strong className="text-slate-700">{targetLog.user} ({targetLog.role})</strong></span>
            <span>Recorded: {targetLog.date} {targetLog.time}</span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold transition border border-rose-200 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
              <span>Delete Entry</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-lg border border-[#c59b27] transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
