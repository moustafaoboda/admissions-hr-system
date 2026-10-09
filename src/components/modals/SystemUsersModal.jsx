import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/Avatars';

export default function SystemUsersModal() {
  const {
    currentUser,
    systemUsers,
    activeModal,
    setActiveModal,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    showToast
  } = useAuth();

  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('HR');

  // Local state for table editing
  const [editFields, setEditFields] = useState({});

  if (activeModal !== 'systemUsers') return null;

  if (currentUser?.role !== "HR Vice Head") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <p className="text-rose-600 font-bold text-sm">Access Restricted: Only HR Vice Head may access credentials manager.</p>
          <button onClick={() => setActiveModal(null)} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg text-xs font-bold">Close</button>
        </div>
      </div>
    );
  }

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    addSystemUser(newName, newUsername, newPassword, newRole);
    setNewName('');
    setNewUsername('');
    setNewPassword('');
  };

  const handleFieldChange = (id, key, val) => {
    setEditFields(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || systemUsers.find(u => u.id === id)),
        [key]: val
      }
    }));
  };

  const handleSaveRow = (id) => {
    const updated = editFields[id] || systemUsers.find(u => u.id === id);
    if (!updated.name || !updated.username || !updated.password) {
      showToast("Fields cannot be empty.", "danger");
      return;
    }
    updateSystemUser(id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c59b27] text-[#002244] flex items-center justify-center font-bold">
              <i className="fa-solid fa-key"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm">System Users & Credentials Console</h3>
              <p className="text-[11px] text-[#dfb743]">HR Vice Head Administrative Privilege</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white text-lg">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-5">
          {/* Register New User */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-xs text-[#002244] mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <i className="fa-solid fa-user-plus text-[#c59b27]"></i>
              <span>Register New System User</span>
            </h4>

            <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              />
              <input
                type="text"
                required
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              />
              <input
                type="text"
                required
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
              >
                <option value="HR">HR</option>
                <option value="HR Head">HR Head</option>
                <option value="HR Vice Head">HR Vice Head</option>
                <option value="Admission's Dean">Admission's Dean</option>
              </select>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end mt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded-md shadow transition flex items-center gap-1"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                  <span>Add User Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Accounts Table */}
          <div>
            <h4 className="font-bold text-xs text-[#002244] mb-2 uppercase tracking-wide">Active System Accounts</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Password (Cleartext)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systemUsers.map(u => {
                    const rowData = editFields[u.id] || u;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar user={u} size="w-7 h-7 text-[10px]" />
                            <input
                              type="text"
                              value={rowData.name}
                              onChange={(e) => handleFieldChange(u.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={rowData.username}
                            onChange={(e) => handleFieldChange(u.id, 'username', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={rowData.role}
                            onChange={(e) => handleFieldChange(u.id, 'role', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          >
                            <option value="HR">HR</option>
                            <option value="HR Head">HR Head</option>
                            <option value="HR Vice Head">HR Vice Head</option>
                            <option value="Admission's Dean">Admission's Dean</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={rowData.password}
                            onChange={(e) => handleFieldChange(u.id, 'password', e.target.value)}
                            className="w-full px-2 py-1 bg-amber-50/80 border border-amber-300 font-mono text-xs text-[#002244] font-bold rounded"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleSaveRow(u.id)}
                            title="Save"
                            className="px-2 py-1 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold rounded text-xs"
                          >
                            <i className="fa-solid fa-floppy-disk"></i>
                          </button>
                          {u.username !== currentUser.username && (
                            <button
                              onClick={() => deleteSystemUser(u.id)}
                              title="Delete"
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
