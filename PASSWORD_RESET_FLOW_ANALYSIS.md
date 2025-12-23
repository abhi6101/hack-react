# 🔐 Complete Password Reset Flow Analysis

## Overview
The system supports **TWO different password reset flows** based on user profile completeness:
- **Route A (SIMPLE_RESET)**: For users with complete profiles (New Users)
- **Route B (FULL_VERIFICATION)**: For users with incomplete profiles (Old/Legacy Users)

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORGOT PASSWORD FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: FORGOT PASSWORD PAGE
├─ User enters email
├─ Frontend: POST /auth/forgot-password
├─ Backend: Generates 6-digit OTP
├─ Backend: Saves OTP to database (expires in 10 min)
├─ Backend: Sends OTP email
└─ Frontend: Stores email in sessionStorage → Navigate to /verify-otp

Step 2: VERIFY OTP PAGE
├─ User enters 6-digit OTP
├─ Frontend: POST /auth/verify-otp with {email, otp}
├─ Backend: Validates OTP
├─ Backend: Checks user profile completeness:
│   ├─ Has computerCode? ✓
│   ├─ Has aadharNumber? ✓
│   ├─ Has DOB? ✓
│   └─ Has Gender? ✓
│
├─ Backend: Generates JWT recovery token (valid 1 hour)
│
└─ Backend: Routes based on completeness:
    │
    ├─ ROUTE A: SIMPLE_RESET (Complete Profile)
    │   ├─ Returns: {route: "SIMPLE_RESET", token, userData}
    │   ├─ Frontend: Stores token + userData in sessionStorage
    │   └─ Frontend: Navigate to /reset-password
    │
    └─ ROUTE B: FULL_VERIFICATION (Incomplete Profile)
        ├─ Returns: {route: "FULL_VERIFICATION", token, userData}
        ├─ Frontend: Stores token + userData in sessionStorage
        └─ Frontend: Navigate to /account-recovery

┌─────────────────────────────────────────────────────────────────┐
│                    ROUTE A: SIMPLE RESET                         │
└─────────────────────────────────────────────────────────────────┘

Step 3A: RESET PASSWORD PAGE
├─ Shows user info (name, computerCode, email)
├─ User enters new password + confirm password
├─ Password strength validation (min 8 chars, uppercase, number, special)
├─ Frontend: POST /auth/reset-password
│   ├─ Headers: Authorization: Bearer {recoveryToken}
│   └─ Body: {email, newPassword}
│
├─ Backend: Validates token
│   ├─ Extracts username from JWT
│   ├─ Finds user by email
│   ├─ Verifies username matches
│   └─ Updates password (bcrypt hash)
│
├─ Backend: Deletes OTP token from database
├─ Backend: Sends confirmation email
├─ Backend: Generates NEW login token
└─ Frontend: Navigate to /reset-success

┌─────────────────────────────────────────────────────────────────┐
│                 ROUTE B: FULL VERIFICATION                       │
└─────────────────────────────────────────────────────────────────┘

Step 3B: ACCOUNT RECOVERY PAGE
├─ User scans ID card (OCR)
├─ User scans Aadhar QR code
├─ User takes selfie
├─ User enters new password
├─ Frontend: POST /auth/complete-recovery
│   ├─ Headers: Authorization: Bearer {recoveryToken}
│   └─ Body: {
│       email, newPassword, computerCode, aadharNumber,
│       dob, gender, name, semester, enrollmentNumber,
│       idCardImage, aadharImage, selfieImage
│   }
│
├─ Backend: Validates token
├─ Backend: Checks computerCode uniqueness
├─ Backend: Checks aadharNumber uniqueness
├─ Backend: Updates user profile:
│   ├─ Sets username = computerCode
│   ├─ Sets computerCode, aadharNumber, dob, gender
│   ├─ Sets fullName, semester, enrollmentNumber
│   ├─ Sets images (ID, Aadhar, Selfie)
│   ├─ Sets verified = true
│   └─ Sets lastProfileUpdate = today
│
├─ Backend: Updates password
├─ Backend: Deletes OTP token
├─ Backend: Sends account upgrade confirmation email
└─ Frontend: Navigate to /reset-success

┌─────────────────────────────────────────────────────────────────┐
│                      RESET SUCCESS PAGE                          │
└─────────────────────────────────────────────────────────────────┘

