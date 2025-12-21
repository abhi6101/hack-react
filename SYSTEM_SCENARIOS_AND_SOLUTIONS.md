# System Scenarios: Possibilities & Solutions
This document outlines every possible user scenario in the Registration & Dashboard flow and how the system handles it.

## 1. Registration Flow Scenarios

### A. The "Happy Path" (New User)
*   **Possibility:** A standard student scans their valid College ID and Aadhar Card.
*   **System Action:**
    1.  Extracts Name, Computer Code (e.g., "59500"), and Aadhar Number.
    2.  Verifies Computer Code does NOT exist in DB.
    3.  Pre-fills the Registration Form.
    4.  User creates password -> Account Created.
*   **Status:** ✅ Working perfectly.

### B. "Already Registered" User (Duplicate Attempt)
*   **Possibility:** A student who *already has an account* tries to register again.
*   **System Action (Solution):**
    1.  **During Scan:** The system checks the Computer Code immediately.
    2.  **Fix Applied:** We now strip leading zeros (e.g. `059500` -> `59500`) to ensure it matches the database.
    3.  **Outcome:** System alerts "Account already exists" and **Redirects to Login**.
*   **Edge Case:** If the old account is missing the Computer Code in the DB (Legacy account), the scan will pass, **BUT** the final form submission will fail with "Username/Email already exists".

### C. Wrong Document Scanned
*   **Possibility:** User shows an Aadhar Card when asked for College ID (or vice versa).
*   **System Action (Solution):**
    1.  **Keyword Detection:** The AI looks for specific words ("IPS Academy" vs "Govt of India").
    2.  **Outcome:** The system **BLOCKS** the capture and shows a dynamic error: *"WRONG DOCUMENT - Please show [Correct Card]"*.

### D. Aadhar Number Not Read ("XXXX")
*   **Possibility:** Lighting is bad or font is blurry, result is `XXXX-XXXX-XXXX`.
*   **System Action (Solution):**
    1.  **Visual Cue:** Shows `XXXX` in the summary.
    2.  **Immediate Fix:** A **"FIX"** button appears next to the number.
    3.  **Nuclear Option:** A **"Rescan Identity"** button allows a full restart.
    4.  **Final Guard:** If user tries to click Register anyway, the system **BLOCKS** submission with error: *"Invalid Aadhar Number"*.

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
