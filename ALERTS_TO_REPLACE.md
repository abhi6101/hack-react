# Browser Alert Replacement Guide

## Total Alerts Found: 47

### Files with Browser Alerts:

---

## 1. **Interview.jsx** (3 alerts)
- Line 53: `"You must be logged in to view interview schedules."`
- Line 139: `Booking Confirmed for ${selectedCompany.company}!\n\nEmail: ${bookingData.studentEmail}`
- Line 183: `"Application submitted successfully!"`

---

## 2. **Papers.jsx** (4 alerts)
- Line 11: `"You must be logged in to view this page."`
- Line 20: `"Your session has expired. Please log in again."`
- Line 121: `"Coming Soon!"` (semester card click)
- Line 131: `"Coming Soon!"` (semester card click)

---

## 3. **Jobs.jsx** (5 alerts)
- Line 89: `"Your session has expired or is invalid. Please log in again."`
- Line 168: `"You have already applied for this job."`
- Line 217: `Application for "${selectedJob.title}" submitted successfully! You will receive a confirmation email shortly.`
- Line 233: `"Failed to submit application. Please try again later."`
- Line 329: `"Details page implementation pending"`

---

## 4. **AdminDashboard.jsx** (5 alerts)
- Line 37: `"No data to export"`
- Line 90: `"Your session has expired. Please log in again."`
- Line 239: `err.message`
- Line 661: `"Access Denied. Admins only."`
- Line 839: `error.message`

---

## 5. **StudentDashboard.jsx** (4 alerts)
- Line 19: `"Please login to access dashboard"`
- Line 49: `"Profile updated successfully!"`
- Line 51: `"Failed to update profile"`
- Line 55: `"Error updating profile"`

---

## 6. **StudentProfile.jsx** (10 alerts)
- Line 23: `"Please login to access your profile"`
- Line 197: `"ID Card uploaded successfully!"`
- Line 199: `"Failed to upload ID Card"`
- Line 200: `"Error uploading ID Card"`
- Line 230: `"Aadhar Card uploaded successfully!"`
- Line 232: `"Failed to upload Aadhar Card"`
- Line 233: `"Error uploading Aadhar Card"`
- Line 263: `"Admit Card uploaded successfully!"`
- Line 265: `"Failed to upload Admit Card"`
- Line 266: `"Error uploading Admit Card"`

---

## 7. **Onboarding.jsx** (6 alerts)
- Line 105: `"Please upload ID card first"`
- Line 114: `"Auto-fill from ID Card is currently only available for local developers."`
- Line 130: `"Auto-filled details from ID Card!"`
- Line 132: `"Scan failed: " + data.error`
- Line 137: `"Scan service unavailable or Tesseract not installed. Please fill manually."`
- Line 215: `"Onboarding Complete! Welcome to the portal."`
- Line 220: `err.message`

---

## 8. **Contact.jsx** (1 alert)
- Line 20: `"Thank you for your message! We will get back to you shortly."`

---

## 9. **Gallery.jsx** (1 alert)
- Line 47: `"Please login to upload photos."`

---

## 10. **Quiz.jsx** (1 alert)
- Line 57: `Sorry, no questions available for ${subjectId.toUpperCase()} yet!`

---

## 11. **Register.jsx** (1 alert)
- Line 1275: `"Could not access camera."`

---

## 12. **ResumeAnalysis.jsx** (2 alerts)
- Line 39: `"Please upload a PDF file."`
- Line 76: `"Analysis failed. Please try again."`

---

## 13. **ResumeBuilder.jsx** (1 alert)
- Line 224: `"Error: " + err.message`

---

## 14. **VerifyOTP.jsx** (1 alert)
- Line 133: `data.message || "Your old account has been removed. Please register again."`

---

## 15. **ProfileUpdateModal.jsx** (1 alert)
- Line 95: `"Profile Updated Successfully!"`

---

## 16. **quizData.js** (1 alert - NOT TO REPLACE)
- Line 39: This is quiz question content, not an actual alert call

---

## How to Replace:

### Example 1: Simple Info Alert
**Before:**
```jsx
alert("Profile updated successfully!");
```

**After:**
```jsx
const { showAlert } = useAlert();
showAlert({
    title: 'Success!',
    message: 'Profile updated successfully!',
    type: 'success'
});
```

### Example 2: Error Alert
**Before:**
```jsx
alert("Failed to upload ID Card");
```

**After:**
```jsx
showAlert({
    title: 'Upload Failed',
    message: 'Failed to upload ID Card',
    type: 'error'
});
```

### Example 3: Login Required Alert
**Before:**
```jsx
alert("You must be logged in to view this page.");
navigate('/login');
```

**After:**
```jsx
showAlert({
    title: 'Login Required',
    message: 'You must be logged in to view this page.',
    type: 'login',
    actions: [
        { label: 'Login Now', primary: true, onClick: () => navigate('/login') },
        { label: 'Go Home', primary: false, onClick: () => navigate('/') }
    ]
});
```

### Example 4: Confirmation/Success with Details
**Before:**
```jsx
alert(`Application for "${selectedJob.title}" submitted successfully!`);
```

**After:**
```jsx
showAlert({
    title: 'Application Submitted!',
    message: `Your application for "${selectedJob.title}" has been submitted successfully. You will receive a confirmation email shortly.`,
    type: 'success'
});
```

---

## Priority Order for Replacement:

### High Priority (User-Facing):
1. **Interview.jsx** - Login required alerts
2. **Papers.jsx** - Login required alerts
3. **Jobs.jsx** - Application alerts
4. **Contact.jsx** - Form submission
5. **Gallery.jsx** - Upload alerts

### Medium Priority (Dashboard/Profile):
6. **StudentDashboard.jsx** - Profile updates
7. **StudentProfile.jsx** - Document uploads
8. **AdminDashboard.jsx** - Admin actions

### Lower Priority (Onboarding/Special):
9. **Onboarding.jsx** - ID card scanning
10. **Register.jsx** - Camera access
11. **ResumeAnalysis.jsx** - File upload
12. **ResumeBuilder.jsx** - PDF generation
13. **VerifyOTP.jsx** - Account removal
14. **ProfileUpdateModal.jsx** - Profile updates
15. **Quiz.jsx** - No questions available

---

## Notes:
- Always import `useAlert` hook at the top of the component
- Choose appropriate `type`: 'success', 'error', 'warning', 'info', or 'login'
- Add custom actions for navigation or confirmations
- Keep messages concise but informative
