import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MemberAvatar, UserAvatar } from '../common/Avatars';

export default function EditMonitoringNoteModal() {
  const {
    activeModal,
    modalExtraData,
    setActiveModal,
    monitoringNotes,
    updateMonitoringNote,
    deleteMonitoringNote,
    members
  } = useAuth();

  const noteId = modalExtraData?.id;
  const currentNote = monitoringNotes.find(n => n.id === noteId);
  const activeMembers = members.filter(m => m.status !== "Discharged");

  const [targetMemberId, setTargetMemberId] = useState('');
  const [category, setCategory] = useState('General Observation');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (currentNote) {
      setTargetMemberId(currentNote.memberId || '');
      setCategory(currentNote.category || 'General Observation');
      setNoteContent(currentNote.note || '');
    }
  }, [currentNote]);

  if (activeModal !== 'editMonitoringNote' || !currentNote) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetMemberId || !noteContent.trim()) return;

    updateMonitoringNote(noteId, {
      memberId: targetMemberId,
      category,
      note: noteContent.trim()
    });

    setActiveModal(null);
  };

  const handleDelete = () => {
    deleteMonitoringNote(noteId);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <div className="flex items-center gap-2.5">
            <MemberAvatar memberId={targetMemberId} name={currentNote?.memberName} size="w-9 h-9 text-xs" className="border border-[#c59b27]" />
            <div>
              <h3 className="font-bold text-sm">Edit Monitoring Note</h3>
              <p className="text-[10px] text-slate-300">Member: {currentNote?.memberName || 'Ambassador'}</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Member <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={targetMemberId}
              onChange={(e) => setTargetMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none font-medium"
            >
              <option value="">-- Select Team Member --</option>
              {activeMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} • {m.college})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none font-medium"
            >
              <option value="General Observation">General Observation</option>
              <option value="Performance & Quality">Performance & Quality</option>
              <option value="Behavior & Professionalism">Behavior & Professionalism</option>
              <option value="Attendance & Punctuality">Attendance & Punctuality</option>
              <option value="Operational Execution">Operational Execution</option>
              <option value="Commendation & Praise">Commendation & Praise</option>
              <option value="Follow-up Required">Follow-up Required</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Note / Observation Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none resize-none"
            />
          </div>

          {/* Author Badge */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserAvatar user={currentNote.authorName} name={currentNote.authorName} size="w-5 h-5 text-[9px]" />
              <span>
                Originally Written by:{' '}
                <strong className="text-slate-900 font-bold">
                  {currentNote.authorName} ({currentNote.authorRole})
                </strong>
              </span>
            </span>
            <span className="text-slate-500 font-mono">
              {currentNote.date} {currentNote.time || ''}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span>Delete Note</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-lg border border-[#c59b27] transition flex items-center gap-1.5 shadow"
              >
                <i className="fa-solid fa-check"></i>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
