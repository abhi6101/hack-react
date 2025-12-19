# Hack-2-Hired: Quick Features Summary

## 🎯 What is Hack-2-Hired?
A comprehensive **Placement Portal** with AI-powered resume analysis, built with React.js and Spring Boot, designed to streamline campus recruitment for students, administrators, and companies.

---

## ⚡ Key Highlights

### For Students
- 🤖 **AI Resume Analyzer** - Get instant ATS scores and job-specific feedback
- 💼 **Smart Job Portal** - Auto-filtered by your branch & semester
- 📄 **Resume Builder** - Create professional PDFs instantly
- 📊 **Personal Dashboard** - Track applications with visual analytics
- 🎯 **Interview Prep** - Access drives, papers, quizzes, and resources
- ✅ **One-Click Apply** - Submit applications with resume & cover letter

### For Admins
- 👥 **5-Tier Access Control** - USER, ADMIN, SUPER_ADMIN, COMPANY_ADMIN, DEPT_ADMIN
- 📈 **Analytics Dashboard** - Company stats, student activity, placement rates
- 📧 **Automated Emails** - SendGrid integration with professional templates
- 🏢 **Multi-Department** - Bulk creation and management
- ✔️ **Profile Verification** - ID card, Aadhar, Admit card approval
- 📋 **Application Management** - Status updates with email notifications

### For Companies
- 🎯 **Company Portal** - Post jobs and manage applications
- 📊 **Company Analytics** - Track hiring metrics
- 🔒 **Data Isolation** - Access only your company's data
- 📅 **Interview Scheduling** - Manage rounds and slots

---

## 🔢 By The Numbers

| Metric | Count |
|--------|-------|
| **User Roles** | 5 |
| **Frontend Pages** | 22 |
| **Backend Controllers** | 25 |
| **Backend Services** | 12 |
| **REST API Endpoints** | 80+ |
| **Database Tables** | 15+ |
| **Email Templates** | 6+ |
| **Quiz Subjects** | 7 |
| **Security Features** | 10+ |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, React Router, Recharts, CSS3 Glassmorphism  
**Backend:** Spring Boot 3, Spring Security 6, JWT, PostgreSQL, SendGrid  
**AI:** Ollama (Llama 2/Mistral), Apache PDFBox  
**Deployment:** Vercel/Render (Frontend), Render (Backend), Supabase (DB)

---

## 🌟 Unique Features

1. **Iron Dome Profile Guard** - Forces profile completion before access
2. **Hybrid AI Architecture** - Cloud app + local AI for privacy
3. **Smart Eligibility Filtering** - Automatic job filtering by branch/semester
4. **Interview Round Integration** - Jobs linked to interview schedules
5. **Automated Email Workflows** - Status updates, job alerts, invitations
6. **Multi-Tier Admin System** - Granular permission control
7. **Real-Time Application Tracking** - Live status updates
8. **Document Verification System** - Admin approval workflow

---

## 🔐 Security Features

✅ JWT Authentication  
✅ BCrypt Password Hashing  
✅ Role-Based Access Control (RBAC)  
✅ Token Blacklisting  
✅ CORS Protection  
✅ Input Validation (Frontend + Backend)  
✅ SQL Injection Prevention  
✅ XSS Attack Prevention  
✅ File Upload Security  
✅ HTTPS Encryption  

---

## 📱 Main Features List

### Authentication & Profile
- Email OTP verification
- Password reset with OTP
- Profile completion guard
- Branch/semester management
- Document verification (ID, Aadhar, Admit)

### Job Management
- Create/edit/delete jobs
- Interview rounds configuration
- Eligibility criteria (branches/semesters)
- Application tracking
- Status management with emails

### Applications
- One-click apply with resume
- Cover letter support
- Status tracking (Pending, Shortlisted, Accepted, Rejected)
- Email notifications
- Admin review and updates

### Interview System
- Interview drive creation
- Slot booking
- Application management
- Multi-round configuration
- Email invitations

### AI Resume Analysis
- Upload PDF for analysis
- ATS score (0-100)
- Job-specific matching
- Gap analysis
- Skill recommendations

### Resources
- Previous year papers (Sem 1-8)
- Quiz system (7 subjects)
- Interview experiences
- Educational videos
- Gallery (placement photos)

### Admin Tools
- User management (CRUD)
- Department management (bulk creation)
- Global email settings
- Company statistics
- Student activity monitoring
- CSV exports

### Analytics
- Visual dashboards (Recharts)
- Application statistics
- Placement rates
- Company-wise metrics
- Student success rates

---

## 🚀 Deployment Architecture

```
┌─────────────────┐
│  Vercel/Render  │  ← React Frontend (24/7)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Render Cloud   │  ← Spring Boot Backend (24/7)
└────────┬────────┘
         │
         ├──→ Supabase (PostgreSQL Database)
         ├──→ SendGrid (Email Service)
         └──→ Ngrok Tunnel → Local Machine (Ollama AI)
```

---

## 📧 Email Notifications

- ✉️ Job posting alerts to eligible students
- ✉️ Application status updates
- ✉️ Interview invitations with details
- ✉️ Account verification OTPs
- ✉️ Password reset OTPs
- ✉️ Acceptance/rejection emails

---

## 🎨 UI/UX Features

- 🌙 Dark mode with glassmorphism
- 🎭 Smooth animations and transitions
- 📱 Fully responsive (mobile/tablet/desktop)
- 🎨 Neon accents and vibrant colors
- 📊 Interactive charts and graphs
- ⚡ Fast loading with lazy loading
- 🔔 Toast notifications
- 💫 Micro-interactions

---

## 📝 Complete Documentation

For detailed feature documentation, see: **[WEBSITE_FEATURES.md](./WEBSITE_FEATURES.md)**

---

**Project Status:** ✅ Production Ready  
**Last Updated:** December 2025  
**Total LOC:** ~50,000+ (Frontend + Backend)
