import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function MemberAvatar({ member, memberId, name, size = "w-8 h-8 text-xs", className = "" }) {
  const auth = useAuth();
  const members = auth?.members || [];
  const dischargedMembers = auth?.dischargedMembers || [];
  const [imgError, setImgError] = useState(false);

  let mem = null;
  if (member && typeof member === 'object') {
    mem = member;
  } else {
    const raw = (memberId || member || name || '').toString().toLowerCase().trim();
    if (raw) {
      mem = members.find(m => m.id === memberId || m.name?.toLowerCase() === raw || raw.includes(m.name?.toLowerCase()) || m.name?.toLowerCase().includes(raw))
        || dischargedMembers.find(d => d.id === memberId || d.name?.toLowerCase() === raw || raw.includes(d.name?.toLowerCase()) || d.name?.toLowerCase().includes(raw));
    }
  }

  useEffect(() => {
    setImgError(false);
  }, [mem?.avatar]);

  const displayName = mem?.name || (typeof member === 'string' ? member : (name || 'Member'));
  const avatar = !imgError ? (mem?.avatar || null) : null;
  const initials = (displayName || 'MB').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'MB';

  return (
    <div
      className={`${size} rounded-full overflow-hidden border border-slate-200 bg-[#002244] text-[#c59b27] flex-shrink-0 inline-flex items-center justify-center font-extrabold shadow-xs select-none ${className}`}
      title={displayName}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={displayName}
          className="w-full h-full object-cover rounded-full block"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function UserAvatar({ user, username, name, size = "w-6 h-6 text-[10px]", className = "" }) {
  const auth = useAuth();
  const systemUsers = auth?.systemUsers || [];
  const currentUser = auth?.currentUser;
  const [imgError, setImgError] = useState(false);

  let usr = null;
  if (user && typeof user === 'object') {
    usr = user;
  } else {
    const raw = (user || username || name || '').toString().toLowerCase().trim();
    if (raw) {
      usr = systemUsers.find(u => raw.includes(u.username?.toLowerCase()) || raw.includes(u.name?.toLowerCase()) || (u.name && u.name.toLowerCase().includes(raw)))
        || (currentUser && (raw.includes(currentUser.name?.toLowerCase()) || (currentUser.name && currentUser.name.toLowerCase().includes(raw))) ? currentUser : null);
    }
  }

  useEffect(() => {
    setImgError(false);
  }, [usr?.avatar]);

  const displayName = usr?.name || (typeof user === 'string' ? user.replace(/\s*\(.*/, '').trim() : (name || 'User'));
  const avatar = !imgError ? (usr?.avatar || null) : null;
  const initials = (displayName || 'HR').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'HR';

  return (
    <div
      className={`${size} rounded-full overflow-hidden border border-[#c59b27]/60 bg-[#c59b27] text-[#002244] flex-shrink-0 inline-flex items-center justify-center font-extrabold shadow-xs select-none ${className}`}
      title={displayName}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={displayName}
          className="w-full h-full object-cover rounded-full block"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
