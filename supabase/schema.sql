-- ==============================================================================
-- AASTMT ADMISSIONS HR SUITE - SMART VILLAGE CAMPUS
-- SUPABASE POSTGRESQL SCHEMA & SEED DATA MIGRATION
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables for clean migration
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS star_ambassadors CASCADE;
DROP TABLE IF EXISTS disciplinary_warnings CASCADE;
DROP TABLE IF EXISTS join_requests CASCADE;
DROP TABLE IF EXISTS monitoring_notes CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;

-- 1. System Users & Credentials (Managed by HR Vice Head)
CREATE TABLE system_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('HR', 'HR Head', 'HR Vice Head', 'Admission''s Dean')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Team Members (Active & Discharged)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PR', 'HR', 'Operations', 'Digital Transformation', 'Innovation')),
    position TEXT NOT NULL CHECK (position IN ('Member', 'Vice Head', 'Head')),
    college TEXT NOT NULL,
    student_id TEXT DEFAULT '2024000',
    phone TEXT DEFAULT '+20 100 000 0000',
    attendance_count INT DEFAULT 0,
    official_days TEXT[] DEFAULT ARRAY['Sunday', 'Tuesday', 'Thursday'],
    extra_days INT DEFAULT 0,
    strikes INT DEFAULT 0,
    score INT DEFAULT 90,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged')),
    discharge_type TEXT CHECK (discharge_type IN ('Voluntary Left', 'Discharged')),
    discharge_reason TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Star Admissions Ambassadors
CREATE TABLE star_ambassadors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    award_title TEXT NOT NULL,
    citation TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance Sessions
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    day_name TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('Normal Day', 'Double Attendance', 'Triple Attendance', 'Orientation Day', 'EDU Gate', 'Event Day')),
    present_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Individual Roll Call Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT TRUE,
    is_excused BOOLEAN DEFAULT FALSE,
    excuse_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Disciplinary Warnings & Strike Requests
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

-- 7. Field Monitoring Notes
CREATE TABLE monitoring_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name TEXT,
    member_role TEXT,
    member_college TEXT,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    category TEXT NOT NULL,
    note TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Activity & Audit Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    details TEXT,
    is_starred BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Global Settings (System Logo / Icon)
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Join Requests & Candidates
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

-- Row Level Security (RLS) Policies
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All System Users" ON system_users FOR ALL USING (true);
CREATE POLICY "Allow All Members" ON members FOR ALL USING (true);
CREATE POLICY "Allow All Star Ambassadors" ON star_ambassadors FOR ALL USING (true);
CREATE POLICY "Allow All Attendance Sessions" ON attendance_sessions FOR ALL USING (true);
CREATE POLICY "Allow All Attendance Records" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow All Warnings" ON disciplinary_warnings FOR ALL USING (true);
CREATE POLICY "Allow All Monitoring Notes" ON monitoring_notes FOR ALL USING (true);
CREATE POLICY "Allow All Activity Logs" ON activity_logs FOR ALL USING (true);
CREATE POLICY "Allow All System Settings" ON system_settings FOR ALL USING (true);
CREATE POLICY "Allow All Join Requests" ON join_requests FOR ALL USING (true);

-- Seed System Accounts
INSERT INTO system_users (name, username, password, role, avatar) VALUES
('Omar Farouk', 'omar.farouk', '123', 'HR Vice Head', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
('Tarek Hegazy', 'tarek.hegazy', '123', 'HR Head', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'),
('Sarah Mostafa', 'sarah.hr', '123', 'HR', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'),
('Prof. Dr. Admissions Dean', 'dean', '123', 'Admission''s Dean', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80');

-- Seed Team Members
INSERT INTO members (id, name, role, position, college, student_id, phone, attendance_count, official_days, strikes, score, status, avatar) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Youssef El-Sayed', 'Operations', 'Head', 'Engineering & Tech', '2023101', '+20 100 111 2233', 14, ARRAY['Sunday', 'Tuesday', 'Thursday'], 0, 95, 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Malak Nour', 'PR', 'Vice Head', 'Management & Tech', '2023102', '+20 101 222 3344', 12, ARRAY['Saturday', 'Monday', 'Wednesday'], 0, 92, 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Karim Hassan', 'PR', 'Head', 'Computing & IT', '2023103', '+20 102 333 4455', 10, ARRAY['Sunday', 'Monday', 'Wednesday'], 1, 87, 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Farida Ahmed', 'Operations', 'Member', 'Logistics & Transport', '2024104', '+20 103 444 5566', 11, ARRAY['Sunday', 'Tuesday', 'Thursday'], 0, 90, 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Ahmed Sherif', 'Digital Transformation', 'Head', 'Computing & IT', '2023105', '+20 104 555 6677', 9, ARRAY['Saturday', 'Tuesday', 'Thursday'], 1, 84, 'Active', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Laila Wael', 'Innovation', 'Member', 'Law', '2024106', '+20 105 666 7788', 7, ARRAY['Monday', 'Wednesday'], 2, 74, 'Active', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Nour El-Din', 'HR', 'Member', 'Arts & Design', '2024107', '+20 106 777 8899', 8, ARRAY['Saturday', 'Sunday', 'Tuesday'], 0, 89, 'Active', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80');

-- Seed Discharged Member
INSERT INTO members (id, name, role, position, college, student_id, phone, status, discharge_type, discharge_reason, avatar) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Hassan Mahmoud', 'PR', 'Member', 'Management & Tech', '2022099', '+20 109 888 7766', 'Discharged', 'Voluntary Left', 'Graduated and relocated to Alexandria.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80');

-- Seed Star Ambassador
INSERT INTO star_ambassadors (member_id, award_title, citation) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ambassador of the Month', 'Exceptional leadership across all Smart Village admissions desks.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Operations Champion', 'Volunteered for 3 non-scheduled weekend open day shifts.');