Final Step: SUCCESS
├─ Shows success message
├─ For SIMPLE_RESET: "Password reset successful! You can now login."
├─ For FULL_VERIFICATION: "Account upgraded! Please complete registration."
└─ User clicks "Go to Login" → Navigate to /login
```

---

## 🔍 User Type Detection Logic

### Backend: `/auth/verify-otp`

```java
// Check if user has complete data
boolean hasComputerCode = user.getComputerCode() != null && !user.getComputerCode().isEmpty();
boolean hasAadhar = user.getAadharNumber() != null && !user.getAadharNumber().isEmpty();
boolean hasDob = user.getDob() != null;
boolean hasGender = user.getGender() != null && !user.getGender().isEmpty();

boolean isComplete = hasComputerCode && hasAadhar && hasDob && hasGender;

// EXCEPTION: Admins don't need ID/Aadhar
if (user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN")) {
    isComplete = true;
}

if (isComplete) {
    return SIMPLE_RESET route
} else {
    return FULL_VERIFICATION route
}
```

---

## 🎯 User Scenarios

### Scenario 1: New User (Complete Profile)
**Profile:**
- ✅ computerCode: "59500"
- ✅ aadharNumber: "559088854237"
- ✅ dob: "2005-03-23"
- ✅ gender: "Male"

**Flow:**
1. Forgot Password → Enter email
2. Verify OTP → Enter 6-digit code
3. **SIMPLE_RESET** → Reset Password page
4. Enter new password → Success
5. Login with new password ✅

---

### Scenario 2: Old User (Incomplete Profile / Legacy)
**Profile:**
- ❌ computerCode: null or empty
- ❌ aadharNumber: null or empty
- ❌ dob: null
- ❌ gender: null
- ✅ email: "olduser@example.com"
- ✅ username: "random_username_123"

**Flow:**
1. Forgot Password → Enter email
2. Verify OTP → Enter 6-digit code
3. **FULL_VERIFICATION** → Account Recovery page
4. Scan ID card → Extract computerCode, name, etc.
5. Scan Aadhar QR → Extract aadharNumber, dob, gender, address
6. Take selfie → Capture profile photo
7. Enter new password → Submit
8. Backend migrates account:
   - username changes from "random_username_123" to computerCode
   - All missing fields populated
   - verified = true
9. Success → Can now login with computerCode ✅

---

### Scenario 3: Admin User
**Profile:**
- ✅ role: "ADMIN" or "SUPER_ADMIN" or "COMPANY_ADMIN" or "DEPT_ADMIN"
- ❌ computerCode: null (admins don't have this)
- ❌ aadharNumber: null (admins don't need this)

**Flow:**
1. Forgot Password → Enter email
2. Verify OTP → Enter 6-digit code
3. **SIMPLE_RESET** (exception for admins)
4. Enter new password → Success
5. Login with username/email ✅

---

## 🔐 Security Features

### Token-Based Authentication
- **OTP Token**: 6-digit code, expires in 10 minutes
- **Recovery Token**: JWT, expires in 1 hour
- **Login Token**: JWT, long-lived (for auto-login after reset)

### Validation Checks
1. **Email validation**: Regex pattern
2. **OTP validation**: Exact match, not expired
3. **Token validation**: JWT signature, expiration
4. **Username validation**: Token username must match user's username
5. **Uniqueness checks**: computerCode and aadharNumber must be unique

### Data Protection
- Passwords hashed with BCrypt
- Tokens stored in sessionStorage (cleared after use)
- OTP deleted from database after successful verification
- Email confirmations sent for all password changes

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network error. Please try again."
**Cause:** 401 Unauthorized from backend
**Possible Reasons:**
- Token expired (> 1 hour since OTP verification)
- Token invalid (JWT signature mismatch)
- Token extraction failed (malformed token)

**Solution:**
- Check backend logs for token validation errors
- Ensure token is being sent in Authorization header
- Verify JWT secret is same in both environments

### Issue 2: "Invalid request - username mismatch"
**Cause:** Token username doesn't match user's username
**Possible Reasons:**
- User's username changed between OTP and password reset
- Token was generated for different user
- Database username is null or different

**Solution:**
- Check backend logs for username comparison
- Verify user's username in database
- Ensure token is generated with correct username

### Issue 3: Password not updating
**Cause:** Backend updatePassword method failing
**Possible Reasons:**
- Password hashing error
- Database connection issue
- Transaction rollback

**Solution:**
- Check backend logs for updatePassword errors
- Verify database connection
- Check if password field is being updated in database

---

## 📝 API Endpoints Summary

### 1. POST `/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully!"
}
```

---

### 2. POST `/auth/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (SIMPLE_RESET):**
```json
{
  "success": true,
  "route": "SIMPLE_RESET",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userData": {
    "name": "Abhi Jain",
    "computerCode": "59500",
    "email": "abhijain6101@gmail.com",
    "role": "USER"
  }
}
```

