# System Scenarios: Possibilities & Solutions
This document outlines every possible user scenario in the Registration & Dashboard flow and how the system handles it.

## 1. Registration Flow Scenarios

### A. The "Happy Path" (New User)
*   **Possibility:** A standard student scans their valid College ID and Aadhar Card.
*   **System Action:**
    1.  **Strict Scanning:** Takes **15 samples** to ensure OCR accuracy. Checks for "IPS/Academy" keywords.
    2.  **Verification:** Upon clicking "Proceed", scans Backend for duplicate `computerCode`.
    3.  **Validation:** Scans Aadhar (12-digits). Upon "Proceed", checks Backend for duplicate `aadharNumber`.
    4.  **Completion:** User fills password -> Account Created.
*   **Status:** ✅ Working perfectly.

### B. "Already Registered" User (Duplicate Attempt)
*   **Possibility:** A student who *already has an account* tries to register again.
*   **System Action (Solution):**
    1.  **Trigger:** User scans ID and clicks "Proceed".
    2.  **Check:** System sends cleaned code (e.g., `59500`) to Backend.
    3.  **Outcome:** System alerts "Account already exists" and **Redirects to Login** (after 3s delay).
    4.  **Network Failure:** If Backend is down/unreachable, system BLOCKS progress with "Connection Error" instead of allowing bypass.

### C. Wrong Document Scanned
*   **Possibility:** User shows an Aadhar Card when asked for College ID (or vice versa).
*   **System Action (Solution):**
    1.  **Keyword Detection:** AI looks for specific words ("IPS Academy" vs "Govt of India").
    2.  **Outcome:** The system **BLOCKS** the capture and shows a dynamic error: *"WRONG DOCUMENT"*.

### D. Aadhar Number Not Read ("XXXX")
*   **Possibility:** Lighting is bad or font is blurry, result is `XXXX-XXXX-XXXX`.
*   **System Action (Solution):**
    1.  **Visual Cue:** Shows `XXXX` in the summary.
    2.  **Correction:** "Rescan" is encouraged.
    3.  **Final Guard:** If user tries to click Register with "XXXX", the system **BLOCKS** submission.

### E. Digital Copy / Spoofing
*   **Possibility:** User tries to scan a photo of an ID displayed on a phone screen.
*   **System Action (Solution):**
    1.  **Anti-Spoofing:** Detects pixel patterns/glare (simulated logic).
    2.  **Outcome:** Alerts "Digital Copy Detected" and requires a physical card.

---

## 2. Dashboard Scenarios

### A. Annoying "Edit Profile" Form
*   **Possibility:** User logs in and immediately sees a "Complete your Profile" pop-up every time.
*   **Solution:** We **DISABLED** the `checkAutoModalTrigger` function. The form now only opens if the user explicitly clicks the "Edit Profile" button.

### B. Missing Profile Data
*   **Possibility:** An old user logs in but has no Branch/Semester set.
*   **Solution:** They will see "Not set" in their profile card. They can click "Edit Profile" to fix it manually.

---

## 3. Data Integrity Scenarios

### A. Computer Code Mismatch (059500 vs 59500)
*   **Possibility:** ID card prints `059500` but official DB Record is `59500`.
*   **Solution:** All Computer Codes are now **cleaned** (leading zeros removed) before being sent to the Backend for checks or Registration.

### B. Browser Refresh / Crash
*   **Possibility:** User is on Step 3 (Selfie) and accidentally reloads the page.
*   **Solution:** **LocalStorage Persistence**. The system remembers `scannedData` and restores the user exactly where they left off (or at the last completed step).
