-- ==============================================================================
-- AASTMT ADMISSIONS HR SUITE - SMART VILLAGE CAMPUS
-- SUPABASE POSTGRESQL SCHEMA & REALTIME SYNC CONFIGURATION
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
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;

-- 1. System Users & Credentials (Managed by HR Vice Head)
CREATE TABLE system_users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('HR', 'HR Head', 'HR Vice Head', 'Admission''s Dean')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Team Members (Active & Discharged)
CREATE TABLE members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name TEXT,
    role TEXT,
    college TEXT,
    award_title TEXT NOT NULL,
    citation TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance Sessions
CREATE TABLE attendance_sessions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    day_name TEXT NOT NULL,
    session_type TEXT NOT NULL,
    present_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    roll_call JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Individual Roll Call Records (Optional relational backup)
CREATE TABLE attendance_records (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    session_id TEXT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT TRUE,
    is_excused BOOLEAN DEFAULT FALSE,
    excuse_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Disciplinary Warnings & Strike Requests
CREATE TABLE disciplinary_warnings (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    level TEXT NOT NULL,
    reason TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Field Monitoring Notes
CREATE TABLE monitoring_notes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

-- 9. Events & Orientations
CREATE TABLE events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Orientations',
    status TEXT DEFAULT 'Active',
    description TEXT,
    location TEXT DEFAULT 'Smart Village Campus',
    date DATE DEFAULT CURRENT_DATE,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. System Global Settings (System Logo / Icon Branding)
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Join Requests & Candidates
CREATE TABLE join_requests (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    college TEXT NOT NULL,
    term INT NOT NULL,
    target_role TEXT NOT NULL,
    interview_schedule TEXT,
    interview_venue TEXT DEFAULT 'Smart Village - Meeting Room 007',
    status TEXT NOT NULL DEFAULT 'Pending Schedule',
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
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All System Users" ON system_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Star Ambassadors" ON star_ambassadors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Attendance Sessions" ON attendance_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Attendance Records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Warnings" ON disciplinary_warnings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Monitoring Notes" ON monitoring_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Activity Logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All System Settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Join Requests" ON join_requests FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime replication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE system_users;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE star_ambassadors;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE disciplinary_warnings;
ALTER PUBLICATION supabase_realtime ADD TABLE monitoring_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE join_requests;

-- Seed System Accounts
INSERT INTO system_users (id, name, username, password, role, avatar) VALUES
('usr-1', 'Omar Farouk', 'omar.farouk', '123', 'HR Vice Head', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
('usr-2', 'Tarek Hegazy', 'tarek.hegazy', '123', 'HR Head', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'),
('usr-3', 'Sarah Mostafa', 'sarah.hr', '123', 'HR', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'),
('usr-4', 'Prof. Dr. Admissions Dean', 'dean', '123', 'Admission''s Dean', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80');

-- Seed Team Members
INSERT INTO members (id, name, role, position, college, student_id, phone, attendance_count, official_days, strikes, score, status, avatar) VALUES
('mem-1', 'Youssef El-Sayed', 'Operations', 'Head', 'Engineering & Tech', '2023101', '+20 100 111 2233', 14, ARRAY['Sunday', 'Tuesday', 'Thursday'], 0, 95, 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'),
('mem-2', 'Malak Nour', 'PR', 'Vice Head', 'Management & Tech', '2023102', '+20 101 222 3344', 12, ARRAY['Saturday', 'Monday', 'Wednesday'], 0, 92, 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
('mem-3', 'Karim Hassan', 'PR', 'Head', 'Computing & IT', '2023103', '+20 102 333 4455', 10, ARRAY['Sunday', 'Monday', 'Wednesday'], 1, 87, 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80'),
('mem-4', 'Farida Ahmed', 'Operations', 'Member', 'Logistics & Transport', '2024104', '+20 103 444 5566', 11, ARRAY['Sunday', 'Tuesday', 'Thursday'], 0, 90, 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'),
('mem-5', 'Ahmed Sherif', 'Digital Transformation', 'Head', 'Computing & IT', '2023105', '+20 104 555 6677', 9, ARRAY['Saturday', 'Tuesday', 'Thursday'], 1, 84, 'Active', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'),
('mem-6', 'Laila Wael', 'Innovation', 'Member', 'Law', '2024106', '+20 105 666 7788', 7, ARRAY['Monday', 'Wednesday'], 2, 74, 'Active', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80'),
('mem-7', 'Nour El-Din', 'HR', 'Member', 'Arts & Design', '2024107', '+20 106 777 8899', 8, ARRAY['Saturday', 'Sunday', 'Tuesday'], 0, 89, 'Active', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80');

-- Seed Discharged Member
INSERT INTO members (id, name, role, position, college, student_id, phone, status, discharge_type, discharge_reason, avatar) VALUES
('dis-1', 'Hassan Mahmoud', 'PR', 'Member', 'Management & Tech', '2022099', '+20 109 888 7766', 'Discharged', 'Voluntary Left', 'Graduated and relocated to Alexandria.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80');



-- Seed System Setting (Default Anchor Icon)
INSERT INTO system_settings (key, value) VALUES
('system_icon', '{"type": "icon", "value": "fa-anchor", "imageUrl": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
