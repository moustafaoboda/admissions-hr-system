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

/**
 * Calculates a member's attendance rate (%) dynamically based on attendance sessions roll calls.
 * If sessions exist where this member was scheduled, calculates: (attended / scheduled) * 100.
 * If no session roll calls exist for this member, falls back to member.attendanceCount.
 */
export function getMemberAttendanceRate(member, attendanceSessions = []) {
  if (!member) return 0;

  const memId = member.id;
  const memUuid = getMemberUuid(memId);

  const memSessions = (attendanceSessions || []).filter(s =>
    Array.isArray(s.rollCall) && s.rollCall.some(rc => rc.memberId === memId || rc.memberId === memUuid || getMemberUuid(rc.memberId) === memUuid)
  );

  if (memSessions.length > 0) {
    const presentCount = memSessions.filter(s =>
      s.rollCall.some(rc => (rc.memberId === memId || rc.memberId === memUuid || getMemberUuid(rc.memberId) === memUuid) && rc.isPresent)
    ).length;
    return Math.round((presentCount / memSessions.length) * 100);
  }

  const count = Number(member.attendanceCount) || 0;
  if (count <= 0) return 0;
  const benchmark = (attendanceSessions && attendanceSessions.length > 0) ? attendanceSessions.length : 12;
  return Math.min(100, Math.round((count / benchmark) * 100));
}
