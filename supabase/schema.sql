-- ==============================================================================
-- AASTMT ADMISSIONS HR SUITE - SMART VILLAGE CAMPUS
-- SUPABASE POSTGRESQL SCHEMA & SEED DATA MIGRATION
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP EXISTING TABLES (IF CLEAN RE-BUILD NEEDED)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS star_ambassadors CASCADE;
DROP TABLE IF EXISTS disciplinary_warnings CASCADE;
DROP TABLE IF EXISTS join_requests CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;

-- 3. CREATE TABLES

-- System Users & Credentials (Accessible for HR Vice Head management)
CREATE TABLE system_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Cleartext/Hashed for HR Vice Head Console
    role TEXT NOT NULL CHECK (role IN ('HR', 'HR Head', 'HR Vice Head', 'Admission''s Dean')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Admissions Team Members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('HR', 'PR', 'Operations', 'Digital Transformation', 'Innovation', 'Vice President', 'President')),
    position TEXT NOT NULL CHECK (position IN ('Member', 'Vice Head', 'Head')),
    college TEXT NOT NULL,
    term INT NOT NULL DEFAULT 1,
    extra_days INT NOT NULL DEFAULT 0,
    attendance_rate NUMERIC(5,2) DEFAULT 100.0,
    strikes INT DEFAULT 0,
    score INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Star Admissions Ambassadors (Multi-member recognition)
CREATE TABLE star_ambassadors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    award_title TEXT NOT NULL,
    citation TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Attendance Sessions
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('Normal Day Shift', 'Official Meeting', 'Special Open Day')),
    present_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual Attendance Roll Calls
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disciplinary & Warnings Log
CREATE TABLE disciplinary_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('First Verbal Warning', 'Official Written Strike', 'Final Hearing Notice')),
    reason TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('Confirmed Strike', 'Pending HR Approval')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Join Requests & Student Applications
CREATE TABLE join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    college TEXT NOT NULL,
    term INT NOT NULL,
    target_role TEXT NOT NULL,
    interview_schedule TEXT,
    interview_venue TEXT DEFAULT 'Smart Village - Meeting Room 007',
    status TEXT NOT NULL DEFAULT 'Pending Schedule' CHECK (status IN ('Pending Schedule', 'Interview Scheduled')),
    hr_recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Public Anon Read/Write for prototype demo integration)
CREATE POLICY "Public Read System Users" ON system_users FOR SELECT USING (true);
CREATE POLICY "Public Write System Users" ON system_users FOR ALL USING (true);

CREATE POLICY "Public Read Members" ON members FOR SELECT USING (true);
CREATE POLICY "Public Write Members" ON members FOR ALL USING (true);

CREATE POLICY "Public Read Star Ambassadors" ON star_ambassadors FOR SELECT USING (true);
CREATE POLICY "Public Write Star Ambassadors" ON star_ambassadors FOR ALL USING (true);

CREATE POLICY "Public Read Attendance Sessions" ON attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Public Write Attendance Sessions" ON attendance_sessions FOR ALL USING (true);

CREATE POLICY "Public Read Attendance Records" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Public Write Attendance Records" ON attendance_records FOR ALL USING (true);

CREATE POLICY "Public Read Warnings" ON disciplinary_warnings FOR SELECT USING (true);
CREATE POLICY "Public Write Warnings" ON disciplinary_warnings FOR ALL USING (true);

CREATE POLICY "Public Read Join Requests" ON join_requests FOR SELECT USING (true);
CREATE POLICY "Public Write Join Requests" ON join_requests FOR ALL USING (true);

-- 6. INITIAL SEED DATA

-- Insert System Accounts
INSERT INTO system_users (name, username, password, role) VALUES
('Omar Farouk', 'omar.farouk', '123', 'HR Vice Head'),
('Tarek Hegazy', 'tarek.hegazy', '123', 'HR Head'),
('Sarah Mostafa', 'sarah.hr', '123', 'HR'),
('Prof. Dr. Admissions Dean', 'dean', '123', 'Admission''s Dean');

-- Insert Initial Team Members
INSERT INTO members (id, name, role, position, college, term, extra_days, attendance_rate, strikes, score) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Youssef El-Sayed', 'President', 'Head', 'Engineering & Tech', 8, 5, 98.0, 0, 95),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Malak Nour', 'Vice President', 'Vice Head', 'Management & Tech', 6, 4, 96.0, 0, 92),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Karim Hassan', 'PR', 'Head', 'Computing & IT', 6, 3, 92.0, 1, 87),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Farida Ahmed', 'Operations', 'Member', 'Logistics & Transport', 4, 2, 95.0, 0, 90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Ahmed Sherif', 'Digital Transformation', 'Head', 'Computing & IT', 6, 4, 91.0, 1, 84),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Laila Wael', 'Innovation', 'Member', 'Law', 4, 1, 85.0, 2, 74);

-- Insert Star Admissions Ambassadors
INSERT INTO star_ambassadors (member_id, award_title, citation) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lead Admissions Ambassador of the Month', 'Spearheaded orientation tours for 120+ prospective parents with zero scheduling conflicts.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Operations Champion', 'Volunteered for 3 non-scheduled weekend open day shifts at the Smart Village registration booth.');

-- Insert Attendance Sessions
INSERT INTO attendance_sessions (id, title, date, session_type, present_count, total_count) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Registration Hall - Sunday Shift', '2026-09-20', 'Normal Day Shift', 6, 6),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'General Assembly & Briefing', '2026-09-17', 'Official Meeting', 5, 6),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Thanaweya Amma Admissions Expo', '2026-09-12', 'Special Open Day', 6, 6);

-- Insert Disciplinary Warnings
INSERT INTO disciplinary_warnings (member_id, level, reason, reported_by, date, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Official Written Strike', 'Unexcused absence from assigned registration desk during peak admission hours.', 'Omar Farouk (HR Vice Head)', '2026-09-18', 'Confirmed Strike'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'First Verbal Warning', 'Failure to wear formal AASTMT admissions pin during parent VIP campus tour.', 'Sarah Mostafa (HR)', '2026-09-15', 'Pending HR Approval');

-- Insert Join Requests
INSERT INTO join_requests (name, college, term, target_role, interview_schedule, interview_venue, status, hr_recommendation) VALUES
('Nouran Adel', 'Computing & IT', 3, 'PR', '2026-09-25 at 11:30 AM', 'Smart Village - Meeting Room 007', 'Interview Scheduled', NULL),
('Mostafa Tamer', 'Engineering & Tech', 4, 'Operations', NULL, NULL, 'Pending Schedule', 'Recommended Accept (by Sarah Mostafa)'),
('Hania Reda', 'Management & Tech', 2, 'Digital Transformation', '2026-09-26 at 01:00 PM', 'Smart Village - Meeting Room 007', 'Interview Scheduled', NULL);
