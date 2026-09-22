import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AddMemberModal() {
  const { activeModal, setActiveModal, addMember } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState('HR');
  const [position, setPosition] = useState('Member');
  const [college, setCollege] = useState('Computing & IT');
  const [term, setTerm] = useState(4);
  const [extraDays, setExtraDays] = useState(0);

  if (activeModal !== 'addMember') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addMember({
      name,
      role,
      position,
      college,
      term: Number(term),
      extraDays: Number(extraDays)
    });
    setName('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-[#c59b27]"></i>
            <span>Add Admissions Ambassador</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Student Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role (Committee)</label>
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
                <option value="Vice President">Vice President</option>
                <option value="President">President</option>
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
            <label className="block font-bold text-slate-700 mb-1">Smart Village College</label>
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
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Term / Semester</label>
              <input
                type="number"
                min="1"
                max="10"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Extra Days</label>
              <input
                type="number"
                min="0"
                value={extraDays}
                onChange={(e) => setExtraDays(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
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
              Enlist Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
