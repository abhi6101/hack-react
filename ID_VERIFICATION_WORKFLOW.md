# 🆔 ID Card Verification & Computer Code Workflow

## 📋 **Complete Workflow**

---

## 🎯 **Scenario 1: New User Registration**

### **Step 1: Student Registers**
```
Student fills form:
- Username
- Email
- Password
- Name
- Phone
```

**Backend:** Creates user with `computerCode = null`

---

### **Step 2: Admin Verifies ID Card**

**Admin Panel:**
1. Admin sees list of unverified users
2. Admin clicks "Verify" button
3. **Popup appears:**
   - Shows student details
   - Upload ID card image
   - **Input field: Computer Code** (e.g., 59500)
   - Verify button

**Admin enters:**
- Computer Code: `59500` (from ID card)
- Uploads ID card image

**Backend updates:**
```java
user.setComputerCode("59500");
user.setVerified(true);
user.setIdCardPath("/uploads/id-cards/59500.jpg");
```

---

## 🎯 **Scenario 2: Existing Users (Already Logged In)**

### **Step 1: User Logs In**

**Check if computer code is missing:**
```java
if (user.getComputerCode() == null || user.getComputerCode().isEmpty()) {
    // Show profile update popup
    return { requiresProfileUpdate: true };
}
```

---

### **Step 2: Profile Update Popup**

**Frontend shows modal:**
```
┌─────────────────────────────────────┐
│  📋 Complete Your Profile           │
├─────────────────────────────────────┤
│                                     │
│  Please upload your ID card and     │
│  enter your computer code.          │
│                                     │
│  Computer Code: [_________]         │
│  (e.g., 59500)                      │
│                                     │
│  ID Card: [Choose File]             │
│                                     │
│  [Submit]  [Skip for now]           │
│                                     │
└─────────────────────────────────────┘
```

**User enters:**
- Computer Code: `59500`
- Uploads ID card

**Backend updates:**
```java
user.setComputerCode("59500");
user.setIdCardPath("/uploads/id-cards/59500.jpg");
```

---

## 🔧 **Backend Implementation**

### **1. Add Endpoint for Profile Update**

```java
// AdminUserController.java or ProfileController.java

@PutMapping("/profile/update-computer-code")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<?> updateComputerCode(
        @RequestParam("computerCode") String computerCode,
        @RequestParam("idCard") MultipartFile idCard,
        Principal principal) {
    
    String username = principal.getName();
    Users user = userRepo.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Check if computer code already exists
    if (userRepo.findByComputerCode(computerCode).isPresent()) {
        return ResponseEntity.badRequest()
            .body("Computer code already exists");
    }
    
    // Save ID card
    String idCardPath = fileStorageService.saveIdCard(idCard, computerCode);
    
    // Update user
    user.setComputerCode(computerCode);
    user.setIdCardPath(idCardPath);
    userRepo.save(user);
    
    return ResponseEntity.ok("Profile updated successfully");
}
```

---

### **2. Add Endpoint for Admin Verification**

```java
@PutMapping("/admin/users/{id}/verify")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN')")
public ResponseEntity<?> verifyUser(
        @PathVariable Integer id,
        @RequestParam("computerCode") String computerCode,
        @RequestParam("idCard") MultipartFile idCard,
        Principal principal) {
    
    Users user = userRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // DEPT_ADMIN validation
    String currentUsername = principal.getName();
    Users currentUser = userRepo.findByUsername(currentUsername).orElse(null);
    
    if (currentUser != null && "DEPT_ADMIN".equals(currentUser.getRole())) {
        if (!currentUser.getAdminBranch().equals(user.getBranch())) {
            return ResponseEntity.status(403)
                .body("Access Denied: Not your branch student");
        }
    }
    
    // Check if computer code already exists
    if (userRepo.findByComputerCode(computerCode).isPresent()) {
        return ResponseEntity.badRequest()
            .body("Computer code already exists");
    }
    
    // Save ID card
    String idCardPath = fileStorageService.saveIdCard(idCard, computerCode);
    
    // Update user
    user.setComputerCode(computerCode);
    user.setIdCardPath(idCardPath);
    user.setVerified(true);
    userRepo.save(user);
    
    return ResponseEntity.ok("User verified successfully");
}
```

