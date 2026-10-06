import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function MonitoringTab() {
  const {
    members,
    currentUser,
    monitoringNotes,
    addMonitoringNote,
    deleteMonitoringNote,
    setActiveModal,
    setModalExtraData,
    monitoringSelectedMemberId,
    setMonitoringSelectedMemberId
  } = useAuth();

  const activeMembers = members.filter(m => m.status !== "Discharged");

  // Form State
  const [targetMemberId, setTargetMemberId] = useState(monitoringSelectedMemberId || (activeMembers[0]?.id || ''));
  const [category, setCategory] = useState('General Observation');
  const [noteText, setNoteText] = useState('');

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Sync if member selected from outside
  useEffect(() => {
    if (monitoringSelectedMemberId) {
      setTargetMemberId(monitoringSelectedMemberId);
    }
  }, [monitoringSelectedMemberId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetMemberId) return;
    if (!noteText.trim()) return;

    addMonitoringNote({
      memberId: targetMemberId,
      category,
      note: noteText
    });

    setNoteText('');
    if (setMonitoringSelectedMemberId) setMonitoringSelectedMemberId('');
  };

  const handleEditNote = (note) => {
    setModalExtraData(note);
    setActiveModal('editMonitoringNote');
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm("Permanently delete this monitoring note?")) {
      deleteMonitoringNote(noteId);
    }
  };

  // Filtered Notes
  const filteredNotes = monitoringNotes.filter(n => {
    if (memberFilter && n.memberId !== memberFilter) return false;
    if (categoryFilter && n.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (n.memberName || '').toLowerCase().includes(q);
      const matchAuthor = (n.authorName || '').toLowerCase().includes(q);
      const matchText = (n.note || '').toLowerCase().includes(q);
      const matchRole = (n.memberRole || '').toLowerCase().includes(q);
      const matchCat = (n.category || '').toLowerCase().includes(q);
      if (!matchName && !matchAuthor && !matchText && !matchRole && !matchCat) return false;
    }
    return true;
  });

  const getCategoryBadgeClass = (cat) => {
    if (cat.includes('Commendation')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (cat.includes('Warning') || cat.includes('Behavior')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (cat.includes('Follow-up')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (cat.includes('Performance')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#c59b27] flex items-center justify-center text-sm font-bold shadow-sm">
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <h2 className="text-lg font-bold text-[#002244]">Member Monitoring & Field Notes</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record direct observations, performance evaluations, and field remarks on team members. Each note automatically records and displays the author HR member's name.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Total Notes Logged:</span>
            <span className="font-extrabold text-[#002244] ml-1.5">{monitoringNotes.length}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Form on Left, Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Column: Note Creation Form */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#002244] flex items-center gap-2">
              <i className="fa-solid fa-comment-medical text-[#c59b27]"></i>
              <span>New Monitoring Note</span>
            </h3>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
              Direct Field Log
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Member Selector */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Choose Member <span className="text-rose-500">*</span>
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

            {/* Note Category */}
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

            {/* Note Content */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Note / Observation <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write detailed observation, feedback, or operational notes regarding this member..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none resize-none"
              />
            </div>

            {/* Author Identity Preview Banner */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#002244] text-[#c59b27] flex items-center justify-center font-bold text-[10px]">
                  <i className="fa-solid fa-user-pen"></i>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Note Author</div>
                  <div className="font-bold text-slate-800">{currentUser?.name}</div>
                </div>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded border border-blue-200">
                {currentUser?.role}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#002244] hover:bg-[#00162e] text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk text-[#c59b27]"></i>
              <span>Save Note</span>
            </button>
          </form>
        </div>

        {/* Right Column: Feed of Saved Monitoring Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full sm:w-auto">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes, members, or authors..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
              >
                <option value="">All Members</option>
                {activeMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="General Observation">General Observation</option>
                <option value="Performance & Quality">Performance & Quality</option>
                <option value="Behavior & Professionalism">Behavior & Professionalism</option>
                <option value="Attendance & Punctuality">Attendance & Punctuality</option>
                <option value="Operational Execution">Operational Execution</option>
                <option value="Commendation & Praise">Commendation & Praise</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>
            </div>
          </div>

          {/* Notes Feed Container */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                <i className="fa-solid fa-clipboard-list text-3xl mb-2 text-slate-300"></i>
                <p className="font-bold text-slate-600">No monitoring notes found.</p>
                <p className="text-[11px] text-slate-400 mt-1">Select a member on the left to record your first field observation note.</p>
              </div>
            ) : (
              filteredNotes.map(n => {
                const initials = (n.memberName || 'Member').split(' ').map(x => x[0]).slice(0, 2).join('');
                return (
                  <div
                    key={n.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-[#002244] transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Target Member Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#002244] text-[#c59b27] font-extrabold flex items-center justify-center text-xs shadow-sm flex-shrink-0 border-2 border-[#c59b27]">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-1.5">
                            <h4 className="font-extrabold text-sm text-[#002244]">{n.memberName}</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                              {n.memberRole || 'Member'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                              • {n.memberCollege || 'SV Campus'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span><i className="fa-regular fa-calendar mr-1"></i>{n.date}</span>
                            {n.time && <span><i className="fa-regular fa-clock mr-1"></i>{n.time}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge & Edit Action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(n.category)}`}>
                          {n.category}
                        </span>
                        <button
                          onClick={() => handleEditNote(n)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#002244] border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1 transition"
                          title="Edit Note"
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Note Content Text */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {n.note}
                    </div>

                    {/* Footer: Prominently Display Author's Name next to the note */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                        <i className="fa-solid fa-pen-fancy text-[#c59b27] text-xs"></i>
                        <span className="text-slate-600 text-[11px] font-medium">Written by:</span>
                        <span className="font-extrabold text-[#002244] text-[11px]">{n.authorName}</span>
                        <span className="text-[10px] bg-[#002244] text-[#c59b27] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                          {n.authorRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Note #{n.id}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
