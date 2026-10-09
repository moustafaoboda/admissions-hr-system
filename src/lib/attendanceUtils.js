/**
 * Calculates a member's attendance rate (%) dynamically based on attendance sessions roll calls.
 * If sessions exist where this member was scheduled, calculates: (attended / scheduled) * 100.
 * If no session roll calls exist for this member, falls back to member.attendanceCount.
 */
export function getMemberAttendanceRate(member, attendanceSessions = []) {
  if (!member) return 0;

  const memSessions = (attendanceSessions || []).filter(s =>
    Array.isArray(s.rollCall) && s.rollCall.some(rc => rc.memberId === member.id)
  );

  if (memSessions.length > 0) {
    const presentCount = memSessions.filter(s =>
      s.rollCall.some(rc => rc.memberId === member.id && rc.isPresent)
    ).length;
    return Math.round((presentCount / memSessions.length) * 100);
  }

  const count = Number(member.attendanceCount) || 0;
  if (count <= 0) return 0;
  const benchmark = (attendanceSessions && attendanceSessions.length > 0) ? attendanceSessions.length : 12;
  return Math.min(100, Math.round((count / benchmark) * 100));
}
