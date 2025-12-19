# Step-by-Step Implementation Guide: AI Resume Analyzer

This guide explains exactly how to build the **Hybrid AI Feature** where your laptop acts as the AI engine for your Cloud Website.

---

## 🛠️ Step 1: Prepare Your Laptop (The "AI Server")

You need to set up your laptop to handle the AI requests.

1.  **Download Ollama**:
    *   Go to [ollama.com](https://ollama.com) and download it for Windows/Mac.
    *   Install it.
2.  **Download an AI Model**:
    *   Open your terminal (CMD/PowerShell).
    *   Run command: `ollama run llama3.2` (or `mistral`).
    *   *Wait for it to download (approx 4GB).*
3.  **Test it**:
    *   In the terminal, type "Hello". If AI replies, it's working.
4.  **Install Ngrok (The Tunnel)**:
    *   Go to [ngrok.com](https://ngrok.com) and sign up (free).
    *   Download and install Ngrok.
    *   Connect your account: `ngrok config add-authtoken <YOUR_TOKEN>`.

---

## 💻 Step 2: Update Spring Boot Backend

You need to teach your backend how to talk to your laptop.

1.  **Add Dependencies (`pom.xml`)**:
    *   Add **Apache PDFBox** (to read PDF files).
    *   Add **WebClient** (or RestTemplate) to make HTTP calls.
2.  **Create `ResumeAnalysisService.java`**:
    *   **Function 1 (`extractText`)**: Takes the uploaded PDF and converts it to a String.
    *   **Function 2 (`analyzeWithAI`)**:
        *   Takes the extracted text.
        *   Sends a POST request to your **Ngrok URL** (e.g., `https://xyz.ngrok.app/api/generate`).
        *   Wait for the response.
    *   **Error Handling**: If the request fails (laptop is off), return a clean error message.
3.  **Create Endpoint (`ResumeController.java`)**:
    *   `POST /api/resume/analyze`
    *   Receives `MultipartFile`.
    *   Returns the JSON result.

---

## 🎨 Step 3: Update React Frontend

1.  **New Page: `ResumeAnalyzer.jsx`**:
    *   Add a File Input (Drag & Drop).
    *   Add a "Analyze Now" button.
2.  **Display Logic**:
    *   While waiting: Show a "Processing... (This may take 10-20s)" spinner.
    *   On Success: Show the Score Gauge (using Charts) and the Suggestions list.
    *   On Error: Show "AI Service Offline - Try again later."

---

## 🚀 Step 4: The Daily Routing (How to run it)

Whenever you want to show the feature (Demo / Viva):

1.  **On Laptop**: Open Terminal 1 -> Run `ollama serve`.
2.  **On Laptop**: Open Terminal 2 -> Run `ngrok http 11434`.
3.  **Copy URL**: Ngrok will give you a URL (e.g., `https://random-name.ngrok-free.app`).
4.  **Update Backend**:
    *   Ideally, you solve this by creating an **Admin API** on your live site like `POST /api/admin/set-ai-url` where you paste this new link.
    *   Or, hardcode it if running backend locally too.

---

## ✅ Summary of Work Needed

| Component | Task | Difficulty |
| :--- | :--- | :--- |
| **Local** | Install Ollama & Ngrok | ⭐ (Easy) |
| **Backend** | PDF Parsing Code | ⭐⭐ (Medium) |
| **Backend** | AI Service Connection | ⭐⭐ (Medium) |
| **Frontend** | Upload UI & Charts | ⭐⭐ (Medium) |

**Do you want me to start with Step 2 (Backend Code) or Step 3 (Frontend Design)?**
