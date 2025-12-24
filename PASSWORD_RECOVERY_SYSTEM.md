# 🔐 Smart Password Recovery System - Complete Implementation Guide

## 📋 Overview

A comprehensive password recovery system that intelligently routes users based on their account verification status:
- **Route A (Simple Reset)**: For users with complete verified data
- **Route B (Full Verification)**: For legacy users requiring ID/Aadhar scanning

---

## 🎯 System Flow

```
User Forgets Password
    ↓
Enter Email → Send OTP
    ↓
Verify OTP
    ↓
Backend Checks User Data
    ├─ Complete Data → Route A (Simple Password Reset)
    └─ Missing Data → Route B (Full Verification + Migration)
```

---

## 📁 Components Created

### 1. **ForgotPassword.jsx**
**Path**: `/forgot-password`
**Purpose**: Entry point for password recovery

**Features**:
- Email input with validation
- Sends OTP to user's email via `POST /auth/forgot-password`
- Stores email in sessionStorage
- Auto-redirects to OTP verification

**API Endpoint**:
```javascript
POST /auth/forgot-password
Body: { email: "user@example.com" }
Response: { success: true, message: "OTP sent" }
```

---

### 2. **VerifyOTP.jsx**
**Path**: `/verify-otp`
**Purpose**: OTP verification with smart routing

**Features**:
- 6-digit OTP input with auto-focus
- Paste support for easy entry
- 10-minute countdown timer
- Resend OTP with 60-second cooldown
- **Smart routing based on backend response**

**API Endpoint**:
```javascript
POST /auth/verify-otp
Body: { 
  email: "user@example.com", 
  otp: "123456" 
}

Response (Route A - Complete Data):
{
  success: true,
  route: "SIMPLE_RESET",
  token: "recovery_token_xyz",
  userData: {
    name: "John Doe",
    computerCode: "59500",
    email: "user@example.com"
  }
}

Response (Route B - Missing Data):
{
  success: true,
  route: "FULL_VERIFICATION",
  token: "recovery_token_xyz",
  userData: {
    email: "user@example.com",
    existingData: {
      name: "John Doe",
      username: "john_doe"
    }
  }
}
```

**Routing Logic**:
```javascript
if (data.route === 'SIMPLE_RESET') {
    navigate('/reset-password');  // Route A
} else if (data.route === 'FULL_VERIFICATION') {
    navigate('/account-recovery');  // Route B
}
```

---

### 3. **ResetPassword.jsx** (Route A)
**Path**: `/reset-password`
**Purpose**: Simple password reset for verified users

**Features**:
- Displays user info (name, computer code, email)
- Password strength indicator (Weak/Fair/Good/Strong)
- Real-time password requirements checklist
- Password confirmation with match validation
- No scanning required

**API Endpoint**:
```javascript
POST /auth/reset-password
Headers: { Authorization: "Bearer recovery_token" }
Body: { 
  email: "user@example.com",
  newPassword: "SecurePass@123"
}
Response: { success: true }
```

---

### 4. **AccountRecovery.jsx** (Route B)
**Path**: `/account-recovery`
**Purpose**: Full verification for legacy users

**Stages**:
1. **INTRO**: Explains what's needed
2. **ID_SCAN**: Scans college ID card → Extracts Computer Code
3. **AADHAR_SCAN**: Scans Aadhar card → Extracts Aadhar Number, DOB, Gender
4. **SELFIE**: Auto-captures selfie for verification
5. **FORM**: Complete form with verified data + set new password

