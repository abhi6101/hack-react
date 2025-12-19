# Role-Based Access Control (RBAC) System - Complete Specification

## 🎯 Role Hierarchy

```
SUPER_ADMIN (Main Admin)
    ├── Can add/edit/delete DEPT_ADMIN
    ├── Can add/edit/delete COMPANY_ADMIN
    ├── Can manage all departments
    ├── Can manage all jobs
    ├── Can view all students
    └── Full system access

DEPT_ADMIN (Department Admin)
    ├── Can add/edit/delete COMPANY_ADMIN
    ├── Can manage students in their department
    ├── Can verify student profiles
    ├── Can view job applications from their department
    └── Cannot manage other departments

COMPANY_ADMIN (Company Admin)
    ├── Can post jobs for their company only
    ├── Can edit/delete their own jobs
    ├── Can view applications for their jobs
    ├── Can update application status
    └── Cannot manage users or departments

USER/STUDENT
    ├── Can view jobs
    ├── Can apply for jobs
    ├── Can create/edit their profile
    ├── Can view their applications
    └── Read-only access to most features
```

---

## 🔐 Access Control Matrix

| Feature | SUPER_ADMIN | DEPT_ADMIN | COMPANY_ADMIN | STUDENT |
|---------|-------------|------------|---------------|---------|
| **User Management** |
| Add DEPT_ADMIN | ✅ | ❌ | ❌ | ❌ |
| Add COMPANY_ADMIN | ✅ | ✅ | ❌ | ❌ |
| Add STUDENT | ✅ | ✅ | ❌ | ❌ |
| Edit Users | ✅ | ✅ (own dept) | ❌ | ❌ |
| Delete Users | ✅ | ✅ (own dept) | ❌ | ❌ |
| View All Users | ✅ | ✅ (own dept) | ❌ | ❌ |
| **Department Management** |
| Add Department | ✅ | ❌ | ❌ | ❌ |
| Edit Department | ✅ | ❌ | ❌ | ❌ |
| Delete Department | ✅ | ❌ | ❌ | ❌ |
| View Departments | ✅ | ✅ | ✅ | ✅ |
| **Job Management** |
| Post Job (Any Company) | ✅ | ❌ | ❌ | ❌ |
| Post Job (Own Company) | ✅ | ❌ | ✅ | ❌ |
| Edit Any Job | ✅ | ❌ | ❌ | ❌ |
| Edit Own Job | ✅ | ❌ | ✅ | ❌ |
| Delete Any Job | ✅ | ❌ | ❌ | ❌ |
| Delete Own Job | ✅ | ❌ | ✅ | ❌ |
| View All Jobs | ✅ | ✅ | ✅ | ✅ |
| **Student Profile Management** |
| Verify Profiles | ✅ | ✅ (own dept) | ❌ | ❌ |
| View All Profiles | ✅ | ✅ (own dept) | ❌ | ❌ |
| Download Resumes | ✅ | ✅ (own dept) | ❌ | ❌ |
| Edit Own Profile | ❌ | ❌ | ❌ | ✅ |
| **Application Management** |
| View All Applications | ✅ | ✅ (own dept) | ❌ | ❌ |
| View Own Company Apps | ✅ | ❌ | ✅ | ❌ |
| Update App Status | ✅ | ✅ | ✅ (own jobs) | ❌ |
| Delete Applications | ✅ | ❌ | ❌ | ❌ |
| Apply for Jobs | ❌ | ❌ | ❌ | ✅ |
| **Interview Management** |
| Post Interview | ✅ | ❌ | ✅ | ❌ |
| Edit Interview | ✅ | ❌ | ✅ (own) | ❌ |
| Delete Interview | ✅ | ❌ | ✅ (own) | ❌ |
| Apply for Interview | ❌ | ❌ | ❌ | ✅ |
| **Analytics & Reports** |
| Company Stats | ✅ | ❌ | ❌ | ❌ |
| Student Activity | ✅ | ✅ (own dept) | ❌ | ❌ |
| Placement Reports | ✅ | ✅ (own dept) | ✅ (own) | ❌ |
| **Email Settings** |
| Master Email Toggle | ✅ | ❌ | ❌ | ❌ |
| Email Preferences | ✅ | ❌ | ❌ | ❌ |
| **Gallery Management** |
| Approve Gallery Items | ✅ | ❌ | ❌ | ❌ |
| Upload to Gallery | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Test Scenarios

### Scenario 1: SUPER_ADMIN Workflow
1. ✅ Login as SUPER_ADMIN
2. ✅ Add departments (MCA, BCA, IMCA)
3. ✅ Create DEPT_ADMIN for MCA department
4. ✅ Create COMPANY_ADMIN for "Google"
5. ✅ Post a job for any company
6. ✅ View all students across departments
7. ✅ Verify student profiles
8. ✅ View analytics and stats

