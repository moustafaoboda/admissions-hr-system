import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AddEventModal() {
  const { activeModal, setActiveModal, addEvent } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Orientations');
  const [status, setStatus] = useState('Scheduled');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Smart Village Campus');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  if (activeModal !== 'addEvent') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title: title.trim(),
      type,
      status,
      date,
      location: location.trim(),
      description: description.trim(),
      color
    });

    setTitle('');
    setDescription('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-calendar-plus text-[#c59b27]"></i>
            <span>Add Event & Operational Log</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Campus Open Orientation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-[#002244]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Type / Category</label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value;
                  setType(val);
                  if (val === 'Orientations') setColor('amber');
                  else if (val === 'EDU Gate') setColor('blue');
                  else if (val === 'Meetings') setColor('emerald');
                  else setColor('purple');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Orientations">Orientations</option>
                <option value="EDU Gate">EDU Gate</option>
                <option value="Meetings">Meetings</option>
                <option value="Special Duty">Special Duty</option>
                <option value="Campus Tour">Campus Tour</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Weekly">Weekly</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Date</label>
              <input
                type="text"
                placeholder="2026-10-15 or Weekly"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Location / Venue</label>
              <input
                type="text"
                placeholder="Hall A or Meeting Room 007"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description & Operational Notes</label>
            <textarea
              rows="3"
              placeholder="Provide briefing details, involved committee, and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Badge Color Theme</label>
            <div className="flex items-center gap-3 pt-1">
              {['amber', 'blue', 'emerald', 'purple', 'rose'].map((c) => (
                <label key={c} className="flex items-center gap-1.5 cursor-pointer capitalize">
                  <input
                    type="radio"
                    name="eventColor"
                    value={c}
                    checked={color === c}
                    onChange={() => setColor(c)}
                    className="text-[#002244]"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-[#c59b27]"></i>
              <span>Save Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
