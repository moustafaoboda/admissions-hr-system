import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { compressImageFile } from '../../lib/imageUtils';

export default function AddMemberModal() {
  const { activeModal, setActiveModal, addMember } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState('HR');
  const [position, setPosition] = useState('Member');
  const [college, setCollege] = useState('Computing & IT');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [officialDays, setOfficialDays] = useState(["Saturday", "Monday", "Wednesday"]);
  const [score, setScore] = useState(90);
  const [avatar, setAvatar] = useState('');

  if (activeModal !== 'addMember') return null;

  const daysList = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const handleDayToggle = (day) => {
    if (officialDays.includes(day)) {
      setOfficialDays(officialDays.filter(d => d !== day));
    } else {
      setOfficialDays([...officialDays, day]);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 300, 300, 0.82);
        if (compressed) {
          setAvatar(compressed);
        }
      } catch (err) {
        console.warn('Avatar compression error:', err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMember({
      name,
      role,
      position,
      college,
      studentId: studentId.trim() || `2024${Math.floor(100 + Math.random() * 900)}`,
      phone: phone.trim() || '+20 100 000 0000',
      officialDays,
      score: Number(score) || 90,
      avatar: avatar.trim() || null
    });
    setName('');
    setStudentId('');
    setPhone('');
    setAvatar('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-[#c59b27]"></i>
            <span>Add New Team Member</span>
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
              placeholder="e.g. Ahmed Mahmoud"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Functional Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="HR">HR</option>
                <option value="PR">PR</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                placeholder="2024101"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+20 100 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Working Days (Sat–Thu)</label>
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {daysList.map(day => (
                <label key={day} className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={officialDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="rounded text-[#002244]"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Performance Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
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
              className="px-4 py-1.5 bg-[#002244] text-[#c59b27] font-bold rounded-lg shadow hover:bg-[#00162e] transition"
            >
              Enlist Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
