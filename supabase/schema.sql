-- ==============================================================================
-- AASTMT ADMISSIONS HR SUITE - SMART VILLAGE CAMPUS
-- SUPABASE POSTGRESQL SCHEMA & SEED DATA MIGRATION (UPDATED)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables for clean migration
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS star_ambassadors CASCADE;
DROP TABLE IF EXISTS disciplinary_warnings CASCADE;
DROP TABLE IF EXISTS join_requests CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;

-- System Users & Credentials (Accessible for HR Vice Head management)
CREATE TABLE system_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('HR', 'HR Head', 'HR Vice Head', 'Admission''s Dean')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active & Discharged Admissions Team Members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PR', 'HR', 'Operations', 'Digital Transformation', 'Innovation')),
    position TEXT NOT NULL CHECK (position IN ('Member', 'Vice Head', 'Head')),
    college TEXT NOT NULL, -- Includes Arts & Design
    student_id TEXT DEFAULT '2024000',
    phone TEXT DEFAULT '+20 100 000 0000',
    attendance_count INT DEFAULT 0,
    official_days TEXT[] DEFAULT ARRAY['Sunday', 'Tuesday', 'Thursday'],
    strikes INT DEFAULT 0, -- WARNINGS
    score INT DEFAULT 90, -- Performance Score (Editable)
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged')),
    discharge_type TEXT CHECK (discharge_type IN ('Voluntary Left', 'Discharged')),
    discharge_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Star Admissions Ambassadors
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
    day_name TEXT NOT NULL, -- Saturday to Thursday mapping
    session_type TEXT NOT NULL CHECK (session_type IN ('Normal Day', 'Double Attendance', 'Triple Attendance', 'Orientation Day', 'EDU Gate', 'Event Day')),
    present_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual Attendance Roll Calls & Excuses
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT TRUE,
    is_excused BOOLEAN DEFAULT FALSE,
    excuse_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warnings Log
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

-- Join Requests & Candidate Applications
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
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

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

-- Initial System Accounts
INSERT INTO system_users (name, username, password, role) VALUES
('Omar Farouk', 'omar.farouk', '123', 'HR Vice Head'),
('Tarek Hegazy', 'tarek.hegazy', '123', 'HR Head'),
('Sarah Mostafa', 'sarah.hr', '123', 'HR'),
('Prof. Dr. Admissions Dean', 'dean', '123', 'Admission''s Dean');

-- Initial Active Members
INSERT INTO members (id, name, role, position, college, student_id, phone, attendance_count, official_days, strikes, score, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Youssef El-Sayed', 'Operations', 'Head', 'Engineering & Tech', '2023101', '+20 100 111 2233', 14, ARRAY['Sunday', 'Tuesday', 'Thursday'], 0, 95, 'Active'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Malak Nour', 'PR', 'Vice Head', 'Management & Tech', '2023102', '+20 101 222 3344', 12, ARRAY['Saturday', 'Monday', 'Wednesday'], 0, 92, 'Active'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Karim Hassan', 'PR', 'Head', 'Computing & IT', '2023103', '+20 102 333 4455', 10, ARRAY['Sunday', 'Monday', 'Wednesday'], 1, 87, 'Active'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Farida Ahmed', 'Operations', 'Member', 'Logistics & Transport', '2024104', '+20 103 444 5566', 11, ARRAY['Sunday', 'Tuesday', 'Thursday'], 0, 90, 'Active'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Ahmed Sherif', 'Digital Transformation', 'Head', 'Computing & IT', '2023105', '+20 104 555 6677', 9, ARRAY['Saturday', 'Tuesday', 'Thursday'], 1, 84, 'Active'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Laila Wael', 'Innovation', 'Member', 'Law', '2024106', '+20 105 666 7788', 7, ARRAY['Monday', 'Wednesday'], 2, 74, 'Active'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Nour El-Din', 'HR', 'Member', 'Arts & Design', '2024107', '+20 106 777 8899', 8, ARRAY['Saturday', 'Sunday', 'Tuesday'], 0, 89, 'Active');
