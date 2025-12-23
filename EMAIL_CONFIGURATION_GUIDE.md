# 📧 Email Service Configuration Guide

## Issue: OTP Emails Not Being Sent

### Root Cause
The backend uses **SendGrid** for sending emails, which requires:
1. SendGrid API Key
2. Verified sender email address
3. Proper environment variables

---

## 🔧 Solution Options

### Option 1: Configure SendGrid (Production)

#### Step 1: Get SendGrid API Key
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up / Login
3. Go to Settings → API Keys
4. Create new API key with "Mail Send" permissions
5. Copy the API key (starts with `SG.`)

#### Step 2: Verify Sender Email
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email (e.g., `noreply@yourdomain.com`)
4. Verify the email by clicking the link sent to your inbox

#### Step 3: Set Environment Variables
Add these to your environment (Render/Railway/local):

```bash
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDER_FROM_EMAIL=noreply@yourdomain.com  # Must match verified email
```

#### Step 4: Restart Backend
```bash
# If running locally
./mvnw spring-boot:run

# If on Render/Railway
# Redeploy or restart the service
```

---

### Option 2: Use Console Logging (Development Only)

For local testing, you can temporarily log OTPs to console instead of sending emails.

#### Modify EmailService.java:

```java
public void sendPasswordResetEmail(String toEmail, String otp) throws IOException {
    // DEVELOPMENT MODE: Log OTP to console
    System.out.println("═══════════════════════════════════════");
    System.out.println("📧 EMAIL (DEV MODE)");
    System.out.println("To: " + toEmail);
    System.out.println("Subject: Password Reset OTP");
    System.out.println("OTP: " + otp);
    System.out.println("═══════════════════════════════════════");
    
    // Comment out actual SendGrid code for dev
    /*
    Email from = new Email(fromEmail);
    Email to = new Email(toEmail);
    // ... rest of SendGrid code
    */
}
```

---

### Option 3: Use Gmail SMTP (Alternative)

If you don't want to use SendGrid, you can use Gmail SMTP:

#### Step 1: Enable App Password in Gmail
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Copy the 16-character password

#### Step 2: Update application.properties
```properties
# Comment out SendGrid
# sendgrid.api.key=${SENDGRID_API_KEY}
# SENDER_FROM_EMAIL=${SENDER_FROM_EMAIL}

# Add Gmail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

#### Step 3: Update EmailService.java
Replace SendGrid code with JavaMailSender:

```java
@Autowired
private JavaMailSender mailSender;

public void sendPasswordResetEmail(String toEmail, String otp) {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);
    
    helper.setTo(toEmail);
    helper.setSubject("Password Reset OTP - Placement Portal");
    helper.setText(htmlContent, true);
    
    mailSender.send(message);
}
```

---

## 🐛 Debugging Email Issues

### Check Backend Logs

After adding the logging, when you try "Forgot Password", you'll see:

**Success:**
```
📧 Forgot Password Request - Email: user@example.com
✅ User found: abhij
✅ OTP generated and saved: 123456
📤 Attempting to send email to: user@example.com
✅ Email sent successfully!
```

**SendGrid API Key Error:**
```
📧 Forgot Password Request - Email: user@example.com
✅ User found: abhij
✅ OTP generated and saved: 123456
📤 Attempting to send email to: user@example.com
❌ Failed to send reset email: Unauthorized
⚠️ SendGrid API Key issue - Check SENDGRID_API_KEY environment variable
```

**Sender Email Not Verified:**
```
📧 Forgot Password Request - Email: user@example.com
✅ User found: abhij
✅ OTP generated and saved: 123456
📤 Attempting to send email to: user@example.com
❌ Failed to send reset email: Forbidden
⚠️ SendGrid sender email not verified - Check SENDER_FROM_EMAIL
```

---

## ✅ Quick Fix for Testing

**Temporary Console OTP Logging:**

Add this to `AuthController.forgotPassword()`:

```java
// TEMPORARY: Log OTP to console for testing
System.out.println("═══════════════════════════════════════");
System.out.println("🔐 PASSWORD RESET OTP (DEV MODE)");
System.out.println("Email: " + user.getEmail());
System.out.println("OTP: " + otp);
System.out.println("═══════════════════════════════════════");
```

Then you can:
1. Request password reset
2. Check backend console for OTP
3. Copy OTP from console
4. Enter it in the frontend

---

## 📝 Environment Variables Checklist

Make sure these are set in your environment:

- [ ] `SENDGRID_API_KEY` - Your SendGrid API key
- [ ] `SENDER_FROM_EMAIL` - Your verified sender email
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `DATABASE_USERNAME` - Database username
- [ ] `DATABASE_PASSWORD` - Database password
- [ ] `JWT_SECRET` - Secret key for JWT tokens
- [ ] `APPLICATION_RECIPIENT_EMAIL` - HR/Admin email
- [ ] `FRONTEND_URL` - Frontend URL (for CORS)
- [ ] `BACKEND_URL` - Backend URL

---

## 🎯 Recommended Solution

**For Production:** Use SendGrid (Option 1)
**For Development:** Use Console Logging (Option 2) or Gmail SMTP (Option 3)

---

## 📞 Support

If emails still don't work after configuration:
1. Check backend console logs
2. Verify SendGrid dashboard for errors
3. Check spam folder
4. Verify sender email is correct
5. Test with a different email address
