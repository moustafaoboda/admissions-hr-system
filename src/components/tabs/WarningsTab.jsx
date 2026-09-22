import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function WarningsTab() {
  const {
    currentUser,
    warnings,
    approveWarningRequest,
    dismissWarning,
    setActiveModal,
    setModalExtraData
  } = useAuth();

  const isViceHead = currentUser?.role === "HR Vice Head";
  const isHeadOrVice = currentUser?.role === "HR Head" || isViceHead;

  const handleOpenWarning = (mode) => {
    setModalExtraData({ mode });
    setActiveModal('warning');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244]">Disciplinary & Warnings Log</h2>
          <p className="text-xs text-slate-500">Track official warnings and pending disciplinary requests.</p>
        </div>

        <div>
          {isHeadOrVice ? (
            <button
              onClick={() => handleOpenWarning('issue')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>Issue Official Warning</span>
            </button>
          ) : currentUser?.role === 'HR' ? (
            <button
              onClick={() => handleOpenWarning('request')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Request Warning Issuance</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Warnings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Type / Level</th>
                <th className="py-3 px-4">Infraction Reason</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {warnings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400">
                    No disciplinary infractions recorded.
                  </td>
                </tr>
              ) : (
                warnings.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{w.memberName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        w.level.includes('Final') ? 'bg-purple-100 text-purple-900' :
                        w.level.includes('Written') ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {w.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{w.reason}</td>
                    <td className="py-3 px-4 text-slate-500">{w.reportedBy}</td>
                    <td className="py-3 px-4 text-slate-500">{w.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'Confirmed Strike' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {isHeadOrVice && w.status === 'Pending HR Approval' && (
                        <button
                          onClick={() => approveWarningRequest(w.id)}
                          title="Confirm Warning"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition"
                        >
                          Approve
                        </button>
                      )}
                      {isHeadOrVice ? (
                        <button
                          onClick={() => dismissWarning(w.id)}
                          title="Dismiss"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-bold transition"
                        >
                          Dismiss
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
