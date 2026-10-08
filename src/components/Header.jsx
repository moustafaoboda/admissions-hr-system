import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';

export default function Header() {
  const { currentUser, logout, setActiveModal, systemIcon } = useAuth();

  if (!currentUser) return null;

  const isViceHead = currentUser.role === "HR Vice Head";
  const isHeadOrVice = currentUser.role === "HR Head" || isViceHead;
  const initials = currentUser.name.split(" ").map(n => n[0]).slice(0, 2).join("");

  return (
    <header className="bg-[#002244] text-white shadow-lg border-b-2 border-[#c59b27] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Crest */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              {isHeadOrVice ? (
                <>
                  <button
                    onClick={() => setActiveModal('systemIcon')}
                    title="Change System Icon / Logo"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-[#c59b27] shadow-md transition overflow-hidden cursor-pointer"
                  >
                    {systemIcon?.type === "image" && systemIcon?.imageUrl ? (
                      <img src={systemIcon.imageUrl} alt="System Logo" className="w-full h-full object-cover rounded-full block" />
                    ) : (
                      <i className={`fa-solid ${systemIcon?.value || 'fa-anchor'} text-[#c59b27] text-lg sm:text-xl`}></i>
                    )}
                  </button>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#c59b27] text-[#002244] text-[9px] font-bold flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <i className="fa-solid fa-pen text-[8px]"></i>
                  </span>
                </>
              ) : (
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center border border-[#c59b27] shadow-md transition overflow-hidden"
                  title="Arab Academy for Science, Technology and Maritime Transport"
                >
                  {systemIcon?.type === "image" && systemIcon?.imageUrl ? (
                    <img src={systemIcon.imageUrl} alt="System Logo" className="w-full h-full object-cover rounded-full block" />
                  ) : (
                    <i className={`fa-solid ${systemIcon?.value || 'fa-anchor'} text-[#c59b27] text-lg sm:text-xl`}></i>
                  )}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-300">ARAB ACADEMY (AASTMT)</span>
                <span className="bg-[#c59b27] text-[#002244] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">SV CAMPUS</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold brand-font text-white leading-tight">Admissions HR Suite</h1>
            </div>
          </div>

          {/* User Controls & Role Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Icon Button (Leadership Only) */}
            {isHeadOrVice && (
              <button
                onClick={() => setActiveModal('systemIcon')}
                className="hidden lg:inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-[#c59b27] border border-[#c59b27]/50 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                title="Customize System Icon & Logo"
              >
                <i className="fa-solid fa-icons text-xs"></i>
                <span>System Icon</span>
              </button>
            )}

            {/* HR Vice Head Exclusive Top Key Button */}
            {isViceHead && (
              <button
                onClick={() => setActiveModal('systemUsers')}
                className="inline-flex items-center gap-1.5 bg-[#c59b27] hover:bg-[#dfb743] text-[#002244] px-3 py-1.5 rounded-lg text-xs font-extrabold shadow transition transform hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-key text-xs"></i>
                <span className="hidden md:inline">Users & Passwords</span>
                <span className="md:hidden">Users</span>
              </button>
            )}

            {/* Current User Pill */}
            <div className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#c59b27] text-[#002244] font-bold flex items-center justify-center text-xs overflow-hidden border border-white/40 flex-shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-full block" />
                ) : (
                  initials || 'HR'
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-[#dfb743] font-semibold">{currentUser.role}</div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setActiveModal('profile')}
              title="Edit My Profile"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-slate-200 transition"
            >
              <i className="fa-solid fa-user-pen"></i>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 bg-rose-600/90 hover:bg-rose-700 rounded-lg text-xs font-semibold text-white transition"
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <Navigation />
    </header>
  );
}