### Scenario 2: DEPT_ADMIN Workflow
1. ✅ Login as DEPT_ADMIN (MCA)
2. ✅ Create COMPANY_ADMIN for "Microsoft"
3. ✅ View students only from MCA department
4. ✅ Verify MCA student profiles
5. ✅ View job applications from MCA students
6. ❌ Cannot add departments
7. ❌ Cannot view students from other departments
8. ❌ Cannot post jobs

### Scenario 3: COMPANY_ADMIN Workflow
1. ✅ Login as COMPANY_ADMIN (Google)
2. ✅ Post job for Google only
3. ✅ Edit/delete own jobs
4. ✅ View applications for Google jobs
5. ✅ Update application status
6. ❌ Cannot post jobs for other companies
7. ❌ Cannot manage users
8. ❌ Cannot manage departments

### Scenario 4: STUDENT Workflow
1. ✅ Login as STUDENT
2. ✅ View all available jobs
3. ✅ Apply for jobs
4. ✅ Create/edit own profile
5. ✅ Upload resume
6. ✅ View own applications
7. ❌ Cannot access admin panel
8. ❌ Cannot manage anything

---

## 🔧 Backend Security Rules

### User Controller
```java
@PreAuthorize("hasRole('SUPER_ADMIN')")
- Create DEPT_ADMIN
- Delete any user

@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DEPT_ADMIN')")
- Create COMPANY_ADMIN
- View users (filtered by department for DEPT_ADMIN)
```

### Job Controller
```java
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
- Create job (company filtered for COMPANY_ADMIN)
- Update job (ownership check for COMPANY_ADMIN)
- Delete job (ownership check for COMPANY_ADMIN)
```

### Department Controller
```java
@PreAuthorize("hasRole('SUPER_ADMIN')")
- Create department
- Update department
- Delete department
```

### Profile Controller
```java
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DEPT_ADMIN')")
- Verify profiles (department filtered for DEPT_ADMIN)
- View all profiles (department filtered for DEPT_ADMIN)
- Download resumes (department filtered for DEPT_ADMIN)
```

---

## 📝 Data Visibility Rules

### SUPER_ADMIN
- Sees: **Everything**
- Filters: None

### DEPT_ADMIN
- Sees: Students, profiles, applications from **their department only**
- Filters: `WHERE department = adminDepartment`

### COMPANY_ADMIN
- Sees: Jobs and applications for **their company only**
- Filters: `WHERE company_name = adminCompany`

### STUDENT
- Sees: All jobs, own applications, own profile
- Filters: `WHERE user_id = currentUserId` (for personal data)

---

## 🎯 Critical Features to Test

### Authentication & Authorization
- [ ] Login with different roles
- [ ] Token validation
- [ ] Role-based route protection
- [ ] Unauthorized access returns 403

### User Management
- [ ] SUPER_ADMIN can create all roles
- [ ] DEPT_ADMIN can create COMPANY_ADMIN
- [ ] COMPANY_ADMIN cannot create users
- [ ] Users can only edit their own profile

### Job Posting
- [ ] SUPER_ADMIN can post for any company
- [ ] COMPANY_ADMIN can only post for their company
- [ ] Company name is auto-filled for COMPANY_ADMIN
- [ ] Company name is locked for COMPANY_ADMIN

### Student Verification
- [ ] SUPER_ADMIN sees all students
- [ ] DEPT_ADMIN sees only their department
- [ ] Profile verification updates status
- [ ] Email notifications sent on approval

### Application Management
- [ ] Students can apply for jobs
- [ ] Admins can view applications
- [ ] Status updates trigger emails
- [ ] Cannot apply twice for same job

---

## 🚨 Security Checks

### Frontend
- [ ] Admin routes require authentication
- [ ] Role-based UI rendering
- [ ] Disabled buttons for unauthorized actions
- [ ] Redirect to login on 401

### Backend
- [ ] JWT token validation
- [ ] Role-based endpoint protection
- [ ] Ownership verification for edits
- [ ] SQL injection prevention
- [ ] XSS protection

---

## 📊 Expected Behavior Summary

**SUPER_ADMIN:**
- Full control over everything
- No restrictions

**DEPT_ADMIN:**
- Can manage users in their department
- Can create company admins
- Cannot manage departments or other dept students

**COMPANY_ADMIN:**
- Can only manage their company's jobs
- Company name is locked
- Cannot manage users or departments

**STUDENT:**
- Can view and apply for jobs
- Can manage own profile
- No admin access

---

## ✅ All Features Working Checklist

- [ ] User authentication (all roles)
- [ ] User creation (role-based)
- [ ] Department management (SUPER_ADMIN only)
- [ ] Job posting (SUPER_ADMIN, COMPANY_ADMIN)
- [ ] Job editing (ownership check)
- [ ] Student profile verification
- [ ] Job applications
- [ ] Application status updates
- [ ] Interview drives
- [ ] Email notifications
- [ ] Gallery management
- [ ] Analytics and reports
- [ ] Role-based data filtering
- [ ] Security and authorization
