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
    if (!mem.avatar) {
      const targetId = mem.id || mem.memberId || mem.member_id;
      const targetName = (mem.name || '').toLowerCase().trim();
      const found = members.find(m => (targetId && m.id === targetId) || (targetName && m.name?.toLowerCase().trim() === targetName))
        || dischargedMembers.find(d => (targetId && d.id === targetId) || (targetName && d.name?.toLowerCase().trim() === targetName));
      if (found && found.avatar) {
        mem = { ...mem, avatar: found.avatar };
      }
    }
  } else {
    const rawId = memberId || (typeof member === 'string' && member.length > 20 ? member : '');
    const raw = (name || member || '').toString().toLowerCase().trim();
    if (rawId || raw) {
      mem = members.find(m => (rawId && m.id === rawId) || (raw && (m.id === raw || m.name?.toLowerCase() === raw || raw.includes(m.name?.toLowerCase()) || m.name?.toLowerCase().includes(raw))))
        || dischargedMembers.find(d => (rawId && d.id === rawId) || (raw && (d.id === raw || d.name?.toLowerCase() === raw || raw.includes(d.name?.toLowerCase()) || d.name?.toLowerCase().includes(raw))));
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
    if (!usr.avatar) {
      const targetId = usr.id;
      const targetUser = (usr.username || '').toLowerCase().trim();
      const targetName = (usr.name || '').toLowerCase().trim();
      const found = systemUsers.find(u => (targetId && u.id === targetId) || (targetUser && u.username?.toLowerCase() === targetUser) || (targetName && u.name?.toLowerCase() === targetName))
        || (currentUser && ((targetId && currentUser.id === targetId) || (targetUser && currentUser.username?.toLowerCase() === targetUser) || (targetName && currentUser.name?.toLowerCase() === targetName)) ? currentUser : null);
      if (found && found.avatar) {
        usr = { ...usr, avatar: found.avatar };
      }
    }
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
