# How to Delete Department Data

## ⚠️ WARNING
**Deleting departments is PERMANENT and cannot be undone!**
Make sure you really want to delete before proceeding.

---

## Method 1: Using Admin Panel (Easiest) ✅

### Delete Individual Departments:
1. **Login** to admin panel at `http://localhost:5173/admin`
2. Go to **"Departments"** tab
3. Find the department you want to delete
4. Click the **red "Delete" button** next to it
5. Confirm the deletion

### Delete Multiple Departments:
- Repeat the above steps for each department you want to remove

**Advantages:**
- ✅ Safe - asks for confirmation
- ✅ Visual - you can see what you're deleting
- ✅ No SQL knowledge needed

---

## Method 2: Using SQL Script (Fast)

### Delete ALL Departments:
1. **Open your database client** (H2 Console, MySQL Workbench, pgAdmin)
2. **Run this command:**
   ```sql
   DELETE FROM departments;
   ```

### Delete Only Specific Departments:

**Delete by Category:**
```sql
-- Delete all School of Computer departments
DELETE FROM departments WHERE category = 'School of Computer';

-- Delete all Engineering departments
DELETE FROM departments WHERE category = 'Engineering';
```

**Delete by Code:**
```sql
-- Delete specific departments
DELETE FROM departments WHERE code IN ('MCA', 'BCA', 'IMCA');

-- Delete all BTech departments
DELETE FROM departments WHERE code LIKE 'BTECH_%';
```

**Delete by Name:**
```sql
-- Delete departments with specific names
DELETE FROM departments WHERE name LIKE '%Computer%';
```

### Reset Auto-Increment ID:
After deleting, if you want IDs to start from 1 again:

**For H2 Database:**
```sql
ALTER TABLE departments ALTER COLUMN id RESTART WITH 1;
```

**For MySQL:**
```sql
ALTER TABLE departments AUTO_INCREMENT = 1;
```

**For PostgreSQL:**
```sql
ALTER SEQUENCE departments_id_seq RESTART WITH 1;
```

---

## Method 3: Using API (Postman/cURL)

### Delete Single Department:
```bash
curl -X DELETE https://placement-portal-backend-production.up.railway.app/api/admin/departments/{DEPARTMENT_ID} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Example:** Delete department with ID 5:
```bash
curl -X DELETE https://placement-portal-backend-production.up.railway.app/api/admin/departments/5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Note:** Replace `YOUR_TOKEN_HERE` with your actual admin token from localStorage.

---

## Method 4: Using Browser Console

1. **Open admin panel** in browser
2. **Press F12** to open developer console
3. **Go to Console tab**
4. **Run this JavaScript:**

```javascript
// Get your token
const token = localStorage.getItem('authToken');

// Delete department by ID (replace 5 with actual ID)
fetch('https://placement-portal-backend-production.up.railway.app/api/admin/departments/5', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.ok ? console.log('✅ Deleted!') : console.log('❌ Failed'))
.catch(err => console.error('Error:', err));
```

---

## Current Departments (From Your Screenshot)

Based on your screenshot, you have:

| Code | Name | HOD |
|------|------|-----|
| MCA | Master of computer application | Mr. Monish Purohit |
| BTECH_CSE_CORE | btech in CSE Core | TBD |
| BTECH_AIML | btech in AIML | TBD |
| BTECH_CVM | btech in CVM | TBD |
| BTECH_ELECTRICAL | btech in Electrical | TBD |

---

## Recommended Approach

### If you want to start completely fresh:

1. **Use SQL method** to delete all:
   ```sql
   DELETE FROM departments;
   ```

2. **Reset auto-increment:**
   ```sql
   ALTER TABLE departments ALTER COLUMN id RESTART WITH 1;
   ```

3. **Add only the departments you need** using the admin panel or SQL

### If you want to keep some departments:

1. **Use admin panel** to delete one by one
2. **OR** use SQL with WHERE clause to delete specific ones

---

## After Deletion

**Verify deletion:**
```sql
SELECT * FROM departments;
```

**Check count:**
```sql
SELECT COUNT(*) as total_departments FROM departments;
```

---

## ⚠️ Important Notes

1. **Backup First:** Consider backing up your database before deleting
2. **Dependencies:** If jobs or profiles reference these departments, you may get errors
3. **Cascade:** Check if your database has CASCADE delete enabled
4. **Confirmation:** Admin panel will ask for confirmation before deleting

---

## Quick Reference

| Task | SQL Command |
|------|-------------|
| Delete all | `DELETE FROM departments;` |
| Delete by category | `DELETE FROM departments WHERE category = 'X';` |
| Delete by code | `DELETE FROM departments WHERE code = 'X';` |
| Delete multiple | `DELETE FROM departments WHERE code IN ('A', 'B');` |
| Count remaining | `SELECT COUNT(*) FROM departments;` |
| View all | `SELECT * FROM departments;` |

---

## Need Help?

If you encounter errors:
- Check if there are foreign key constraints
- Verify you have admin permissions
- Make sure no jobs/profiles are using these departments
- Share the error message for specific help
