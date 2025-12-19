# AI-Based Resume Analyzer - System Design Document

**Status**: Design Phase  
**Author**: AntiGravity (AI Assistant)  
**Date**: 2025-12-17

---

## 1. Overview

This document outlines the architecture and design for an offline, AI-powered Resume Analyzer system. The system allows users to upload resumes, which are then processed by a local AI engine (Ollama) to extract skills, analyze strengths/weaknesses, and match them against job descriptions. It features a secure Spring Boot backend, temporary file storage for privacy and performance, and role-based access control (including a VIP tier).

---

## 2. System Architecture

### High-Level Architecture Diagram

```mermaid
flowchart TD
    %% Nodes
    User[React Frontend]
    Backend[Spring Boot Backend]
    Security[Security Layer (JWT)]
    TempStorage[Temporary Storage (Local FS)]
    Parser[Resume Parser]
    AI[Ollama AI Engine (Offline)]
    DB[(MySQL Database)]
    Admin[Admin Panel]

    %% Connections
    User -->|1. Upload Resume (PDF/DOC)| Backend
    Backend -->|2. Validate Auth & Role| Security
    Security -->|Authorized| Backend
    Backend -->|3. Store File Temporarily| TempStorage
    Backend -->|4. Extract Text| Parser
    Parser -->|Text Content| AI
    
    subgraph AI_Processing [AI Analysis]
        AI -->|Generate: Skills, Score, Suggestions| AI
    end
    
    AI -->|5. Return Analysis JSON| Backend
    Backend -->|6. Save Results| DB
    Backend -->|7. API Response/Dashboard| User
    
    Admin -->|Create VIP Users| DB
```

### Component Breakdown

1.  **React Frontend (Client-Side)**
    *   **Tech**: React.js (Vite/CRA), Axios/Fetch, CSS Modules/Tailwind.
    *   **Function**: Single Page Application (SPA) for seamless user experience. Handles file selection, progress bars during upload, and dynamic rendering of the analysis JSON (charts, scorecards).

2.  **Spring Boot Backend**
    *   **Tech**: Java Spring Boot 3.x.
    *   **Function**: Central orchestrator. Handles HTTP requests, file uploads, invokes AI services, and manages database transactions.

3.  **Security Layer**
    *   **Tech**: Spring Security + JWT (JSON Web Tokens).
    *   **Function**: Ensures stateless authentication.
    *   **Roles**:
        *   `ROLE_USER`: Standard access (limited uploads).
        *   `ROLE_VIP`: Admin-created. Faster processing, more detailed feedback.
        *   `ROLE_ADMIN`: System management.

4.  **Temporary Storage**
    *   **Tech**: Local Server File System (e.g., `/temp/resumes/`).
    *   **Function**: Holds resume files briefly during processing. Files are deleted or archived after extraction to ensure privacy and save space.

5.  **Ollama AI Engine (Offline)**
    *   **Tech**: Ollama (running Llama 2, Mistral, or similar).
    *   **Function**: Local LLM inference.
    *   **Tasks**:
        *   Extract skills and entities.
        *   Calculate match percentage with Job Descriptions.
        *   Generate natural language suggestions for improvement.

6.  **Database**
    *   **Tech**: MySQL / PostgreSQL.
    *   **Data Models**:
        *   `Users` (Credentials, Roles).
        *   `ResumeAnalysis` (JSON results, Scores, Timestamp).
        *   `JobMatches` (Linked jobs and relevance scores).

---

## 3. Detailed Data Flow

1.  **Upload**: User uploads a resume via the secure web dashboard.
2.  **Validation**: Server verifies the User's JWT token and Role (checking for VIP status).
3.  **Storage**: The file is saved to a restricted standard temporary directory.
4.  **Extraction**: The backend reads the file and converts PDF/DOC content into raw text.
5.  **AI Analysis**:
    *   Backend sends the raw text + target Job Description to the Ollama API (localhost).
    *   Ollama processes the context and returns a structured JSON response containing:
        *   *Skills Found*
        *   *Missing Skills*
        *   *Strength/Weakness formatting*
        *   *Overall Score (0-100)*
6.  **Persistence**: The JSON result is parsed and stored in the database, linked to the User ID.
7.  **Presentation**: The frontend fetches the analysis and renders a dashboard with charts and actionable insights.

---

## 4. Role-Based Access Control (RBAC) Details

*   **Standard USER**:
    *   Can upload and analyze resumes for generally "Standard" analysis depth.
    *   Result includes basic score and top 5 missing skills.
    
*   **VIP User (Admin Created)**:
    *   **Feature Flag**: `is_vip = true`.
    *   **Benefits**:
        *   Deep-dive analysis (tone, formatting checks).
        *   Higher priority in AI processing queue (if implemented).
        *   Unlimited history of past analyses.

*   **ADMIN**:
    *   Can manually grant VIP status to users.
    *   View system-wide stats on AI usage.

---

## 5. Viva & Presentation Guide

**Key Explanation Line:**
> "The system utilizes a secure Spring Boot backend to manage interactions between the user and an offline Ollama AI engine. It employs temporary local storage for efficient file processing and persists structured analysis results in a relational database, ensuring data rights management via role-based security."

**Why this Architecture?**
*   **Privacy**: Offline AI (Ollama) means user data never leaves the server to 3rd party APIs like OpenAI.
*   **Performance**: Temporary storage avoids bloating the database with large binary files (BLOBs).
*   **Scalability**: The modular design allows the AI engine to be moved to a separate microservice if load increases.

---

## 6. Implementation Keywords (Master Prompt)

When ready to implement, use this context:
> "Design a Spring Boot service that accepts a MultipartFile, saves it to a temporary path, extracts text using Apache PDFBox, sends the text to a local Ollama instance (port 11434), parses the JSON response, and ties it to a User entity with a One-To-Many relationship."

