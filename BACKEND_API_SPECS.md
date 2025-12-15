# Backend API Specifications for Job Application Management

## Required Backend Endpoints

### 1. Update Job Creation Endpoint

**Endpoint:** `POST /admin/jobs`

**Request Body:**
```json
{
  "title": "Frontend Developer",
  "description": "Job description...",
  "company_name": "Google",
  "apply_link": "https://apply.google.com",
  "last_date": "2025-12-31",
  "salary": 1200000,
  "interview_details": "{\"codingRound\":{\"enabled\":true,\"date\":\"2025-12-20\",\"time\":\"10:00\",\"venue\":\"Lab 101\",\"instructions\":\"Solve 3 DSA problems\"},\"technicalInterview\":{\"enabled\":false},\"hrRound\":{\"enabled\":false},\"projectTask\":{\"enabled\":false}}"
}
```

**Database Changes:**
```sql
ALTER TABLE jobs ADD COLUMN interview_details TEXT;
```

---

### 2. Get Job Applications

**Endpoint:** `GET /api/job-applications/all`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "jobId": 5,
    "studentId": 10,
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "jobTitle": "Frontend Developer",
    "companyName": "Google",
    "resumeUrl": "/uploads/resumes/john_resume.pdf",
    "appliedAt": "2025-12-15T10:30:00Z",
    "status": "PENDING",
    "student": {
      "id": 10,
      "username": "John Doe",
      "email": "john@example.com"
    },
    "job": {
      "id": 5,
      "title": "Frontend Developer",
      "company_name": "Google",
      "interview_details": "{...}"
    }
  }
]
```

**Database Table:**
```sql
CREATE TABLE job_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(100),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);
```

---

### 3. Update Application Status

**Endpoint:** `PUT /api/job-applications/{id}/status`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "SHORTLISTED"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "SHORTLISTED",
  "reviewedAt": "2025-12-15T14:30:00Z",
  "reviewedBy": "admin@example.com"
}
```

**Backend Logic:**
```java
@PutMapping("/job-applications/{id}/status")
public ResponseEntity<?> updateApplicationStatus(
    @PathVariable Long id,
    @RequestBody StatusUpdateDTO statusDTO,
    Principal principal
) {
    JobApplication application = jobApplicationRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    
    application.setStatus(statusDTO.getStatus());
    application.setReviewedAt(LocalDateTime.now());
    application.setReviewedBy(principal.getName());
    
    jobApplicationRepository.save(application);
    
    // If SHORTLISTED, create interview entries and send email
    if ("SHORTLISTED".equals(statusDTO.getStatus())) {
        createInterviewsForStudent(application);
        sendAcceptanceEmail(application);
    } else if ("REJECTED".equals(statusDTO.getStatus())) {
        sendRejectionEmail(application);
    }
    
    return ResponseEntity.ok(application);
}
```

---

### 4. Create Interview Entries on Acceptance

**Function:** `createInterviewsForStudent(JobApplication application)`

**Logic:**
```java
private void createInterviewsForStudent(JobApplication application) {
    Job job = application.getJob();
    String interviewDetailsJson = job.getInterviewDetails();
    
    if (interviewDetailsJson == null || interviewDetailsJson.isEmpty()) {
        return; // No interview details configured
    }
    
    JSONObject details = new JSONObject(interviewDetailsJson);
    
    // Create Coding Round if enabled
    if (details.has("codingRound")) {
        JSONObject coding = details.getJSONObject("codingRound");
        if (coding.getBoolean("enabled")) {
            InterviewDrive interview = new InterviewDrive();
            interview.setCompany(job.getCompanyName());
            interview.setDate(coding.getString("date"));
            interview.setTime(coding.getString("time"));
            interview.setVenue(coding.getString("venue"));
            interview.setPositions("Coding Round - " + job.getTitle());
            interview.setEligibility("Shortlisted Candidate");
            interviewDriveRepository.save(interview);
            
            // Link to student
            linkInterviewToStudent(interview, application.getStudent());
        }
    }
    
    // Repeat for Technical, HR, and Project Task rounds
}

private void linkInterviewToStudent(InterviewDrive interview, User student) {
    // Create application entry linking student to interview
    Application app = new Application();
    app.setInterviewDrive(interview);
    app.setStudent(student);
    app.setStatus("PENDING");
    app.setAppliedAt(LocalDateTime.now());
    applicationRepository.save(app);
}
```

---

### 5. Send Email Notifications (SendGrid)