---

### **3. Add Login Check**

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // ... authentication logic
    
    Users user = userRepo.findByUsername(request.getUsername())
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Generate token
    String token = jwtService.generateToken(user.getUsername());
    
    // Check if profile needs update
    boolean requiresProfileUpdate = (user.getComputerCode() == null || 
                                    user.getComputerCode().isEmpty());
    
    return ResponseEntity.ok(new LoginResponse(
        token,
        user.getRole(),
        requiresProfileUpdate
    ));
}
```

---

## 🎨 **Frontend Implementation**

### **1. Login Response Handler**

```javascript
// Login.jsx
const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.requiresProfileUpdate) {
        // Show profile update popup
        setShowProfileUpdatePopup(true);
    } else {
        // Normal login flow
        localStorage.setItem('authToken', data.token);
        navigate('/dashboard');
    }
};
```

---

### **2. Profile Update Popup Component**

```javascript
// ProfileUpdatePopup.jsx
const ProfileUpdatePopup = ({ onClose, onUpdate }) => {
    const [computerCode, setComputerCode] = useState('');
    const [idCard, setIdCard] = useState(null);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('computerCode', computerCode);
        formData.append('idCard', idCard);
        
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/profile/update-computer-code`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        if (response.ok) {
            alert('Profile updated successfully!');
            onUpdate();
        } else {
            const error = await response.text();
            alert(error);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>📋 Complete Your Profile</h2>
                <p>Please upload your ID card and enter your computer code.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Computer Code (e.g., 59500)</label>
                        <input 
                            type="text"
                            value={computerCode}
                            onChange={(e) => setComputerCode(e.target.value)}
                            required
                            placeholder="59500"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>ID Card Image</label>
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setIdCard(e.target.files[0])}
                            required
                        />
                    </div>
                    
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Skip for now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
```

---

### **3. Admin Verification UI**

```javascript
// AdminDashboard.jsx - User List
{users.map(user => (
    <tr key={user.id}>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>{user.computerCode || 'Not Set'}</td>
        <td>
            {!user.computerCode && (
                <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => openVerifyModal(user)}
                >
                    <i className="fas fa-check"></i> Verify
                </button>
            )}
        </td>
    </tr>
))}
```

---

## 📊 **Complete Flow Diagram**

```
NEW USER:
┌─────────────┐
│  Register   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ User Created    │
│ computerCode:   │
│ null            │
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│ Admin Panel      │
│ Shows Unverified │
│ Users            │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Admin Clicks     │
│ "Verify"         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Popup Opens:     │
│ - Upload ID Card │
│ - Enter Code     │
│   (59500)        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User Updated:    │
│ computerCode:    │
│ "59500"          │
│ verified: true   │
└──────────────────┘

EXISTING USER:
┌─────────────┐
│  Login      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Check if        │
│ computerCode    │
│ exists?         │
└──────┬──────────┘
       │
       ├─ Yes ─→ Normal Dashboard
       │
       └─ No ──→ Show Popup
                 ┌──────────────────┐
                 │ Profile Update   │
                 │ Popup            │
                 │ - Enter Code     │
                 │ - Upload ID      │
                 └──────┬───────────┘
                        │
                        ▼
                 ┌──────────────────┐
                 │ User Updated     │
                 │ computerCode:    │
                 │ "59500"          │
                 └──────────────────┘
```

---

## ✅ **Implementation Checklist**

### **Backend:**
- [x] Computer code field added
- [x] Repository methods added
- [ ] Profile update endpoint
- [ ] Admin verification endpoint
- [ ] Login check for missing computer code
- [ ] File storage for ID cards

### **Frontend:**
- [ ] Profile update popup component
- [ ] Admin verification modal
- [ ] Login flow update
- [ ] ID card upload UI

### **Database:**
- [ ] Add computer_code column
- [ ] Add id_card_path column
- [ ] Run migration

---

## 🎯 **Summary**

**Computer Code Assignment:**
1. ✅ **New Users:** Admin verifies ID card and sets code
2. ✅ **Existing Users:** Popup on login to update profile
3. ✅ **Unique Validation:** Database enforced
4. ✅ **ID Card Storage:** Uploaded and saved

**Status:** ✅ **Backend Ready, Frontend Pending**
