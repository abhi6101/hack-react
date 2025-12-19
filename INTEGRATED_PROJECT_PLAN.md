# Hack-2-Hired: Placement Portal with AI Resume Analyzer
**Integrated System Design Document**

## 1. Project Overview
The **Hack-2-Hired** platform is a comprehensive Placement Portal designed to streamline the recruitment process for students, administrators, and companies. 

**New Major Feature**: The system now integrates an **Offline AI Resume Analyzer** (powered by Ollama). This feature allows students to receive instant, detailed feedback on their resumes, including compatibility scores for specific job roles, directly within their dashboard.

---

## 2. Integrated Feature Set

### 🎓 For Students (Role: USER)
*   **AI Resume Analyzer (NEW)**: 
    *   **Instant Feedback**: Upload a resume (PDF) and get an immediate "ATS Score" (0-100).
    *   **Job Matching**: Select a target job role (e.g., "Java Developer") to see how well the resume matches the specific description.
    *   **Gap Analysis**: AI highlights missing skills and suggests specific improvements.
    *   **Offline Privacy**: Analysis happens on the secure server; personal data never leaves the system.
*   **Smart Dashboard**: Visual analytics of application status and now **Resume Performance Trends** over time.
*   **Job Portal**: 
    *   Apply to jobs with one click using the analyzed resume.
    *   Auto-filter jobs based on eligible Branch/Semester.
*   **Profile Management**: Academic details, skills, and resume versions.
*   **Resources & Prep**: Access placement papers, interview experiences, and educational videos.

### 🛡️ For Administrators (Role: ADMIN)
*   **AI Usage Analytics (NEW)**: Monitor how many resumes are being analyzed and the system load on the AI engine.
*   **VIP User Management (NEW)**: Ability to grant "Premium/VIP" status to specific students, giving them priority processing or deeper AI insights.
*   **Global Dashboard**: Overview of total users, active jobs, placement rates, and application volumes.
*   **User & Content Management**: Manage students, companies, gallery images, and learning resources.

### 🏢 For Company HR (Role: COMPANY_ADMIN)
*   **Smart Candidate Filtering (NEW)**: (Future Scope) Ability to filter applicants based on their AI-generated resume score.
*   **Job Posting**: Create job listings with specific descriptions that the AI uses for matching.
*   **Application Management**: Review applicants for their specific postings.

---

## 3. Technology Stack (Enhanced)

### Frontend (React.js)
*   **Framework**: **React 18** (Vite)
*   **UI Library**: Custom Glassmorphism CSS + **Recharts** (for Resume Score visualization).
*   **State Management**: React Hooks / Context API.
*   **Communication**: Axios (handling Multipart File Uploads for resumes).

### Backend (Spring Boot + AI)
*   **Core Framework**: **Java Spring Boot 3.x**
*   **Security**: Spring Security + **JWT** (Stateless Auth).
*   **Database**: **PostgreSQL** (User Data, Jobs) + **MySQL** (Resume Analysis Logs - *Optional separation*).
*   **AI Engine**: **Ollama** (Running locally on the server).
    *   *Model*: Llama 2 / Mistral / TinyLlama (optimized for offline CPU usage).
*   **Resume Parsing**: **Apache PDFBox** (Text extraction).
*   **Email**: SendGrid API.

---

## 4. System Architecture & Data Flow

### Integrated Usage Flow
1.  **Student Login**: User logs into the React Dashboard.
2.  **Navigation**: User clicks "Resume Analysis" in the sidebar.
3.  **Upload**: User uploads `resume.pdf` + selects a specific Job Post (optional).
4.  **Processing (Backend)**:
    *   Spring Boot receives the file.
    *   **Temp Storage**: File is saved to `C:/temp/uploads/`.
    *   **Text Extraction**: PDFBox extracts raw text.
    *   **AI Request**: Spring Boot sends Prompt + Resume Text to **Ollama** (running on port 11434).
5.  **AI Response**:
    *   Ollama returns JSON: `{ "score": 85, "missing_skills": ["Docker", "Kubernetes"], "summary": "Good foundation..." }`.
6.  **Database**: Result is saved to the `resume_analysis` table linked to the `User`.
7.  **Display**: React Frontend updates to show a "Score Gauge" and a checklist of improvements.

---

## 5. Security & Access Control (Updated)

| Role | Access Level | New AI Capabilities |
| :--- | :--- | :--- |
| **USER** | Level 1 | Can upload 5 resumes/day for Basic Analysis. |
| **VIP USER** | Level 1+ | **Unlimited** uploads, **Deep Analysis** (Formatting check + Tone analysis). |
| **ADMIN** | Level 3 | Can view system-wide AI performance and grant VIP status. |

---

## 6. Implementation Roadmap

1.  **Phase 1: Foundation (Current Status)**
    *   Auth, Job Posting, Basic Dashboard (Done).
2.  **Phase 2: AI Integration (Next Step)**
    *   Install generic Ollama service on backend server.
    *   Create `ResumeService.java` to handle PDF parsing and Ollama API calls.
    *   Create React UI for "Upload & Analyze".
3.  **Phase 3: Optimization**
    *   Implement async processing (WebSockets) so the user doesn't wait during analysis.
    *   Add VIP tier logic.

---

## 7. Hybrid Deployment Strategy (Cost-Optimized)

To balance **high performance AI** requirements with **zero-cost hosting**, this project utilizes a **Hybrid Edge-Cloud Architecture**.

### Architecture Components
1.  **Cloud Layer (Render.com)**:
    *   Hosts the **React Frontend** and **Spring Boot Backend**.
    *   **Always On**: Ensures the main website (Login, Jobs, Dashboard) is accessible 24/7 from anywhere.
    *   **Resource**: Low CPU/RAM (Sufficient for web traffic).

2.  **Edge AI Node (Local Machine)**:
    *   Hosts the **Ollama AI Engine**.
    *   **On-Demand**: Handles the heavy computational load of resume analysis.
    *   **Resource**: High CPU/RAM (Required for LLM inference).

3.  **Secure Tunneling (Ngrok)**:
    *   Establishes a secure, encrypted tunnel (`https://xyz.ngrok-free.app`) connecting the *Public Cloud Backend* to the *Private Local AI Node*.
    *   Allows the Spring Boot cloud server to send resume text to the local computer for processing.

### ⚠️ Operational Constraint (The "Always-On" Factor)
Since the AI processing happens on the Local Machine:
*   **The AI features (Resume Analysis) are only available when the Local Machine is powered on and running Ngrok.**
*   **Fallback Mechanism**: If the local machine is off, the Spring Boot Backend detects the timeout and gracefully notifies the user: *"AI Service is currently offline. Please try again later."*
*   The rest of the portal (Jobs, Profile, Applications) remains fully functional 24/7.