**Response (FULL_VERIFICATION):**
```json
{
  "success": true,
  "route": "FULL_VERIFICATION",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userData": {
    "email": "olduser@example.com",
    "existingData": {
      "name": "Old User",
      "username": "random_123"
    }
  }
}
```

---

### 3. POST `/auth/reset-password`
**Request:**
```json
{
  "email": "user@example.com",
  "newPassword": "NewSecurePass123!"
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // New login token
}
```

---

### 4. POST `/auth/complete-recovery`
**Request:**
```json
{
  "email": "olduser@example.com",
  "newPassword": "NewSecurePass123!",
  "computerCode": "59500",
  "aadharNumber": "559088854237",
  "dob": "2005-03-23",
  "gender": "Male",
  "name": "Abhi Jain",
  "semester": "5",
  "enrollmentNumber": "0810CA22DD02",
  "idCardImage": "data:image/jpeg;base64,...",
  "aadharImage": "data:image/jpeg;base64,...",
  "selfieImage": "data:image/jpeg;base64,..."
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Account recovery and upgrade successful"
}
```

---

## ✅ Testing Checklist

### Test Case 1: New User Password Reset
- [ ] Enter email → OTP sent
- [ ] Enter correct OTP → Routes to SIMPLE_RESET
- [ ] Shows user info correctly
- [ ] Enter new password → Success
- [ ] Can login with new password

### Test Case 2: Old User Account Recovery
- [ ] Enter email → OTP sent
- [ ] Enter correct OTP → Routes to FULL_VERIFICATION
- [ ] Scan ID card → Data extracted
- [ ] Scan Aadhar → Data extracted
- [ ] Take selfie → Photo captured
- [ ] Enter new password → Success
- [ ] Account upgraded in database
- [ ] Can login with computerCode

### Test Case 3: Admin Password Reset
- [ ] Enter admin email → OTP sent
- [ ] Enter correct OTP → Routes to SIMPLE_RESET (admin exception)
- [ ] Enter new password → Success
- [ ] Can login with new password

### Test Case 4: Error Handling
- [ ] Invalid email → Error message
- [ ] Wrong OTP → Error message
- [ ] Expired OTP → Error message
- [ ] Expired token → Error message
- [ ] Network error → Error message
- [ ] Duplicate computerCode → Error message
- [ ] Duplicate aadharNumber → Error message

---

## 🔧 Debug Logging

### Frontend Logs (Browser Console)
```javascript
// ForgotPassword.jsx - No logging yet
// VerifyOTP.jsx - No logging yet

// ResetPassword.jsx
console.log('🔐 Password Reset - Starting...');
console.log('Email:', email);
console.log('Token present:', !!token);
console.log('New password length:', newPassword.length);
console.log('Password strength:', passwordStrength);
console.log('Response status:', response.status);
console.log('Response data:', data);
```

### Backend Logs (Java Console)
```java
// AuthController.resetPassword()
System.out.println("🔐 Password Reset Request - Email: " + email);
System.out.println("Authorization Header Present: " + (authHeader != null));
System.out.println("Token extracted, length: " + token.length());
System.out.println("✅ Username extracted from token: " + username);
System.out.println("✅ Validation passed, updating password...");
System.out.println("✅ Password reset successful for user: " + username);

// Or errors:
System.err.println("❌ Missing or invalid authorization header");
System.err.println("❌ Failed to extract username from token: " + e.getMessage());
System.err.println("❌ User not found for email: " + email);
System.err.println("❌ Username mismatch - Token: " + username + ", User: " + user.getUsername());
```

---

## 🎯 Conclusion

The password reset system is **well-designed** with:
- ✅ Two distinct flows for different user types
- ✅ Secure token-based authentication
- ✅ Comprehensive validation
- ✅ Legacy user migration support
- ✅ Admin user exception handling
- ✅ Email confirmations
- ✅ Error handling and logging

**Current Status:** All code is in place and should work correctly. If there are issues, they are likely:
1. Token expiration (user took too long)
2. JWT configuration mismatch
3. Database connection issues
4. Email service failures

**Next Steps:** Test with real users and monitor logs to identify any remaining issues.
