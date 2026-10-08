import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditMemberModal() {
  const { members, activeModal, modalExtraData, setActiveModal, editMemberInfo } = useAuth();

  const [name, setName] = useState('');
  const [role, setRole] = useState('PR');
  const [position, setPosition] = useState('Member');
  const [college, setCollege] = useState('Computing & IT');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [score, setScore] = useState(90);
  const [officialDays, setOfficialDays] = useState([]);
  const [avatar, setAvatar] = useState('');

  const daysList = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  useEffect(() => {
    if (modalExtraData?.memberId) {
      const mem = members.find(m => m.id === modalExtraData.memberId);
      if (mem) {
        setName(mem.name || '');
        setRole(mem.role || 'PR');
        setPosition(mem.position || 'Member');
        setCollege(mem.college || 'Computing & IT');
        setStudentId(mem.studentId || '');
        setPhone(mem.phone || '');
        setScore(mem.score ?? 90);
        setOfficialDays(mem.officialDays || ["Sunday", "Tuesday", "Thursday"]);
        setAvatar(mem.avatar || '');
      }
    }
  }, [modalExtraData, members]);

  if (activeModal !== 'editMember') return null;

  const toggleDay = (day) => {
    setOfficialDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!modalExtraData?.memberId) return;

    editMemberInfo(modalExtraData.memberId, {
      name,
      role,
      position,
      college,
      studentId,
      phone,
      score: Number(score),
      officialDays,
      avatar: avatar.trim() || null
    });

    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-user-pen text-[#c59b27]"></i>
            <span>Edit Member Information</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs max-h-[85vh] overflow-y-auto">
          {/* Member Profile Picture */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Profile Picture</label>
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#002244] text-[#c59b27] font-black flex items-center justify-center text-sm border-2 border-white shadow overflow-hidden flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Member Avatar" className="w-full h-full object-cover rounded-full block" />
                ) : (
                  <i className="fa-solid fa-user text-slate-300 text-base"></i>
                )}
              </div>
              <div className="flex-grow space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-xs cursor-pointer transition flex items-center gap-1 shadow-xs">
                    <i className="fa-solid fa-upload text-[10px]"></i>
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded font-semibold text-xs transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role / Functional Area</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="PR">PR</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Digital Transformation">Digital Transformation</option>
                <option value="Innovation">Innovation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Member">Member</option>
                <option value="Vice Head">Vice Head</option>
                <option value="Head">Head</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty</label>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="Computing & IT">Computing & Information Technology</option>
              <option value="Engineering & Tech">Engineering & Technology</option>
              <option value="Management & Tech">Management & Technology</option>
              <option value="Logistics & Transport">International Transport & Logistics</option>
              <option value="Law">Law & Legal Studies</option>
              <option value="Language & Comm">Language & Communication</option>
              <option value="Arts & Design">Arts & Design</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID (Student ID)</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Performance (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Working Days</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {daysList.map(day => (
                <label key={day} className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={officialDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="rounded text-[#002244] focus:ring-0"
                  />
                  <span className={officialDays.includes(day) ? "font-bold text-[#002244]" : "text-slate-600"}>{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              Save Member Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
