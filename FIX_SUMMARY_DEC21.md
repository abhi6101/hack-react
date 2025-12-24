# Fixes Applied - Dec 21, 2025

## 1. Aadhar Number "XXXX" Issue
- **Problem:** OCR was failing to read Aadhar numbers correctly due to noise or font issues, defaulting to "xxxx-xxxx-xxxx".
- **Fix:** 
  - Updated Regex patterns to be more robust (handles `O`->`0`, `S`->`5` substitutions).
  - Added support for dash `-` and space separators in numbers.

## 2. "How to Fix" / Rescan Feature
- **Problem:** Users with "XXXX" Aadhar numbers were stuck and couldn't edit or rescan without clearing browser data.
- **Fix:**
  - Added a **"Incorrect Details? Rescan Identity"** button at the bottom of the verified summary.
  - Added a specific **"FIX"** button next to the Aadhar Number if it shows "XXXX".
  - These buttons clear the verification session and allow you to scan again with the improved OCR.

## 3. Wrong Error Message on Aadhar Scan
- **Problem:** Showing "INVALID ID - Show College ID" when scanning Aadhar card.
- **Fix:** 
  - Updated error overlay to be context-aware.
  - Now says **"WRONG DOCUMENT - Please show your AADHAR CARD"** when in Step 2.

## 4. Dashboard Form Glitch
- **Problem:** "Edit Profile" modal was appearing automatically on the dashboard, annoying users.
- **Fix:** Disabled the auto-trigger logic in `StudentDashboard.jsx`.

## 5. Security & Persistence
- **Fix:** 
  - Added `aadharNumber` to the data sent to the backend.
  - Added validation to PREVENT registration if Aadhar number is still "XXXX". You must rescan to fix it.

---

### How to Test:
1. Reload the Register page.
2. If you see "XXXX" for Aadhar, click the red **"Rescan Identity"** button.
3. Scan your ID and Aadhar again.
4. The Aadhar number should now be detected correctly!
5. Proceed to registration.

## Failure Scenarios & Validations (How Users Can Fail)

- **Wrong Document:** Showing Aadhar in Step 1 or ID in Step 2 will strictly **FAIL** with "WRONG DOCUMENT".
- **Hidden Aadhar Number:** Submitting form with "XXXX" will **FAIL** validation. User MUST rescan.
- **Already Registered:** Scanning a Computer Code that exists in DB will **FAIL** registration and Redirect to Login.
- **Digital Copy:** Scanning a phone screen or monitor will **FAIL** with "Anti-Spoofing Alert".
- **Missing Data:** If Computer Code (Student ID) is not read from the card, the scan will **NOT** complete.
