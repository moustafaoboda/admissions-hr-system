import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AddRecruitModal() {
  const { currentUser, activeModal, setActiveModal, addRecruit } = useAuth();
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('PR');
  const [college, setCollege] = useState('Computing & IT');
  const [term, setTerm] = useState(3);
  const [recommendation, setRecommendation] = useState('');

  if (activeModal !== 'addRecruit') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let hrRec = recommendation.trim();
    if (!hrRec && currentUser) {
      hrRec = `Submitted by ${currentUser.name} (${currentUser.role})`;
    }

    addRecruit({
      name: name.trim(),
      targetRole,
      college,
      term: Number(term),
      hrRecommendation: hrRec
    });

    setName('');
    setRecommendation('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-[#c59b27]"></i>
            <span>Submit Candidate Join Request</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Applicant Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Omar Khaled"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Role / Committee</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="PR">PR</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Digital Transformation">Digital Transformation</option>
                <option value="Innovation">Innovation</option>
                <option value="Vice President">Vice President</option>
                <option value="President">President</option>
              </select>
            </div>

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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Recommendation / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Recommended Accept (Strong communication skills)"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
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
              className="px-4 py-1.5 bg-[#002244] text-[#c59b27] font-bold rounded-lg flex items-center gap-1.5"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
              <span>Submit Join Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
