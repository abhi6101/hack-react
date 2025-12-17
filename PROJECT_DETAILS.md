# Hack-2-Hired: Placement Portal Project Overview

## 1. Project Features

### For Students (Role: USER)
*   **Secure Authentication**: Sign up and Log in with Email OTP verification. Password reset functionality via generic email OTP.
*   **Dashboard**: Personalized dashboard showing application stats using chart visualizations.
*   **Profile Management**: Update personal details, branch (`MCA`, `BCA`, `IMCA`), and semester. Automated profile prompts ensure data is up-to-date for eligibility logic.
*   **Job Portal**:
    *   **Smart Filtering**: Jobs are automatically filtered based on the student's *Branch* and *Semester* eligibility.
    *   **Application System**: One-click application process with Resume upload (PDF) and Cover Letter support.
    *   **Application Tracking**: View status of applied jobs (`PENDING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).
*   **Resume Builder**: Interactive tool to build and download professional resumes.
*   **Resources**: Access to previous year placement papers, interview experiences, and educational videos.
*   **Gallery**: View placement drive photos in an interactive gallery.
*   **Interview Preparation**: Access detailed interview rounds and questions posted by companies.

### For Administrators (Role: ADMIN)
*   **Global Dashboard**: Comprehensive analytics (Total Users, Jobs, Applications, Placement Rates) with graphical trends.
*   **User Management**: View all registered users, manage roles, and enable/disable accounts.
*   **Job Management**: Create, Edit, and Delete job postings. Define eligibility criteria (Allowed Branches/Semesters).
*   **Application Management**: View all applications, download resumes, and update application statuses (e.g., Select/Reject candidates). Status updates trigger automatic emails to students.
*   **Content Management**: Manage Gallery images (Upload/Delete), Interview experiences, and Resources.
*   **Company Management**: Create "Company Admin" accounts restricted to specific organizations.

### For Company HR (Role: COMPANY_ADMIN)
*   **Company Dashboard**: Analytics specific to their company's postings.
*   **Job Posting**: Post new openings specifically for their company.
*   **Application Review**: View and manage applications *only* for their company's jobs. Segregated access ensures data privacy.
*   **Interview Scheduling**: Post interview details and schedules.

---

## 2. Technology Stack

### Frontend (Client-Side)
*   **Framework**: **React.js** (v18+) with Functional Components and Hooks.
*   **Build Tool**: **Vite** for fast development and optimized production builds.
*   **Routing**: **React Router DOM** (v6) for seamless client-side navigation.
*   **Styling**:
    *   **Vanilla CSS3**: Custom "Glassmorphism" design system (Dark Mode, Neon accents, Translucent surfaces).
    *   **Responsive Design**: Mobile-first approach using Flexbox/Grid and Media Queries.
*   **HTTP Client**: **Fetch API** (with custom interceptors for Token management).
*   **Icons**: FontAwesome (`react-icons` or CDN).

### Backend (Server-Side)
*   **Framework**: **Java Spring Boot 3.x** (REST API Architecture).
*   **Security**: **Spring Security 6** with **JWT (JSON Web Tokens)**.
*   **Database Access**: **Spring Data JPA** (Hibernate ORM).
*   **Database**: **PostgreSQL** (Production-grade Relational Database).
*   **Email Service**: **SendGrid API** integration for reliable transactional emails (OTP, Notifications).
*   **Input Validation**: **Jakarta Validation (Hibernate Validator)** for ensuring data integrity.
*   **Build Tool**: **Maven**.

### Infrastructure & Deployment
*   **Frontend Hosting**: **Render** (Static Site Hosting).
*   **Backend Hosting**: **Render** (Web Service with Docker/Native Java runtime).
*   **Database Hosting**: **Supabase** (Managed PostgreSQL).
*   **Version Control**: **Git** & **GitHub**.

---

## 3. User Roles & Access Control (RBAC)

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **USER** | Level 1 | Standard student access. Can view eligible jobs, apply, and manage own profile. Cannot see admin data. |
| **COMPANY_ADMIN** | Level 2 | Restricted Admin. Access limited to data (Jobs/Applications) strictly related to their assigned `Company Name`. Cannot manage other companies or global settings. |
| **ADMIN** | Level 3 | Super User. Full access to all data, settings, user management, and global analytics. |

---

## 4. Security Implementation Details

### authentication & Authorization
*   **JWT (JSON Web Token)**: Stateless authentication. Upon login, a signed JWT containing the Subject (Username) and List of Permissions (Roles) is issued.
*   **Request Filtering**: A custom `JwtFilter` intercepts every HTTP request to validate `Authorization: Bearer <token>` headers before the request reaches Controllers.
*   **Statelessness**: The server does not maintain session state, ensuring scalability (Server restarts do not "lose" sessions, provided the Secret Key is persistent).

### Data Protection
*   **Password Hashing**: User passwords are **never** stored in plain text. They are hashed using **BCrypt**, an industry-standard adaptive hashing function.
*   **Token Blacklisting**: Implementation of a `BlacklistedTokenRepository`. When a user logs out, their token is explicitly saved to a blacklist table, preventing it from being reused even if it hasn't expired yet.
*   **Input Sanitization**: Backend DTOs use `@NotBlank`, `@Email`, and custom validation logic to prevent SQL Injection and XSS attacks via malformed input.

### Access Control
*   **Method-Level Security**: Usage of `@PreAuthorize("hasRole('ADMIN')")` annotations on Controller endpoints ensures that even if a user guesses a URL, they cannot execute the action without the correct role.
*   **Data Isolation**: Logic in `JobController` and `JobApplicationController` explicitly checks `Principal.getName()` vs `resource.owner` to prevent Horizontal Privilege Escalation (e.g., Company A accessing Company B's applicants).

### Network Security
*   **CORS (Cross-Origin Resource Sharing)**: Strictly configured `CorsConfigurationSource` to allow requests *only* from the trusted Frontend domain (`hack-2-hired.onrender.com`) and Localhost (for dev), blocking unauthorized external calls.
*   **HTTPS**: All Deployment traffic is encrypted via SSL/TLS on Render.

### Reliability
*   **Transactional Integrity**: Critical data operations (e.g., Reading large text files, Saving Applications) are wrapped in `@Transactional` contexts to ensure Atomicity and consistenoy (ACID compliance).
