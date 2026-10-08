import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal() {
  const { currentUser, login, systemUsers = [] } = useAuth();
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

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Quick Profile Access</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {systemUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => quickFill(u.username)}
                  className="flex flex-col items-center p-2 rounded-lg border border-slate-200 hover:border-[#c59b27] hover:bg-amber-50/40 transition text-center group cursor-pointer bg-white"
                >
                  <div className="w-10 h-10 rounded-full border border-slate-300 overflow-hidden mb-1.5 shadow-xs group-hover:scale-105 transition flex-shrink-0 bg-[#002244] text-[#c59b27] flex items-center justify-center font-bold text-xs">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-full block" />
                    ) : (
                      <span>{(u.name || 'HR').slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#002244] leading-tight truncate w-full">{u.name}</span>
                  <span className="text-[9px] text-slate-400 truncate w-full">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
