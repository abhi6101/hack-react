# 🎯 Frontend UI Updates Required

## ✅ Backend Implementation Complete

All backend features are implemented. Now we need to update the frontend UI to expose these features.

---

## 📝 Required Frontend Changes

### **1. Update AdminDashboard.jsx - User Form State**

**Location:** Line 112-114

**Current:**
```javascript
const [userForm, setUserForm] = useState({
    username: '', email: '', password: '', role: 'USER'
});
```

**Update to:**
```javascript
const [userForm, setUserForm] = useState({
    username: '', 
    email: '', 
    password: '', 
    role: 'USER',
    adminBranch: '',           // NEW: For DEPT_ADMIN
    allowedDepartments: [],    // NEW: For COMPANY_ADMIN
    companyName: ''            // Existing for COMPANY_ADMIN
});
```

---

### **2. Update User Creation Form - Add Department Selection**

**Location:** Around line 1595-1625

**Add after DEPT_ADMIN branch selection:**

```jsx
{/* DEPT_ADMIN: Admin Branch Selection */}
{userForm.role === 'DEPT_ADMIN' && (
    <div className="form-group">
        <label>Admin Branch *</label>
        <select 
            className="form-control" 
            required
            value={userForm.adminBranch || ''}
            onChange={e => setUserForm({ ...userForm, adminBranch: e.target.value })}
        >
            <option value="">Select Branch to Manage</option>
            <option value="MCA">MCA</option>
            <option value="BCA">BCA</option>
            <option value="IMCA">IMCA</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="B.Tech AIML">B.Tech AIML</option>
            <option value="B.Tech CVM">B.Tech CVM</option>
        </select>
        <small className="form-text text-muted">
            This admin will manage only this branch
        </small>
    </div>
)}

{/* COMPANY_ADMIN: Allowed Departments Selection */}
{userForm.role === 'COMPANY_ADMIN' && (
    <>
        <div className="form-group">
            <label>Company Name *</label>
            <input 
                type="text" 
                className="form-control" 
                required
                value={userForm.companyName || ''}
                onChange={e => setUserForm({ ...userForm, companyName: e.target.value })}
                placeholder="e.g., Google, Microsoft"
            />
        </div>
        
        <div className="form-group">
            <label>Allowed Departments *</label>
            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                {['MCA', 'BCA', 'IMCA', 'B.Tech CSE', 'B.Tech AIML', 'B.Tech CVM'].map(dept => (
                    <div key={dept} className="form-check">
                        <input 
                            type="checkbox" 
                            className="form-check-input"
                            id={`dept-${dept}`}
                            checked={userForm.allowedDepartments.includes(dept)}
                            onChange={e => {
                                if (e.target.checked) {
                                    setUserForm({
                                        ...userForm,
                                        allowedDepartments: [...userForm.allowedDepartments, dept]
                                    });
                                } else {
                                    setUserForm({
                                        ...userForm,
                                        allowedDepartments: userForm.allowedDepartments.filter(d => d !== dept)
                                    });
                                }
                            }}
                        />
                        <label className="form-check-label" htmlFor={`dept-${dept}`}>
                            {dept}
                        </label>
                    </div>
                ))}
            </div>
            <small className="form-text text-muted">
                Company can post jobs for selected departments only
            </small>
        </div>
    </>
)}
```

---

### **3. Update User Creation API Call**

**Location:** Around line 700-715

**Update the body to include new fields:**

```javascript
const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Prepare payload
    const payload = {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role
    };
    
    // Add role-specific fields
    if (userForm.role === 'DEPT_ADMIN') {
        payload.adminBranch = userForm.adminBranch;
    }
    
    if (userForm.role === 'COMPANY_ADMIN') {
        payload.companyName = userForm.companyName;
        payload.allowedDepartments = userForm.allowedDepartments.join(','); // Convert array to comma-separated string
    }
    
    try {
        const response = await fetch(`${ADMIN_API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            alert('User created successfully!');
            setUserForm({ 
                username: '', 
                email: '', 
                password: '', 
                role: 'USER',
                adminBranch: '',
                allowedDepartments: [],
                companyName: ''
            });
            fetchUsers(); // Refresh user list
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user');
    }
};
```

---

### **4. Update Interview Drive Form - Add Batch Selection**

**Location:** Around line 109-111 (interviewForm state)

**Current:**
```javascript
const [interviewForm, setInterviewForm] = useState({
    company: '', date: '', time: '', venue: '', positions: '', eligibility: ''
});
```

**Update to:**
```javascript
const [interviewForm, setInterviewForm] = useState({
    company: '', 
    date: '', 
    time: '', 
    venue: '', 
    positions: '', 
    eligibility: '',
    eligibleBranches: [],      // NEW
    eligibleSemesters: [],     // NEW
    eligibleBatches: []        // NEW
});
```

---

### **5. Add Batch Selection UI in Interview Form**

**Add this in the interview drive form:**

```jsx
<div className="form-group">
    <label>Eligible Batches (Passout Year)</label>
    <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
        {['2023', '2024', '2025', '2026', '2027', '2028'].map(batch => (
            <div key={batch} className="form-check form-check-inline">
                <input 
                    type="checkbox" 
                    className="form-check-input"
                    id={`batch-${batch}`}
                    checked={interviewForm.eligibleBatches.includes(batch)}
                    onChange={e => {
                        if (e.target.checked) {
                            setInterviewForm({
                                ...interviewForm,
                                eligibleBatches: [...interviewForm.eligibleBatches, batch]
                            });
                        } else {
                            setInterviewForm({
                                ...interviewForm,
                                eligibleBatches: interviewForm.eligibleBatches.filter(b => b !== batch)
                            });
                        }
                    }}
                />
                <label className="form-check-label" htmlFor={`batch-${batch}`}>
                    {batch}
                </label>
            </div>
        ))}
    </div>
    <small className="form-text text-muted">
        Select passout years (current students + alumni)
    </small>
