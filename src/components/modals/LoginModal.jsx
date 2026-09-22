import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal() {
  const { currentUser, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (currentUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  const quickFill = (uname) => {
    setUsername(uname);
    setPassword('123');
    login(uname, '123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00162e] via-[#002244] to-[#0d3868] p-6 text-center text-white relative">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center border-2 border-[#c59b27] shadow-lg">
            <i className="fa-solid fa-anchor text-2xl text-[#c59b27]"></i>
          </div>
          <h2 className="text-xl font-bold brand-font tracking-wide">AASTMT ADMISSIONS</h2>
          <p className="text-xs text-[#dfb743] font-semibold mt-1">Smart Village Campus • HR Administration Suite</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fa-solid fa-user text-sm"></i>
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
                placeholder="e.g. omar.farouk"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fa-solid fa-lock text-sm"></i>
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#002244] hover:bg-[#00162e] text-white font-bold rounded-lg shadow-md transition duration-150 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-right-to-bracket text-[#c59b27]"></i>
            <span>Sign In to Portal</span>
          </button>

          {/* Fast Demo Switcher */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">Fast 1-Click Role Login (Demo)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill('omar.farouk')}
                className="p-2 border border-amber-300 bg-amber-50/60 rounded-md text-slate-800 hover:bg-amber-100 flex items-center gap-1.5 font-medium transition text-left"
              >
                <i className="fa-solid fa-key text-[#c59b27]"></i>
                <div>
                  <div className="font-bold text-[11px] text-[#002244]">HR Vice Head</div>
                  <div className="text-[10px] text-slate-500">omar.farouk</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('tarek.hegazy')}
                className="p-2 border border-slate-200 bg-slate-50 rounded-md text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 font-medium transition text-left"
              >
                <i className="fa-solid fa-crown text-blue-800"></i>
                <div>
                  <div className="font-bold text-[11px] text-[#002244]">HR Head</div>
                  <div className="text-[10px] text-slate-500">tarek.hegazy</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('sarah.hr')}
                className="p-2 border border-slate-200 bg-slate-50 rounded-md text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 font-medium transition text-left"
              >
                <i className="fa-solid fa-user-tag text-emerald-700"></i>
                <div>
                  <div className="font-bold text-[11px] text-[#002244]">HR Member</div>
                  <div className="text-[10px] text-slate-500">sarah.hr</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('dean')}
                className="p-2 border border-slate-200 bg-slate-50 rounded-md text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 font-medium transition text-left"
              >
                <i className="fa-solid fa-building-columns text-purple-700"></i>
                <div>
                  <div className="font-bold text-[11px] text-[#002244]">Admission's Dean</div>
                  <div className="text-[10px] text-slate-500">dean (view only)</div>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
