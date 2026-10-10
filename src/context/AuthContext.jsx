import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getStoredSupabaseConfig, runDb } from '../lib/supabaseClient';

const AuthContext = createContext(null);

// Unique client identifier to prevent processing self-broadcasts
const CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

// Helper to load persistent state from localStorage with fallback
function loadStoredState(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (item !== null && item !== undefined) {
      const parsed = JSON.parse(item);
      if (Array.isArray(fallback)) {
        if (Array.isArray(parsed)) return parsed;
      } else if (parsed !== null && parsed !== undefined) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
  }
  return fallback;
}

// Helper to track and persist deletions so reloads / cloud sync never resurrect deleted items
function getDeletedIds(entityKey) {
  try {
    const raw = localStorage.getItem(`aastmt_deleted_${entityKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedId(entityKey, id) {
  try {
    if (!id) return;
    const current = getDeletedIds(entityKey);
    const strId = String(id).trim();
    if (!current.includes(strId)) {
      const updated = [...current, strId];
      localStorage.setItem(`aastmt_deleted_${entityKey}`, JSON.stringify(updated));
    }
  } catch {}
}

function removeDeletedId(entityKey, id) {
  try {
    if (!id) return;
    const current = getDeletedIds(entityKey);
    const strId = String(id).trim().toLowerCase();
    const updated = current.filter(x => String(x).toLowerCase().trim() !== strId);
    localStorage.setItem(`aastmt_deleted_${entityKey}`, JSON.stringify(updated));
  } catch {}
}

function isLegacyDemoStar(s) {
  if (!s) return true;
  const sId = s.id ? String(s.id).toLowerCase().trim() : '';
  if (sId === 'star-1' || sId === 'star-2') return true;
  return false;
}

function isDemoSession(s) {
  if (!s) return true;
  const id = String(s.id || '').toLowerCase().trim();
  return id === 'att-1' || id === 'att-2' || id === 'att-3' ||
         id === 'c1000000-0000-4000-8000-000000000001' ||
         id === 'c1000000-0000-4000-8000-000000000002' ||
         id === 'c1000000-0000-4000-8000-000000000003';
}

function isDemoWarning(w) {
  if (!w) return true;
  const id = String(w.id || '').toLowerCase().trim();
  return id === 'warn-1' || id === 'warn-2' || id === 'warn-3' ||
         id === 'd1000000-0000-4000-8000-000000000001' ||
         id === 'd1000000-0000-4000-8000-000000000002' ||
         id === 'd1000000-0000-4000-8000-000000000003';
}

function isDemoEvent(e) {
  if (!e) return true;
  const id = String(e.id || '').toLowerCase().trim();
  return id === 'evt-1' || id === 'evt-2' || id === 'evt-3';
}

function isDemoNote(n) {
  if (!n) return true;
  const id = String(n.id || '').toLowerCase().trim();
  return id === 'note-1' || id === 'note-2' || id === 'note-3';
}

function isDemoLog(a) {
  if (!a) return true;
  const id = String(a.id || '').toLowerCase().trim();
  return id === 'act-1' || id === 'act-2' || id === 'act-3' || id === 'act-4';
}

function isStarDeleted(s) {
  if (!s) return true;
  if (isLegacyDemoStar(s)) return true;
  const deletedStars = getDeletedIds('stars');
  if (!deletedStars || deletedStars.length === 0) return false;

  const sId = s.id ? String(s.id).toLowerCase().trim() : '';
  const mId = (s.memberId || s.member_id) ? String(s.memberId || s.member_id).toLowerCase().trim() : '';
  const sName = s.name ? String(s.name).toLowerCase().trim() : '';

  return deletedStars.some(del => {
    const d = String(del).toLowerCase().trim();
    return (sId && d === sId) || (mId && d === mId) || (sName && d === sName);
  });
}

function isMemberDeleted(m) {
  if (!m) return true;
  const deletedMemIds = getDeletedIds('members');
  if (!deletedMemIds || deletedMemIds.length === 0) return false;

  const mId = m.id ? String(m.id).toLowerCase().trim() : '';
  const sId = (m.studentId || m.student_id) ? String(m.studentId || m.student_id).toLowerCase().trim() : '';
  const mName = m.name ? String(m.name).toLowerCase().trim() : '';

  return deletedMemIds.some(del => {
    const d = String(del).toLowerCase().trim();
    return (mId && d === mId) || (sId && d === sId) || (mName && d === mName);
  });
}

function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const LEGACY_MEMBER_UUID_MAP = {
  "mem-1": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "mem-2": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
  "mem-3": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
  "mem-4": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
  "mem-5": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
  "mem-6": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
  "mem-7": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
  "mem-8": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
  "dis-1": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18"
};

function getMemberUuid(id) {
  if (!id) return id;
  return LEGACY_MEMBER_UUID_MAP[id] || id;
}

const LEGACY_USER_UUID_MAP = {
  "usr-1": "b3f74058-20b8-441c-bcdd-2bd27a302289",
  "usr-2": "6ddf714f-079e-443a-820c-9a27de6c40bc",
  "usr-3": "21b6358a-8cb0-43f1-a9e6-4fff0186a529",
  "usr-4": "2a2b5d87-1fdf-4b54-83b4-4849621a38bb"
};

function getUserUuid(id) {
  if (!id) return id;
  return LEGACY_USER_UUID_MAP[id] || id;
}

function normalizeWarningLevel(lvl) {
  if (!lvl) return 'First Verbal Warning';
  const s = String(lvl).trim();
  if (s === 'Final Hearing Notice' || s === 'Final Notice' || s === 'Final Strike & Review') return 'Final Strike & Review';
  if (s === 'Official Written Strike' || s === 'Written Strike') return 'Official Written Strike';
  return 'First Verbal Warning';
}

function normalizeSessionType(t) {
  if (!t) return "Normal Day";
  const str = String(t).trim();
  if (str === "Regular Shift" || str === "Normal" || str === "Standard") return "Normal Day";
  if (str === "EDU Gate Event") return "EDU Gate";
  if (str === "Urgent Meeting" || str === "Special Duty" || str === "Special Event") return "Event Day";
  const allowed = ["Normal Day", "Double Attendance", "Triple Attendance", "Orientation Day", "EDU Gate", "Event Day"];
  if (allowed.includes(str)) return str;
  return "Normal Day";
}

const INITIAL_SYSTEM_USERS = [
  { id: "b3f74058-20b8-441c-bcdd-2bd27a302289", name: "Booda", username: "booda", password: "111", role: "HR Vice Head", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80" },
  { id: "6ddf714f-079e-443a-820c-9a27de6c40bc", name: "Ali", username: "ali", password: "111", role: "HR Head", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80" },
  { id: "21b6358a-8cb0-43f1-a9e6-4fff0186a529", name: "Test HR", username: "test", password: "111", role: "HR", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80" },
  { id: "2a2b5d87-1fdf-4b54-83b4-4849621a38bb", name: "Admissions Dean", username: "dean", password: "111", role: "Admission's Dean", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80" }
];

const INITIAL_MEMBERS = [];
const INITIAL_DISCHARGED_MEMBERS = [];
const INITIAL_STAR_AMBASSADORS = [];
const INITIAL_ATTENDANCE_SESSIONS = [];
const INITIAL_ACTIVITY_LOGS = [];
const INITIAL_WARNINGS = [];
const INITIAL_EVENTS = [];
const INITIAL_MONITORING_NOTES = [];

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days auto-logout expiration

const SYSTEM_CACHE_VERSION = "v6_live_db_data";
try {
  if (typeof window !== "undefined" && localStorage.getItem("aastmt_sync_ver") !== SYSTEM_CACHE_VERSION) {
    const keysToRemove = [
      "aastmt_members",
      "aastmt_discharged_members",
      "aastmt_star_ambassadors",
      "aastmt_attendance_sessions",
      "aastmt_warnings",
      "aastmt_events",
      "aastmt_monitoring_notes",
      "aastmt_system_users",
      "aastmt_deleted_members",
      "aastmt_deleted_users",
      "aastmt_deleted_sessions",
      "aastmt_deleted_warnings",
      "aastmt_deleted_stars",
      "aastmt_deleted_events",
      "aastmt_deleted_notes"
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    const savedUser = localStorage.getItem("aastmt_current_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const validUsernames = ["dean", "ali", "booda", "test"];
        if (!validUsernames.includes(parsed?.username?.toLowerCase()?.trim())) {
          localStorage.removeItem("aastmt_current_user");
          localStorage.removeItem("aastmt_login_timestamp");
        }
      } catch(e) {
        localStorage.removeItem("aastmt_current_user");
      }
    }
    localStorage.setItem("aastmt_sync_ver", SYSTEM_CACHE_VERSION);
  }
} catch (e) {}

export function AuthProvider({ children }) {
  // Persistent login session with 1-week auto-logout expiry
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("aastmt_current_user");
      const loginTimeStr = localStorage.getItem("aastmt_login_timestamp");
      if (saved) {
        if (loginTimeStr) {
          const loginTime = Number(loginTimeStr);
          if (Date.now() - loginTime < ONE_WEEK_MS) {
            return JSON.parse(saved);
          } else {
            // Expired after 1 week
            localStorage.removeItem("aastmt_current_user");
            localStorage.removeItem("aastmt_login_timestamp");
            return null;
          }
        }
        // If saved user exists but timestamp not set yet, initialize timestamp to now
        localStorage.setItem("aastmt_login_timestamp", Date.now().toString());
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem("aastmt_active_tab") || "dashboard";
    } catch {
      return "dashboard";
    }
  });

  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Data Collections with automatic local persistence across sessions
  const [systemUsers, setSystemUsers] = useState(() => {
    const deleted = getDeletedIds("users");
    return loadStoredState("aastmt_system_users", INITIAL_SYSTEM_USERS).filter(u => !deleted.includes(u.id));
  });
  const [members, setMembers] = useState(() => {
    return loadStoredState("aastmt_members", []).filter(m => !isMemberDeleted(m));
  });
  const [dischargedMembers, setDischargedMembers] = useState(() => {
    return loadStoredState("aastmt_discharged_members", []).filter(m => !isMemberDeleted(m));
  });
  const [starAmbassadors, setStarAmbassadors] = useState(() => {
    return loadStoredState("aastmt_star_ambassadors", []).filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isStarDeleted(s));
  });
  const [attendanceSessions, setAttendanceSessions] = useState(() => {
    const deleted = getDeletedIds("sessions");
    return loadStoredState("aastmt_attendance_sessions", []).filter(s => !deleted.includes(s.id) && !isDemoSession(s));
  });
  const [warnings, setWarnings] = useState(() => {
    const deleted = getDeletedIds("warnings");
    return loadStoredState("aastmt_warnings", []).filter(w => !deleted.includes(w.id) && !isDemoWarning(w));
  });
  const [events, setEvents] = useState(() => {
    const deleted = getDeletedIds("events");
    return loadStoredState("aastmt_events", []).filter(e => !deleted.includes(e.id) && !isDemoEvent(e));
  });
  const [monitoringNotes, setMonitoringNotes] = useState(() => {
    const deleted = getDeletedIds("notes");
    return loadStoredState("aastmt_monitoring_notes", []).filter(n => !deleted.includes(n.id) && !isDemoNote(n));
  });
  const [monitoringSelectedMemberId, setMonitoringSelectedMemberId] = useState("");
  const [recruits, setRecruits] = useState(() => loadStoredState("aastmt_recruits", []));
  const [activityLogs, setActivityLogs] = useState(() => loadStoredState("aastmt_activity_logs", []).filter(a => !isDemoLog(a)));

  // Initial database loading state
  const [isLoading, setIsLoading] = useState(Boolean(isSupabaseConfigured));

  // Sync Status
  const [syncStatus, setSyncStatus] = useState({
    isCloudConnected: Boolean(isSupabaseConfigured),
    onlinePeers: 1,
    lastSyncTime: null
  });

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [modalExtraData, setModalExtraData] = useState({});

  // System Branding / Icon State
  const [systemIcon, setSystemIcon] = useState(() => {
    try {
      const saved = localStorage.getItem("aastmt_system_icon");
      return saved ? JSON.parse(saved) : { type: "icon", value: "fa-anchor", imageUrl: "" };
    } catch {
      return { type: "icon", value: "fa-anchor", imageUrl: "" };
    }
  });

  // Ensure all data updates are immediately saved in localStorage (so closing the browser never resets anything)
  useEffect(() => {
    try { localStorage.setItem("aastmt_members", JSON.stringify(members)); } catch (e) {}
  }, [members]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_discharged_members", JSON.stringify(dischargedMembers)); } catch (e) {}
  }, [dischargedMembers]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_attendance_sessions", JSON.stringify(attendanceSessions)); } catch (e) {}
  }, [attendanceSessions]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_warnings", JSON.stringify(warnings)); } catch (e) {}
  }, [warnings]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_events", JSON.stringify(events)); } catch (e) {}
  }, [events]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_star_ambassadors", JSON.stringify(starAmbassadors)); } catch (e) {}
  }, [starAmbassadors]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_monitoring_notes", JSON.stringify(monitoringNotes)); } catch (e) {}
  }, [monitoringNotes]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_system_users", JSON.stringify(systemUsers)); } catch (e) {}
  }, [systemUsers]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_recruits", JSON.stringify(recruits)); } catch (e) {}
  }, [recruits]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_activity_logs", JSON.stringify(activityLogs)); } catch (e) {}
  }, [activityLogs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("aastmt_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("aastmt_current_user");
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem("aastmt_active_tab", activeTab); } catch (e) {}
  }, [activeTab]);

  // Periodic check to auto-logout if session exceeds 1 week
  useEffect(() => {
    const checkExpiry = () => {
      const loginTimeStr = localStorage.getItem("aastmt_login_timestamp");
      if (loginTimeStr && currentUser) {
        const loginTime = Number(loginTimeStr);
        if (Date.now() - loginTime >= ONE_WEEK_MS) {
          setCurrentUser(null);
          try {
            localStorage.removeItem("aastmt_current_user");
            localStorage.removeItem("aastmt_login_timestamp");
          } catch (e) {}
          setActiveModal('login');
          showToast("Your session has expired after 1 week. Please sign in again.", "warning");
        }
      }
    };

    checkExpiry();
    const timer = setInterval(checkExpiry, 60 * 1000); // Check every minute
    return () => clearInterval(timer);
  }, [currentUser, showToast]);

  // Broadcast Channels Refs
  const localBcRef = useRef(null);
  const supabaseChannelRef = useRef(null);
  const pauseCloudSyncUntilRef = useRef(0);
  const lastMutationTimeRef = useRef(0);

  const pauseCloudSync = useCallback((ms = 5000) => {
    lastMutationTimeRef.current = Date.now();
    pauseCloudSyncUntilRef.current = Date.now() + ms;
  }, []);

  // Unified Remote Mutation Handler
  const handleRemoteMutation = useCallback((type, payload, senderId) => {
    if (senderId === CLIENT_ID) return; // Ignore echoes

    switch (type) {
      case 'SYNC_ALL':
        try {
          const storedMems = loadStoredState("aastmt_members", null);
          if (storedMems) setMembers(storedMems.filter(m => !isMemberDeleted(m)));
          const storedDis = loadStoredState("aastmt_discharged_members", null);
          if (storedDis) setDischargedMembers(storedDis.filter(m => !isMemberDeleted(m)));
          const storedAtt = loadStoredState("aastmt_attendance_sessions", null);
          if (storedAtt) setAttendanceSessions(storedAtt.filter(s => !getDeletedIds("sessions").includes(s.id)));
          const storedWarn = loadStoredState("aastmt_warnings", null);
          if (storedWarn) setWarnings(storedWarn.filter(w => !getDeletedIds("warnings").includes(w.id)));
          const storedEvt = loadStoredState("aastmt_events", null);
          if (storedEvt) setEvents(storedEvt.filter(e => !getDeletedIds("events").includes(e.id)));
          const storedStars = loadStoredState("aastmt_star_ambassadors", null);
          if (storedStars) setStarAmbassadors(storedStars.filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isStarDeleted(s)));
          const storedNotes = loadStoredState("aastmt_monitoring_notes", null);
          if (storedNotes) setMonitoringNotes(storedNotes.filter(n => !getDeletedIds("notes").includes(n.id)));
          const storedUsers = loadStoredState("aastmt_system_users", null);
          if (storedUsers) setSystemUsers(storedUsers.filter(u => !getDeletedIds("users").includes(u.id)));
          const storedIcon = loadStoredState("aastmt_system_icon", null);
          if (storedIcon) setSystemIcon(storedIcon);
        } catch(e) {}
        break;

      case 'ADD_MEMBER':
        if (payload.id) removeDeletedId("members", payload.id);
        if (payload.studentId) removeDeletedId("members", payload.studentId);
        if (payload.name) removeDeletedId("members", payload.name.toLowerCase().trim());
        setMembers(prev => prev.some(m => m.id === payload.id) ? prev : [...prev, payload]);
        break;

      case 'UPDATE_MEMBER':
        setMembers(prev => prev.map(m => (m.id === payload.id || getMemberUuid(m.id) === getMemberUuid(payload.id)) ? { ...m, ...payload.fields } : m));
        setDischargedMembers(prev => prev.map(d => (d.id === payload.id || getMemberUuid(d.id) === getMemberUuid(payload.id)) ? { ...d, ...payload.fields } : d));
        if (payload.fields?.avatar !== undefined) {
          setStarAmbassadors(prev => prev.map(s => (s.memberId === payload.id || s.member_id === payload.id || getMemberUuid(s.memberId) === getMemberUuid(payload.id)) ? { ...s, avatar: payload.fields.avatar } : s));
        }
        break;

      case 'DELETE_MEMBER':
        if (payload.id) addDeletedId("members", payload.id);
        if (payload.studentId) addDeletedId("members", payload.studentId);
        if (payload.name) addDeletedId("members", payload.name.toLowerCase().trim());
        setMembers(prev => prev.filter(m => m.id !== payload.id && (!payload.studentId || m.studentId !== payload.studentId) && (!payload.name || m.name.toLowerCase().trim() !== String(payload.name).toLowerCase().trim())));
        setStarAmbassadors(prev => prev.filter(s => s.memberId !== payload.id && s.member_id !== payload.id && (!payload.name || s.name.toLowerCase().trim() !== String(payload.name).toLowerCase().trim())));
        break;

      case 'DISCHARGE_MEMBER':
        setMembers(prev => prev.filter(m => m.id !== payload.memberId));
        setDischargedMembers(prev => [payload.record, ...prev.filter(d => d.id !== payload.record.id)]);
        break;

      case 'UPDATE_DISCHARGED_MEMBER':
        setDischargedMembers(prev => prev.map(d => d.id === payload.id ? { ...d, ...payload.fields } : d));
        if (payload.fields?.avatar !== undefined) {
          setMembers(prev => prev.map(m => m.id === payload.id ? { ...m, ...payload.fields } : m));
          setStarAmbassadors(prev => prev.map(s => (s.memberId === payload.id || s.member_id === payload.id) ? { ...s, avatar: payload.fields.avatar } : s));
        }
        break;

      case 'REINSTATE_MEMBER':
        if (payload.reinstatedMember?.id) removeDeletedId("members", payload.reinstatedMember.id);
        if (payload.reinstatedMember?.studentId) removeDeletedId("members", payload.reinstatedMember.studentId);
        if (payload.reinstatedMember?.name) removeDeletedId("members", payload.reinstatedMember.name.toLowerCase().trim());
        setDischargedMembers(prev => prev.filter(d => d.id !== payload.id));
        setMembers(prev => prev.some(m => m.id === payload.reinstatedMember.id) ? prev : [...prev, payload.reinstatedMember]);
        break;

      case 'DELETE_DISCHARGED_MEMBER':
        if (payload.id) addDeletedId("members", payload.id);
        if (payload.studentId) addDeletedId("members", payload.studentId);
        if (payload.name) addDeletedId("members", payload.name.toLowerCase().trim());
        setDischargedMembers(prev => prev.filter(d => d.id !== payload.id && (!payload.name || d.name.toLowerCase().trim() !== String(payload.name).toLowerCase().trim())));
        break;

      case 'ADD_STAR':
        if (payload.id) removeDeletedId('stars', payload.id);
        if (payload.memberId) removeDeletedId('stars', payload.memberId);
        if (payload.name) removeDeletedId('stars', payload.name.toLowerCase().trim());
        setStarAmbassadors(prev => [payload, ...prev.filter(s => s.id !== payload.id && (!payload.memberId || (s.memberId !== payload.memberId && s.member_id !== payload.memberId)))]);
        break;

      case 'REMOVE_STAR':
        if (payload.id) addDeletedId('stars', payload.id);
        if (payload.memberId) addDeletedId('stars', payload.memberId);
        if (payload.name) addDeletedId('stars', payload.name.toLowerCase().trim());
        setStarAmbassadors(prev => prev.filter(s => {
          if (payload.id && s.id === payload.id) return false;
          if (payload.memberId && (s.memberId === payload.memberId || s.member_id === payload.memberId)) return false;
          if (payload.name && s.name && s.name.toLowerCase().trim() === String(payload.name).toLowerCase().trim()) return false;
          return true;
        }));
        break;

      case 'CREATE_ATTENDANCE_SESSION':
        setAttendanceSessions(prev => [payload.session, ...prev.filter(s => s.id !== payload.session.id)]);
        if (payload.updatedMemberIds && payload.updatedMemberIds.length > 0) {
          setMembers(prev => prev.map(m => payload.updatedMemberIds.includes(m.id) ? { ...m, attendanceCount: m.attendanceCount + 1 } : m));
        }
        break;

      case 'UPDATE_ATTENDANCE_SESSION':
        setAttendanceSessions(prev => prev.map(s => s.id === payload.id ? { ...s, ...payload.data } : s));
        if (payload.deltas) {
          setMembers(prev => prev.map(m => {
            const delta = payload.deltas[m.id];
            if (delta) {
              return { ...m, attendanceCount: Math.max(0, m.attendanceCount + delta) };
            }
            return m;
          }));
        }
        break;

      case 'DELETE_ATTENDANCE_SESSION':
        if (payload.id) addDeletedId('sessions', payload.id);
        setAttendanceSessions(prev => prev.filter(s => s.id !== payload.id));
        if (payload.wasPresentIds && payload.wasPresentIds.length > 0) {
          setMembers(prev => prev.map(m => payload.wasPresentIds.includes(m.id) ? { ...m, attendanceCount: Math.max(0, m.attendanceCount - 1) } : m));
        }
        break;

      case 'SUBMIT_WARNING':
        setWarnings(prev => [payload.warning, ...prev.filter(w => w.id !== payload.warning.id)]);
        if (payload.memberId && payload.incrementStrikes) {
          setMembers(prev => prev.map(m => m.id === payload.memberId ? {
            ...m,
            strikes: m.strikes + 1,
            score: Math.max(50, m.score - 8)
          } : m));
        }
        break;

      case 'APPROVE_WARNING':
        setWarnings(prev => prev.map(w => w.id === payload.id ? { ...w, status: "Confirmed Strike" } : w));
        if (payload.memberId) {
          setMembers(prev => prev.map(m => m.id === payload.memberId ? {
            ...m,
            strikes: m.strikes + 1,
            score: Math.max(50, m.score - 8)
          } : m));
        }
        break;

      case 'DISMISS_WARNING':
        addDeletedId('warnings', payload.id);
        if (payload.wasConfirmed && payload.memberId) {
          setMembers(prev => prev.map(m => m.id === payload.memberId ? { ...m, strikes: Math.max(0, m.strikes - 1), score: Math.min(100, m.score + 8) } : m));
        }
        setWarnings(prev => prev.filter(w => w.id !== payload.id));
        break;

      case 'UPDATE_WARNING':
        setWarnings(prev => prev.map(w => w.id === payload.id ? { ...w, ...payload.fields } : w));
        break;

      case 'ADD_EVENT':
        setEvents(prev => [...prev.filter(e => e.id !== payload.id), payload]);
        break;

      case 'UPDATE_EVENT':
        setEvents(prev => prev.map(e => e.id === payload.id ? { ...e, ...payload.fields } : e));
        break;

      case 'DELETE_EVENT':
        setEvents(prev => prev.filter(e => e.id !== payload.id));
        break;

      case 'ADD_MONITORING_NOTE':
        setMonitoringNotes(prev => [payload, ...prev.filter(n => n.id !== payload.id)]);
        break;

      case 'UPDATE_MONITORING_NOTE':
        setMonitoringNotes(prev => prev.map(n => n.id === payload.id ? { ...n, ...payload.fields } : n));
        break;

      case 'DELETE_MONITORING_NOTE':
        setMonitoringNotes(prev => prev.filter(n => n.id !== payload.id));
        break;

      case 'ADD_SYSTEM_USER':
        setSystemUsers(prev => [...prev.filter(u => u.id !== payload.id), payload]);
        break;

      case 'UPDATE_SYSTEM_USER':
        setSystemUsers(prev => prev.map(u => u.id === payload.id ? { ...u, ...payload.fields } : u));
        break;

      case 'DELETE_SYSTEM_USER':
        setSystemUsers(prev => prev.filter(u => u.id !== payload.id));
        break;

      case 'UPDATE_SYSTEM_ICON':
        setSystemIcon(payload);
        try { localStorage.setItem("aastmt_system_icon", JSON.stringify(payload)); } catch(e) {}
        break;

      case 'ADD_ACTIVITY_LOG':
        setActivityLogs(prev => [payload, ...prev.filter(a => a.id !== payload.id)]);
        break;

      case 'TOGGLE_STAR_ACTIVITY_LOG':
        setActivityLogs(prev => prev.map(a => a.id === payload.id ? { ...a, isStarred: payload.isStarred } : a));
        break;

      case 'UPDATE_ACTIVITY_LOG':
        setActivityLogs(prev => prev.map(a => a.id === payload.id ? { ...a, ...payload.fields } : a));
        break;

      case 'DELETE_ACTIVITY_LOG':
        setActivityLogs(prev => prev.filter(a => a.id !== payload.id));
        break;

      default:
        break;
    }
  }, []);

  // Broadcast function (Multi-layer: Local BroadcastChannel + Supabase Realtime)
  const broadcastMutation = useCallback((type, payload) => {
    const message = { type, payload, senderId: CLIENT_ID, timestamp: Date.now() };

    // 1. Broadcast locally across browser tabs
    if (localBcRef.current) {
      try {
        localBcRef.current.postMessage(message);
      } catch (err) {
        console.warn('Local broadcast error:', err);
      }
    }

    // 2. Broadcast via Supabase Realtime channel across all internet-connected devices
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'MUTATION',
          payload: message
        });
      } catch (err) {
        console.warn('Supabase broadcast error:', err);
      }
    }
  }, []);

  // Fetch initial/latest data from Supabase Cloud Database with auto-seed fallback
  const refreshDataFromCloud = useCallback(async () => {
    if (!supabase) return;
    const fetchStartTime = Date.now();

    try {
      let activeMems = [];
      let disMems = [];
      const deletedMemIds = getDeletedIds('members');

      // 1. Members
      const { data: dbMembers, error: mErr } = await supabase.from('members').select('*');
      if (!mErr && dbMembers) {
        if (lastMutationTimeRef.current > fetchStartTime || Date.now() < pauseCloudSyncUntilRef.current) {
          return;
        }
        dbMembers.forEach(row => {
          const extraCount = typeof row.extra_days === 'number' ? row.extra_days : (parseInt(row.extra_days, 10) || 0);
          let extraArr = Array.isArray(row.extra_days) ? row.extra_days : [];
          if (extraArr.length === 0) {
            try {
              const saved = JSON.parse(localStorage.getItem("aastmt_member_extra_days_" + row.id) || "[]");
              if (Array.isArray(saved) && saved.length > 0) extraArr = saved;
            } catch (e) {}
          }
          const formatted = {
            id: row.id,
            name: row.name,
            role: row.role,
            position: row.position,
            college: row.college,
            studentId: row.student_id,
            phone: row.phone,
            attendanceCount: row.attendance_count || 0,
            officialDays: row.official_days || ["Sunday", "Tuesday", "Thursday"],
            extraDays: extraArr,
            extraDaysCount: (row.extra_days_count !== undefined && row.extra_days_count !== null) ? Number(row.extra_days_count) : extraCount,
            extra_days: (row.extra_days_count !== undefined && row.extra_days_count !== null) ? Number(row.extra_days_count) : extraCount,
            strikes: row.strikes || 0,
            score: row.score || 90,
            status: row.status,
            dischargeType: row.discharge_type,
            dischargeReason: row.discharge_reason,
            avatar: row.avatar || null
          };
          if (row.status === 'Discharged') {
            disMems.push(formatted);
          } else {
            activeMems.push(formatted);
          }
        });

        // Database is authoritative source of truth:
        setMembers(activeMems);
        try { localStorage.setItem("aastmt_members", JSON.stringify(activeMems)); } catch (e) {}
        setDischargedMembers(disMems);
        try { localStorage.setItem("aastmt_discharged_members", JSON.stringify(disMems)); } catch (e) {}
      }

      // 2. System Users
      const deletedUserIds = getDeletedIds('users');
      const { data: dbUsers, error: uErr } = await supabase.from('system_users').select('*');
      if (!uErr && dbUsers) {
        const validUsers = dbUsers
          .filter(u => !deletedUserIds.includes(u.id) && !deletedUserIds.includes(u.username?.toLowerCase()))
          .map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            password: u.password,
            role: u.role,
            avatar: u.avatar || null
          }));

        // Database is the single source of truth: stale local copies must never be pushed back
        // (that previously resurrected old/renamed accounts and old passwords on other devices).
        setSystemUsers(validUsers);
        try { localStorage.setItem("aastmt_system_users", JSON.stringify(validUsers)); } catch (e) {}
      }

      // 3. Star Ambassadors (Direct Supabase Sync - DB is Single Source of Truth)
      const { data: dbStars, error: sErr } = await supabase.from('star_ambassadors').select('*');

      if (!sErr && dbStars) {
        if (lastMutationTimeRef.current > fetchStartTime || Date.now() < pauseCloudSyncUntilRef.current) {
          return;
        }
        const allKnownMembers = [...activeMems, ...disMems, ...members];
        const validDbStars = dbStars
          .filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isLegacyDemoStar(s))
          .map(s => {
            const m = allKnownMembers.find(mem => mem.id === s.member_id || getMemberUuid(mem.id) === s.member_id || mem.id === getMemberUuid(s.member_id));
            return {
              id: s.id,
              memberId: s.member_id,
              name: s.name || m?.name || 'Ambassador',
              role: s.role || m?.role || 'Operations',
              college: s.college || m?.college || 'AASTMT',
              avatar: m?.avatar || null,
              awardTitle: s.award_title,
              citation: s.citation
            };
          });

        setStarAmbassadors(validDbStars);
        try { localStorage.setItem("aastmt_star_ambassadors", JSON.stringify(validDbStars)); } catch (e) {}
      } else if (sErr) {
        const localStars = loadStoredState("aastmt_star_ambassadors", [])
          .filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isLegacyDemoStar(s));
        setStarAmbassadors(localStars);
      }

      // 4. Attendance Sessions & Relational Attendance Records
      const [sessRes, recRes] = await Promise.all([
        supabase.from('attendance_sessions').select('*'),
        supabase.from('attendance_records').select('*')
      ]);

      const { data: dbSessions, error: aErr } = sessRes;
      const { data: dbRecords } = recRes;

      if (!aErr && dbSessions) {
        if (lastMutationTimeRef.current > fetchStartTime || Date.now() < pauseCloudSyncUntilRef.current) {
          return;
        }
        const allKnownMembers = [...activeMems, ...disMems, ...members];
        const validSessions = dbSessions
          .map(s => {
            const matchedRecords = (dbRecords || []).filter(r => r.session_id === s.id);
            const rollCall = matchedRecords.map(r => {
              const m = allKnownMembers.find(mem => mem.id === r.member_id || getMemberUuid(mem.id) === r.member_id || mem.id === getMemberUuid(r.member_id));
              return {
                memberId: r.member_id,
                name: m ? m.name : 'Ambassador',
                role: m ? m.role : 'Operations',
                isPresent: Boolean(r.is_present),
                isExcused: Boolean(r.is_excused),
                excuseReason: r.excuse_reason || ''
              };
            });

            return {
              id: s.id,
              title: s.title,
              date: s.date,
              dayName: s.day_name,
              type: s.session_type,
              presentCount: s.present_count,
              totalCount: s.total_count || rollCall.length,
              rollCall: rollCall
            };
          });

        setAttendanceSessions(validSessions);
        try { localStorage.setItem("aastmt_attendance_sessions", JSON.stringify(validSessions)); } catch (e) {}
      }

      // 5. Warnings
      const { data: dbWarnings, error: wErr } = await supabase.from('disciplinary_warnings').select('*');
      if (!wErr && dbWarnings) {
        const allKnownMembers = [...activeMems, ...disMems, ...members];
        const validWarnings = dbWarnings
          .map(w => {
            const m = allKnownMembers.find(mem => mem.id === w.member_id || getMemberUuid(mem.id) === w.member_id || mem.id === getMemberUuid(w.member_id));
            return {
              id: w.id,
              memberId: w.member_id,
              memberName: m ? m.name : (w.member_name || 'Ambassador'),
              level: normalizeWarningLevel(w.level),
              reason: w.reason,
              reportedBy: w.reported_by,
              date: w.date,
              status: w.status
            };
          });
        setWarnings(validWarnings);
        try { localStorage.setItem("aastmt_warnings", JSON.stringify(validWarnings)); } catch (e) {}
      }

      // 6. Monitoring Notes
      const { data: dbNotes, error: nErr } = await supabase.from('monitoring_notes').select('*');
      if (!nErr && dbNotes) {
        const validNotes = dbNotes
          .map(n => ({
            id: n.id,
            memberId: n.member_id,
            memberName: n.member_name,
            memberRole: n.member_role,
            memberCollege: n.member_college,
            authorName: n.author_name,
            authorRole: n.author_role,
            category: n.category,
            note: n.note,
            date: n.date,
            time: n.time
          }));
        setMonitoringNotes(validNotes);
        try { localStorage.setItem("aastmt_monitoring_notes", JSON.stringify(validNotes)); } catch (e) {}
      }

      // 7. Events
      const { data: dbEvents, error: eErr } = await supabase.from('events').select('*');
      if (!eErr && dbEvents) {
        const validEvents = dbEvents
          .map(e => ({
            id: e.id,
            title: e.title,
            type: e.type,
            status: e.status,
            description: e.description,
            location: e.location,
            date: e.date,
            color: e.color
          }));
        setEvents(validEvents);
        try { localStorage.setItem("aastmt_events", JSON.stringify(validEvents)); } catch (e) {}
      }

      // 8. System Settings (Branding Icon)
      const { data: dbSettings, error: stErr } = await supabase.from('system_settings').select('*');
      if (!stErr && dbSettings && dbSettings.length > 0) {
        const iconSetting = dbSettings.find(s => s.key === 'system_icon');
        if (iconSetting && iconSetting.value) {
          setSystemIcon(iconSetting.value);
          try { localStorage.setItem("aastmt_system_icon", JSON.stringify(iconSetting.value)); } catch(e) {}
        }
      }

      setSyncStatus(prev => ({ ...prev, lastSyncTime: Date.now() }));
    } catch (err) {
      console.warn('Initial Supabase data load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize Realtime Listeners & Storage Cross-Tab Sync
  useEffect(() => {
    // Coalescing refresh: never overlaps requests, and re-runs once if changes arrived mid-flight
    let refreshInFlight = false;
    let refreshQueued = false;
    let refreshTimeout = null;
    const runRefresh = async () => {
      if (Date.now() < pauseCloudSyncUntilRef.current) return;
      if (refreshInFlight) { refreshQueued = true; return; }
      refreshInFlight = true;
      try {
        await refreshDataFromCloud();
      } finally {
        refreshInFlight = false;
        if (refreshQueued) { refreshQueued = false; runRefresh(); }
      }
    };
    const scheduleRefresh = (delay = 0) => {
      if (refreshTimeout) return;
      refreshTimeout = setTimeout(() => { refreshTimeout = null; runRefresh(); }, delay);
    };

    // 1. Multi-Tab Local Broadcast Channel
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const bc = new BroadcastChannel('aastmt_admissions_realtime');
      localBcRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data && event.data.type) {
          handleRemoteMutation(event.data.type, event.data.payload, event.data.senderId);
        }
      };
    }

    // 2. LocalStorage cross-tab sync listener
    const handleStorageChange = (e) => {
      if (!e.key || !e.newValue) return;
      try {
        const val = JSON.parse(e.newValue);
        if (e.key === "aastmt_members") setMembers(val);
        else if (e.key === "aastmt_discharged_members") setDischargedMembers(val);
        else if (e.key === "aastmt_attendance_sessions") setAttendanceSessions(val);
        else if (e.key === "aastmt_warnings") setWarnings(val);
        else if (e.key === "aastmt_events") setEvents(val);
        else if (e.key === "aastmt_star_ambassadors") setStarAmbassadors(val);
        else if (e.key === "aastmt_monitoring_notes") setMonitoringNotes(val);
        else if (e.key === "aastmt_system_users") setSystemUsers(val);
        else if (e.key === "aastmt_system_icon") setSystemIcon(val);
        else if (e.key === "aastmt_activity_logs") setActivityLogs(val);
      } catch (err) {}
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Supabase Realtime Channel
    if (supabase) {
      const channel = supabase.channel('admissions_realtime_broadcast', {
        config: {
          broadcast: { self: false },
          presence: { key: CLIENT_ID }
        }
      });
      supabaseChannelRef.current = channel;

      channel
        .on('broadcast', { event: 'MUTATION' }, (payload) => {
          if (payload && payload.payload) {
            handleRemoteMutation(payload.payload.type, payload.payload.payload, payload.payload.senderId);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          if (Date.now() < pauseCloudSyncUntilRef.current || (Date.now() - lastMutationTimeRef.current < 5000)) {
            return;
          }
          scheduleRefresh(500);
        })
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const peerCount = Object.keys(presenceState).length;
          setSyncStatus(prev => ({ ...prev, isCloudConnected: true, onlinePeers: Math.max(1, peerCount) }));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.track({ onlineAt: new Date().toISOString() });
            setSyncStatus(prev => ({ ...prev, isCloudConnected: true }));
            refreshDataFromCloud();
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setSyncStatus(prev => ({ ...prev, isCloudConnected: false }));
          }
        });

      // Load initial state from Cloud DB
      refreshDataFromCloud();
    }

    // 4. Background Sync Heartbeat (Polling fallback ensures parity across backgrounded tabs/devices)
    const heartbeatTimer = setInterval(() => {
      scheduleRefresh(0);
    }, 6000);

    // 5. Re-sync immediately when tab gains focus, becomes visible, or reconnects to network
    const handleActiveResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        scheduleRefresh(0);
      }
    };
    window.addEventListener('focus', handleActiveResume);
    window.addEventListener('online', handleActiveResume);
    document.addEventListener('visibilitychange', handleActiveResume);

    return () => {
      clearInterval(heartbeatTimer);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      window.removeEventListener('focus', handleActiveResume);
      window.removeEventListener('online', handleActiveResume);
      document.removeEventListener('visibilitychange', handleActiveResume);
      window.removeEventListener('storage', handleStorageChange);
      if (localBcRef.current) {
        localBcRef.current.close();
      }
      if (supabaseChannelRef.current && supabase) {
        supabase.removeChannel(supabaseChannelRef.current);
      }
    };
  }, [handleRemoteMutation, refreshDataFromCloud]);

  // Auto purge unstarred activity logs older than 7 days
  useEffect(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    setActivityLogs(prev => prev.filter(log => log.isStarred || (now - new Date(log.timestamp).getTime()) < sevenDaysMs));
  }, []);

  const logActivity = (action, category = "General", details = "") => {
    const now = new Date();
    const newEntry = {
      id: `act-${Date.now()}`,
      action,
      category,
      user: currentUser ? currentUser.name : "System",
      role: currentUser ? currentUser.role : "HR",
      timestamp: now.toISOString(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStarred: false,
      details: details || ""
    };
    setActivityLogs(prev => [newEntry, ...prev]);
    broadcastMutation('ADD_ACTIVITY_LOG', newEntry);

    if (supabase) {
      runDb(supabase.from('activity_logs').insert([{
        id: newEntry.id,
        action: newEntry.action,
        category: newEntry.category,
        user_name: newEntry.user,
        role: newEntry.role,
        timestamp: newEntry.timestamp,
        date: newEntry.date,
        time: newEntry.time,
        is_starred: false,
        details: newEntry.details
      }]));
    }
  };

  const toggleStarActivityLog = (id) => {
    let nextStarred = false;
    setActivityLogs(prev => prev.map(log => {
      if (log.id === id) {
        nextStarred = !log.isStarred;
        showToast(nextStarred ? "Activity starred (retained permanently)." : "Activity unstarred (will auto-delete after 7 days).");
        return { ...log, isStarred: nextStarred };
      }
      return log;
    }));
    broadcastMutation('TOGGLE_STAR_ACTIVITY_LOG', { id, isStarred: nextStarred });

    if (supabase) {
      runDb(supabase.from('activity_logs').update({ is_starred: nextStarred }).eq('id', id));
    }
  };

  const updateActivityLog = (id, updatedFields) => {
    setActivityLogs(prev => prev.map(log => log.id === id ? { ...log, ...updatedFields } : log));
    broadcastMutation('UPDATE_ACTIVITY_LOG', { id, fields: updatedFields });
    showToast("Activity log entry updated.");

    if (supabase) {
      runDb(supabase.from('activity_logs').update(updatedFields).eq('id', id));
    }
  };

  const deleteActivityLog = (id) => {
    setActivityLogs(prev => prev.filter(log => log.id !== id));
    broadcastMutation('DELETE_ACTIVITY_LOG', { id });
    showToast("Activity log entry removed.");

    if (supabase) {
      runDb(supabase.from('activity_logs').delete().eq('id', id));
    }
  };

  const updateSystemIcon = (newIconConfig) => {
    pauseCloudSync(5000);
    setSystemIcon(newIconConfig);
    try {
      localStorage.setItem("aastmt_system_icon", JSON.stringify(newIconConfig));
    } catch (err) {}
    broadcastMutation('UPDATE_SYSTEM_ICON', newIconConfig);

    if (supabase) {
      runDb(supabase.from('system_settings').upsert({ key: 'system_icon', value: newIconConfig }, { onConflict: 'key' }));
    }

    logActivity("Updated system branding icon/logo", "System");
    showToast("System icon & branding updated successfully across all devices.");
  };

  const login = async (username, password) => {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Always validate against the freshest cloud credentials (database is source of truth)
    let userList = systemUsers;
    if (supabase) {
      try {
        const { data: dbUsers, error: uErr } = await supabase.from('system_users').select('*');
        if (!uErr && dbUsers && dbUsers.length > 0) {
          const deletedUserIds = getDeletedIds('users');
          userList = dbUsers
            .filter(u => !deletedUserIds.includes(u.id) && !deletedUserIds.includes(u.username?.toLowerCase()))
            .map(u => ({ id: u.id, name: u.name, username: u.username, password: u.password, role: u.role, avatar: u.avatar || null }));
          setSystemUsers(userList);
          try { localStorage.setItem("aastmt_system_users", JSON.stringify(userList)); } catch (e) {}
        }
      } catch (e) {
        console.warn('Login cloud credential fetch failed, using local copy:', e);
      }
    }

    const user = userList.find(u => (u.username || '').toLowerCase() === cleanUsername);
    if (user && (user.password || '').trim() === cleanPassword) {
      const userObj = {
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar || null
      };
      setCurrentUser(userObj);
      try {
        localStorage.setItem("aastmt_current_user", JSON.stringify(userObj));
        localStorage.setItem("aastmt_login_timestamp", Date.now().toString());
      } catch(e) {}
      setActiveTab("dashboard");
      setActiveModal(null);
      showToast(`Welcome back, ${userObj.name} (${userObj.role})`);
      return true;
    } else {
      showToast("Invalid credentials. Please verify your username and password.", "danger");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("aastmt_current_user");
      localStorage.removeItem("aastmt_login_timestamp");
    } catch (e) {}
    setActiveModal('login');
    showToast("Logged out successfully.");
  };

  const switchTab = (tabId) => {
    if (currentUser?.role === "HR" && !["dashboard", "directory", "monitoring"].includes(tabId)) {
      showToast("HR Members have access to Dashboard, Team Members, and Monitoring only.", "warning");
      return;
    }
    if (currentUser?.role === "Admission's Dean" && !["dashboard", "directory", "attendance"].includes(tabId)) {
      showToast("Dean access is limited to Dashboard, Team Members, and Attendance only.", "warning");
      return;
    }
    if (currentUser?.role === "Admission's Dean" && tabId === "activityLog") {
      showToast("Activity log is restricted to HR Leadership.", "warning");
      return;
    }
    setActiveTab(tabId);
  };

  // Helper State Modifiers
  const addMember = async (newMem) => {
    pauseCloudSync(5000);
    const mem = {
      id: generateUuid(),
      name: newMem.name,
      role: newMem.role || 'Operations',
      position: newMem.position || 'Member',
      college: newMem.college || 'Computing & IT',
      studentId: newMem.studentId || '2024' + Math.floor(100 + Math.random() * 900),
      phone: newMem.phone || '+20 100 000 0000',
      attendanceCount: 0,
      officialDays: newMem.officialDays && newMem.officialDays.length ? newMem.officialDays : ["Sunday", "Tuesday", "Thursday"],
      extraDays: newMem.extraDays || [],
      strikes: 0,
      score: newMem.score || 90,
      status: "Active",
      avatar: newMem.avatar || null
    };

    removeDeletedId("members", mem.id);
    if (mem.studentId) removeDeletedId("members", mem.studentId);
    if (mem.name) removeDeletedId("members", mem.name.toLowerCase().trim());

    setMembers(prev => [...prev, mem]);
    broadcastMutation('ADD_MEMBER', mem);

    if (supabase) {
      runDb(supabase.from('members').insert([{
        id: mem.id,
        name: mem.name,
        role: mem.role,
        position: mem.position,
        college: mem.college,
        student_id: mem.studentId,
        phone: mem.phone,
        attendance_count: mem.attendanceCount,
        official_days: mem.officialDays,
        strikes: mem.strikes,
        score: mem.score,
        status: mem.status,
        avatar: mem.avatar
      }]));
    }

    logActivity(`Added new team member: ${mem.name}`, "Members", `${mem.role} - ${mem.college}`);
    showToast(`Ambassador ${mem.name} registered and synced live.`);
  };

  const editMemberInfo = (id, updatedFields) => {
    pauseCloudSync(5000);
    const target = members.find(m => m.id === id) || dischargedMembers.find(d => d.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
    setDischargedMembers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));

    if (updatedFields.avatar !== undefined) {
      setStarAmbassadors(prev => prev.map(s => (s.memberId === id || s.member_id === id) ? { ...s, avatar: updatedFields.avatar } : s));
    }

    broadcastMutation('UPDATE_MEMBER', { id, fields: updatedFields });

    if (supabase && target) {
      const cleanUpdate = {};
      if (updatedFields.name !== undefined) cleanUpdate.name = updatedFields.name;
      if (updatedFields.role !== undefined) cleanUpdate.role = updatedFields.role;
      if (updatedFields.position !== undefined) cleanUpdate.position = updatedFields.position;
      if (updatedFields.college !== undefined) cleanUpdate.college = updatedFields.college;
      if (updatedFields.studentId !== undefined) cleanUpdate.student_id = updatedFields.studentId;
      if (updatedFields.phone !== undefined) cleanUpdate.phone = updatedFields.phone;
      if (updatedFields.officialDays !== undefined) cleanUpdate.official_days = updatedFields.officialDays;
      if (updatedFields.avatar !== undefined) cleanUpdate.avatar = updatedFields.avatar;
      if (updatedFields.score !== undefined) cleanUpdate.score = updatedFields.score;
      if (updatedFields.strikes !== undefined) cleanUpdate.strikes = updatedFields.strikes;
      if (updatedFields.status !== undefined) cleanUpdate.status = updatedFields.status;

      runDb(supabase.from('members').update(cleanUpdate).eq('id', target.id));
    }

    logActivity(`Updated info for: ${target ? target.name : 'member'}`, "Members");
    showToast("Member information updated & synced across all devices.");
  };

  const updateMemberExtraDays = (id, extraDays) => {
    pauseCloudSync(5000);
    const normId = getMemberUuid(id);
    const count = Array.isArray(extraDays) ? extraDays.length : (parseInt(extraDays, 10) || 0);
    try { localStorage.setItem("aastmt_member_extra_days_" + normId, JSON.stringify(extraDays)); } catch (e) {}
    setMembers(prev => prev.map(m => (m.id === id || getMemberUuid(m.id) === normId) ? { ...m, extraDays, extraDaysCount: count, extra_days: count } : m));
    broadcastMutation('UPDATE_MEMBER', { id: normId, fields: { extraDays, extraDaysCount: count, extra_days: count } });
    if (supabase) {
      runDb(supabase.from('members').update({ extra_days: count }).eq('id', normId));
    }
    showToast("Extra attendance days updated.");
  };

  const updateExtraDaysCount = (id, delta) => {
    pauseCloudSync(5000);
    const normId = getMemberUuid(id);
    let nextCount = 0;
    setMembers(prev => prev.map(m => {
      if (m.id === id || getMemberUuid(m.id) === normId) {
        const current = m.extraDaysCount !== undefined ? m.extraDaysCount : (typeof m.extra_days === 'number' ? m.extra_days : (m.extraDays ? m.extraDays.length : 0));
        nextCount = Math.max(0, current + delta);
        return { ...m, extraDaysCount: nextCount, extra_days: nextCount };
      }
      return m;
    }));
    broadcastMutation('UPDATE_MEMBER', { id: normId, fields: { extraDaysCount: nextCount, extra_days: nextCount } });
    if (supabase) {
      runDb(supabase.from('members').update({ extra_days: nextCount }).eq('id', normId));
    }
    showToast("Extra days counter updated.");
  };

  const deleteMember = (id) => {
    pauseCloudSync(5000);
    const mem = members.find(m => m.id === id);
    if (id) addDeletedId("members", id);
    if (mem?.studentId) addDeletedId("members", mem.studentId);
    if (mem?.name) addDeletedId("members", mem.name.toLowerCase().trim());

    // Also remove any star ambassador associated with this member
    removeStarAmbassador(null, id, mem?.name);

    setMembers(prev => prev.filter(m => m.id !== id));
    broadcastMutation('DELETE_MEMBER', { id, studentId: mem?.studentId, name: mem?.name });

    if (supabase) {
      runDb(supabase.from('members').delete().eq('id', id));
      if (mem?.studentId) runDb(supabase.from('members').delete().eq('student_id', mem.studentId));
    }

    logActivity(`Deleted team member: ${mem?.name || 'Member'}`, "Members");
    showToast(`Member ${mem?.name || ''} deleted across all devices.`);
  };

  const dischargeMember = (id, dischargeType, reason) => {
    pauseCloudSync(5000);
    const mem = members.find(m => m.id === id);
    if (!mem) return;

    const dischargedRecord = {
      id: `dis-${Date.now()}`,
      name: mem.name,
      role: mem.role,
      position: mem.position,
      college: mem.college,
      studentId: mem.studentId,
      phone: mem.phone,
      dischargeType: dischargeType || "Voluntary Left",
      dischargeReason: reason || "Left team",
      date: new Date().toISOString().split("T")[0],
      avatar: mem.avatar || null
    };

    setMembers(prev => prev.filter(m => m.id !== id));
    setDischargedMembers(prev => [dischargedRecord, ...prev]);
    broadcastMutation('DISCHARGE_MEMBER', { memberId: id, record: dischargedRecord });

    if (supabase) {
      runDb(supabase.from('members').update({
        status: 'Discharged',
        discharge_type: dischargedRecord.dischargeType,
        discharge_reason: dischargedRecord.dischargeReason
      }).eq('id', id));
    }

    logActivity(`Discharged member: ${mem.name}`, "Members", `${dischargeType} - Reason: ${reason}`);
    showToast(`${mem.name} moved to Discharged Members list.`);
  };

  const updateMemberPerformance = (id, newScore) => {
    pauseCloudSync(5000);
    const scoreVal = Math.max(0, Math.min(100, Number(newScore)));
    const mem = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, score: scoreVal } : m));
    broadcastMutation('UPDATE_MEMBER', { id, fields: { score: scoreVal } });

    if (supabase) {
      runDb(supabase.from('members').update({ score: scoreVal }).eq('id', id));
    }

    logActivity(`Updated performance score for: ${mem ? mem.name : 'member'} to ${newScore}%`, "Members");
    showToast("Performance score updated & synced.");
  };

  const addStarAmbassador = async (memberId, awardTitle, citation) => {
    pauseCloudSync(5000);
    const normMemId = getMemberUuid(memberId);
    const mem = members.find(m => m.id === memberId || m.id === normMemId || getMemberUuid(m.id) === normMemId);
    if (!mem) return;

    const starId = generateUuid();
    const star = {
      id: starId,
      memberId: normMemId,
      name: mem.name,
      role: mem.role,
      college: mem.college,
      avatar: mem.avatar || null,
      awardTitle,
      citation
    };

    removeDeletedId('stars', star.id);
    removeDeletedId('stars', normMemId);
    removeDeletedId('stars', mem.id);
    removeDeletedId('stars', mem.name.toLowerCase().trim());

    setStarAmbassadors(prev => {
      const updated = [star, ...prev.filter(s => s.id !== star.id && s.memberId !== normMemId && s.memberId !== mem.id)];
      try { localStorage.setItem("aastmt_star_ambassadors", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    broadcastMutation('ADD_STAR', star);

    if (supabase) {
      // First ensure the member is in Supabase members table so foreign key constraint is satisfied
      runDb(supabase.from('members').upsert([{
        id: normMemId,
        name: mem.name,
        role: mem.role,
        position: mem.position,
        college: mem.college,
        student_id: mem.studentId,
        phone: mem.phone,
        attendance_count: mem.attendanceCount || 0,
        official_days: mem.officialDays || ["Sunday", "Tuesday", "Thursday"],
        extra_days: typeof mem.extraDaysCount === 'number' ? mem.extraDaysCount : (Array.isArray(mem.extraDays) ? mem.extraDays.length : (parseInt(mem.extra_days, 10) || 0)),
        strikes: mem.strikes || 0,
        score: mem.score || 90,
        status: mem.status || 'Active',
        avatar: mem.avatar || null
      }])).then(() => {
        runDb(supabase.from('star_ambassadors').upsert([{
          id: star.id,
          member_id: normMemId,
          award_title: star.awardTitle,
          citation: star.citation
        }]));
      });
    }

    logActivity(`Granted star ambassador recognition to ${mem.name}`, "Members", awardTitle);
    showToast(`Star Ambassador recognition granted to ${mem.name}!`);
  };

  const removeStarAmbassador = async (starId, memberId, starName) => {
    pauseCloudSync(5000);
    const target = starAmbassadors.find(s =>
      (starId && s.id === starId) ||
      (memberId && (s.memberId === memberId || s.member_id === memberId)) ||
      (starName && s.name && s.name.toLowerCase().trim() === String(starName).toLowerCase().trim())
    );

    const targetId = starId || target?.id;
    const targetMemberId = memberId || target?.memberId || target?.member_id;
    const targetName = (starName || target?.name || '').toLowerCase().trim();

    if (targetId) addDeletedId('stars', targetId);
    if (targetMemberId) addDeletedId('stars', targetMemberId);
    if (targetName) addDeletedId('stars', targetName);

    setStarAmbassadors(prev => {
      const updated = prev.filter(s => {
        if (targetId && s.id === targetId) return false;
        const sMId = s.memberId || s.member_id;
        if (targetMemberId && sMId === targetMemberId) return false;
        if (targetName && s.name && s.name.toLowerCase().trim() === targetName) return false;
        return true;
      });
      try { localStorage.setItem("aastmt_star_ambassadors", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    broadcastMutation('REMOVE_STAR', { id: targetId, memberId: targetMemberId, name: targetName });

    if (supabase) {
      if (targetId) runDb(supabase.from('star_ambassadors').delete().eq('id', targetId));
      if (targetMemberId) runDb(supabase.from('star_ambassadors').delete().eq('member_id', targetMemberId));
    }

    logActivity(`Removed star recognition for: ${target?.name || targetName || 'Ambassador'}`, "Members");
    showToast("Star recognition removed & synced.");
  };

  const deleteAttendanceSession = async (sessionId) => {
    pauseCloudSync(5000);
    addDeletedId('sessions', sessionId);
    const s = attendanceSessions.find(x => x.id === sessionId);
    const wasPresentIds = s?.rollCall ? s.rollCall.filter(r => r.isPresent).map(r => r.memberId) : [];

    // Decrement attendance count for members who were marked present in this deleted session
    if (wasPresentIds.length > 0) {
      setMembers(prev => prev.map(m => wasPresentIds.includes(m.id) ? { ...m, attendanceCount: Math.max(0, m.attendanceCount - 1) } : m));
      if (supabase) {
        wasPresentIds.forEach(memId => {
          const normMemId = getMemberUuid(memId);
          const memObj = members.find(m => m.id === memId || m.id === normMemId);
          if (memObj) {
            runDb(supabase.from('members').update({ attendance_count: Math.max(0, (memObj.attendanceCount || 0) - 1) }).eq('id', normMemId));
          }
        });
      }
    }

    setAttendanceSessions(prev => prev.filter(x => x.id !== sessionId));
    broadcastMutation('DELETE_ATTENDANCE_SESSION', { id: sessionId, wasPresentIds });

    if (supabase) {
      runDb(supabase.from('attendance_sessions').delete().eq('id', sessionId));
      runDb(supabase.from('attendance_records').delete().eq('session_id', sessionId));
    }

    logActivity(`Deleted attendance session: ${s ? s.title : sessionId}`, "Attendance");
    showToast("Attendance session deleted & member totals updated.");
  };

  const updateAttendanceSession = async (sessionId, updatedData) => {
    pauseCloudSync(5000);
    let finalSession = null;
    const oldSession = attendanceSessions.find(s => s.id === sessionId);
    const memberAttendanceDeltas = {};

    // Track member attendance count changes if rollCall was edited
    if (oldSession && updatedData.rollCall) {
      const oldPresent = new Set((oldSession.rollCall || []).filter(r => r.isPresent).map(r => r.memberId));
      const newPresent = new Set((updatedData.rollCall || []).filter(r => r.isPresent).map(r => r.memberId));

      setMembers(prev => prev.map(m => {
        const wasP = oldPresent.has(m.id) || oldPresent.has(getMemberUuid(m.id));
        const isP = newPresent.has(m.id) || newPresent.has(getMemberUuid(m.id));
        if (!wasP && isP) {
          memberAttendanceDeltas[m.id] = (memberAttendanceDeltas[m.id] || 0) + 1;
          const newCnt = (m.attendanceCount || 0) + 1;
          if (supabase) runDb(supabase.from('members').update({ attendance_count: newCnt }).eq('id', getMemberUuid(m.id)));
          return { ...m, attendanceCount: newCnt };
        } else if (wasP && !isP) {
          memberAttendanceDeltas[m.id] = (memberAttendanceDeltas[m.id] || 0) - 1;
          const newCnt = Math.max(0, (m.attendanceCount || 0) - 1);
          if (supabase) runDb(supabase.from('members').update({ attendance_count: newCnt }).eq('id', getMemberUuid(m.id)));
          return { ...m, attendanceCount: newCnt };
        }
        return m;
      }));
    }

    setAttendanceSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const presentCount = updatedData.rollCall ? updatedData.rollCall.filter(r => r.isPresent).length : s.presentCount;
        const totalCount = updatedData.rollCall ? updatedData.rollCall.length : s.totalCount;
        finalSession = { ...s, ...updatedData, presentCount, totalCount };
        return finalSession;
      }
      return s;
    }));

    broadcastMutation('UPDATE_ATTENDANCE_SESSION', { id: sessionId, data: updatedData, deltas: memberAttendanceDeltas });

    if (supabase && finalSession) {
      runDb(supabase.from('attendance_sessions').update({
        title: finalSession.title,
        date: finalSession.date,
        day_name: finalSession.dayName,
        session_type: normalizeSessionType(finalSession.type),
        present_count: finalSession.presentCount,
        total_count: finalSession.totalCount
      }).eq('id', sessionId));

      if (updatedData.rollCall) {
        for (const r of updatedData.rollCall) {
          const normMid = getMemberUuid(r.memberId);
          if (!normMid) continue;
          const { data: updatedRecs } = await runDb(
            supabase.from('attendance_records')
              .update({
                is_present: Boolean(r.isPresent),
                is_excused: Boolean(r.isExcused),
                excuse_reason: r.excuseReason || ''
              })
              .eq('session_id', sessionId)
              .eq('member_id', normMid)
              .select('id')
          ) || {};
          if (!updatedRecs || updatedRecs.length === 0) {
            await runDb(
              supabase.from('attendance_records').insert([{
                id: generateUuid(),
                session_id: sessionId,
                member_id: normMid,
                is_present: Boolean(r.isPresent),
                is_excused: Boolean(r.isExcused),
                excuse_reason: r.excuseReason || ''
              }])
            );
          }
        }
      }
    }

    logActivity(`Updated attendance session: ${updatedData.title || sessionId}`, "Attendance");
    showToast("Attendance session details & member totals updated.");
  };

  const createAttendanceSession = async (title, date, sessionType, rollCallRecords) => {
    pauseCloudSync(5000);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(date);
    const dayName = daysOfWeek[d.getDay()] || "Sunday";

    const presentCount = rollCallRecords.filter(r => r.isPresent).length;
    const presentMemberIds = rollCallRecords.filter(r => r.isPresent).map(r => r.memberId);
    const sessionUuid = generateUuid();
    const normalizedType = normalizeSessionType(sessionType);

    const formattedRollCall = rollCallRecords.map(r => ({
      ...r,
      memberId: getMemberUuid(r.memberId),
      isPresent: Boolean(r.isPresent),
      isExcused: Boolean(r.isExcused),
      excuseReason: r.excuseReason || ''
    }));

    // Increment attendance count for present members locally
    setMembers(prev => prev.map(m => {
      if (presentMemberIds.includes(m.id)) {
        return { ...m, attendanceCount: (m.attendanceCount || 0) + 1 };
      }
      return m;
    }));

    const session = {
      id: sessionUuid,
      title,
      date,
      dayName,
      type: normalizedType,
      presentCount,
      totalCount: rollCallRecords.length,
      rollCall: formattedRollCall
    };

    removeDeletedId('sessions', session.id);

    setAttendanceSessions(prev => [session, ...prev]);
    broadcastMutation('CREATE_ATTENDANCE_SESSION', { session, updatedMemberIds: presentMemberIds });

    if (supabase) {
      // 1. Insert session metadata into attendance_sessions (without roll_call)
      runDb(supabase.from('attendance_sessions').insert([{
        id: sessionUuid,
        title: session.title,
        date: session.date,
        day_name: session.dayName,
        session_type: session.type,
        present_count: session.presentCount,
        total_count: session.totalCount
      }]));

      // 2. Insert roll call records into attendance_records
      const recordsPayload = formattedRollCall.map(r => ({
        id: generateUuid(),
        session_id: sessionUuid,
        member_id: r.memberId,
        is_present: r.isPresent,
        is_excused: r.isExcused,
        excuse_reason: r.excuseReason || ''
      }));
      if (recordsPayload.length > 0) {
        runDb(supabase.from('attendance_records').insert(recordsPayload));
      }

      // 3. Update members attendance count in DB
      presentMemberIds.forEach(memId => {
        const normId = getMemberUuid(memId);
        const memObj = members.find(m => m.id === memId || m.id === normId);
        if (memObj) {
          runDb(supabase.from('members').update({ attendance_count: (memObj.attendanceCount || 0) + 1 }).eq('id', normId));
        }
      });
    }

    logActivity(`Created attendance roll call: ${title}`, "Attendance", `${dayName}, ${date} (${presentCount}/${rollCallRecords.length} present)`);
    showToast(`Attendance recorded & synced across all screens.`);
  };

  const submitWarning = async (memberId, level, reason) => {
    if (currentUser?.role === "Admission's Dean") {
      showToast("Dean profile has read-only access.", "warning");
      return;
    }
    pauseCloudSync(5000);
    const mem = members.find(m => m.id === memberId || m.id === getMemberUuid(memberId));
    if (!mem) return;

    const isLeadership = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";
    const normMemberId = getMemberUuid(mem.id);
    const normLevel = normalizeWarningLevel(level);
    const newWrnId = generateUuid();

    if (isLeadership) {
      setMembers(prev => prev.map(m => m.id === mem.id ? {
        ...m,
        strikes: (m.strikes || 0) + 1,
        score: Math.max(50, (m.score || 90) - 8)
      } : m));

      const wrn = {
        id: newWrnId,
        memberId: normMemberId,
        memberName: mem.name,
        level: normLevel,
        reason,
        reportedBy: `${currentUser.name} (${currentUser.role})`,
        date: new Date().toISOString().split("T")[0],
        status: "Confirmed Strike"
      };

      removeDeletedId('warnings', wrn.id);

      setWarnings(prev => [wrn, ...prev]);
      broadcastMutation('SUBMIT_WARNING', { warning: wrn, memberId: normMemberId, incrementStrikes: true });

      if (supabase) {
        runDb(supabase.from('disciplinary_warnings').insert([{
          id: wrn.id,
          member_id: normMemberId,
          level: wrn.level,
          reason: wrn.reason,
          reported_by: wrn.reportedBy,
          date: wrn.date,
          status: wrn.status
        }]));

        runDb(supabase.from('members').update({
          strikes: (mem.strikes || 0) + 1,
          score: Math.max(50, (mem.score || 90) - 8)
        }).eq('id', normMemberId));
      }

      logActivity(`Issued warning to: ${mem.name}`, "Warnings", `${normLevel} - ${reason}`);
      showToast(`Warning recorded for ${mem.name}.`);
    } else {
      const wrn = {
        id: newWrnId,
        memberId: normMemberId,
        memberName: mem.name,
        level: normLevel,
        reason,
        reportedBy: `${currentUser.name} (HR Request)`,
        date: new Date().toISOString().split("T")[0],
        status: "Pending HR Approval"
      };

      removeDeletedId('warnings', wrn.id);

      setWarnings(prev => [wrn, ...prev]);
      broadcastMutation('SUBMIT_WARNING', { warning: wrn, memberId: normMemberId, incrementStrikes: false });

      if (supabase) {
        runDb(supabase.from('disciplinary_warnings').insert([{
          id: wrn.id,
          member_id: normMemberId,
          level: wrn.level,
          reason: wrn.reason,
          reported_by: wrn.reportedBy,
          date: wrn.date,
          status: wrn.status
        }]));
      }

      logActivity(`Submitted warning request for: ${mem.name}`, "Warnings", `${normLevel} - ${reason}`);
      showToast(`Warning request submitted for ${mem.name}.`);
    }
  };

  const approveWarningRequest = async (warningId) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can approve warnings.", "warning");
      return;
    }
    pauseCloudSync(5000);
    const wrn = warnings.find(w => w.id === warningId);
    if (!wrn) return;

    const normMemberId = getMemberUuid(wrn.memberId);

    setMembers(prev => prev.map(m => (m.id === wrn.memberId || m.id === normMemberId) ? {
      ...m,
      strikes: (m.strikes || 0) + 1,
      score: Math.max(50, (m.score || 90) - 8)
    } : m));

    setWarnings(prev => prev.map(w => w.id === warningId ? { ...w, status: "Confirmed Strike" } : w));
    broadcastMutation('APPROVE_WARNING', { id: warningId, memberId: normMemberId });

    if (supabase) {
      runDb(supabase.from('disciplinary_warnings').update({ status: 'Confirmed Strike' }).eq('id', warningId));
      const targetMem = members.find(m => m.id === wrn.memberId || m.id === normMemberId);
      if (targetMem) {
        runDb(supabase.from('members').update({
          strikes: (targetMem.strikes || 0) + 1,
          score: Math.max(50, (targetMem.score || 90) - 8)
        }).eq('id', normMemberId));
      }
    }

    logActivity(`Approved warning request for: ${wrn.memberName}`, "Warnings");
    showToast(`Warning approved for ${wrn.memberName}.`);
  };

  const dismissWarning = async (warningId) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can remove warnings.", "warning");
      return;
    }
    pauseCloudSync(5000);
    addDeletedId('warnings', warningId);
    const wrn = warnings.find(w => w.id === warningId);
    const wasConfirmed = wrn && wrn.status === 'Confirmed Strike';
    const normMemberId = wrn?.memberId ? getMemberUuid(wrn.memberId) : null;

    if (wasConfirmed && normMemberId) {
      setMembers(prev => prev.map(m => (m.id === wrn.memberId || m.id === normMemberId) ? {
        ...m,
        strikes: Math.max(0, (m.strikes || 1) - 1),
        score: Math.min(100, (m.score || 90) + 8)
      } : m));

      if (supabase) {
        const targetMem = members.find(m => m.id === wrn.memberId || m.id === normMemberId);
        if (targetMem) {
          runDb(supabase.from('members').update({
            strikes: Math.max(0, (targetMem.strikes || 1) - 1),
            score: Math.min(100, (targetMem.score || 90) + 8)
          }).eq('id', normMemberId));
        }
      }
    }

    setWarnings(prev => prev.filter(w => w.id !== warningId));
    broadcastMutation('DISMISS_WARNING', { id: warningId, memberId: normMemberId, wasConfirmed });

    if (supabase) {
      runDb(supabase.from('disciplinary_warnings').delete().eq('id', warningId));
    }

    logActivity(`Dismissed warning for: ${wrn ? wrn.memberName : warningId}`, "Warnings");
    showToast("Warning record dismissed & synced.");
  };

  const updateWarning = async (id, updatedFields) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can edit warnings.", "warning");
      return;
    }
    pauseCloudSync(5000);
    const cleanFields = { ...updatedFields };
    if (cleanFields.level) cleanFields.level = normalizeWarningLevel(cleanFields.level);

    setWarnings(prev => prev.map(w => w.id === id ? { ...w, ...cleanFields } : w));
    broadcastMutation('UPDATE_WARNING', { id, fields: cleanFields });

    if (supabase) {
      runDb(supabase.from('disciplinary_warnings').update(cleanFields).eq('id', id));
    }

    logActivity(`Updated warning details #${id}`, "Warnings");
    showToast("Warning details updated successfully.");
  };

  const updateDischargedMember = async (id, updatedFields) => {
    pauseCloudSync(5000);
    const target = dischargedMembers.find(d => d.id === id);
    setDischargedMembers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
    if (updatedFields.avatar !== undefined) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
      setStarAmbassadors(prev => prev.map(s => (s.memberId === id || s.member_id === id) ? { ...s, avatar: updatedFields.avatar } : s));
    }
    broadcastMutation('UPDATE_DISCHARGED_MEMBER', { id, fields: updatedFields });

    if (supabase && target) {
      const cleanFields = {};
      if (updatedFields.name !== undefined) cleanFields.name = updatedFields.name;
      if (updatedFields.role !== undefined) cleanFields.role = updatedFields.role;
      if (updatedFields.position !== undefined) cleanFields.position = updatedFields.position;
      if (updatedFields.college !== undefined) cleanFields.college = updatedFields.college;
      if (updatedFields.studentId !== undefined) cleanFields.student_id = updatedFields.studentId;
      if (updatedFields.phone !== undefined) cleanFields.phone = updatedFields.phone;
      if (updatedFields.avatar !== undefined) cleanFields.avatar = updatedFields.avatar;
      if (updatedFields.dischargeType !== undefined) cleanFields.discharge_type = updatedFields.dischargeType;
      if (updatedFields.dischargeReason !== undefined) cleanFields.discharge_reason = updatedFields.dischargeReason;

      runDb(supabase.from('members').update(cleanFields).eq('id', target.id));
    }

    logActivity(`Updated discharged record #${id}`, "Members");
    showToast("Discharged member record updated & synced.");
  };

  const reinstateMember = async (id) => {
    pauseCloudSync(5000);
    const mem = dischargedMembers.find(d => d.id === id);
    if (!mem) return;

    const reinstatedMember = {
      id: mem.id,
      name: mem.name,
      role: mem.role || 'Operations',
      position: 'Member',
      college: mem.college || 'Computing & IT',
      studentId: mem.studentId || '2024101',
      phone: mem.phone || '+20 100 000 0000',
      attendanceCount: 0,
      officialDays: ["Sunday", "Tuesday", "Thursday"],
      extraDays: [],
      strikes: 0,
      score: 90,
      status: "Active"
    };

    removeDeletedId("members", mem.id);
    if (mem.studentId) removeDeletedId("members", mem.studentId);
    if (mem.name) removeDeletedId("members", mem.name.toLowerCase().trim());

    setDischargedMembers(prev => prev.filter(d => d.id !== id));
    setMembers(prev => [...prev, reinstatedMember]);
    broadcastMutation('REINSTATE_MEMBER', { id, reinstatedMember });

    if (supabase) {
      runDb(supabase.from('members').update({
        status: 'Active',
        discharge_type: null,
        discharge_reason: null
      }).eq('id', id));
    }

    logActivity(`Reinstated member back to active team: ${mem.name}`, "Members");
    showToast(`${mem.name} reinstated back to active team.`);
  };

  const deleteDischargedMember = (id) => {
    pauseCloudSync(5000);
    const mem = dischargedMembers.find(d => d.id === id);
    if (id) addDeletedId("members", id);
    if (mem?.studentId) addDeletedId("members", mem.studentId);
    if (mem?.name) addDeletedId("members", mem.name.toLowerCase().trim());

    setDischargedMembers(prev => prev.filter(d => d.id !== id));
    broadcastMutation('DELETE_DISCHARGED_MEMBER', { id, studentId: mem?.studentId, name: mem?.name });

    if (supabase) {
      runDb(supabase.from('members').delete().eq('id', id));
      if (mem?.studentId) runDb(supabase.from('members').delete().eq('student_id', mem.studentId));
    }

    logActivity(`Permanently deleted discharged record: ${mem?.name || 'Member'}`, "Members");
    showToast(`Discharged record for ${mem?.name || ''} permanently deleted.`);
  };

  const addEvent = async (newEvent) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can create events.", "warning");
      return;
    }
    pauseCloudSync(5000);
    const evt = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type || 'Orientations',
      status: newEvent.status || 'Active',
      description: newEvent.description || '',
      location: newEvent.location || 'Smart Village Campus',
      date: newEvent.date || new Date().toISOString().split('T')[0],
      color: newEvent.color || 'blue'
    };
    removeDeletedId('events', evt.id);
    setEvents(prev => [...prev, evt]);
    broadcastMutation('ADD_EVENT', evt);

    if (supabase) {
      runDb(supabase.from('events').insert([evt]));
    }

    logActivity(`Created event: ${evt.title}`, "Events", `${evt.type} on ${evt.date}`);
    showToast(`Event "${evt.title}" created & synced.`);
  };

  const updateEvent = async (id, updatedFields) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can edit events.", "warning");
      return;
    }
    pauseCloudSync(5000);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    broadcastMutation('UPDATE_EVENT', { id, fields: updatedFields });

    if (supabase) {
      runDb(supabase.from('events').update(updatedFields).eq('id', id));
    }

    logActivity(`Updated event: ${updatedFields.title || id}`, "Events");
    showToast("Event updated successfully.");
  };

  const deleteEvent = async (id) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can remove events.", "warning");
      return;
    }
    pauseCloudSync(5000);
    addDeletedId('events', id);
    const evt = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    broadcastMutation('DELETE_EVENT', { id });

    if (supabase) {
      runDb(supabase.from('events').delete().eq('id', id));
    }

    logActivity(`Deleted event: ${evt ? evt.title : id}`, "Events");
    showToast("Event removed from logs.");
  };

  const addMonitoringNote = async ({ memberId, category, note }) => {
    pauseCloudSync(5000);
    const mem = members.find(m => m.id === memberId);
    const newNote = {
      id: generateUuid(),
      memberId,
      memberName: mem ? mem.name : 'Unknown Member',
      memberRole: mem ? mem.role : '',
      memberCollege: mem ? mem.college : '',
      category: category || 'General Observation',
      note: note.trim(),
      authorName: currentUser.name,
      authorRole: currentUser.role,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    removeDeletedId('notes', newNote.id);
    setMonitoringNotes(prev => [newNote, ...prev]);
    broadcastMutation('ADD_MONITORING_NOTE', newNote);

    if (supabase) {
      runDb(supabase.from('monitoring_notes').insert([{
        id: newNote.id,
        member_id: newNote.memberId,
        member_name: newNote.memberName,
        member_role: newNote.memberRole,
        member_college: newNote.memberCollege,
        author_name: newNote.authorName,
        author_role: newNote.authorRole,
        category: newNote.category,
        note: newNote.note,
        date: newNote.date,
        time: newNote.time
      }]));
    }

    logActivity(`Logged monitoring note for: ${mem ? mem.name : 'member'}`, "Monitoring", `Category: ${category}`);
    showToast(`Monitoring note logged & synced.`);
  };

  const updateMonitoringNote = async (id, updatedFields) => {
    pauseCloudSync(5000);
    let finalNote = null;
    setMonitoringNotes(prev => prev.map(n => {
      if (n.id === id) {
        let memberDetails = {};
        if (updatedFields.memberId && updatedFields.memberId !== n.memberId) {
          const mem = members.find(m => m.id === updatedFields.memberId);
          if (mem) {
            memberDetails = {
              memberName: mem.name,
              memberRole: mem.role,
              memberCollege: mem.college
            };
          }
        }
        finalNote = { ...n, ...updatedFields, ...memberDetails };
        return finalNote;
      }
      return n;
    }));
    broadcastMutation('UPDATE_MONITORING_NOTE', { id, fields: updatedFields });

    if (supabase && finalNote) {
      runDb(supabase.from('monitoring_notes').update({
        category: finalNote.category,
        note: finalNote.note,
        member_id: finalNote.memberId,
        member_name: finalNote.memberName,
        member_role: finalNote.memberRole,
        member_college: finalNote.memberCollege
      }).eq('id', id));
    }

    logActivity(`Updated monitoring note #${id}`, "Monitoring");
    showToast("Monitoring note updated & synced.");
  };

  const deleteMonitoringNote = async (id) => {
    pauseCloudSync(5000);
    addDeletedId('notes', id);
    setMonitoringNotes(prev => prev.filter(n => n.id !== id));
    broadcastMutation('DELETE_MONITORING_NOTE', { id });

    if (supabase) {
      runDb(supabase.from('monitoring_notes').delete().eq('id', id));
    }

    logActivity(`Deleted monitoring note #${id}`, "Monitoring");
    showToast("Monitoring note deleted & synced.");
  };

  const scheduleInterview = async (applicantId, date, time) => {
    const scheduleStr = `${date} at ${time}`;
    const venue = "Smart Village - Meeting Room 007";

    setRecruits(prev => prev.map(r => r.id === applicantId ? {
      ...r,
      interviewSchedule: scheduleStr,
      interviewVenue: venue,
      status: "Interview Scheduled"
    } : r));

    const rec = recruits.find(r => r.id === applicantId);
    showToast(`Interview scheduled for ${rec?.name || 'Applicant'} in Room 007.`);
  };

  const enlistRecruit = async (recruitId) => {
    const rec = recruits.find(r => r.id === recruitId);
    if (!rec) return;

    await addMember({
      name: rec.name,
      role: rec.targetRole,
      position: "Member",
      college: rec.college,
      studentId: '2024' + Math.floor(100 + Math.random() * 900),
      phone: '+20 100 000 0000',
      officialDays: ["Sunday", "Tuesday", "Thursday"]
    });

    setRecruits(prev => prev.filter(r => r.id !== recruitId));
    showToast(`${rec.name} successfully enlisted into Smart Village Admissions Team!`);
  };

  const declineRecruit = async (recruitId) => {
    const rec = recruits.find(r => r.id === recruitId);
    setRecruits(prev => prev.filter(r => r.id !== recruitId));
    showToast(`Applicant ${rec?.name} removed from recruitment list.`);
  };

  const requestRecruitRecommendation = async (recruitId, action) => {
    const rec = recruits.find(r => r.id === recruitId);
    if (!rec) return;
    const recText = `Requested ${action} (by ${currentUser?.name || 'HR'})`;

    setRecruits(prev => prev.map(r => r.id === recruitId ? { ...r, hrRecommendation: recText } : r));
    showToast(`Recommendation submitted to HR Leadership.`);
  };

  const addRecruit = async (newRec) => {
    const recruit = {
      id: `rec-${Date.now()}`,
      name: newRec.name,
      college: newRec.college,
      term: newRec.term,
      targetRole: newRec.targetRole,
      interviewSchedule: null,
      interviewVenue: null,
      status: 'Pending Schedule',
      hrRecommendation: newRec.hrRecommendation || null
    };

    setRecruits(prev => [recruit, ...prev]);
    showToast(`Join request submitted for ${recruit.name}.`);
  };

  const addSystemUser = async (name, username, password, role) => {
    const cleanName = (name || '').trim();
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName || !cleanUsername || !cleanPassword) {
      showToast("Please fill in all user credential fields.", "danger");
      return;
    }

    if (systemUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      showToast("A user with this username already exists.", "danger");
      return;
    }

    pauseCloudSync(5000);
    const newUser = {
      id: generateUuid(),
      name: cleanName,
      username: cleanUsername,
      password: cleanPassword,
      role,
      avatar: null
    };

    removeDeletedId('users', newUser.id);
    removeDeletedId('users', newUser.username);

    setSystemUsers(prev => {
      const nextUsers = [...prev.filter(u => u.username.toLowerCase() !== cleanUsername), newUser];
      try { localStorage.setItem("aastmt_system_users", JSON.stringify(nextUsers)); } catch (e) {}
      return nextUsers;
    });
    broadcastMutation('ADD_SYSTEM_USER', newUser);

    if (supabase) {
      runDb(supabase.from('system_users').upsert(newUser, { onConflict: 'id' }));
    }

    showToast(`New user ${cleanName} (${role}) added to credentials database.`);
  };

  const updateSystemUser = async (id, updated) => {
    pauseCloudSync(5000);
    const cleanId = getUserUuid(id);
    const cleanUpdated = {
      ...updated,
      id: cleanId,
      name: (updated.name || '').trim(),
      username: (updated.username || '').trim().toLowerCase(),
      password: (updated.password || '').trim()
    };

    setSystemUsers(prev => {
      const nextUsers = prev.map(u => (u.id === id || u.id === cleanId) ? { ...u, ...cleanUpdated } : u);
      try { localStorage.setItem("aastmt_system_users", JSON.stringify(nextUsers)); } catch (e) {}
      return nextUsers;
    });
    broadcastMutation('UPDATE_SYSTEM_USER', { id: cleanId, fields: cleanUpdated });

    if (supabase) {
      runDb(supabase.from('system_users').update(cleanUpdated).eq('id', cleanId));
    }

    if (currentUser && (currentUser.username === cleanUpdated.username || currentUser.id === cleanId || currentUser.id === id)) {
      setCurrentUser(prev => ({ ...prev, name: cleanUpdated.name, role: cleanUpdated.role }));
    }
    showToast(`Credentials updated & synced for ${cleanUpdated.name}.`);
  };

  const deleteSystemUser = async (id) => {
    pauseCloudSync(5000);
    const cleanId = getUserUuid(id);
    const target = systemUsers.find(u => u.id === id || u.id === cleanId);
    addDeletedId('users', id);
    addDeletedId('users', cleanId);
    if (target?.username) addDeletedId('users', target.username.toLowerCase());

    setSystemUsers(prev => {
      const nextUsers = prev.filter(u => u.id !== id && u.id !== cleanId);
      try { localStorage.setItem("aastmt_system_users", JSON.stringify(nextUsers)); } catch (e) {}
      return nextUsers;
    });
    broadcastMutation('DELETE_SYSTEM_USER', { id: cleanId, username: target?.username });

    if (supabase) {
      runDb(supabase.from('system_users').delete().eq('id', cleanId));
      if (target?.username) {
        runDb(supabase.from('system_users').delete().eq('username', target.username.toLowerCase()));
      }
    }

    showToast("User login removed across all systems.");
  };

  const updateProfile = async (name, username, oldPassword, newPassword, avatar = undefined) => {
    pauseCloudSync(5000);
    const userRecord = systemUsers.find(u => (u.username || '').toLowerCase().trim() === (currentUser?.username || '').toLowerCase().trim() || u.id === currentUser?.id);
    if (!userRecord) {
      showToast("User account not found.", "danger");
      return false;
    }

    if (newPassword || oldPassword) {
      if ((userRecord.password || '').trim() !== (oldPassword || '').trim()) {
        showToast("Incorrect old password. Please verify your current password.", "danger");
        return false;
      }
      userRecord.password = newPassword.trim();
    }

    userRecord.name = name.trim();
    userRecord.username = username.trim().toLowerCase();
    const finalAvatar = avatar !== undefined ? avatar : (userRecord.avatar || null);
    userRecord.avatar = finalAvatar;

    setCurrentUser(prev => ({
      ...prev,
      name: userRecord.name,
      username: userRecord.username,
      role: userRecord.role,
      avatar: finalAvatar
    }));

    const cleanId = getUserUuid(userRecord.id);
    userRecord.id = cleanId;
    const updatedObj = { name: userRecord.name, username: userRecord.username, password: userRecord.password, avatar: finalAvatar };
    setSystemUsers(prev => {
      const nextUsers = prev.map(u => (u.id === cleanId || u.username === userRecord.username) ? { ...u, ...updatedObj } : u);
      try { localStorage.setItem("aastmt_system_users", JSON.stringify(nextUsers)); } catch (e) {}
      return nextUsers;
    });
    broadcastMutation('UPDATE_SYSTEM_USER', { id: cleanId, fields: updatedObj });

    if (supabase) {
      runDb(supabase.from('system_users').update({
        name: updatedObj.name,
        username: updatedObj.username,
        password: updatedObj.password,
        avatar: updatedObj.avatar
      }).eq('id', cleanId));
    }

    showToast("Profile & password updated. Old password has been deleted from the database.");
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        systemIcon,
        updateSystemIcon,
        login,
        logout,
        activeTab,
        switchTab,
        toasts,
        showToast,
        syncStatus,
        refreshDataFromCloud,
        systemUsers,
        members,
        dischargedMembers,
        starAmbassadors,
        attendanceSessions,
        warnings,
        events,
        monitoringNotes,
        monitoringSelectedMemberId,
        setMonitoringSelectedMemberId,
        addMonitoringNote,
        updateMonitoringNote,
        deleteMonitoringNote,
        activityLogs,
        logActivity,
        toggleStarActivityLog,
        updateActivityLog,
        deleteActivityLog,
        recruits,
        activeModal,
        setActiveModal,
        modalExtraData,
        setModalExtraData,
        addMember,
        editMemberInfo,
        updateMemberExtraDays,
        updateExtraDaysCount,
        deleteMember,
        dischargeMember,
        updateMemberPerformance,
        updateDischargedMember,
        reinstateMember,
        deleteDischargedMember,
        addStarAmbassador,
        removeStarAmbassador,
        createAttendanceSession,
        deleteAttendanceSession,
        updateAttendanceSession,
        submitWarning,
        approveWarningRequest,
        dismissWarning,
        updateWarning,
        addEvent,
        updateEvent,
        deleteEvent,
        scheduleInterview,
        enlistRecruit,
        declineRecruit,
        requestRecruitRecommendation,
        addRecruit,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