**Endpoint:** `POST /api/emails/send`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "to": "student@example.com",
  "subject": "Congratulations! You've been shortlisted",
  "templateType": "ACCEPTANCE",
  "data": {
    "studentName": "John Doe",
    "jobTitle": "Frontend Developer",
    "companyName": "Google",
    "interviewDetails": {...}
  }
}
```

**Backend Implementation (Java + SendGrid):**

```java
@Service
public class EmailService {
    
    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from.email}")
    private String fromEmail;
    
    public void sendEmail(EmailRequest emailRequest) throws IOException {
        Email from = new Email(fromEmail);
        Email to = new Email(emailRequest.getTo());
        String subject = emailRequest.getSubject();
        
        String htmlContent = buildEmailContent(emailRequest);
        Content content = new Content("text/html", htmlContent);
        
        Mail mail = new Mail(from, subject, to, content);
        
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            
            if (response.getStatusCode() >= 400) {
                throw new RuntimeException("Failed to send email: " + response.getBody());
            }
        } catch (IOException ex) {
            throw ex;
        }
    }
    
    private String buildEmailContent(EmailRequest emailRequest) {
        if ("ACCEPTANCE".equals(emailRequest.getTemplateType())) {
            return buildAcceptanceEmail(emailRequest.getData());
        } else if ("REJECTION".equals(emailRequest.getTemplateType())) {
            return buildRejectionEmail(emailRequest.getData());
        }
        return "";
    }
    
    private String buildAcceptanceEmail(Map<String, Object> data) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: linear-gradient(135deg, #4361ee, #00d9ff); color: white; padding: 30px; text-align: center; }");
        html.append(".content { padding: 30px; background: #f8f9fa; }");
        html.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }");
        html.append("</style></head><body>");
        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🎉 Congratulations!</h1>");
        html.append("</div>");
        html.append("<div class='content'>");
        html.append("<p>Dear ").append(data.get("studentName")).append(",</p>");
        html.append("<p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the position of <strong>")
            .append(data.get("jobTitle")).append("</strong> at <strong>").append(data.get("companyName")).append("</strong>.</p>");
        
        // Add interview details
        Object interviewDetails = data.get("interviewDetails");
        if (interviewDetails != null) {
            html.append(formatInterviewDetailsHTML(interviewDetails));
        }
        
        html.append("<p>Please check your Interview section in the portal for complete details.</p>");
        html.append("<p>Best regards,<br>Placement Cell</p>");
        html.append("</div>");
        html.append("<div class='footer'>");
        html.append("<p>This is an automated email. Please do not reply.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body></html>");
        
        return html.toString();
    }
    
    private String buildRejectionEmail(Map<String, Object> data) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: #6c757d; color: white; padding: 30px; text-align: center; }");
        html.append(".content { padding: 30px; background: #f8f9fa; }");
        html.append("</style></head><body>");
        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>Application Status Update</h1>");
        html.append("</div>");
        html.append("<div class='content'>");
        html.append("<p>Dear ").append(data.get("studentName")).append(",</p>");
        html.append("<p>Thank you for applying for the position of <strong>")
            .append(data.get("jobTitle")).append("</strong> at <strong>").append(data.get("companyName")).append("</strong>.</p>");
        html.append("<p>After careful consideration, we regret to inform you that we are unable to proceed with your application at this time.</p>");
        html.append("<p>We encourage you to apply for other opportunities available on our portal.</p>");
        html.append("<p>Best regards,<br>Placement Cell</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body></html>");
        
        return html.toString();
    }
}
```

**application.properties:**
```properties
sendgrid.api.key=YOUR_SENDGRID_API_KEY
sendgrid.from.email=placement@youruniversity.edu
```

---

### 6. Get Student's Job Applications

**Endpoint:** `GET /api/job-applications/my`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "jobId": 5,
    "jobTitle": "Frontend Developer",
    "companyName": "Google",
    "appliedAt": "2025-12-15T10:30:00Z",
    "status": "SHORTLISTED"
  }
]
```

---

## Summary of Backend Changes Required

1. **Database:**
   - Add `interview_details` column to `jobs` table
   - Create `job_applications` table

2. **Endpoints:**
   - Update `POST /admin/jobs` to accept `interview_details`
   - Create `GET /api/job-applications/all` (admin)
   - Create `GET /api/job-applications/my` (student)
   - Create `PUT /api/job-applications/{id}/status` (admin)
   - Create `POST /api/emails/send` (email service)

3. **Services:**
   - EmailService with SendGrid integration
   - Interview creation logic on application acceptance
   - Application-to-interview linking

4. **Dependencies:**
   - Add SendGrid Java library to pom.xml:
   ```xml
   <dependency>
       <groupId>com.sendgrid</groupId>
       <artifactId>sendgrid-java</artifactId>
       <version>4.9.3</version>
   </dependency>
   ```

5. **Configuration:**
   - Add SendGrid API key to application.properties
   - Configure from email address
