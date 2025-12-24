# Backend API Specification for Progressive Verification System

## Overview
This document specifies the backend APIs required to support the progressive verification system with device binding security.

---

## Database Schema

### 1. `verification_sessions` Table
Stores temporary verification data until registration is complete.

```sql
CREATE TABLE verification_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_code VARCHAR(20) NOT NULL,
  
  -- Verified Data
  full_name VARCHAR(255),
  father_name VARCHAR(255),
  branch VARCHAR(50),
  session VARCHAR(20),
  institution VARCHAR(255),
  mobile_primary VARCHAR(15),
  mobile_secondary VARCHAR(15),
  aadhar_number_encrypted TEXT,
  
  -- Images (URLs to cloud storage)
  id_card_image_url TEXT,
  aadhar_image_url TEXT,
  selfie_image_url TEXT,
  
  -- Security: Device Binding
  device_fingerprint TEXT NOT NULL,
  ip_address VARCHAR(45),
  location JSONB,
  user_agent TEXT,
  
  -- Status
  all_steps_completed BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Unique constraint: One verification per computer code + device
  UNIQUE(computer_code, device_fingerprint)
);

CREATE INDEX idx_computer_code ON verification_sessions(computer_code);
CREATE INDEX idx_device_fingerprint ON verification_sessions(device_fingerprint);
CREATE INDEX idx_expires_at ON verification_sessions(expires_at);
```

### 2. `security_logs` Table
Tracks suspicious activity for admin review.

```sql
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_code VARCHAR(20),
  event_type VARCHAR(50), -- 'DEVICE_MISMATCH', 'MULTIPLE_ATTEMPTS', etc.
  
  -- Original verification details
  original_device TEXT,
  original_ip VARCHAR(45),
  original_location JSONB,
  
  -- Attempted access details
  attempted_device TEXT,
  attempted_ip VARCHAR(45),
  attempted_location JSONB,
  
  -- Metadata
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_computer_code_logs ON security_logs(computer_code);
CREATE INDEX idx_event_type ON security_logs(event_type);
CREATE INDEX idx_created_at ON security_logs(created_at);
```