</div>
```

---

### **6. Update Department Management UI**

**Add a new section for creating departments with branches:**

```jsx
{activeTab === 'departments' && (
    <div className="admin-section">
        <h2>Department Management</h2>
        
        <div className="department-form">
            <h3>Create Department with Branches</h3>
            
            <div className="form-group">
                <label>Department Name *</label>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g., School of Computer"
                />
            </div>
            
            <div className="form-group">
                <label>Department Code *</label>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g., SOC"
                />
            </div>
            
            <div className="form-group">
                <label>HOD Name</label>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g., Dr. Smith (for entire department)"
                />
            </div>
            
            <h4>Branches</h4>
            <div className="branches-list">
                {/* Branch 1: MCA */}
                <div className="branch-item">
                    <input type="text" placeholder="Branch Name" value="MCA" />
                    <input type="text" placeholder="Code" value="MCA" />
                    <input type="number" placeholder="Semesters" value="4" />
                    <input type="text" placeholder="Branch HOD (optional)" />
                </div>
                
                {/* Branch 2: BCA */}
                <div className="branch-item">
                    <input type="text" placeholder="Branch Name" value="BCA" />
                    <input type="text" placeholder="Code" value="BCA" />
                    <input type="number" placeholder="Semesters" value="6" />
                    <input type="text" placeholder="Branch HOD (optional)" />
                </div>
                
                {/* Branch 3: IMCA */}
                <div className="branch-item">
                    <input type="text" placeholder="Branch Name" value="IMCA" />
                    <input type="text" placeholder="Code" value="IMCA" />
                    <input type="number" placeholder="Semesters" value="10" />
                    <input type="text" placeholder="Branch HOD (optional)" />
                </div>
            </div>
            
            <button className="btn btn-primary">
                <i className="fas fa-plus"></i> Add Branch
            </button>
            
            <button className="btn btn-success">
                <i className="fas fa-save"></i> Create Department
            </button>
        </div>
    </div>
)}
```

---

## 🎯 Summary of Changes

### **Files to Modify:**
1. ✅ `AdminDashboard.jsx` - Main admin interface

### **Changes Needed:**

1. **User Form State:**
   - Add `adminBranch` field
   - Add `allowedDepartments` array

2. **User Creation Form:**
   - Add admin branch dropdown for DEPT_ADMIN
   - Add department checkboxes for COMPANY_ADMIN

3. **Interview Drive Form:**
   - Add `eligibleBatches` array
   - Add batch year checkboxes (2023-2028)

4. **Department Management:**
   - Add hierarchical department creation UI
   - Support multiple branches per department

---

## 📊 Testing After Implementation

1. **Create DEPT_ADMIN:**
   - Select branch (e.g., MCA)
   - Verify they can only post for MCA

2. **Create COMPANY_ADMIN:**
   - Select departments (e.g., MCA, BCA, IMCA)
   - Verify they can only post for selected departments

3. **Post Interview Drive:**
   - Select batches (e.g., 2023, 2024, 2027)
   - Verify filtering works

4. **Create Department:**
   - Add SOC with MCA, BCA, IMCA branches
   - Verify hierarchy is saved

---

## ⚡ Quick Implementation

Due to the large file size (2400 lines), I recommend:

1. **Option 1:** Make changes manually following this guide
2. **Option 2:** I can create a separate component file for the new forms
3. **Option 3:** I can provide specific line-by-line replacements

**Which option would you prefer?** 🤔
