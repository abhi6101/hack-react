# Release Notes - Security Update (Dec 21)

## 🛡️ Critical Security Upgrades
1.  **Strict Verification Enforcement:**
    *   Removed "Rescan" buttons from the ID/Aadhar form.
    *   Removed "Restart" button from Camera Overlay (Strict Mode).
    *   Users must scan correctly or Refresh the Page.

2.  **Aadhar Duplicate Protection (Backend):**
    *   **Vulnerability Fixed:** Prevented "Fake ID + Stolen Aadhar" attack.
    *   **Mechanism:** Added `aadhar_number` to `Users` table with **UNIQUE** constraint.
    *   **Check:** Registration now rejects any submission if the Aadhar Number is already linked to another account.

3.  **Data Integrity:**
    *   Computer Codes normalized (leading zeros removed).
    *   Dashboard "Edit Profile" popup disabled.

## ✅ Verification Status
*   **Scenario:** Stolen Cards Attempt.
*   **Defense:** 
    *   **Step 1:** Blocked by "Already Registered" check (Computer Code).
    *   **Step 2:** Blocked by "Liveness Check" (Selfie).
    *   **Backdoor:** Blocked by "Duplicate Aadhar Check" (Backend).

The system is now fully hardened.
