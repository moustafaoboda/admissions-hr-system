import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ScheduleModal() {
  const { recruits, activeModal, modalExtraData, setActiveModal, scheduleInterview } = useAuth();
  const [applicantId, setApplicantId] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');

  useEffect(() => {
    if (modalExtraData?.recruitId) {
      const rec = recruits.find(r => r.id === modalExtraData.recruitId);
      if (rec) {
        setApplicantId(rec.id);
        setApplicantName(`${rec.name} (${rec.targetRole})`);
      }
    }
  }, [modalExtraData, recruits]);

  if (activeModal !== 'schedule') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantId) return;
    scheduleInterview(applicantId, date, time);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-calendar-days text-[#c59b27]"></i>
            <span>Schedule Candidate Interview</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Applicant</label>
            <input
              type="text"
              readOnly
              value={applicantName}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interview Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Interview Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Interview Venue</label>
            <input
              type="text"
              readOnly
              value="Smart Village - Meeting Room 007"
              className="w-full px-3 py-2 bg-amber-50/70 border border-amber-300 rounded-lg text-[#002244] font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#002244] text-[#c59b27] font-bold rounded-lg"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