**Features**:
- Reuses OCR scanning logic from Register.jsx
- Auto-progression through stages
- Real-time scanning feedback
- Locked verified fields (can't edit)
- Optional fields (semester, enrollment number)

**API Endpoint**:
```javascript
POST /auth/complete-recovery
Headers: { Authorization: "Bearer recovery_token" }
Body: {
  email: "user@example.com",
  computerCode: "59500",
  aadharNumber: "123456789012",
  dob: "01/01/2000",
  gender: "Male",
  name: "John Doe",
  semester: "5",
  enrollmentNumber: "EN12345",
  newPassword: "SecurePass@123",
  selfieImage: "base64...",
  idCardImage: "base64...",
  aadharImage: "base64..."
}
Response: { success: true }
```

**Backend Processing**:
```javascript
1. Verify recovery token
2. Find user by email
3. Validate Computer Code not already in use
4. Validate Aadhar not already registered
5. Update user record:
   - username → computerCode (59500)
   - password → hash(newPassword)
   - computerCode → 59500
   - aadharNumber → 123456789012
   - dob → 2000-01-01
   - gender → Male
   - isVerified → true
   - isLegacyUser → false
6. Save images to storage
7. Send confirmation email
```

---

### 5. **ResetSuccess.jsx**
**Path**: `/reset-success`
**Purpose**: Confirmation screen

**Features**:
- Success animation
- Displays new login credentials
- Shows Computer Code prominently
- Auto-redirects to login after 5 seconds
- Manual "Login Now" button

---

## 🔧 Backend Requirements

### Database Schema Updates

```sql
-- Add recovery token table
CREATE TABLE password_recovery_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_legacy_user BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP;
```

### Required API Endpoints

#### 1. Send OTP
```javascript
POST /auth/forgot-password
Request: { email: string }
Response: { success: boolean, message: string }

Logic:
- Check if email exists in database
- Generate 6-digit OTP
- Store OTP with expiry (10 minutes)
- Send email with OTP
- Return success
```

#### 2. Verify OTP
```javascript
POST /auth/verify-otp
Request: { email: string, otp: string }
Response: { 
  success: boolean, 
  route: "SIMPLE_RESET" | "FULL_VERIFICATION",
  token: string,
  userData: object
}

Logic:
- Validate OTP
- Find user by email
- Check data completeness:
  const isComplete = user.computerCode && user.aadharNumber && user.dob && user.gender;
- Generate recovery token (JWT, 1 hour expiry)
- Return appropriate route
```

#### 3. Reset Password (Route A)
```javascript
POST /auth/reset-password
Headers: { Authorization: "Bearer token" }
Request: { email: string, newPassword: string }
Response: { success: boolean }

Logic:
- Verify recovery token
- Find user by email
- Hash new password
- Update password
- Delete recovery token
- Send confirmation email
```

#### 4. Complete Recovery (Route B)
```javascript
POST /auth/complete-recovery
Headers: { Authorization: "Bearer token" }
Request: {
  email: string,
  computerCode: string,
  aadharNumber: string,
  dob: string,
  gender: string,
  name: string,
  newPassword: string,
  selfieImage: string,
  idCardImage: string,
  aadharImage: string,
  semester?: string,
  enrollmentNumber?: string
}
Response: { success: boolean }

Logic:
- Verify recovery token
- Validate Computer Code not in use
- Validate Aadhar not registered
- Update user record (migrate to new system)
- Save images to storage
- Delete recovery token
- Send confirmation email
```

---

## 📧 Email Templates

### OTP Email
```
Subject: Your OTP for Password Recovery

Hi,

Your OTP for password recovery is: 123456

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.

Security tip: Never share your OTP with anyone.
```

### Password Reset Success (Route A)
```
Subject: Password Reset Successful

Hi [Name],

Your password has been successfully reset.

Login with:
Computer Code: 59500
Password: [Your new password]

If you didn't perform this action, contact support immediately.
```

### Account Recovery Success (Route B)
```
Subject: Account Upgraded Successfully

Hi [Name],

Your account has been successfully recovered and upgraded!

Your New Login Details:
Computer Code: 59500
Password: [Your new password]

Important Changes:
• Your old username is no longer valid
• Always use Computer Code to login
• Your account is now fully verified

Verified Information:
Name: John Doe
Computer Code: 59500
Aadhar: ****-****-9012
DOB: 01/01/2000

If you didn't perform this action, contact support immediately.
```

---

## 🔐 Security Features

### OTP Security
- **Length**: 6 digits
- **Validity**: 10 minutes
- **Max Attempts**: 3 (optional - implement in backend)
- **Rate Limiting**: 1 OTP per minute per email
- **Resend Limit**: 3 times per session (60s cooldown)
- **Auto-expire**: After successful use

### Token Security
- **Type**: JWT
- **Expiry**: 1 hour
- **Storage**: sessionStorage (cleared after use)
- **Validation**: Required for all recovery endpoints

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

---

## 🎯 User Scenarios

### Scenario 1: New User (Registered with Scanning)
```
User: Sarah
Data: ✅ Complete (Computer Code, Aadhar, DOB, Gender)

Flow:
1. Forgot Password → Enter email
2. Verify OTP
3. Backend: Data complete → Route A
4. Simple password reset
5. Login with Computer Code
```

### Scenario 2: Legacy User (Old System)
```
User: John
Data: ❌ Missing (No Computer Code, Aadhar, DOB, Gender)

Flow:
1. Forgot Password → Enter email
2. Verify OTP
3. Backend: Data incomplete → Route B
4. Scan ID Card
5. Scan Aadhar
6. Auto-selfie
7. Complete form + set password
8. Account upgraded
9. Login with Computer Code
```

### Scenario 3: Migrated User
```
User: Mike (was legacy, already migrated)
Data: ✅ Complete

Flow:
1. Forgot Password → Enter email
2. Verify OTP
3. Backend: Data complete → Route A
4. Simple password reset
5. Login with Computer Code
```

---

## 🚀 Testing Checklist

### Frontend Testing
- [ ] Email validation works
- [ ] OTP input accepts only digits
- [ ] OTP auto-focuses next box
- [ ] OTP paste functionality works
- [ ] Countdown timer displays correctly
- [ ] Resend OTP has cooldown
- [ ] Password strength indicator updates
- [ ] Password requirements checklist works
- [ ] Camera permissions requested
- [ ] ID card scanning extracts Computer Code
- [ ] Aadhar scanning extracts all fields
- [ ] Selfie capture works
- [ ] Form validation works
- [ ] Success page redirects

### Backend Testing
- [ ] OTP generation works
- [ ] OTP email delivery works
- [ ] OTP validation works
- [ ] OTP expiry works
- [ ] Route decision logic correct
- [ ] Simple reset updates password
- [ ] Full recovery updates all fields
- [ ] Computer Code uniqueness validated
- [ ] Aadhar uniqueness validated
- [ ] Images saved correctly
- [ ] Confirmation emails sent
- [ ] Tokens expire correctly

---

## 📊 Database Migration Impact

### Before Migration
```sql
users {
  id: 123
  username: "john_doe"
  email: "user@example.com"
  password: "old_hash"
  computerCode: NULL
  aadharNumber: NULL
  dob: NULL
  gender: NULL
  isLegacyUser: true
  isVerified: false
}
```

### After Recovery (Route B)
```sql
users {
  id: 123
  username: "59500"  -- Changed to Computer Code
  email: "user@example.com"
  password: "new_hash"
  computerCode: "59500"
  aadharNumber: "123456789012"
  dob: "2000-01-01"
  gender: "Male"
  isLegacyUser: false
  isVerified: true
  verificationDate: "2025-12-22"
}
```

---

## ✅ Implementation Complete!

All components have been created and integrated:
- ✅ ForgotPassword.jsx
- ✅ VerifyOTP.jsx
- ✅ ResetPassword.jsx (Route A)
- ✅ AccountRecovery.jsx (Route B)
- ✅ ResetSuccess.jsx
- ✅ Routes added to App.jsx
- ✅ Navbar hidden for recovery pages
- ✅ "Forgot Password?" link in Login page

**Next Steps**:
1. Implement backend API endpoints
2. Test complete flow
3. Deploy to production

---

## 🎉 Benefits

1. **Smart Routing**: Automatically detects user type
2. **No Disruption**: Verified users get quick reset
3. **Forced Migration**: Legacy users upgrade seamlessly
4. **Secure**: Multi-factor verification (Email OTP + ID + Aadhar)
5. **Complete Data**: All users eventually have verified profiles
6. **User-Friendly**: Clear steps, good UX
7. **Automated**: No manual admin intervention

---

**System is ready for backend integration!** 🚀
