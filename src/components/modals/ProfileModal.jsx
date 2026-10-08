import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileModal() {
  const { currentUser, activeModal, setActiveModal, updateProfile, showToast } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser, activeModal]);

  if (activeModal !== 'profile' || !currentUser) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword || confirmPassword || oldPassword) {
      if (newPassword !== confirmPassword) {
        showToast("New passwords do not match.", "danger");
        return;
      }
      if (newPassword.length < 3) {
        showToast("New password must be at least 3 characters long.", "danger");
        return;
      }
    }

    const success = await updateProfile(name, username, oldPassword, newPassword, avatar);
    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveModal(null);
    }
  };

  const initials = (name || currentUser.name || 'HR').split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27]">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <i className="fa-solid fa-user-pen text-[#c59b27]"></i>
            <span>Edit User Profile</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Profile Picture Upload & Preview */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Profile Picture</label>
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#c59b27] text-[#002244] font-black flex items-center justify-center text-sm border-2 border-white shadow overflow-hidden flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full block" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-grow space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-xs cursor-pointer transition flex items-center gap-1 shadow-xs">
                    <i className="fa-solid fa-upload text-[10px]"></i>
                    <span>Upload Picture</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded font-semibold text-xs transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="font-bold text-slate-600 mb-2">Change Password</p>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-500 mb-0.5">Old Password</label>
                <input
                  type="password"
                  placeholder="Required to save password change"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">New Password</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Rewrite New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] rounded-lg font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
