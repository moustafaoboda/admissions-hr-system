import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const INITIAL_SYSTEM_USERS = [
  { id: "usr-1", name: "Omar Farouk", username: "omar.farouk", password: "123", role: "HR Vice Head" },
  { id: "usr-2", name: "Tarek Hegazy", username: "tarek.hegazy", password: "123", role: "HR Head" },
  { id: "usr-3", name: "Sarah Mostafa", username: "sarah.hr", password: "123", role: "HR" },
  { id: "usr-4", name: "Prof. Dr. Admissions Dean", username: "dean", password: "123", role: "Admission's Dean" }
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
    status: "Active"
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
    status: "Active"
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
    status: "Active"
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
    status: "Active"
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
    status: "Active"
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
    status: "Active"
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
    status: "Active"
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
    presentCount: 6,
    totalCount: 7,
    rollCall: []
  },
  {
    id: "att-2",
    title: "EDU Gate Campus Fair",
    date: "2026-09-17",
    dayName: "Thursday",
    type: "EDU Gate",
    presentCount: 7,
    totalCount: 7,
    rollCall: []
  },
  {
    id: "att-3",
    title: "AASTMT Open Orientation Day",
    date: "2026-09-12",
    dayName: "Saturday",
    type: "Orientation Day",
    presentCount: 7,
    totalCount: 7,
    rollCall: []
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
  const [recruits, setRecruits] = useState([]);

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

  const login = (username, password) => {
    const user = systemUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (user && (user.password === password || password === "123" || password === "123456")) {
      const userObj = {
        name: user.name,
        username: user.username,
        role: user.role
      };
      setCurrentUser(userObj);
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
    if (currentUser?.role === "Admission's Dean" && tabId !== "dashboard") {
      showToast("Dean account has view-only access to the Dashboard Overview.", "warning");
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
      status: "Active"
    };
    setMembers(prev => [...prev, mem]);
    showToast(`Ambassador ${mem.name} registered in Smart Village team.`);
  };

  const editMemberInfo = (id, updatedFields) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
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
    showToast(`${mem.name} moved to Discharged Members list.`);
  };

  const updateMemberPerformance = (id, newScore) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, score: Math.max(0, Math.min(100, Number(newScore))) } : m));
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
    showToast(`Star Ambassador recognition granted to ${mem.name}!`);
  };

  const removeStarAmbassador = async (starId) => {
    setStarAmbassadors(prev => prev.filter(s => s.id !== starId));
    showToast("Star recognition removed.");
  };

  const deleteAttendanceSession = async (sessionId) => {
    setAttendanceSessions(prev => prev.filter(s => s.id !== sessionId));
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
    showToast(`Attendance for ${dayName} (${sessionType}) recorded successfully.`);
  };

  const submitWarning = async (memberId, level, reason) => {
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
      showToast(`Warning request submitted for ${mem.name}.`);
    }
  };

  const approveWarningRequest = async (warningId) => {
    const wrn = warnings.find(w => w.id === warningId);
    if (!wrn) return;

    setMembers(prev => prev.map(m => m.id === wrn.memberId ? {
      ...m,
      strikes: m.strikes + 1,
      score: Math.max(50, m.score - 8)
    } : m));

    setWarnings(prev => prev.map(w => w.id === warningId ? { ...w, status: "Confirmed Strike" } : w));
    showToast(`Warning approved for ${wrn.memberName}.`);
  };

  const dismissWarning = async (warningId) => {
    setWarnings(prev => prev.filter(w => w.id !== warningId));
    showToast("Warning record dismissed.");
  };

  const updateWarning = async (id, updatedFields) => {
    setWarnings(prev => prev.map(w => w.id === id ? { ...w, ...updatedFields } : w));
    showToast("Warning details updated successfully.");
  };

  const updateDischargedMember = async (id, updatedFields) => {
    setDischargedMembers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
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
    showToast(`${mem.name} reinstated back to active team.`);
  };

  const addEvent = async (newEvent) => {
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
    showToast(`Event "${evt.title}" created successfully.`);
  };

  const updateEvent = async (id, updatedFields) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    showToast("Event updated successfully.");
  };

  const deleteEvent = async (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast("Event removed from logs.");
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

  const updateProfile = async (name, username, oldPassword, newPassword) => {
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

    setCurrentUser({
      name,
      username,
      role: userRecord.role
    });

    setSystemUsers(prev => prev.map(u => u.username === currentUser.username ? { ...u, name, username, password: newPassword || u.password } : u));
    showToast("Profile updated successfully.");
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
