# Codebase Audit & Error Report
**Date:** December 18, 2025
**Project:** Fully Frontend React (Placement Portal)

This document outlines the specific errors, architectural flaws, and maintenance risks identified during the code analysis of the `fully-frontend-react` project.

## 1. Critical & Logical Errors
These are issues that may cause immediate runtime failures, security vulnerabilities, or unpredictable behavior.

### A. Missing Authorization Headers (Security Risk)
**File:** `src/pages/AdminDashboard.jsx` (Line 122)
```javascript
fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-drives')
    .then(res => res.json())
```
**The Error:**
This `fetch` call is missing the `Authorization` header containing the JWT token.
**Impact:**
- If the backend protects this endpoint (which is standard for admin data), this request will fail with a `401 Unauthorized` error.
- Unlike other calls in the file (e.g., `loadApplications` at Line 135), this one tries to access data anonymously.

### B. Stale Data Fallback Risk
**File:** `src/pages/AdminDashboard.jsx` (Line 127-128)
```javascript
.catch(() => {
    // Fallback
    const stored = localStorage.getItem('interviews');
    if (stored) setInterviews(JSON.parse(stored));
});
```
**The Error:**
The code silently catches fetch errors and falls back to `localStorage`.
**Impact:**
- If the API fails, the Admin will see **old/stale data** without a clear warning that they are disconnected. They might try to edit an interview slot that no longer exists on the server.

### C. Hardcoded Production URLs (Deployment Error)
**Files:** `App.jsx`, `AdminDashboard.jsx`, `emailService.js`, `keepAliveService.js`
**The Error:**
The backend URL `https://placement-portal-backend-nwaj.onrender.com` is hardcoded as a string in **over 10 different locations**.
**Impact:**
- **Development Broken:** You cannot easily switch to `localhost:8080` for testing.
- **Fragile:** If the render URL changes, the app breaks completely until every single file is manually updated.
- **Inconsistency:** Some calls might point to an old URL if one instance is missed during an update.

### D. API Specification Mismatch
**File:** `src/pages/AdminDashboard.jsx` vs `BACKEND_API_SPECS.md`
**The Error:**
The frontend code calls endpoints that do NOT match the official Backend API Specifications.
- **Spec:** `GET /api/job-applications/all` (Line 31 of SPECS)
- **Code:** `GET /api/admin/job-applications` (Line 135 of AdminDashboard.jsx)

**Impact:**
- Unless the backend has implemented *both* routes, one of these is wrong. If the backend follows the Spec, the Frontend Admin Dashboard will fail to load applications (404 Not Found).

---

## 2. Architectural & Maintainability Codes
These are "Code Smells" that make the application difficult to work with.

### A. The "God Component" Anti-Pattern
**File:** `src/pages/AdminDashboard.jsx`
**The Error:**
This single file is **1,768 lines long** and handles four completely different domains:
1. Job Management (CRUD)
2. User Management (CRUD)
3. Interview Drive Management
4. Gallery/Content Management
5. Global Settings

**Impact:**
- **High Cognitive Load:** It is nearly impossible to debug specific features without scrolling through 1000+ lines of unrelated code.
- **State Pollution:** There are over 20 `useState` hooks defined at the top level. A re-render caused by a "Typing in Job Title" action could theoretically affect the performance of the entire dashboard.

### B. Inline API Logic
**File:** `src/pages/AdminDashboard.jsx`
**The Error:**
API logic (fetching, parsing, error handling) is written directly inside UI event handlers (`handleSubmit`, `useEffect`).
**Impact:**
- **No Reusability:** If another page needs to "Load Jobs" (e.g., the Student Dashboard), the logic must be copy-pasted.
- **Testing Difficulty:** You cannot unit test the "Job Service" logic independently of the React Component.

---

## 3. Recommended Fixes (Action Plan)

1.  **Centralize Configuration:**
    Create a `src/config.js` file to export the `API_BASE_URL`.
    ```javascript
    export const API_BASE_URL = "https://placement-portal-backend-nwaj.onrender.com";
    ```
2.  **Create API Service Layer:**
    Move all `fetch` calls to `src/services/api.js`.
    ```javascript
    export const fetchJobs = (token) => fetch(`${API_BASE_URL}/api/admin/jobs`, ...);
    ```
3.  **Refactor AdminDashboard:**
    Break the file into sub-components:
    - `src/components/admin/AdminJobs.jsx` 
    - `src/components/admin/AdminUsers.jsx` 
    - `src/components/admin/AdminInterviews.jsx`
