# Job Posting Debug Guide

## Issue Identified
The browser console shows **401 Unauthorized** errors, which means the authentication token is not being accepted by the backend.

## Steps to Fix

### 1. Check Your Login Status
1. Open the browser console (F12)
2. Type: `localStorage.getItem('authToken')`
3. Check if you have a valid token

### 2. Re-login to Get Fresh Token
1. **Log out** from the admin panel
2. **Log back in** with your admin credentials
3. This will generate a fresh authentication token

### 3. Verify Token Format
The token should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (a long JWT string)

### 4. Test Job Posting
After re-logging in:
1. Go to **Manage Jobs** tab
2. Click **Fill Sample** button to populate the form
3. Click **Post Job**
4. Check the browser console for the debug logs we added

## Debug Console Logs to Watch For

When you click "Post Job", you should see:
- 🚀 Job Posting Started...
- 📝 Form Data: {...}
- 📦 Job Payload: {...}
- 🌐 API Endpoint: ...
- 📨 HTTP Method: POST
- 🔑 Token: Present
- ⏳ Sending request to backend...
- 📡 Response Status: 200 OK (if successful)
- ✅ Job saved successfully

## Common Issues & Solutions

### Issue: "Token: Missing"
**Solution:** You're not logged in. Go to login page and sign in.

### Issue: "Response Status: 401 Unauthorized"
**Solution:** Your token is expired or invalid. Log out and log back in.

### Issue: "Response Status: 403 Forbidden"
**Solution:** Your account doesn't have admin permissions. Contact super admin.

### Issue: "Response Status: 500 Internal Server Error"
**Solution:** Backend issue. Check backend logs or contact support.

### Issue: Missing required fields error
**Solution:** Fill all required fields (Job Title, Company Name, Description, Apply Link, Last Date, Salary)

## Backend Health Check

Test if backend is running:
```
Open: https://placement-portal-backend-production.up.railway.app/api/health
```

If you get an error, the backend server might be down.

## Next Steps

1. **Clear browser cache and cookies** (Ctrl+Shift+Delete)
2. **Log out completely**
3. **Log back in with admin credentials**
4. **Try posting a job again**
5. **Check console for detailed error messages**

## If Still Not Working

Share the console output with me, specifically:
- All the emoji debug logs (🚀, 📝, 📦, etc.)
- Any error messages in red
- The response status code