### 3. Update `users` Table
Add fields to store verification data permanently.

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_primary VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_secondary VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhar_number_encrypted TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_card_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhar_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS selfie_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
```

---

## API Endpoints

### 1. Check Verification Status
**Endpoint:** `POST /api/verification/check-status`

**Purpose:** Check if a user is already registered, already verified, or is new.

**Request Body:**
```json
{
  "computerCode": "59500",
  "deviceFingerprint": "TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCk...",
  "ipAddress": "192.168.1.100",
  "location": {
    "lat": "22.7196",
    "lng": "75.8577",
    "accuracy": "50m"
  }
}
```

**Response Scenarios:**

#### Scenario 1: Already Registered
```json
{
  "status": "ALREADY_REGISTERED",
  "message": "This account is already registered. Please login.",
  "userData": {
    "username": "@abhi_jain",
    "email": "abhi@example.com",
    "registeredAt": "2025-12-20T10:30:00Z"
  }
}
```

#### Scenario 2: Verified But Not Registered (Same Device)
```json
{
  "status": "VERIFIED_NOT_REGISTERED",
  "message": "Verification complete. Finish registration.",
  "data": {
    "fullName": "Abhi Jain",
    "fatherName": "Rajesh Jain",
    "computerCode": "59500",
    "branch": "IMCA",
    "session": "2022-2027",
    "institution": "IPS Academy",
    "mobilePrimary": "9876543210",
    "mobileSecondary": "8765432109",
    "aadharNumber": "****-****-9012",
    "idCardImageUrl": "https://cdn.example.com/id/59500.jpg",
    "aadharImageUrl": "https://cdn.example.com/aadhar/59500.jpg",
    "selfieImageUrl": "https://cdn.example.com/selfie/59500.jpg"
  }
}
```

#### Scenario 3: Device Mismatch (Security Alert)
```json
{
  "status": "DEVICE_MISMATCH",
  "message": "Security Error: Device mismatch detected. This ID was verified on a different device. Please contact support.",
  "supportContact": {
    "email": "support@ipsacademy.edu",
    "phone": "+91-XXXX-XXXX"
  }
}
```

#### Scenario 4: New User
```json
{
  "status": "NEW_USER",
  "message": "Start verification process."
}
```

**Backend Logic:**
```javascript
async function checkVerificationStatus(req, res) {
  const { computerCode, deviceFingerprint, ipAddress, location } = req.body;
  
  // Check 1: Is user already registered?
  const existingUser = await db.users.findOne({ computer_code: computerCode });
  if (existingUser) {
    return res.json({
      status: "ALREADY_REGISTERED",
      userData: {
        username: existingUser.username,
        email: existingUser.email,
        registeredAt: existingUser.created_at
      }
    });
  }
  
  // Check 2: Is verification completed?
  const session = await db.verification_sessions.findOne({
    computer_code: computerCode,
    all_steps_completed: true,
    expires_at: { $gt: new Date() }
  });
  
  if (!session) {
    return res.json({ status: "NEW_USER" });
  }
  
  // Check 3: Device fingerprint match
  if (session.device_fingerprint !== deviceFingerprint) {
    // Log suspicious activity
    await db.security_logs.create({
      computer_code: computerCode,
      event_type: 'DEVICE_MISMATCH',
      original_device: session.device_fingerprint,
      original_ip: session.ip_address,
      original_location: session.location,
      attempted_device: deviceFingerprint,
      attempted_ip: ipAddress,
      attempted_location: location
    });
    
    // Send email to admin
    await sendEmailToAdmin({
      subject: '🚨 Security Alert: Device Mismatch',
      body: `Student ID: ${computerCode}\nDevice mismatch detected.`
    });
    
    return res.json({
      status: "DEVICE_MISMATCH",
      message: "Security Error: Device mismatch detected.",
      supportContact: {
        email: "support@ipsacademy.edu",
        phone: "+91-XXXX-XXXX"
      }
    });
  }
  
  // Device matches - return verification data
  return res.json({
    status: "VERIFIED_NOT_REGISTERED",
    data: {
      fullName: session.full_name,
      fatherName: session.father_name,
      computerCode: session.computer_code,
      branch: session.branch,
      session: session.session,
      mobilePrimary: session.mobile_primary,
      mobileSecondary: session.mobile_secondary,
      aadharNumber: decrypt(session.aadhar_number_encrypted),
      idCardImageUrl: session.id_card_image_url,
      aadharImageUrl: session.aadhar_image_url,
      selfieImageUrl: session.selfie_image_url
    }
  });
}
```

---

### 2. Save Step 1 (ID Card)
**Endpoint:** `POST /api/verification/save-step1`

**Purpose:** Save ID card verification data.

**Request Body:**
```json
{
  "computerCode": "59500",
  "fullName": "Abhi Jain",
  "fatherName": "Rajesh Jain",
  "branch": "IMCA",
  "session": "2022-2027",
  "institution": "IPS Academy",
  "mobilePrimary": "9876543210",
  "mobileSecondary": "8765432109",
  "idCardImage": "base64_encoded_image_or_url",
  "deviceFingerprint": "TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCk...",
  "ipAddress": "192.168.1.100",
  "location": {
    "lat": "22.7196",
    "lng": "75.8577"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "ID card verified. Proceed to Aadhar scan.",
  "sessionId": "uuid-here"
}
```

---

### 3. Save Step 2 (Aadhar)
**Endpoint:** `POST /api/verification/save-step2`

**Purpose:** Save Aadhar verification data.

**Request Body:**
```json
{
  "computerCode": "59500",
  "aadharNumber": "1234-5678-9012",
  "aadharImage": "base64_encoded_image_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aadhar verified. Proceed to selfie."
}
```

---

### 4. Save Step 3 (Selfie)
**Endpoint:** `POST /api/verification/save-step3`

**Purpose:** Save selfie and mark verification as complete.

**Request Body:**
```json
{
  "computerCode": "59500",
  "selfieImage": "base64_encoded_image_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification complete. Proceed to registration.",
  "verificationToken": "jwt_token_here"
}
```

**Backend Logic:**
```javascript
async function saveStep3(req, res) {
  const { computerCode, selfieImage } = req.body;
  
  // Upload selfie to cloud storage
  const selfieUrl = await uploadToCloud(selfieImage);
  
  // Update session
  await db.verification_sessions.update({
    computer_code: computerCode
  }, {
    selfie_image_url: selfieUrl,
    all_steps_completed: true,
    updated_at: new Date()
  });
  
  // Generate verification token (JWT)
  const token = jwt.sign({ computerCode }, SECRET_KEY, { expiresIn: '7d' });
  
  return res.json({
    success: true,
    verificationToken: token
  });
}
```

---

### 5. Register User
**Endpoint:** `POST /api/auth/register`

**Purpose:** Create user account after verification.

**Headers:**
```
X-Verification-Token: jwt_token_here
```

**Request Body:**
```json
{
  "username": "@abhi_jain",
  "email": "abhi@example.com",
  "password": "securePassword123",
  "computerCode": "59500",
  "branch": "IMCA",
  "semester": 7,
  "startYear": "2022",
  "batch": "2022-2027"
}
```

**Backend Logic:**
```javascript
async function register(req, res) {
  const token = req.headers['x-verification-token'];
  
  // Verify token
  const decoded = jwt.verify(token, SECRET_KEY);
  
  // Get verification session
  const session = await db.verification_sessions.findOne({
    computer_code: decoded.computerCode,
    all_steps_completed: true
  });
  
  if (!session) {
    return res.status(400).json({ error: "Verification not found" });
  }
  
  // Create user account
  const user = await db.users.create({
    username: req.body.username,
    email: req.body.email,
    password_hash: await bcrypt.hash(req.body.password, 10),
    computer_code: req.body.computerCode,
    full_name: session.full_name,
    father_name: session.father_name,
    branch: req.body.branch,
    semester: req.body.semester,
    mobile_primary: session.mobile_primary,
    mobile_secondary: session.mobile_secondary,
    aadhar_number_encrypted: session.aadhar_number_encrypted,
    id_card_image_url: session.id_card_image_url,
    aadhar_image_url: session.aadhar_image_url,
    selfie_image_url: session.selfie_image_url,
    verified_at: new Date()
  });
  
  // Delete verification session
  await db.verification_sessions.delete({ computer_code: decoded.computerCode });
  
  // Send email OTP
  const otp = generateOTP();
  await sendEmailOTP(req.body.email, otp);
  
  return res.json({
    success: true,
    message: "Account created. Please verify your email."
  });
}
```

---

## Security Features

### 1. Device Fingerprint Validation
- Every verification is tied to a specific device
- Device mismatch triggers security alert
- Logs suspicious activity for admin review

### 2. Session Expiry
- Verification sessions expire after 7 days
- Expired sessions are automatically deleted
- User must re-verify if session expires

### 3. Email Notifications
Send email to admin when:
- Device mismatch detected
- Multiple failed verification attempts
- Suspicious activity patterns

### 4. Image Storage
- Upload images to cloud storage (AWS S3, Cloudinary, etc.)
- Store only URLs in database
- Set expiry for temporary images (verification sessions)
- Keep permanent images for registered users

---

## Cron Jobs

### 1. Clean Expired Sessions
Run daily to delete expired verification sessions:
```sql
DELETE FROM verification_sessions WHERE expires_at < NOW();
```

### 2. Security Monitoring
Run hourly to detect suspicious patterns:
- Multiple device mismatch attempts from same IP
- High volume of verification attempts
- Geographic anomalies

---

## Testing Scenarios

### Test 1: New User Registration
1. Scan ID → Save Step 1
2. Scan Aadhar → Save Step 2
3. Capture Selfie → Save Step 3
4. Fill registration form → Create account
5. Verify email OTP → Account activated

### Test 2: User Returns (Same Device)
1. Scan ID → Backend returns "VERIFIED_NOT_REGISTERED"
2. Skip to registration form
3. Fill email/password → Create account

### Test 3: Device Mismatch (Security)
1. User A verifies on Device A
2. User B tries to use same ID on Device B
3. Backend detects mismatch → Block access
4. Log security event → Email admin

### Test 4: Already Registered
1. User tries to register again
2. Backend returns "ALREADY_REGISTERED"
3. Redirect to login page

---

## Implementation Checklist

- [ ] Create `verification_sessions` table
- [ ] Create `security_logs` table
- [ ] Update `users` table schema
- [ ] Implement `/verification/check-status` endpoint
- [ ] Implement `/verification/save-step1` endpoint
- [ ] Implement `/verification/save-step2` endpoint
- [ ] Implement `/verification/save-step3` endpoint
- [ ] Update `/auth/register` endpoint
- [ ] Set up cloud storage for images
- [ ] Implement email notification system
- [ ] Create cron job for session cleanup
- [ ] Add security monitoring
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Deploy to staging
- [ ] Test all scenarios
- [ ] Deploy to production

---

## Notes

- All Aadhar numbers must be encrypted before storage
- Images should be stored in cloud with CDN for fast access
- Device fingerprints are not 100% unique but good enough for this use case
- For production, consider using more robust device fingerprinting libraries
- Implement rate limiting on all verification endpoints
- Add CAPTCHA for registration form to prevent bots
