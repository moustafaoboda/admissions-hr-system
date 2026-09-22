# ⚓ AASTMT Admissions HR Suite - Smart Village Campus

> **Production-Ready Full-Stack HR Management Portal** built for the Arab Academy for Science, Technology and Maritime Transport (AASTMT) Admissions Office at Smart Village Campus.

---

## 🌟 Key Features & Role-Based Access Matrix

| Feature / Module | HR Vice Head | HR Head | HR Member | Admission's Dean |
| :--- | :---: | :---: | :---: | :---: |
| **Users & Passwords Console** | ✅ Full Access (Cleartext & Change) | ❌ Restricted | ❌ Restricted | ❌ Restricted |
| **Dashboard Overview** | ✅ Read & Manage | ✅ Read & Manage | ✅ Read & Manage | 👁️ Read-Only Notice |
| **Star Admissions Ambassadors** | ✅ Assign & Remove | ✅ Assign & Remove | 👁️ View Only | 👁️ View Only |
| **Team Directory & Extra Days** | ✅ Full Edit (+/- Days) | ✅ Full Edit (+/- Days) | ✅ Full Edit (+/- Days) | 👁️ View Only |
| **Disciplinary & Strikes** | ⚡ Direct Issue Strike | ⚡ Direct Issue Strike | 📩 Request Approval | ❌ Restricted |
| **Join Requests & Room 007** | 📅 Schedule & Enlist | 📅 Schedule & Enlist | ✍️ Recommend | ❌ Restricted |
| **AI HR Copilot (Gemini)** | ✅ Unlimited Access | ✅ Unlimited Access | ✅ Unlimited Access | ❌ Restricted |

---

## 🏗️ Technology Stack

- **Frontend**: Vite + React 18
- **Styling**: Tailwind CSS + Custom AASTMT Navy (`#002244`) & Gold (`#c59b27`) Design Tokens
- **Icons**: Font Awesome 6 Pro
- **Backend Database**: Supabase PostgreSQL + Row Level Security (RLS)
- **AI Integration**: Gemini 3 Flash Preview API
- **Deployment**: Vercel SPA Hosting

---

## 📂 Project Directory Structure

```
.
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
├── README.md
├── supabase/
│   └── schema.sql
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── context/
    │   └── AuthContext.jsx
    ├── lib/
    │   ├── supabaseClient.js
    │   └── gemini.js
    └── components/
        ├── Header.jsx
        ├── Navigation.jsx
        ├── Toast.jsx
        ├── modals/
        │   ├── LoginModal.jsx
        │   ├── ProfileModal.jsx
        │   ├── AddMemberModal.jsx
        │   ├── AddStarModal.jsx
        │   ├── AddAttendanceModal.jsx
        │   ├── WarningModal.jsx
        │   ├── ScheduleModal.jsx
        │   └── SystemUsersModal.jsx
        └── tabs/
            ├── DashboardTab.jsx
            ├── DirectoryTab.jsx
            ├── AttendanceTab.jsx
            ├── WarningsTab.jsx
            ├── RecruitmentTab.jsx
            └── CopilotTab.jsx
```

---

## 🗄️ Step 1: Supabase Database Setup

1. Create a free project at [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Copy and execute the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon public` key

---

## 💻 Step 2: Local Setup & Configuration

1. **Clone or navigate to project directory**:
   ```bash
   cd "P:\Software Projects\Admission's HR System"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```

---

## 🐙 Step 3: Git & GitHub Setup

Execute the following commands in your terminal to initialize version control and push to GitHub:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all files
git add .

# 3. Commit changes
git commit -m "feat: Initial refactoring of AASTMT Admissions HR Suite to full-stack Vite React Supabase app"

# 4. Create and push to GitHub using GitHub CLI (gh)
gh repo create aastmt-admissions-hr --public --source=. --remote=origin --push

# (OR manually add remote if using standard Git)
# git remote add origin https://github.com/your-username/aastmt-admissions-hr.git
# git branch -M main
# git push -u origin main
```

---

## 🚀 Step 4: Vercel Production Deployment

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Deploy to Vercel
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? Your Account
# ? Link to existing project? No
# ? Project name? aastmt-admissions-hr
# ? Directory? ./
# ? Build Command? npm run build
# ? Output Directory? dist

# Set Environment Variables in Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# Deploy to Production
vercel --prod
```

### Option B: Using Vercel Web Dashboard

1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **Import Repository** and select `aastmt-admissions-hr`.
4. Configure Framework Preset: **Vite**.
5. Build Command: `npm run build`, Output Directory: `dist`.
6. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
7. Click **Deploy**.

---

## 🔐 Initial Demo Accounts

| Name | Role | Username | Password |
| :--- | :--- | :--- | :--- |
| Omar Farouk | **HR Vice Head** | `omar.farouk` | `123` |
| Tarek Hegazy | **HR Head** | `tarek.hegazy` | `123` |
| Sarah Mostafa | **HR** | `sarah.hr` | `123` |
| Prof. Dr. Admissions Dean | **Admission's Dean** | `dean` | `123` |
