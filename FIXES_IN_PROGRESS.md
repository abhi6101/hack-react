# 🔧 FIXES APPLIED - 2025-12-19 21:24 IST

## ✅ **Fix 1: DEPT_ADMIN Restriction - Only One Per Branch**

### **Problem:**
User requested that each B.Tech department should have only ONE department admin (DEPT_ADMIN), not multiple.

### **Solution Applied:**

#### **Backend Changes:**

**1. Added Repository Method** (`UserRepo.java`)
```java
// NEW: Find users by role and branch (for DEPT_ADMIN validation)
List<Users> findByRoleAndBranch(String role, String branch);
```

**2. Added Validation in Create User** (`AdminUserController.java` Lines 60-74)
```java
// DEPT_ADMIN Validation: Only ONE DEPT_ADMIN per branch
if ("DEPT_ADMIN".equals(user.getRole())) {
    if (user.getBranch() == null || user.getBranch().isEmpty()) {
        return ResponseEntity.badRequest().body("Branch is required for DEPT_ADMIN role");
    }
    
    // Check if a DEPT_ADMIN already exists for this branch
    List<Users> existingDeptAdmins = userRepo.findByRoleAndBranch("DEPT_ADMIN", user.getBranch());
    if (!existingDeptAdmins.isEmpty()) {
        String existingAdmin = existingDeptAdmins.get(0).getUsername();
        return ResponseEntity.badRequest().body(
            "A Department Admin already exists for " + user.getBranch() + 
            " (" + existingAdmin + "). Only one DEPT_ADMIN is allowed per department."
        );
    }
}
```

### **How It Works:**

1. **When creating a new user with DEPT_ADMIN role:**
   - System checks if branch is provided
   - Queries database for existing DEPT_ADMIN with same branch
   - If found, returns error with existing admin's username
   - If not found, allows creation

2. **Error Message Example:**
   ```
   "A Department Admin already exists for CSE_BTECH 
    (prof_sharma). Only one DEPT_ADMIN is allowed per department."
   ```

### **Files Modified:**
- ✅ `UserRepo.java` - Added `findByRoleAndBranch()` method
- ✅ `AdminUserController.java` - Added validation in `createUser()`

### **Status:**
✅ **PUSHED TO GITHUB** (Commit: `c77a99d`)  
✅ **DEPLOYING TO RAILWAY** (Wait 3-5 minutes)

---

## ⚠️ **Fix 2: Department Edit Button Missing** (IN PROGRESS)

### **Problem:**
User reported that there is no edit button in the department management page to edit departments.

### **Current Status:**
- ✅ Delete button exists (`deleteDept()` function found)
- ✅ Create button exists (`handleDeptSubmit()` function found)
- ❌ **Edit button MISSING**

### **Functions Found:**
```javascript
// Existing functions in AdminDashboard.jsx
const loadDepartments = async () => { ... }  // Line 293-302
const handleDeptSubmit = async (e) => { ... } // Line 304-321  
const deleteDept = async (id) => { ... }      // Line 378-382
```

### **What Needs to be Added:**

1. **Edit Department Function:**
```javascript
const [editingDept, setEditingDept] = useState(null);

const startEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
        name: dept.name,
        code: dept.code,
        hodName: dept.hodName,
        contactEmail: dept.contactEmail,
        maxSemesters: dept.maxSemesters
    });
};

const updateDept = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_BASE_URL}/admin/departments/${editingDept.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(deptForm)
        });
        if (res.ok) {
            setMessage({ text: 'Department Updated!', type: 'success' });
            loadDepartments();
            setEditingDept(null);
            setDeptForm({ name: '', code: '', hodName: '', contactEmail: '', maxSemesters: 8 });
        }
    } catch (e) { 
        setMessage({ text: 'Failed to update dept', type: 'error' }); 
    }
};
```

2. **Edit Button in Department Table:**
```javascript
{departments.map(dept => (
    <tr key={dept.id}>
        <td>{dept.name}</td>
        <td>{dept.code}</td>
        <td>{dept.hodName}</td>
        <td>
            <button onClick={() => startEditDept(dept)} className="btn-edit">
                <i className="fas fa-edit"></i> Edit
            </button>
            <button onClick={() => deleteDept(dept.id)} className="btn-delete">
                <i className="fas fa-trash"></i> Delete
            </button>
        </td>
    </tr>
))}
```

3. **Update Form Submit Handler:**
```javascript
const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (editingDept) {
        await updateDept(e);  // Update existing
    } else {
        // Create new (existing code)
    }
};
```

### **Next Steps:**
1. ⏳ Find the exact location of department table rendering
2. ⏳ Add edit button to each department row
3. ⏳ Add edit functionality
4. ⏳ Test and push to GitHub

---

## 📊 **Summary:**

| Fix | Status | Files Changed | Deployed |
|-----|--------|---------------|----------|
| **DEPT_ADMIN Restriction** | ✅ COMPLETE | UserRepo.java, AdminUserController.java | ✅ YES (c77a99d) |
| **Department Edit Button** | ⏳ IN PROGRESS | AdminDashboard.jsx | ❌ NOT YET |

---

## 🚀 **Deployment Status:**

**Backend:**
- ✅ Commit: `c77a99d`
- ✅ Message: "Add: DEPT_ADMIN restriction - only one per branch"
- ✅ Pushed to: https://github.com/abhi6101/placement-portal-backend.git
- ⏳ Railway deploying (wait 3-5 minutes)

**Frontend:**
- ⏳ Department edit button - pending implementation

---

**Last Updated:** 2025-12-19 21:24 IST  
**Next:** Add department edit functionality to frontend
