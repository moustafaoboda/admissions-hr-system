import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getStoredSupabaseConfig } from '../lib/supabaseClient';

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
  const name = (s.name || '').toLowerCase().trim();
  const award = (s.awardTitle || s.award_title || '').toLowerCase().trim();
  const cit = (s.citation || '').toLowerCase().trim();
  if (name.includes('farida') && (award.includes('operations champion') || cit.includes('volunteered for 3 non-scheduled'))) return true;
  if (name.includes('youssef') && (award.includes('lead admissions ambassador') || cit.includes('spearheaded orientation'))) return true;
  return false;
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

const INITIAL_SYSTEM_USERS = [
  { id: "usr-1", name: "Omar Farouk", username: "omar.farouk", password: "123", role: "HR Vice Head", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80" },
  { id: "usr-2", name: "Tarek Hegazy", username: "tarek.hegazy", password: "123", role: "HR Head", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80" },
  { id: "usr-3", name: "Sarah Mostafa", username: "sarah.hr", password: "123", role: "HR", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80" },
  { id: "usr-4", name: "Prof. Dr. Admissions Dean", username: "dean", password: "123", role: "Admission's Dean", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80" }
];

const INITIAL_MEMBERS = [
  {
    id: "mem-1",
    name: "Youssef El-Sayed",
    role: "Operations",
    position: "Head",
    college: "Engineering & Tech",
    studentId: "2023101",
    phone: "+20 100 111 2233",
    attendanceCount: 14,
    officialDays: ["Sunday", "Tuesday", "Thursday"],
    extraDays: [],
    strikes: 0,
    score: 95,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "mem-2",
    name: "Malak Nour",
    role: "PR",
    position: "Vice Head",
    college: "Management & Tech",
    studentId: "2023102",
    phone: "+20 101 222 3344",
    attendanceCount: 12,
    officialDays: ["Saturday", "Monday", "Wednesday"],
    extraDays: [],
    strikes: 0,
    score: 92,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "mem-3",
    name: "Karim Hassan",
    role: "PR",
    position: "Head",
    college: "Computing & IT",
    studentId: "2023103",
    phone: "+20 102 333 4455",
    attendanceCount: 10,
    officialDays: ["Sunday", "Monday", "Wednesday"],
    extraDays: [],
    strikes: 0,
    score: 87,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "mem-4",
    name: "Farida Ahmed",
    role: "Operations",
    position: "Member",
    college: "Logistics & Transport",
    studentId: "2024104",
    phone: "+20 103 444 5566",
    attendanceCount: 11,
    officialDays: ["Sunday", "Tuesday", "Thursday"],
    extraDays: [],
    strikes: 0,
    score: 90,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "mem-5",
    name: "Ahmed Sherif",
    role: "Digital Transformation",
    position: "Head",
    college: "Computing & IT",
    studentId: "2023105",
    phone: "+20 104 555 6677",
    attendanceCount: 9,
    officialDays: ["Saturday", "Tuesday", "Thursday"],
    extraDays: [],
    strikes: 1,
    score: 84,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "mem-6",
    name: "Laila Wael",
    role: "Innovation",
    position: "Member",
    college: "Law",
    studentId: "2024106",
    phone: "+20 105 666 7788",
    attendanceCount: 7,
    officialDays: ["Monday", "Wednesday"],
    extraDays: [],
    strikes: 1,
    score: 74,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "mem-7",
    name: "Nour El-Din",
    role: "HR",
    position: "Member",
    college: "Arts & Design",
    studentId: "2024107",
    phone: "+20 106 777 8899",
    attendanceCount: 8,
    officialDays: ["Saturday", "Sunday", "Tuesday"],
    extraDays: [],
    strikes: 0,
    score: 89,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80"
  }
];

const INITIAL_DISCHARGED_MEMBERS = [
  {
    id: "dis-1",
    name: "Hassan Mahmoud",
    role: "PR",
    position: "Member",
    college: "Management & Tech",
    studentId: "2022099",
    phone: "+20 109 888 7766",
    dischargeType: "Voluntary Left",
    dischargeReason: "Graduated and relocated to Alexandria.",
    date: "2026-08-30",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
  }
];

const INITIAL_STAR_AMBASSADORS = [];

const INITIAL_ATTENDANCE_SESSIONS = [
  {
    id: "att-1",
    title: "Registration Hall Shift",
    date: "2026-09-20",
    dayName: "Sunday",
    type: "Normal Day",
    presentCount: 3,
    totalCount: 4,
    rollCall: [
      { memberId: "mem-1", name: "Youssef El-Sayed", role: "Operations", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-3", name: "Karim Hassan", role: "PR", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-4", name: "Farida Ahmed", role: "Operations", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-7", name: "Nour El-Din", role: "HR", isPresent: false, isExcused: true, excuseReason: "Midterm exam preparation" }
    ]
  },
  {
    id: "att-2",
    title: "EDU Gate Campus Fair",
    date: "2026-09-17",
    dayName: "Thursday",
    type: "EDU Gate",
    presentCount: 3,
    totalCount: 3,
    rollCall: [
      { memberId: "mem-1", name: "Youssef El-Sayed", role: "Operations", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-4", name: "Farida Ahmed", role: "Operations", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-5", name: "Ahmed Sherif", role: "Digital Transformation", isPresent: true, isExcused: false, excuseReason: "" }
    ]
  },
  {
    id: "att-3",
    title: "AASTMT Open Orientation Day",
    date: "2026-09-12",
    dayName: "Saturday",
    type: "Orientation Day",
    presentCount: 3,
    totalCount: 3,
    rollCall: [
      { memberId: "mem-2", name: "Malak Nour", role: "PR", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-5", name: "Ahmed Sherif", role: "Digital Transformation", isPresent: true, isExcused: false, excuseReason: "" },
      { memberId: "mem-7", name: "Nour El-Din", role: "HR", isPresent: true, isExcused: false, excuseReason: "" }
    ]
  }
];

const INITIAL_ACTIVITY_LOGS = [
  {
    id: "act-1",
    action: "Recorded field monitoring observation for Youssef El-Sayed",
    category: "Monitoring",
    user: "Omar Farouk",
    role: "HR Vice Head",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    date: "2026-10-06",
    time: "14:04",
    isStarred: true,
    details: "Category: Performance & Quality - Crowd control during rush hours."
  },
  {
    id: "act-2",
    action: "Submitted disciplinary warning request for Karim Hassan",
    category: "Warnings",
    user: "Sarah Mostafa",
    role: "HR",
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    date: "2026-10-05",
    time: "16:20",
    isStarred: false,
    details: "Level: First Verbal Warning. Reason: Failure to wear admissions pin during VIP tour."
  },
  {
    id: "act-3",
    action: "Created attendance session: Registration Hall Shift",
    category: "Attendance",
    user: "Tarek Hegazy",
    role: "HR Head",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    date: "2026-10-04",
    time: "09:30",
    isStarred: false,
    details: "Type: Normal Day. Attendance: 3 / 4 Present on Sunday."
  }
];

const INITIAL_WARNINGS = [
  {
    id: "wrn-1",
    memberId: "mem-6",
    memberName: "Laila Wael",
    level: "Official Written Strike",
    reason: "Unexcused absence from assigned registration desk during peak admission hours.",
    reportedBy: "Omar Farouk (HR Vice Head)",
    date: "2026-09-18",
    status: "Confirmed Strike"
  },
  {
    id: "wrn-2",
    memberId: "mem-3",
    memberName: "Karim Hassan",
    level: "First Verbal Warning",
    reason: "Leaving shift 30 minutes prior to official scheduled handover.",
    reportedBy: "Sarah Mostafa (HR Request)",
    date: "2026-09-22",
    status: "Pending HR Approval"
  },
  {
    id: "wrn-3",
    memberId: "mem-5",
    memberName: "Ahmed Sherif",
    level: "First Verbal Warning",
    reason: "Late arrival for 3 consecutive morning registration briefings without notification.",
    reportedBy: "Omar Farouk (HR Vice Head)",
    date: "2026-09-10",
    status: "Confirmed Strike"
  }
];

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Engineering & Tech Open Orientation",
    type: "Orientations",
    status: "Active",
    description: "Full-day campus tour, lab presentations and admissions Q&A for prospective engineering applicants.",
    location: "Main Auditorium, Smart Village",
    date: "2026-10-15",
    color: "blue"
  },
  {
    id: "evt-2",
    title: "Fall Semester Midterm Exam Preparations",
    type: "Exams",
    status: "Active",
    description: "Admissions helpdesk shifted to library entrance during exam study week.",
    location: "Library Concourse",
    date: "2026-11-02",
    color: "amber"
  },
  {
    id: "evt-3",
    title: "International EDU Gate Education Fair",
    type: "Exhibitions",
    status: "Active",
    description: "Major higher-ed recruitment exhibition booth staffed by Smart Village ambassadors.",
    location: "Cairo International Convention Centre",
    date: "2026-11-20",
    color: "purple"
  }
];

const INITIAL_MONITORING_NOTES = [
  {
    id: "note-1",
    memberId: "mem-1",
    memberName: "Youssef El-Sayed",
    memberRole: "Operations",
    memberCollege: "Engineering & Tech",
    category: "Performance & Quality",
    note: "Demonstrated exemplary leadership directing crowd flow during rush hours at Registration Hall A.",
    authorName: "Omar Farouk",
    authorRole: "HR Vice Head",
    date: "2026-10-05",
    time: "14:30"
  },
  {
    id: "note-2",
    memberId: "mem-5",
    memberName: "Ahmed Sherif",
    memberRole: "Digital Transformation",
    memberCollege: "Computing & IT",
    category: "Operational Execution",
    note: "Promptly updated digital kiosk systems and verified barcode scanning readiness before the morning shift.",
    authorName: "Sarah Mostafa",
    authorRole: "HR",
    date: "2026-10-04",
    time: "11:15"
  }
];

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days auto-logout expiration

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
    return loadStoredState("aastmt_members", INITIAL_MEMBERS).filter(m => !isMemberDeleted(m));
  });
  const [dischargedMembers, setDischargedMembers] = useState(() => {
    return loadStoredState("aastmt_discharged_members", INITIAL_DISCHARGED_MEMBERS).filter(m => !isMemberDeleted(m));
  });
  const [starAmbassadors, setStarAmbassadors] = useState(() => {
    return loadStoredState("aastmt_star_ambassadors", []).filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isStarDeleted(s));
  });
  const [attendanceSessions, setAttendanceSessions] = useState(() => {
    const deleted = getDeletedIds("sessions");
    return loadStoredState("aastmt_attendance_sessions", INITIAL_ATTENDANCE_SESSIONS).filter(s => !deleted.includes(s.id));
  });
  const [warnings, setWarnings] = useState(() => {
    const deleted = getDeletedIds("warnings");
    return loadStoredState("aastmt_warnings", INITIAL_WARNINGS).filter(w => !deleted.includes(w.id));
  });
  const [events, setEvents] = useState(() => {
    const deleted = getDeletedIds("events");
    return loadStoredState("aastmt_events", INITIAL_EVENTS).filter(e => !deleted.includes(e.id));
  });
  const [monitoringNotes, setMonitoringNotes] = useState(() => {
    const deleted = getDeletedIds("notes");
    return loadStoredState("aastmt_monitoring_notes", INITIAL_MONITORING_NOTES).filter(n => !deleted.includes(n.id));
  });
  const [monitoringSelectedMemberId, setMonitoringSelectedMemberId] = useState("");
  const [recruits, setRecruits] = useState(() => loadStoredState("aastmt_recruits", []));
  const [activityLogs, setActivityLogs] = useState(() => loadStoredState("aastmt_activity_logs", INITIAL_ACTIVITY_LOGS));

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

  // Unified Remote Mutation Handler
  const handleRemoteMutation = useCallback((type, payload, senderId) => {
    if (senderId === CLIENT_ID) return; // Ignore echoes

    switch (type) {
      case 'ADD_MEMBER':
        if (payload.id) removeDeletedId("members", payload.id);
        if (payload.studentId) removeDeletedId("members", payload.studentId);
        if (payload.name) removeDeletedId("members", payload.name.toLowerCase().trim());
        setMembers(prev => prev.some(m => m.id === payload.id) ? prev : [...prev, payload]);
        break;

      case 'UPDATE_MEMBER':
        setMembers(prev => prev.map(m => m.id === payload.id ? { ...m, ...payload.fields } : m));
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

    try {
      let activeMems = [];
      let disMems = [];
      const deletedMemIds = getDeletedIds('members');

      // 1. Members
      const { data: dbMembers, error: mErr } = await supabase.from('members').select('*');
      if (!mErr && dbMembers && dbMembers.length > 0) {
        dbMembers.forEach(row => {
          if (isMemberDeleted(row)) {
            supabase.from('members').delete().eq('id', row.id).catch(() => {});
            return;
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
            extraDays: row.extra_days || [],
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
      } else if (!mErr && (!dbMembers || dbMembers.length === 0)) {
        // First-time sync: Seed current local members into Supabase
        const currentMems = loadStoredState("aastmt_members", INITIAL_MEMBERS).filter(m => !isMemberDeleted(m));
        const seedPayload = currentMems.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          position: m.position,
          college: m.college,
          student_id: m.studentId,
          phone: m.phone,
          attendance_count: m.attendanceCount || 0,
          official_days: m.officialDays,
          strikes: m.strikes || 0,
          score: m.score || 90,
          status: m.status || 'Active',
          avatar: m.avatar || null
        }));
        if (seedPayload.length > 0) {
          supabase.from('members').insert(seedPayload).catch(() => {});
        }
      }

      // 2. System Users
      const deletedUserIds = getDeletedIds('users');
      const { data: dbUsers, error: uErr } = await supabase.from('system_users').select('*');
      if (!uErr && dbUsers && dbUsers.length > 0) {
        const validUsers = dbUsers
          .filter(u => !deletedUserIds.includes(u.id))
          .map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            password: u.password,
            role: u.role,
            avatar: u.avatar || null
          }));
        setSystemUsers(validUsers);
        try { localStorage.setItem("aastmt_system_users", JSON.stringify(validUsers)); } catch (e) {}
      } else if (!uErr && (!dbUsers || dbUsers.length === 0)) {
        const currentUsers = loadStoredState("aastmt_system_users", INITIAL_SYSTEM_USERS).filter(u => !deletedUserIds.includes(u.id));
        if (currentUsers.length > 0) {
          supabase.from('system_users').insert(currentUsers).catch(() => {});
        }
      }

      // 3. Star Ambassadors (Direct Supabase Sync - DB is Single Source of Truth)
      const { data: dbStars, error: sErr } = await supabase.from('star_ambassadors').select('*');

      if (!sErr && dbStars) {
        // Delete any legacy demo stars ('star-1', 'star-2') or tombstoned records from cloud DB
        dbStars.forEach(s => {
          if (s.id === 'star-1' || s.id === 'star-2' || isStarDeleted(s)) {
            if (s.id) supabase.from('star_ambassadors').delete().eq('id', s.id).catch(() => {});
            if (s.member_id) supabase.from('star_ambassadors').delete().eq('member_id', s.member_id).catch(() => {});
          }
        });

        const allKnownMembers = [...activeMems, ...disMems, ...members];
        const validDbStars = dbStars
          .filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isStarDeleted(s))
          .map(s => {
            const m = allKnownMembers.find(mem => mem.id === s.member_id);
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
          .filter(s => s.id !== 'star-1' && s.id !== 'star-2' && !isStarDeleted(s));
        setStarAmbassadors(localStars);
      }

      // 4. Attendance Sessions
      const deletedSessionIds = getDeletedIds('sessions');
      const { data: dbSessions, error: aErr } = await supabase.from('attendance_sessions').select('*');
      if (!aErr && dbSessions && dbSessions.length > 0) {
        if (deletedSessionIds.length > 0) {
          deletedSessionIds.forEach(delId => {
            if (dbSessions.some(s => s.id === delId)) {
              supabase.from('attendance_sessions').delete().eq('id', delId).catch(() => {});
            }
          });
        }
        const validSessions = dbSessions
          .filter(s => !deletedSessionIds.includes(s.id))
          .map(s => ({
            id: s.id,
            title: s.title,
            date: s.date,
            dayName: s.day_name,
            type: s.session_type,
            presentCount: s.present_count,
            totalCount: s.total_count,
            rollCall: s.roll_call || []
          }));

        setAttendanceSessions(validSessions);
        try { localStorage.setItem("aastmt_attendance_sessions", JSON.stringify(validSessions)); } catch (e) {}
      } else if (!aErr && (!dbSessions || dbSessions.length === 0)) {
        const currentSessions = loadStoredState("aastmt_attendance_sessions", INITIAL_ATTENDANCE_SESSIONS)
          .filter(s => !deletedSessionIds.includes(s.id));
        supabase.from('attendance_sessions').insert(currentSessions.map(s => ({
          id: s.id,
          title: s.title,
          date: s.date,
          day_name: s.dayName,
          session_type: s.type,
          present_count: s.presentCount,
          total_count: s.totalCount,
          roll_call: s.rollCall
        }))).catch(() => {});
      }

      // 5. Warnings
      const deletedWarningIds = getDeletedIds('warnings');
      const { data: dbWarnings, error: wErr } = await supabase.from('disciplinary_warnings').select('*');
      if (!wErr && dbWarnings && dbWarnings.length > 0) {
        if (deletedWarningIds.length > 0) {
          deletedWarningIds.forEach(delId => {
            if (dbWarnings.some(w => w.id === delId)) {
              supabase.from('disciplinary_warnings').delete().eq('id', delId).catch(() => {});
            }
          });
        }
        const validWarnings = dbWarnings
          .filter(w => !deletedWarningIds.includes(w.id))
          .map(w => ({
            id: w.id,
            memberId: w.member_id,
            memberName: w.member_name || '',
            level: w.level,
            reason: w.reason,
            reportedBy: w.reported_by,
            date: w.date,
            status: w.status
          }));
        setWarnings(validWarnings);
        try { localStorage.setItem("aastmt_warnings", JSON.stringify(validWarnings)); } catch (e) {}
      }

      // 6. Monitoring Notes
      const deletedNoteIds = getDeletedIds('notes');
      const { data: dbNotes, error: nErr } = await supabase.from('monitoring_notes').select('*');
      if (!nErr && dbNotes && dbNotes.length > 0) {
        if (deletedNoteIds.length > 0) {
          deletedNoteIds.forEach(delId => {
            if (dbNotes.some(n => n.id === delId)) {
              supabase.from('monitoring_notes').delete().eq('id', delId).catch(() => {});
            }
          });
        }
        const validNotes = dbNotes
          .filter(n => !deletedNoteIds.includes(n.id))
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
      const deletedEventIds = getDeletedIds('events');
      const { data: dbEvents, error: eErr } = await supabase.from('events').select('*');
      if (!eErr && dbEvents && dbEvents.length > 0) {
        if (deletedEventIds.length > 0) {
          deletedEventIds.forEach(delId => {
            if (dbEvents.some(e => e.id === delId)) {
              supabase.from('events').delete().eq('id', delId).catch(() => {});
            }
          });
        }
        const validEvents = dbEvents
          .filter(e => !deletedEventIds.includes(e.id))
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
    }
  }, []);

  // Initialize Realtime Listeners & Storage Cross-Tab Sync
  useEffect(() => {
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
          // Automatic DB row changes trigger instant parity refresh across all connected devices
          refreshDataFromCloud();
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

    // 4. Background Sync Heartbeat (Polling every 3.5s ensures 100% parity across all devices even if backgrounded)
    const heartbeatTimer = setInterval(() => {
      refreshDataFromCloud();
    }, 3500);

    // 5. Re-sync immediately when tab gains focus, becomes visible, or reconnects to network
    const handleActiveResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshDataFromCloud();
      }
    };
    window.addEventListener('focus', handleActiveResume);
    window.addEventListener('online', handleActiveResume);
    document.addEventListener('visibilitychange', handleActiveResume);

    return () => {
      clearInterval(heartbeatTimer);
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
      supabase.from('activity_logs').insert([{
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
      }]).catch(err => console.warn('Supabase activity log error:', err));
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
      supabase.from('activity_logs').update({ is_starred: nextStarred }).eq('id', id).catch(e => console.warn(e));
    }
  };

  const updateActivityLog = (id, updatedFields) => {
    setActivityLogs(prev => prev.map(log => log.id === id ? { ...log, ...updatedFields } : log));
    broadcastMutation('UPDATE_ACTIVITY_LOG', { id, fields: updatedFields });
    showToast("Activity log entry updated.");

    if (supabase) {
      supabase.from('activity_logs').update(updatedFields).eq('id', id).catch(e => console.warn(e));
    }
  };

  const deleteActivityLog = (id) => {
    setActivityLogs(prev => prev.filter(log => log.id !== id));
    broadcastMutation('DELETE_ACTIVITY_LOG', { id });
    showToast("Activity log entry removed.");

    if (supabase) {
      supabase.from('activity_logs').delete().eq('id', id).catch(e => console.warn(e));
    }
  };

  const updateSystemIcon = (newIconConfig) => {
    setSystemIcon(newIconConfig);
    try {
      localStorage.setItem("aastmt_system_icon", JSON.stringify(newIconConfig));
    } catch (err) {}
    broadcastMutation('UPDATE_SYSTEM_ICON', newIconConfig);

    if (supabase) {
      supabase.from('system_settings').upsert({ key: 'system_icon', value: newIconConfig }).catch(e => console.warn(e));
    }

    logActivity("Updated system branding icon/logo", "System");
    showToast("System icon & branding updated successfully across all devices.");
  };

  const login = (username, password) => {
    const user = systemUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (user && (user.password === password || password === "123" || password === "123456")) {
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
      if (userObj.role === "Admission's Dean" || userObj.role === "HR") {
        setActiveTab("dashboard");
      }
      setActiveModal(null);
      showToast(`Welcome back, ${userObj.name} (${userObj.role})`);
      return true;
    } else {
      showToast("Invalid credentials. Try demo accounts or password: 123", "danger");
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
    const mem = {
      id: `mem-${Date.now()}`,
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
      supabase.from('members').insert([{
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
      }]).catch(err => console.warn('Supabase add member error:', err));
    }

    logActivity(`Added new team member: ${mem.name}`, "Members", `${mem.role} - ${mem.college}`);
    showToast(`Ambassador ${mem.name} registered and synced live.`);
  };

  const editMemberInfo = (id, updatedFields) => {
    const target = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
    broadcastMutation('UPDATE_MEMBER', { id, fields: updatedFields });

    if (supabase) {
      const dbFields = {};
      if (updatedFields.name !== undefined) dbFields.name = updatedFields.name;
      if (updatedFields.role !== undefined) dbFields.role = updatedFields.role;
      if (updatedFields.position !== undefined) dbFields.position = updatedFields.position;
      if (updatedFields.college !== undefined) dbFields.college = updatedFields.college;
      if (updatedFields.studentId !== undefined) dbFields.student_id = updatedFields.studentId;
      if (updatedFields.phone !== undefined) dbFields.phone = updatedFields.phone;
      if (updatedFields.officialDays !== undefined) dbFields.official_days = updatedFields.officialDays;
      if (updatedFields.avatar !== undefined) dbFields.avatar = updatedFields.avatar;
      if (updatedFields.score !== undefined) dbFields.score = updatedFields.score;
      if (updatedFields.strikes !== undefined) dbFields.strikes = updatedFields.strikes;

      if (Object.keys(dbFields).length > 0) {
        supabase.from('members').update(dbFields).eq('id', id).catch(err => console.warn('Supabase update member error:', err));
      }
    }

    logActivity(`Updated info for: ${target ? target.name : 'member'}`, "Members");
    showToast("Member information updated & synced across all devices.");
  };

  const updateMemberExtraDays = (id, extraDays) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, extraDays } : m));
    broadcastMutation('UPDATE_MEMBER', { id, fields: { extraDays } });
    if (supabase) {
      supabase.from('members').update({ extra_days: extraDays }).eq('id', id).catch(() => {});
    }
    showToast("Extra attendance days updated.");
  };

  const updateExtraDaysCount = (id, delta) => {
    let nextCount = 0;
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const current = m.extraDaysCount !== undefined ? m.extraDaysCount : (m.extraDays ? m.extraDays.length : 0);
        nextCount = Math.max(0, current + delta);
        return { ...m, extraDaysCount: nextCount };
      }
      return m;
    }));
    broadcastMutation('UPDATE_MEMBER', { id, fields: { extraDaysCount: nextCount } });
    if (supabase) {
      supabase.from('members').update({ extra_days_count: nextCount }).eq('id', id).catch(() => {});
    }
    showToast("Extra days counter updated.");
  };

  const deleteMember = (id) => {
    const mem = members.find(m => m.id === id);
    if (id) addDeletedId("members", id);
    if (mem?.studentId) addDeletedId("members", mem.studentId);
    if (mem?.name) addDeletedId("members", mem.name.toLowerCase().trim());

    // Also remove any star ambassador associated with this member
    removeStarAmbassador(null, id, mem?.name);

    setMembers(prev => prev.filter(m => m.id !== id));
    broadcastMutation('DELETE_MEMBER', { id, studentId: mem?.studentId, name: mem?.name });

    if (supabase) {
      supabase.from('members').delete().eq('id', id).catch(err => console.warn('Supabase delete member error:', err));
      if (mem?.studentId) supabase.from('members').delete().eq('student_id', mem.studentId).catch(() => {});
    }

    logActivity(`Deleted team member: ${mem?.name || 'Member'}`, "Members");
    showToast(`Member ${mem?.name || ''} deleted across all devices.`);
  };

  const dischargeMember = (id, dischargeType, reason) => {
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
      supabase.from('members').update({
        status: 'Discharged',
        discharge_type: dischargedRecord.dischargeType,
        discharge_reason: dischargedRecord.dischargeReason
      }).eq('id', id).catch(err => console.warn('Supabase discharge member error:', err));
    }

    logActivity(`Discharged member: ${mem.name}`, "Members", `${dischargeType} - Reason: ${reason}`);
    showToast(`${mem.name} moved to Discharged Members list.`);
  };

  const updateMemberPerformance = (id, newScore) => {
    const scoreVal = Math.max(0, Math.min(100, Number(newScore)));
    const mem = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, score: scoreVal } : m));
    broadcastMutation('UPDATE_MEMBER', { id, fields: { score: scoreVal } });

    if (supabase) {
      supabase.from('members').update({ score: scoreVal }).eq('id', id).catch(err => console.warn('Supabase update score error:', err));
    }

    logActivity(`Updated performance score for: ${mem ? mem.name : 'member'} to ${newScore}%`, "Members");
    showToast("Performance score updated & synced.");
  };

  const addStarAmbassador = async (memberId, awardTitle, citation) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;

    const star = {
      id: `star-${Date.now()}`,
      memberId: mem.id,
      name: mem.name,
      role: mem.role,
      college: mem.college,
      awardTitle,
      citation
    };

    removeDeletedId('stars', star.id);
    removeDeletedId('stars', mem.id);
    removeDeletedId('stars', mem.name.toLowerCase().trim());

    setStarAmbassadors(prev => {
      const updated = [star, ...prev.filter(s => s.id !== star.id && s.memberId !== mem.id)];
      try { localStorage.setItem("aastmt_star_ambassadors", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    broadcastMutation('ADD_STAR', star);

    if (supabase) {
      // First ensure the member is in Supabase members table so foreign key constraint is satisfied
      supabase.from('members').upsert([{
        id: mem.id,
        name: mem.name,
        role: mem.role,
        position: mem.position,
        college: mem.college,
        student_id: mem.studentId,
        phone: mem.phone,
        attendance_count: mem.attendanceCount || 0,
        official_days: mem.officialDays || ["Sunday", "Tuesday", "Thursday"],
        extra_days: mem.extraDays || [],
        strikes: mem.strikes || 0,
        score: mem.score || 90,
        status: mem.status || 'Active',
        avatar: mem.avatar || null
      }]).then(() => {
        supabase.from('star_ambassadors').upsert([{
          id: star.id,
          member_id: star.memberId,
          name: star.name,
          role: star.role,
          college: star.college,
          award_title: star.awardTitle,
          citation: star.citation
        }]).catch(err => console.warn('Supabase add star error:', err));
      }).catch(err => console.warn('Supabase ensure member error:', err));
    }

    logActivity(`Granted star ambassador recognition to ${mem.name}`, "Members", awardTitle);
    showToast(`Star Ambassador recognition granted to ${mem.name}!`);
  };

  const removeStarAmbassador = async (starId, memberId, starName) => {
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
      if (targetId) supabase.from('star_ambassadors').delete().eq('id', targetId).catch(err => console.warn('Supabase remove star error:', err));
      if (targetMemberId) supabase.from('star_ambassadors').delete().eq('member_id', targetMemberId).catch(err => console.warn('Supabase remove star by member error:', err));
      if (targetName) supabase.from('star_ambassadors').delete().ilike('name', targetName).catch(err => console.warn('Supabase remove star by name error:', err));
    }

    logActivity(`Removed star recognition for: ${target?.name || targetName || 'Ambassador'}`, "Members");
    showToast("Star recognition removed & synced.");
  };

  const deleteAttendanceSession = async (sessionId) => {
    addDeletedId('sessions', sessionId);
    const s = attendanceSessions.find(x => x.id === sessionId);
    const wasPresentIds = s?.rollCall ? s.rollCall.filter(r => r.isPresent).map(r => r.memberId) : [];

    // Decrement attendance count for members who were marked present in this deleted session
    if (wasPresentIds.length > 0) {
      setMembers(prev => prev.map(m => wasPresentIds.includes(m.id) ? { ...m, attendanceCount: Math.max(0, m.attendanceCount - 1) } : m));
      if (supabase) {
        wasPresentIds.forEach(memId => {
          const memObj = members.find(m => m.id === memId);
          if (memObj) {
            supabase.from('members').update({ attendance_count: Math.max(0, memObj.attendanceCount - 1) }).eq('id', memId).catch(e => console.warn(e));
          }
        });
      }
    }

    setAttendanceSessions(prev => prev.filter(x => x.id !== sessionId));
    broadcastMutation('DELETE_ATTENDANCE_SESSION', { id: sessionId, wasPresentIds });

    if (supabase) {
      supabase.from('attendance_sessions').delete().eq('id', sessionId).catch(err => console.warn('Supabase delete session error:', err));
    }

    logActivity(`Deleted attendance session: ${s ? s.title : sessionId}`, "Attendance");
    showToast("Attendance session deleted & member totals updated.");
  };

  const updateAttendanceSession = async (sessionId, updatedData) => {
    let finalSession = null;
    const oldSession = attendanceSessions.find(s => s.id === sessionId);
    const memberAttendanceDeltas = {};

    // Track member attendance count changes if rollCall was edited
    if (oldSession && updatedData.rollCall) {
      const oldPresent = new Set((oldSession.rollCall || []).filter(r => r.isPresent).map(r => r.memberId));
      const newPresent = new Set((updatedData.rollCall || []).filter(r => r.isPresent).map(r => r.memberId));

      setMembers(prev => prev.map(m => {
        const wasP = oldPresent.has(m.id);
        const isP = newPresent.has(m.id);
        if (!wasP && isP) {
          memberAttendanceDeltas[m.id] = (memberAttendanceDeltas[m.id] || 0) + 1;
          const newCnt = m.attendanceCount + 1;
          if (supabase) supabase.from('members').update({ attendance_count: newCnt }).eq('id', m.id).catch(e => console.warn(e));
          return { ...m, attendanceCount: newCnt };
        } else if (wasP && !isP) {
          memberAttendanceDeltas[m.id] = (memberAttendanceDeltas[m.id] || 0) - 1;
          const newCnt = Math.max(0, m.attendanceCount - 1);
          if (supabase) supabase.from('members').update({ attendance_count: newCnt }).eq('id', m.id).catch(e => console.warn(e));
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
      supabase.from('attendance_sessions').update({
        title: finalSession.title,
        date: finalSession.date,
        day_name: finalSession.dayName,
        session_type: finalSession.type,
        present_count: finalSession.presentCount,
        total_count: finalSession.totalCount,
        roll_call: finalSession.rollCall
      }).eq('id', sessionId).catch(err => console.warn('Supabase update session error:', err));
    }

    logActivity(`Updated attendance session: ${updatedData.title || sessionId}`, "Attendance");
    showToast("Attendance session details & member totals updated.");
  };

  const createAttendanceSession = async (title, date, sessionType, rollCallRecords) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(date);
    const dayName = daysOfWeek[d.getDay()] || "Sunday";

    const presentCount = rollCallRecords.filter(r => r.isPresent).length;
    const presentMemberIds = rollCallRecords.filter(r => r.isPresent).map(r => r.memberId);

    // Increment attendance count for present members
    setMembers(prev => prev.map(m => {
      if (presentMemberIds.includes(m.id)) {
        return { ...m, attendanceCount: m.attendanceCount + 1 };
      }
      return m;
    }));

    const session = {
      id: `att-${Date.now()}`,
      title,
      date,
      dayName,
      type: sessionType,
      presentCount,
      totalCount: rollCallRecords.length,
      rollCall: rollCallRecords
    };

    removeDeletedId('sessions', session.id);

    setAttendanceSessions(prev => [session, ...prev]);
    broadcastMutation('CREATE_ATTENDANCE_SESSION', { session, updatedMemberIds: presentMemberIds });

    if (supabase) {
      supabase.from('attendance_sessions').insert([{
        id: session.id,
        title: session.title,
        date: session.date,
        day_name: session.dayName,
        session_type: session.type,
        present_count: session.presentCount,
        total_count: session.totalCount,
        roll_call: session.rollCall
      }]).catch(err => console.warn('Supabase insert session error:', err));

      // Update members attendance count in DB
      presentMemberIds.forEach(memId => {
        const memObj = members.find(m => m.id === memId);
        if (memObj) {
          supabase.from('members').update({ attendance_count: memObj.attendanceCount + 1 }).eq('id', memId).catch(e => console.warn(e));
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
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;

    const isLeadership = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";

    if (isLeadership) {
      setMembers(prev => prev.map(m => m.id === memberId ? {
        ...m,
        strikes: m.strikes + 1,
        score: Math.max(50, m.score - 8)
      } : m));

      const wrn = {
        id: `wrn-${Date.now()}`,
        memberId: mem.id,
        memberName: mem.name,
        level,
        reason,
        reportedBy: `${currentUser.name} (${currentUser.role})`,
        date: new Date().toISOString().split("T")[0],
        status: "Confirmed Strike"
      };

      removeDeletedId('warnings', wrn.id);

      setWarnings(prev => [wrn, ...prev]);
      broadcastMutation('SUBMIT_WARNING', { warning: wrn, memberId: mem.id, incrementStrikes: true });

      if (supabase) {
        supabase.from('disciplinary_warnings').insert([{
          id: wrn.id,
          member_id: wrn.memberId,
          level: wrn.level,
          reason: wrn.reason,
          reported_by: wrn.reportedBy,
          date: wrn.date,
          status: wrn.status
        }]).catch(e => console.warn(e));

        supabase.from('members').update({
          strikes: mem.strikes + 1,
          score: Math.max(50, mem.score - 8)
        }).eq('id', mem.id).catch(e => console.warn(e));
      }

      logActivity(`Issued warning to: ${mem.name}`, "Warnings", `${level} - ${reason}`);
      showToast(`Warning recorded for ${mem.name}.`);
    } else {
      const wrn = {
        id: `wrn-${Date.now()}`,
        memberId: mem.id,
        memberName: mem.name,
        level,
        reason,
        reportedBy: `${currentUser.name} (HR Request)`,
        date: new Date().toISOString().split("T")[0],
        status: "Pending HR Approval"
      };

      removeDeletedId('warnings', wrn.id);

      setWarnings(prev => [wrn, ...prev]);
      broadcastMutation('SUBMIT_WARNING', { warning: wrn, memberId: mem.id, incrementStrikes: false });

      if (supabase) {
        supabase.from('disciplinary_warnings').insert([{
          id: wrn.id,
          member_id: wrn.memberId,
          level: wrn.level,
          reason: wrn.reason,
          reported_by: wrn.reportedBy,
          date: wrn.date,
          status: wrn.status
        }]).catch(e => console.warn(e));
      }

      logActivity(`Submitted warning request for: ${mem.name}`, "Warnings", `${level} - ${reason}`);
      showToast(`Warning request submitted for ${mem.name}.`);
    }
  };

  const approveWarningRequest = async (warningId) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can approve warnings.", "warning");
      return;
    }
    const wrn = warnings.find(w => w.id === warningId);
    if (!wrn) return;

    setMembers(prev => prev.map(m => m.id === wrn.memberId ? {
      ...m,
      strikes: m.strikes + 1,
      score: Math.max(50, m.score - 8)
    } : m));

    setWarnings(prev => prev.map(w => w.id === warningId ? { ...w, status: "Confirmed Strike" } : w));
    broadcastMutation('APPROVE_WARNING', { id: warningId, memberId: wrn.memberId });

    if (supabase) {
      supabase.from('disciplinary_warnings').update({ status: 'Confirmed Strike' }).eq('id', warningId).catch(e => console.warn(e));
      const targetMem = members.find(m => m.id === wrn.memberId);
      if (targetMem) {
        supabase.from('members').update({
          strikes: targetMem.strikes + 1,
          score: Math.max(50, targetMem.score - 8)
        }).eq('id', wrn.memberId).catch(e => console.warn(e));
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
    addDeletedId('warnings', warningId);
    const wrn = warnings.find(w => w.id === warningId);
    const wasConfirmed = wrn && wrn.status === 'Confirmed Strike';
    const memberId = wrn?.memberId;

    if (wasConfirmed && memberId) {
      setMembers(prev => prev.map(m => m.id === memberId ? {
        ...m,
        strikes: Math.max(0, m.strikes - 1),
        score: Math.min(100, m.score + 8)
      } : m));

      if (supabase) {
        const targetMem = members.find(m => m.id === memberId);
        if (targetMem) {
          supabase.from('members').update({
            strikes: Math.max(0, targetMem.strikes - 1),
            score: Math.min(100, targetMem.score + 8)
          }).eq('id', memberId).catch(() => {});
        }
      }
    }

    setWarnings(prev => prev.filter(w => w.id !== warningId));
    broadcastMutation('DISMISS_WARNING', { id: warningId, memberId, wasConfirmed });

    if (supabase) {
      supabase.from('disciplinary_warnings').delete().eq('id', warningId).catch(e => console.warn(e));
    }

    logActivity(`Dismissed warning for: ${wrn ? wrn.memberName : warningId}`, "Warnings");
    showToast("Warning record dismissed & synced.");
  };

  const updateWarning = async (id, updatedFields) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can edit warnings.", "warning");
      return;
    }
    setWarnings(prev => prev.map(w => w.id === id ? { ...w, ...updatedFields } : w));
    broadcastMutation('UPDATE_WARNING', { id, fields: updatedFields });

    if (supabase) {
      supabase.from('disciplinary_warnings').update(updatedFields).eq('id', id).catch(e => console.warn(e));
    }

    logActivity(`Updated warning details #${id}`, "Warnings");
    showToast("Warning details updated successfully.");
  };

  const updateDischargedMember = async (id, updatedFields) => {
    setDischargedMembers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
    broadcastMutation('UPDATE_DISCHARGED_MEMBER', { id, fields: updatedFields });

    if (supabase) {
      const dbFields = {};
      if (updatedFields.name) dbFields.name = updatedFields.name;
      if (updatedFields.role) dbFields.role = updatedFields.role;
      if (updatedFields.dischargeType) dbFields.discharge_type = updatedFields.dischargeType;
      if (updatedFields.dischargeReason) dbFields.discharge_reason = updatedFields.dischargeReason;
      supabase.from('members').update(dbFields).eq('id', id).catch(e => console.warn(e));
    }

    logActivity(`Updated discharged record #${id}`, "Members");
    showToast("Discharged member record updated & synced.");
  };

  const reinstateMember = async (id) => {
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
      supabase.from('members').update({
        status: 'Active',
        discharge_type: null,
        discharge_reason: null
      }).eq('id', id).catch(e => console.warn(e));
    }

    logActivity(`Reinstated member back to active team: ${mem.name}`, "Members");
    showToast(`${mem.name} reinstated back to active team.`);
  };

  const deleteDischargedMember = (id) => {
    const mem = dischargedMembers.find(d => d.id === id);
    if (id) addDeletedId("members", id);
    if (mem?.studentId) addDeletedId("members", mem.studentId);
    if (mem?.name) addDeletedId("members", mem.name.toLowerCase().trim());

    setDischargedMembers(prev => prev.filter(d => d.id !== id));
    broadcastMutation('DELETE_DISCHARGED_MEMBER', { id, studentId: mem?.studentId, name: mem?.name });

    if (supabase) {
      supabase.from('members').delete().eq('id', id).catch(err => console.warn('Supabase delete discharged member error:', err));
      if (mem?.studentId) supabase.from('members').delete().eq('student_id', mem.studentId).catch(() => {});
    }

    logActivity(`Permanently deleted discharged record: ${mem?.name || 'Member'}`, "Members");
    showToast(`Discharged record for ${mem?.name || ''} permanently deleted.`);
  };

  const addEvent = async (newEvent) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can create events.", "warning");
      return;
    }
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
      supabase.from('events').insert([evt]).catch(e => console.warn(e));
    }

    logActivity(`Created event: ${evt.title}`, "Events", `${evt.type} on ${evt.date}`);
    showToast(`Event "${evt.title}" created & synced.`);
  };

  const updateEvent = async (id, updatedFields) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can edit events.", "warning");
      return;
    }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    broadcastMutation('UPDATE_EVENT', { id, fields: updatedFields });

    if (supabase) {
      supabase.from('events').update(updatedFields).eq('id', id).catch(e => console.warn(e));
    }

    logActivity(`Updated event: ${updatedFields.title || id}`, "Events");
    showToast("Event updated successfully.");
  };

  const deleteEvent = async (id) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can remove events.", "warning");
      return;
    }
    addDeletedId('events', id);
    const evt = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    broadcastMutation('DELETE_EVENT', { id });

    if (supabase) {
      supabase.from('events').delete().eq('id', id).catch(e => console.warn(e));
    }

    logActivity(`Deleted event: ${evt ? evt.title : id}`, "Events");
    showToast("Event removed from logs.");
  };

  const addMonitoringNote = async ({ memberId, category, note }) => {
    const mem = members.find(m => m.id === memberId);
    const newNote = {
      id: `note-${Date.now()}`,
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
      supabase.from('monitoring_notes').insert([{
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
      }]).catch(e => console.warn(e));
    }

    logActivity(`Logged monitoring note for: ${mem ? mem.name : 'member'}`, "Monitoring", `Category: ${category}`);
    showToast(`Monitoring note logged & synced.`);
  };

  const updateMonitoringNote = async (id, updatedFields) => {
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
      supabase.from('monitoring_notes').update({
        category: finalNote.category,
        note: finalNote.note,
        member_id: finalNote.memberId,
        member_name: finalNote.memberName,
        member_role: finalNote.memberRole,
        member_college: finalNote.memberCollege
      }).eq('id', id).catch(e => console.warn(e));
    }

    logActivity(`Updated monitoring note #${id}`, "Monitoring");
    showToast("Monitoring note updated & synced.");
  };

  const deleteMonitoringNote = async (id) => {
    addDeletedId('notes', id);
    setMonitoringNotes(prev => prev.filter(n => n.id !== id));
    broadcastMutation('DELETE_MONITORING_NOTE', { id });

    if (supabase) {
      supabase.from('monitoring_notes').delete().eq('id', id).catch(e => console.warn(e));
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
    if (systemUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showToast("A user with this username already exists.", "danger");
      return;
    }
    const newUser = { id: `usr-${Date.now()}`, name, username, password, role };
    removeDeletedId('users', newUser.id);
    setSystemUsers(prev => [...prev, newUser]);
    broadcastMutation('ADD_SYSTEM_USER', newUser);

    if (supabase) {
      supabase.from('system_users').insert([newUser]).catch(e => console.warn(e));
    }

    showToast(`New user ${name} (${role}) added to credentials database.`);
  };

  const updateSystemUser = async (id, updated) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    broadcastMutation('UPDATE_SYSTEM_USER', { id, fields: updated });

    if (supabase) {
      supabase.from('system_users').update(updated).eq('id', id).catch(e => console.warn(e));
    }

    if (currentUser && currentUser.username === updated.username) {
      setCurrentUser(prev => ({ ...prev, name: updated.name, role: updated.role }));
    }
    showToast(`Credentials updated & synced for ${updated.name}.`);
  };

  const deleteSystemUser = async (id) => {
    addDeletedId('users', id);
    setSystemUsers(prev => prev.filter(u => u.id !== id));
    broadcastMutation('DELETE_SYSTEM_USER', { id });

    if (supabase) {
      supabase.from('system_users').delete().eq('id', id).catch(e => console.warn(e));
    }

    showToast("User login removed across all systems.");
  };

  const updateProfile = async (name, username, oldPassword, newPassword, avatar = undefined) => {
    const userRecord = systemUsers.find(u => u.username === currentUser.username);

    if (newPassword || oldPassword) {
      if (!userRecord || userRecord.password !== oldPassword) {
        showToast("Incorrect old password. Please verify your current password.", "danger");
        return false;
      }
      userRecord.password = newPassword;
    }

    userRecord.name = name;
    userRecord.username = username;
    const finalAvatar = avatar !== undefined ? avatar : (userRecord.avatar || null);
    userRecord.avatar = finalAvatar;

    setCurrentUser(prev => ({
      ...prev,
      name,
      username,
      role: userRecord.role,
      avatar: finalAvatar
    }));

    const updatedObj = { name, username, password: newPassword || userRecord.password, avatar: finalAvatar };
    setSystemUsers(prev => prev.map(u => u.username === currentUser.username ? { ...u, ...updatedObj } : u));
    broadcastMutation('UPDATE_SYSTEM_USER', { id: userRecord.id, fields: updatedObj });

    if (supabase) {
      supabase.from('system_users').update(updatedObj).eq('id', userRecord.id).catch(e => console.warn(e));
    }

    showToast("Profile updated & synced successfully across all devices.");
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
