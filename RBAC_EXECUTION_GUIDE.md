# 🚀 RBAC Testing - Step-by-Step Execution Guide

## ⚡ Quick 3-Step Process

### **Step 1: Create Test Users (2 minutes)**

**Option A: Using SQL (Recommended)**
1. Open your database console (H2 Console, MySQL Workbench, etc.)
2. Open file: `CREATE_TEST_USERS.sql`
3. Copy and run the SQL script
4. Verify 4 users are created

**Option B: Using Admin Panel**
1. Login as your existing admin
2. Go to "Manage Users" tab
3. Create these 4 users manually:
   - `superadmin` (SUPER_ADMIN)
   - `deptadmin_mca` (DEPT_ADMIN, branch: MCA)
   - `google_admin` (COMPANY_ADMIN, company: Google)
   - `student1` (USER)

---

### **Step 2: Run Automated Tests (3 minutes)**

1. **Open your admin panel** in browser: `http://localhost:5173/admin`

2. **Open browser console:**
   - Press `F12`
   - Click on "Console" tab

3. **Copy test script:**
   - Open file: `RBAC_AUTO_TEST.js`
   - Select ALL code (Ctrl+A)
   - Copy (Ctrl+C)

4. **Paste and run:**
   - Click in console
   - Paste (Ctrl+V)
   - Press Enter

5. **Wait for results:**
   - Tests will auto-run in 3 seconds
   - Watch the console output

---

### **Step 3: Review Results (1 minute)**

You'll see output like this:

```
🚀 Starting RBAC Automated Tests...

📋 Testing Authentication...
✅ SUPER_ADMIN login
✅ DEPT_ADMIN login
✅ COMPANY_ADMIN login
✅ STUDENT login

📋 Testing User Management...
✅ SUPER_ADMIN creates DEPT_ADMIN
✅ DEPT_ADMIN creates COMPANY_ADMIN
✅ COMPANY_ADMIN blocked from creating users
✅ STUDENT blocked from admin access

📋 Testing Department Management...
✅ SUPER_ADMIN creates department
✅ DEPT_ADMIN blocked from creating departments

📋 Testing Job Management...
✅ SUPER_ADMIN posts job for any company
✅ COMPANY_ADMIN posts job
✅ DEPT_ADMIN blocked from posting jobs

📋 Testing Data Visibility...
✅ SUPER_ADMIN views all jobs
✅ COMPANY_ADMIN views jobs
✅ STUDENT views public jobs

═══════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════════════════════
✅ Passed: 16/16
❌ Failed: 0/16
📈 Success Rate: 100.0%
═══════════════════════════════════════
```

---

## 🎯 What Success Looks Like

### ✅ **100% Pass Rate**
**Meaning:** All RBAC features are working perfectly!
- SUPER_ADMIN can add DEPT_ADMIN ✓
- DEPT_ADMIN can add COMPANY_ADMIN ✓
- COMPANY_ADMIN restricted to own company ✓
- All security rules enforced ✓

### ⚠️ **90-99% Pass Rate**
**Meaning:** Mostly working, minor issues
- Check which tests failed
- Review error messages
- Fix specific issues

### ❌ **Below 90% Pass Rate**
**Meaning:** Major issues detected
- Review backend authorization rules
- Check database schema
- Verify test users exist

---

## 🔧 Troubleshooting

### Issue: "Login failed" for all users
**Cause:** Test users don't exist in database
**Solution:** Run `CREATE_TEST_USERS.sql` script

### Issue: "CORS error"
**Cause:** Running from different domain
**Solution:** Run tests from same domain as your app

### Issue: All tests return 401
**Cause:** JWT token generation failing
**Solution:** Check backend JWT configuration

### Issue: All tests return 403
**Cause:** Authorization rules not working
**Solution:** Check `@PreAuthorize` annotations in backend

### Issue: Some specific tests fail
**Cause:** Specific feature not working
**Solution:** Check the failed test name and fix that feature

---

## 📋 Test Users Credentials

| Username | Password | Role | Department/Company |
|----------|----------|------|-------------------|
| superadmin | admin123 | SUPER_ADMIN | - |
| deptadmin_mca | dept123 | DEPT_ADMIN | MCA |
| google_admin | company123 | COMPANY_ADMIN | Google |
| student1 | student123 | USER | - |

**Note:** These are test users only. Change passwords in production!

---

## 🎬 Video Walkthrough (Text Version)

**Minute 0:00 - 0:30:** Create test users
```sql
-- Run CREATE_TEST_USERS.sql in database
```

**Minute 0:30 - 1:00:** Open browser and console
```
1. Go to http://localhost:5173/admin
2. Press F12
3. Click Console tab
```

**Minute 1:00 - 1:30:** Copy and paste test script
```
1. Open RBAC_AUTO_TEST.js
2. Ctrl+A, Ctrl+C
3. Paste in console
4. Press Enter
```

**Minute 1:30 - 4:30:** Watch tests run
```
Tests auto-run in 3 seconds
Watch console output
See green checkmarks ✅
```

**Minute 4:30 - 5:00:** Review results
```
Check success rate
Review any failures
Done!
```

---

## 📊 Expected Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Create test users |
| 2 | 1 min | Open console & paste script |
| 3 | 3 min | Tests run automatically |
| 4 | 1 min | Review results |
| **Total** | **~7 min** | **Complete testing** |

---

## ✅ Checklist

Before running tests:
- [ ] Backend is running
- [ ] Frontend is running
- [ ] Database is accessible
- [ ] Test users are created

During tests:
- [ ] Browser console is open
- [ ] Test script is pasted
- [ ] Tests are running
- [ ] Watching output

After tests:
- [ ] Check success rate
- [ ] Review failed tests (if any)
- [ ] Fix issues
- [ ] Re-run if needed

---

## 🎯 What Each Test Verifies

### Authentication Tests (4 tests)
✅ SUPER_ADMIN can login
✅ DEPT_ADMIN can login
✅ COMPANY_ADMIN can login
✅ STUDENT can login

### User Management Tests (4 tests)
✅ SUPER_ADMIN → creates DEPT_ADMIN
✅ DEPT_ADMIN → creates COMPANY_ADMIN
✅ COMPANY_ADMIN → blocked from creating users
✅ STUDENT → blocked from admin access

### Department Management Tests (2 tests)
✅ SUPER_ADMIN → can create departments
✅ DEPT_ADMIN → blocked from creating departments

### Job Management Tests (3 tests)
✅ SUPER_ADMIN → posts job for any company
✅ COMPANY_ADMIN → posts job (company auto-filled)
✅ DEPT_ADMIN → blocked from posting jobs

### Data Visibility Tests (3 tests)
✅ SUPER_ADMIN → sees all jobs
✅ COMPANY_ADMIN → sees jobs
✅ STUDENT → sees public jobs

---

## 🚀 Ready to Start?

1. **Create test users** → Run `CREATE_TEST_USERS.sql`
2. **Open browser console** → F12
3. **Paste test script** → From `RBAC_AUTO_TEST.js`
4. **Watch magic happen** → Tests run automatically!

**Total time: ~7 minutes**
**Manual effort: Minimal**
**Confidence: Maximum** ✅

---

## 📞 Need Help?

**If tests fail:**
1. Check console for error messages
2. Note which specific tests failed
3. Review `RBAC_SPECIFICATION.md` for expected behavior
4. Check backend logs
5. Verify test users exist

**Common fixes:**
- Re-run `CREATE_TEST_USERS.sql`
- Restart backend server
- Clear browser cache
- Check database connection

---

**Ready? Let's test! 🚀**
