import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

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
    strikes: 1,
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
    strikes: 2,
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
    date: "2026-08-30"
  }
];

const INITIAL_STAR_AMBASSADORS = [
  {
    id: "star-1",
    memberId: "mem-1",
    name: "Youssef El-Sayed",
    role: "Operations",
    college: "Engineering & Tech",
    awardTitle: "Lead Admissions Ambassador of the Month",
    citation: "Spearheaded orientation tours for 120+ prospective parents with zero scheduling conflicts."
  },
  {
    id: "star-2",
    memberId: "mem-4",
    name: "Farida Ahmed",
    role: "Operations",
    college: "Logistics & Transport",
    awardTitle: "Operations Champion",
    citation: "Volunteered for 3 non-scheduled weekend open day shifts at the Smart Village registration booth."
  }
];

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
    reason: "Failure to wear formal AASTMT admissions pin during parent VIP campus tour.",
    reportedBy: "Sarah Mostafa (HR)",
    date: "2026-09-15",
    status: "Pending HR Approval"
  }
];

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Orientations",
    type: "Orientations",
    status: "Active",
    description: "Campus tours & parent welcome briefings in Hall A.",
    location: "Hall A, Smart Village",
    date: "2026-10-10",
    color: "amber"
  },
  {
    id: "evt-2",
    title: "EDU Gate",
    type: "EDU Gate",
    status: "Scheduled",
    description: "Annual admissions exhibition & university portal drive.",
    location: "Exhibition Hall & Booth 4",
    date: "2026-10-15",
    color: "blue"
  },
  {
    id: "evt-3",
    title: "Meetings",
    type: "Meetings",
    status: "Weekly",
    description: "General assembly & committee sync in Meeting Room 007.",
    location: "Meeting Room 007",
    date: "Every Wednesday",
    color: "emerald"
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

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toasts, setToasts] = useState([]);

  // Data Collections
  const [systemUsers, setSystemUsers] = useState(INITIAL_SYSTEM_USERS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [dischargedMembers, setDischargedMembers] = useState(INITIAL_DISCHARGED_MEMBERS);
  const [starAmbassadors, setStarAmbassadors] = useState(INITIAL_STAR_AMBASSADORS);
  const [attendanceSessions, setAttendanceSessions] = useState(INITIAL_ATTENDANCE_SESSIONS);
  const [warnings, setWarnings] = useState(INITIAL_WARNINGS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [monitoringNotes, setMonitoringNotes] = useState(INITIAL_MONITORING_NOTES);
  const [monitoringSelectedMemberId, setMonitoringSelectedMemberId] = useState("");
  const [recruits, setRecruits] = useState([]);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);

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
  };

  const toggleStarActivityLog = (id) => {
    setActivityLogs(prev => prev.map(log => {
      if (log.id === id) {
        const nextStarred = !log.isStarred;
        showToast(nextStarred ? "Activity starred (retained permanently)." : "Activity unstarred (will auto-delete after 7 days).");
        return { ...log, isStarred: nextStarred };
      }
      return log;
    }));
  };

  const updateActivityLog = (id, updatedFields) => {
    setActivityLogs(prev => prev.map(log => log.id === id ? { ...log, ...updatedFields } : log));
    showToast("Activity log entry updated.");
  };

  const deleteActivityLog = (id) => {
    setActivityLogs(prev => prev.filter(log => log.id !== id));
    showToast("Activity log entry removed.");
  };

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [modalExtraData, setModalExtraData] = useState({});

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // System Branding / Icon State
  const [systemIcon, setSystemIcon] = useState(() => {
    try {
      const saved = localStorage.getItem("aastmt_system_icon");
      return saved ? JSON.parse(saved) : { type: "icon", value: "fa-anchor", imageUrl: "" };
    } catch {
      return { type: "icon", value: "fa-anchor", imageUrl: "" };
    }
  });

  const updateSystemIcon = (newIconConfig) => {
    setSystemIcon(newIconConfig);
    try {
      localStorage.setItem("aastmt_system_icon", JSON.stringify(newIconConfig));
    } catch (err) {}
    logActivity("Updated system branding icon/logo", "System");
    showToast("System icon & branding updated successfully.");
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
    setMembers(prev => [...prev, mem]);
    logActivity(`Added new team member: ${mem.name}`, "Members", `${mem.role} - ${mem.college}`);
    showToast(`Ambassador ${mem.name} registered in Smart Village team.`);
  };

  const editMemberInfo = (id, updatedFields) => {
    const target = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
    logActivity(`Updated info for: ${target ? target.name : 'member'}`, "Members");
    showToast("Member information updated successfully.");
  };

  const updateMemberExtraDays = (id, extraDays) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, extraDays } : m));
    showToast("Extra attendance days updated.");
  };

  const updateExtraDaysCount = (id, delta) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const current = m.extraDaysCount !== undefined ? m.extraDaysCount : (m.extraDays ? m.extraDays.length : 0);
        const newCount = Math.max(0, current + delta);
        return { ...m, extraDaysCount: newCount };
      }
      return m;
    }));
    showToast("Extra days counter updated.");
  };

  const deleteMember = (id) => {
    const mem = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    logActivity(`Deleted team member: ${mem?.name || 'Member'}`, "Members");
    showToast(`Member ${mem?.name || ''} deleted.`);
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
      date: new Date().toISOString().split("T")[0]
    };

    setMembers(prev => prev.filter(m => m.id !== id));
    setDischargedMembers(prev => [dischargedRecord, ...prev]);
    logActivity(`Discharged member: ${mem.name}`, "Members", `${dischargeType} - Reason: ${reason}`);
    showToast(`${mem.name} moved to Discharged Members list.`);
  };

  const updateMemberPerformance = (id, newScore) => {
    const mem = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, score: Math.max(0, Math.min(100, Number(newScore))) } : m));
    logActivity(`Updated performance score for: ${mem ? mem.name : 'member'} to ${newScore}%`, "Members");
    showToast("Performance score updated.");
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

    setStarAmbassadors(prev => [star, ...prev]);
    logActivity(`Granted star ambassador recognition to ${mem.name}`, "Members", awardTitle);
    showToast(`Star Ambassador recognition granted to ${mem.name}!`);
  };

  const removeStarAmbassador = async (starId) => {
    setStarAmbassadors(prev => prev.filter(s => s.id !== starId));
    logActivity("Removed star recognition", "Members");
    showToast("Star recognition removed.");
  };

  const deleteAttendanceSession = async (sessionId) => {
    const s = attendanceSessions.find(x => x.id === sessionId);
    setAttendanceSessions(prev => prev.filter(x => x.id !== sessionId));
    logActivity(`Deleted attendance session: ${s ? s.title : sessionId}`, "Attendance");
    showToast("Attendance session deleted.");
  };

  const updateAttendanceSession = async (sessionId, updatedData) => {
    setAttendanceSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const presentCount = updatedData.rollCall ? updatedData.rollCall.filter(r => r.isPresent).length : s.presentCount;
        const totalCount = updatedData.rollCall ? updatedData.rollCall.length : s.totalCount;
        return { ...s, ...updatedData, presentCount, totalCount };
      }
      return s;
    }));
    logActivity(`Updated attendance session: ${updatedData.title || sessionId}`, "Attendance");
    showToast("Attendance session details updated.");
  };

  const createAttendanceSession = async (title, date, sessionType, rollCallRecords) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(date);
    const dayName = daysOfWeek[d.getDay()] || "Sunday";

    const presentCount = rollCallRecords.filter(r => r.isPresent).length;

    // Increment attendance count for present members
    setMembers(prev => prev.map(m => {
      const rec = rollCallRecords.find(r => r.memberId === m.id);
      if (rec && rec.isPresent) {
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

    setAttendanceSessions(prev => [session, ...prev]);
    logActivity(`Created attendance roll call: ${title}`, "Attendance", `${dayName}, ${date} (${presentCount}/${rollCallRecords.length} present)`);
    showToast(`Attendance for ${dayName} (${sessionType}) recorded successfully.`);
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

      setWarnings(prev => [wrn, ...prev]);
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

      setWarnings(prev => [wrn, ...prev]);
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
    logActivity(`Approved warning request for: ${wrn.memberName}`, "Warnings");
    showToast(`Warning approved for ${wrn.memberName}.`);
  };

  const dismissWarning = async (warningId) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can remove warnings.", "warning");
      return;
    }
    const wrn = warnings.find(w => w.id === warningId);
    setWarnings(prev => prev.filter(w => w.id !== warningId));
    logActivity(`Dismissed warning for: ${wrn ? wrn.memberName : warningId}`, "Warnings");
    showToast("Warning record dismissed.");
  };

  const updateWarning = async (id, updatedFields) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can edit warnings.", "warning");
      return;
    }
    setWarnings(prev => prev.map(w => w.id === id ? { ...w, ...updatedFields } : w));
    logActivity(`Updated warning details #${id}`, "Warnings");
    showToast("Warning details updated successfully.");
  };

  const updateDischargedMember = async (id, updatedFields) => {
    setDischargedMembers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
    logActivity(`Updated discharged record #${id}`, "Members");
    showToast("Discharged member record updated.");
  };

  const reinstateMember = async (id) => {
    const mem = dischargedMembers.find(d => d.id === id);
    if (!mem) return;
    setDischargedMembers(prev => prev.filter(d => d.id !== id));
    setMembers(prev => [
      ...prev,
      {
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
      }
    ]);
    logActivity(`Reinstated member back to active team: ${mem.name}`, "Members");
    showToast(`${mem.name} reinstated back to active team.`);
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
    setEvents(prev => [...prev, evt]);
    logActivity(`Created event: ${evt.title}`, "Events", `${evt.type} on ${evt.date}`);
    showToast(`Event "${evt.title}" created successfully.`);
  };

  const updateEvent = async (id, updatedFields) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can edit events.", "warning");
      return;
    }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    logActivity(`Updated event: ${updatedFields.title || id}`, "Events");
    showToast("Event updated successfully.");
  };

  const deleteEvent = async (id) => {
    if (currentUser?.role !== "HR Head" && currentUser?.role !== "HR Vice Head") {
      showToast("Only HR Leadership can remove events.", "warning");
      return;
    }
    const evt = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
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
    setMonitoringNotes(prev => [newNote, ...prev]);
    logActivity(`Logged monitoring note for: ${mem ? mem.name : 'member'}`, "Monitoring", `Category: ${category}`);
    showToast(`Monitoring note logged for ${mem ? mem.name : 'member'}`);
  };

  const updateMonitoringNote = async (id, updatedFields) => {
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
        return { ...n, ...updatedFields, ...memberDetails };
      }
      return n;
    }));
    logActivity(`Updated monitoring note #${id}`, "Monitoring");
    showToast("Monitoring note updated.");
  };

  const deleteMonitoringNote = async (id) => {
    setMonitoringNotes(prev => prev.filter(n => n.id !== id));
    logActivity(`Deleted monitoring note #${id}`, "Monitoring");
    showToast("Monitoring note deleted.");
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
    setSystemUsers(prev => [...prev, newUser]);
    showToast(`New user ${name} (${role}) added to credentials database.`);
  };

  const updateSystemUser = async (id, updated) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    if (currentUser && currentUser.username === updated.username) {
      setCurrentUser(prev => ({ ...prev, name: updated.name, role: updated.role }));
    }
    showToast(`Credentials updated for ${updated.name}.`);
  };

  const deleteSystemUser = async (id) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id));
    showToast("User login removed.");
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

    setSystemUsers(prev => prev.map(u => u.username === currentUser.username ? { ...u, name, username, password: newPassword || u.password, avatar: finalAvatar } : u));
    showToast("Profile updated successfully.");
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
