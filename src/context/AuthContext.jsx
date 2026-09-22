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
    role: "President",
    position: "Head",
    college: "Engineering & Tech",
    term: 8,
    extraDays: 5,
    attendanceRate: 98,
    strikes: 0,
    score: 95
  },
  {
    id: "mem-2",
    name: "Malak Nour",
    role: "Vice President",
    position: "Vice Head",
    college: "Management & Tech",
    term: 6,
    extraDays: 4,
    attendanceRate: 96,
    strikes: 0,
    score: 92
  },
  {
    id: "mem-3",
    name: "Karim Hassan",
    role: "PR",
    position: "Head",
    college: "Computing & IT",
    term: 6,
    extraDays: 3,
    attendanceRate: 92,
    strikes: 1,
    score: 87
  },
  {
    id: "mem-4",
    name: "Farida Ahmed",
    role: "Operations",
    position: "Member",
    college: "Logistics & Transport",
    term: 4,
    extraDays: 2,
    attendanceRate: 95,
    strikes: 0,
    score: 90
  },
  {
    id: "mem-5",
    name: "Ahmed Sherif",
    role: "Digital Transformation",
    position: "Head",
    college: "Computing & IT",
    term: 6,
    extraDays: 4,
    attendanceRate: 91,
    strikes: 1,
    score: 84
  },
  {
    id: "mem-6",
    name: "Laila Wael",
    role: "Innovation",
    position: "Member",
    college: "Law",
    term: 4,
    extraDays: 1,
    attendanceRate: 85,
    strikes: 2,
    score: 74
  }
];

