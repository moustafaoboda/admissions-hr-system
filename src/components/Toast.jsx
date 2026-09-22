import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toasts } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div id="toastContainer" className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 transform transition-all duration-300 pointer-events-auto border ${
            toast.type === "success"
              ? "bg-[#002244] border-[#c59b27] text-[#c59b27]"
              : toast.type === "danger"
              ? "bg-rose-600 border-rose-400 text-white"
              : "bg-amber-600 border-amber-400 text-white"
          }`}
        >
          <i
            className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check text-[#c59b27]' : 'fa-triangle-exclamation'
            }`}
          ></i>
          <span className="text-white">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
