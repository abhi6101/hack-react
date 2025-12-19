# Quick RBAC Testing Guide

## 🎯 Goal
Verify that the complete role-based access control system is working correctly without manual testing.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Test Users

Run this SQL in your database:

```sql
-- 1. Create SUPER_ADMIN (if not exists)
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES ('superadmin', 'super@admin.com', '$2a$10$encoded_password', 'SUPER_ADMIN', true, true);

-- 2. Create DEPT_ADMIN for MCA
INSERT INTO users (username, email, password, role, enabled, verified, admin_branch)
VALUES ('deptadmin_mca', 'mca@admin.com', '$2a$10$encoded_password', 'DEPT_ADMIN', true, true, 'MCA');

-- 3. Create COMPANY_ADMIN for Google
INSERT INTO users (username, email, password, role, enabled, verified, company_name)
VALUES ('google_admin', 'google@admin.com', '$2a$10$encoded_password', 'COMPANY_ADMIN', true, true, 'Google');

-- 4. Create STUDENT
INSERT INTO users (username, email, password, role, enabled, verified)
VALUES ('student1', 'student@test.com', '$2a$10$encoded_password', 'USER', true, true);
```

**Note:** Replace `$2a$10$encoded_password` with actual bcrypt hashed passwords.

---

### Step 2: Run Automated Tests

**Option A: Browser Console (Easiest)**
1. Open your admin panel in browser
2. Press **F12** to open console
3. Copy and paste the entire content of `RBAC_AUTO_TEST.js`
4. Press Enter
5. Tests will auto-run in 3 seconds
6. View results in console

**Option B: Using Test File**
1. Open browser console
2. Run: `fetch('file:///path/to/RBAC_AUTO_TEST.js').then(r => r.text()).then(eval)`
3. Or manually copy-paste the file content

---

### Step 3: Review Results

The test will show:
```
✅ Passed: X/Y
❌ Failed: Z/Y
📈 Success Rate: XX%
```

**Expected Results:**
- ✅ All authentication tests should pass
- ✅ SUPER_ADMIN should have full access
- ✅ DEPT_ADMIN should be restricted to their department
- ✅ COMPANY_ADMIN should only manage their company
- ✅ STUDENT should have read-only access

---

## 📋 Manual Verification Checklist

If you prefer manual testing, follow this:

### Test 1: SUPER_ADMIN
- [ ] Login as SUPER_ADMIN
- [ ] Go to "Manage Users" → Create DEPT_ADMIN ✅
- [ ] Go to "Manage Users" → Create COMPANY_ADMIN ✅
- [ ] Go to "Departments" → Add new department ✅
- [ ] Go to "Manage Jobs" → Post job for any company ✅
- [ ] Go to "Student Details" → View all students ✅

### Test 2: DEPT_ADMIN
- [ ] Login as DEPT_ADMIN (MCA)
- [ ] Go to "Manage Users" → Create COMPANY_ADMIN ✅
- [ ] Try to create DEPT_ADMIN → Should FAIL ❌
- [ ] Go to "Student Details" → See only MCA students ✅
- [ ] Try to add department → Should FAIL ❌
- [ ] Try to post job → Should FAIL ❌

### Test 3: COMPANY_ADMIN
- [ ] Login as COMPANY_ADMIN (Google)
- [ ] Go to "Manage Jobs" → Post job ✅
- [ ] Company name should be auto-filled and locked ✅
- [ ] Edit own job ✅
- [ ] Delete own job ✅
- [ ] Try to access "Manage Users" → Should FAIL ❌
- [ ] Try to access "Departments" → Should FAIL ❌

### Test 4: STUDENT
- [ ] Login as STUDENT
- [ ] View jobs page ✅
- [ ] Apply for a job ✅
- [ ] View own applications ✅
- [ ] Try to access admin panel → Should redirect to home ❌

---

## 🔍 What Each Test Checks

### Authentication Tests
- ✅ All roles can login
- ✅ Tokens are generated correctly
- ✅ Invalid credentials are rejected

### User Management Tests
- ✅ SUPER_ADMIN can create all roles
- ✅ DEPT_ADMIN can create COMPANY_ADMIN only
- ✅ COMPANY_ADMIN cannot create users
- ✅ Unauthorized access returns 403

### Department Management Tests
- ✅ Only SUPER_ADMIN can manage departments
- ✅ Other roles get 403 error

### Job Management Tests
- ✅ SUPER_ADMIN can post for any company
- ✅ COMPANY_ADMIN can only post for their company
- ✅ Company name is enforced for COMPANY_ADMIN
- ✅ DEPT_ADMIN cannot post jobs

### Data Visibility Tests
- ✅ SUPER_ADMIN sees everything
- ✅ DEPT_ADMIN sees only their department
- ✅ COMPANY_ADMIN sees only their company data
- ✅ STUDENT sees only public data

---

## 🎯 Expected Test Results

| Test Category | Expected Pass Rate |
|---------------|-------------------|
| Authentication | 100% (4/4) |
| User Management | 100% (4/4) |
| Department Management | 100% (2/2) |
| Job Management | 100% (3/3) |
| Data Visibility | 100% (3/3) |
| **TOTAL** | **100% (16/16)** |

---

## 🐛 Troubleshooting

### All tests fail with "Login failed"
**Solution:** Test users don't exist. Create them using SQL script above.

### Tests fail with "CORS error"
**Solution:** Run tests from the same domain as your app, or enable CORS in backend.

### Tests fail with "403 Forbidden"
**Solution:** Check backend authorization rules. Ensure `@PreAuthorize` annotations are correct.

### Tests fail with "401 Unauthorized"
**Solution:** Token generation might be failing. Check JWT configuration.

---

## 📊 Interpreting Results

### 100% Pass Rate ✅
**Great!** All RBAC features are working correctly.

### 90-99% Pass Rate ⚠️
**Good, but...** Some edge cases might be failing. Review failed tests.

### Below 90% Pass Rate ❌
**Issues detected!** Review failed tests and fix authorization rules.

---

## 🔧 Quick Fixes

### If COMPANY_ADMIN can post for other companies:
**Fix:** Check `AdminJobController.java` line 50-61

### If DEPT_ADMIN can see all students:
**Fix:** Add department filter in student profile queries

### If STUDENT can access admin panel:
**Fix:** Check route protection in `AdminDashboard.jsx` line 624-628

---

## 📁 Files Reference

1. **`RBAC_SPECIFICATION.md`** - Complete role hierarchy and permissions
2. **`RBAC_AUTO_TEST.js`** - Automated test script
3. **`QUICK_RBAC_TEST_GUIDE.md`** - This file

---

## ✅ Final Checklist

Before going live:
- [ ] All automated tests pass
- [ ] Manual spot-checks confirm behavior
- [ ] Test users are created
- [ ] Backend authorization rules are in place
- [ ] Frontend route protection works
- [ ] Data filtering is correct for each role
- [ ] Security audit passed

---

## 🆘 Need Help?

If tests fail:
1. Check console for specific error messages
2. Review `RBAC_SPECIFICATION.md` for expected behavior
3. Check backend logs for authorization errors
4. Verify database has test users
5. Share failed test details for debugging

---

**Status:** Ready to test! 🚀
**Time to complete:** ~5 minutes for automated tests
**Manual testing:** ~15-20 minutes if needed