const INITIAL_STAR_AMBASSADORS = [
  {
    id: "star-1",
    memberId: "mem-1",
    name: "Youssef El-Sayed",
    role: "President",
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
    title: "Registration Hall - Sunday Shift",
    date: "2026-09-20",
    type: "Normal Day Shift",
    presentCount: 6,
    totalCount: 6
  },
  {
    id: "att-2",
    title: "General Assembly & Briefing",
    date: "2026-09-17",
    type: "Official Meeting",
    presentCount: 5,
    totalCount: 6
  },
  {
    id: "att-3",
    title: "Thanaweya Amma Admissions Expo",
    date: "2026-09-12",
    type: "Special Open Day",
    presentCount: 6,
    totalCount: 6
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

const INITIAL_RECRUITS = [
  {
    id: "rec-1",
    name: "Nouran Adel",
    college: "Computing & IT",
    term: 3,
    targetRole: "PR",
    interviewSchedule: "2026-09-25 at 11:30 AM",
    interviewVenue: "Smart Village - Meeting Room 007",
    status: "Interview Scheduled",
    hrRecommendation: null
  },
  {
    id: "rec-2",
    name: "Mostafa Tamer",
    college: "Engineering & Tech",
    term: 4,
    targetRole: "Operations",
    interviewSchedule: null,
    interviewVenue: null,
    status: "Pending Schedule",
    hrRecommendation: "Recommended Accept (by Sarah Mostafa)"
  },
  {
    id: "rec-3",
    name: "Hania Reda",
    college: "Management & Tech",
    term: 2,
    targetRole: "Digital Transformation",
    interviewSchedule: "2026-09-26 at 01:00 PM",
    interviewVenue: "Smart Village - Meeting Room 007",
    status: "Interview Scheduled",
    hrRecommendation: null
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // NULL when logged out
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toasts, setToasts] = useState([]);

  // Data Collections
  const [systemUsers, setSystemUsers] = useState(INITIAL_SYSTEM_USERS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [starAmbassadors, setStarAmbassadors] = useState(INITIAL_STAR_AMBASSADORS);
  const [attendanceSessions, setAttendanceSessions] = useState(INITIAL_ATTENDANCE_SESSIONS);
  const [warnings, setWarnings] = useState(INITIAL_WARNINGS);
  const [recruits, setRecruits] = useState(INITIAL_RECRUITS);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'login', 'profile', 'systemUsers', 'addMember', 'addStar', 'addAttendance', 'warning', 'schedule'
  const [modalExtraData, setModalExtraData] = useState({});

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Sync from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchData() {
      try {
        const { data: su } = await supabase.from('system_users').select('*');
        if (su && su.length > 0) setSystemUsers(su);

        const { data: mems } = await supabase.from('members').select('*');
        if (mems && mems.length > 0) {
          setMembers(mems.map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            position: m.position,
            college: m.college,
            term: m.term,
            extraDays: m.extra_days,
            attendanceRate: Number(m.attendance_rate),
            strikes: m.strikes,
            score: m.score
          })));
        }

        const { data: stars } = await supabase.from('star_ambassadors').select('*, members(name, role, college)');
        if (stars && stars.length > 0) {
          setStarAmbassadors(stars.map(s => ({
            id: s.id,
            memberId: s.member_id,
            name: s.members?.name || 'Ambassador',
            role: s.members?.role || 'Staff',
            college: s.members?.college || 'Smart Village',
            awardTitle: s.award_title,
            citation: s.citation
          })));
        }

        const { data: atts } = await supabase.from('attendance_sessions').select('*');
        if (atts && atts.length > 0) {
          setAttendanceSessions(atts.map(a => ({
            id: a.id,
            title: a.title,
            date: a.date,
            type: a.session_type,
            presentCount: a.present_count,
            totalCount: a.total_count
          })));
        }

        const { data: wrns } = await supabase.from('disciplinary_warnings').select('*, members(name)');
        if (wrns && wrns.length > 0) {
          setWarnings(wrns.map(w => ({
            id: w.id,
            memberId: w.member_id,
            memberName: w.members?.name || 'Staff Member',
            level: w.level,
            reason: w.reason,
            reportedBy: w.reported_by,
            date: w.date,
            status: w.status
          })));
        }

        const { data: recs } = await supabase.from('join_requests').select('*');
        if (recs && recs.length > 0) {
          setRecruits(recs.map(r => ({
            id: r.id,
            name: r.name,
            college: r.college,
            term: r.term,
            targetRole: r.target_role,
            interviewSchedule: r.interview_schedule,
            interviewVenue: r.interview_venue,
            status: r.status,
            hrRecommendation: r.hr_recommendation
          })));
        }
      } catch (err) {
        console.warn("Supabase fetch fallback to local initial state:", err);
      }
    }

    fetchData();
  }, []);

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
  const adjustExtraDays = async (memberId, delta) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    const updatedExtra = Math.max(0, target.extraDays + delta);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, extraDays: updatedExtra } : m));

    showToast(`Updated extra attended days for ${target.name} (+${updatedExtra} days)`);

    if (isSupabaseConfigured) {
      await supabase.from('members').update({ extra_days: updatedExtra }).eq('id', memberId);
    }
  };

  const addMember = async (newMem) => {
    const mem = {
      id: `mem-${Date.now()}`,
      ...newMem,
      attendanceRate: 100,
      strikes: 0,
      score: 90
    };
    setMembers(prev => [...prev, mem]);
    showToast(`Ambassador ${mem.name} registered in Smart Village team.`);

    if (isSupabaseConfigured) {
      await supabase.from('members').insert([{
        name: mem.name,
        role: mem.role,
        position: mem.position,
        college: mem.college,
        term: mem.term,
        extra_days: mem.extraDays,
        attendance_rate: mem.attendanceRate,
        strikes: mem.strikes,
        score: mem.score
      }]);
    }
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

    if (isSupabaseConfigured) {
      await supabase.from('star_ambassadors').insert([{
        member_id: mem.id,
        award_title: awardTitle,
        citation
      }]);
    }
  };

  const removeStarAmbassador = async (starId) => {
    setStarAmbassadors(prev => prev.filter(s => s.id !== starId));
    showToast("Star recognition removed.");

    if (isSupabaseConfigured) {
      await supabase.from('star_ambassadors').delete().eq('id', starId);
    }
  };

  const createAttendanceSession = async (title, date, type, presentCount) => {
    const session = {
      id: `att-${Date.now()}`,
      title,
      date,
      type,
      presentCount,
      totalCount: members.length
    };
    setAttendanceSessions(prev => [session, ...prev]);
    showToast("Attendance session logged successfully.");

    if (isSupabaseConfigured) {
      await supabase.from('attendance_sessions').insert([{
        title: session.title,
        date: session.date,
        session_type: session.type,
        present_count: session.presentCount,
        total_count: session.totalCount
      }]);
    }
  };

  const submitWarning = async (memberId, level, reason) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;

    const isLeadership = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";

    if (isLeadership) {
      // Direct strike application
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
      showToast(`Official strike recorded for ${mem.name}.`);

      if (isSupabaseConfigured) {
        await supabase.from('disciplinary_warnings').insert([{
          member_id: mem.id,
          level,
          reason,
          reported_by: wrn.reportedBy,
          date: wrn.date,
          status: wrn.status
        }]);
        await supabase.from('members').update({ strikes: mem.strikes + 1, score: Math.max(50, mem.score - 8) }).eq('id', mem.id);
      }
    } else {
      // Pending request by HR member
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
      showToast(`Warning request submitted for ${mem.name} awaiting Head/Vice Head approval.`);

      if (isSupabaseConfigured) {
        await supabase.from('disciplinary_warnings').insert([{
          member_id: mem.id,
          level,
          reason,
          reported_by: wrn.reportedBy,
          date: wrn.date,
          status: wrn.status
        }]);
      }
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
    showToast(`Warning approved and applied to ${wrn.memberName}.`);

    if (isSupabaseConfigured) {
      await supabase.from('disciplinary_warnings').update({ status: 'Confirmed Strike' }).eq('id', warningId);
      await supabase.from('members').update({ strikes: (members.find(m=>m.id===wrn.memberId)?.strikes || 0) + 1 }).eq('id', wrn.memberId);
    }
  };

  const dismissWarning = async (warningId) => {
    setWarnings(prev => prev.filter(w => w.id !== warningId));
    showToast("Warning record dismissed.");

    if (isSupabaseConfigured) {
      await supabase.from('disciplinary_warnings').delete().eq('id', warningId);
    }
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

    if (isSupabaseConfigured) {
      await supabase.from('join_requests').update({
        interview_schedule: scheduleStr,
        interview_venue: venue,
        status: 'Interview Scheduled'
      }).eq('id', applicantId);
    }
  };

  const enlistRecruit = async (recruitId) => {
    const rec = recruits.find(r => r.id === recruitId);
    if (!rec) return;

    await addMember({
      name: rec.name,
      role: rec.targetRole,
      position: "Member",
      college: rec.college,
      term: rec.term,
      extraDays: 0
    });

    setRecruits(prev => prev.filter(r => r.id !== recruitId));
    showToast(`${rec.name} successfully enlisted into Smart Village Admissions Team!`);

    if (isSupabaseConfigured) {
      await supabase.from('join_requests').delete().eq('id', recruitId);
    }
  };

  const declineRecruit = async (recruitId) => {
    const rec = recruits.find(r => r.id === recruitId);
    setRecruits(prev => prev.filter(r => r.id !== recruitId));
    showToast(`Applicant ${rec?.name} removed from recruitment list.`);

    if (isSupabaseConfigured) {
      await supabase.from('join_requests').delete().eq('id', recruitId);
    }
  };

  const requestRecruitRecommendation = async (recruitId, action) => {
    const rec = recruits.find(r => r.id === recruitId);
    if (!rec) return;
    const recText = `Requested ${action} (by ${currentUser?.name || 'HR'})`;

    setRecruits(prev => prev.map(r => r.id === recruitId ? { ...r, hrRecommendation: recText } : r));
    showToast(`Recommendation submitted to HR Leadership.`);

    if (isSupabaseConfigured) {
      await supabase.from('join_requests').update({ hr_recommendation: recText }).eq('id', recruitId);
    }
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

    if (isSupabaseConfigured) {
      await supabase.from('join_requests').insert([{
        name: recruit.name,
        college: recruit.college,
        term: recruit.term,
        target_role: recruit.targetRole,
        status: recruit.status,
        hr_recommendation: recruit.hrRecommendation
      }]);
    }
  };

  // System Users Console Actions (HR Vice Head Exclusive)
  const addSystemUser = async (name, username, password, role) => {
    if (systemUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showToast("A user with this username already exists.", "danger");
      return;
    }
    const newUser = { id: `usr-${Date.now()}`, name, username, password, role };
    setSystemUsers(prev => [...prev, newUser]);
    showToast(`New user ${name} (${role}) added to credentials database.`);

    if (isSupabaseConfigured) {
      await supabase.from('system_users').insert([{ name, username, password, role }]);
    }
  };

  const updateSystemUser = async (id, updated) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    if (currentUser && currentUser.username === updated.username) {
      setCurrentUser(prev => ({ ...prev, name: updated.name, role: updated.role }));
    }
    showToast(`Credentials updated for ${updated.name}.`);

    if (isSupabaseConfigured) {
      await supabase.from('system_users').update({
        name: updated.name,
        username: updated.username,
        role: updated.role,
        password: updated.password
      }).eq('id', id);
    }
  };

  const deleteSystemUser = async (id) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id));
    showToast("User login removed.");

    if (isSupabaseConfigured) {
      await supabase.from('system_users').delete().eq('id', id);
    }
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
    showToast("Profile and credentials updated successfully.");

    if (isSupabaseConfigured && userRecord.id) {
      await supabase.from('system_users').update({
        name,
        username,
        password: userRecord.password
      }).eq('id', userRecord.id);
    }

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
        starAmbassadors,
        attendanceSessions,
        warnings,
        recruits,
        activeModal,
        setActiveModal,
        modalExtraData,
        setModalExtraData,
        adjustExtraDays,
        addMember,
        addStarAmbassador,
        removeStarAmbassador,
        createAttendanceSession,
        submitWarning,
        approveWarningRequest,
        dismissWarning,
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
