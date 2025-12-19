# Adding School of Computer (SOC) Departments

## Option 1: Using Admin Panel (Recommended)

1. **Login to Admin Panel** at: `http://localhost:5173/admin`

2. **Go to "Manage Departments" tab**

3. **Click "Bulk Add" button**

4. **Fill in the form:**
   - **Category:** School of Computer
   - **Degree:** MCA
   - **Max Semesters:** 4
   - **Branches:** MCA (just type "MCA")
   - Click **Submit**

5. **Repeat for BCA:**
   - **Category:** School of Computer
   - **Degree:** BCA
   - **Max Semesters:** 6
   - **Branches:** BCA
   - Click **Submit**

6. **Repeat for IMCA:**
   - **Category:** School of Computer
   - **Degree:** IMCA
   - **Max Semesters:** 10
   - **Branches:** IMCA
   - Click **Submit**

---

## Option 2: Using SQL Script

If you have direct database access:

1. **Open your database client** (e.g., MySQL Workbench, pgAdmin, H2 Console)

2. **Run the SQL script:** `ADD_SOC_DEPARTMENTS.sql`

3. **Verify:** Check that 3 new departments appear in the departments table

---

## Option 3: Using API (Postman/cURL)

### Add MCA
```bash
curl -X POST https://placement-portal-backend-production.up.railway.app/api/admin/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Master of Computer Applications",
    "code": "MCA",
    "category": "School of Computer",
    "degree": "MCA",
    "hodName": "TBD",
    "contactEmail": "mca@college.edu",
    "maxSemesters": 4
  }'
```

### Add BCA
```bash
curl -X POST https://placement-portal-backend-production.up.railway.app/api/admin/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Bachelor of Computer Applications",
    "code": "BCA",
    "category": "School of Computer",
    "degree": "BCA",
    "hodName": "TBD",
    "contactEmail": "bca@college.edu",
    "maxSemesters": 6
  }'
```

### Add IMCA
```bash
curl -X POST https://placement-portal-backend-production.up.railway.app/api/admin/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Integrated Master of Computer Applications",
    "code": "IMCA",
    "category": "School of Computer",
    "degree": "IMCA",
    "hodName": "TBD",
    "contactEmail": "imca@college.edu",
    "maxSemesters": 10
  }'
```

**Note:** Replace `YOUR_TOKEN_HERE` with your actual admin token from localStorage.

---

## Department Details Summary

| Department | Code | Semesters | Years | Category |
|------------|------|-----------|-------|----------|
| Master of Computer Applications | MCA | 4 | 2 | School of Computer |
| Bachelor of Computer Applications | BCA | 6 | 3 | School of Computer |
| Integrated Master of Computer Applications | IMCA | 10 | 5 | School of Computer |

---

## After Adding Departments

Once departments are added, they will appear in:
- ✅ Job posting eligibility criteria
- ✅ Student profile branch selection
- ✅ Department management table
- ✅ Analytics and reports

---

## Troubleshooting

**Issue:** "Unauthorized" error
- **Solution:** Make sure you're logged in as SUPER_ADMIN

**Issue:** "Duplicate entry" error
- **Solution:** Department already exists, check existing departments first

**Issue:** Departments not showing in job posting form
- **Solution:** Refresh the page or re-login to reload departments
