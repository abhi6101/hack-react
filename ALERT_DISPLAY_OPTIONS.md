# Custom Alert System - All Display Options

## 🎨 **5 Alert Types Available**

Our custom alert system supports 5 different types, each with unique colors and icons:

---

## 1. ✅ **SUCCESS Alert** (Green)
**Use for:** Successful operations, confirmations, completed actions

```jsx
import { useAlert } from '../components/CustomAlert';

const { showAlert } = useAlert();

showAlert({
    title: 'Success!',
    message: 'Your profile has been updated successfully.',
    type: 'success'
});
```

**Visual:**
- Icon: ✅ Green checkmark
- Color: Green (#10b981)
- Border: Green glow
- Use Case: Profile updates, successful uploads, form submissions

---

## 2. ❌ **ERROR Alert** (Red)
**Use for:** Errors, failures, validation issues

```jsx
showAlert({
    title: 'Upload Failed',
    message: 'Failed to upload ID Card. Please try again.',
    type: 'error'
});
```

**Visual:**
- Icon: ❌ Red X
- Color: Red (#ef4444)
- Border: Red glow
- Use Case: Upload failures, API errors, validation errors

---

## 3. ⚠️ **WARNING Alert** (Yellow/Orange)
**Use for:** Warnings, cautions, important notices

```jsx
showAlert({
    title: 'Session Expiring',
    message: 'Your session will expire in 5 minutes. Please save your work.',
    type: 'warning'
});
```

**Visual:**
- Icon: ⚠️ Yellow warning triangle
- Color: Orange (#f59e0b)
- Border: Orange glow
- Use Case: Session expiry, data loss warnings, important notices

---

## 4. ℹ️ **INFO Alert** (Blue)
**Use for:** General information, tips, neutral messages

```jsx
showAlert({
    title: 'Coming Soon',
    message: 'This feature is currently under development.',
    type: 'info'
});
```

**Visual:**
- Icon: ℹ️ Blue info symbol
- Color: Blue (#3b82f6)
- Border: Blue glow
- Use Case: Feature announcements, tips, general information

---

## 5. 🔒 **LOGIN Alert** (Purple)
**Use for:** Authentication required, login prompts

```jsx
showAlert({
    title: 'Login Required',
    message: 'You must be logged in to view interview schedules.',
    type: 'login',
    actions: [
        {
            label: 'Login Now',
            primary: true,
            onClick: () => navigate('/login')
        },
        {
            label: 'Go Home',
            primary: false,
            onClick: () => navigate('/')
        }
    ]
});
```

**Visual:**
- Icon: 🔒 Purple lock
- Color: Purple (#8b5cf6)
- Border: Purple glow
- Use Case: Login required, authentication needed

---

## 📝 **Alert Configurations**

### **Minimal Alert** (Just OK button)
```jsx
showAlert({
    message: 'Operation completed!'
});
// No title, no type (defaults to 'info'), single OK button
```

### **Alert with Title**
```jsx
showAlert({
    title: 'Important Notice',
    message: 'Please read the terms and conditions.',
    type: 'warning'
});
```

### **Alert with Custom Actions**
```jsx
showAlert({
    title: 'Delete Confirmation',
    message: 'Are you sure you want to delete this item?',
    type: 'warning',
    actions: [
        {
            label: 'Delete',
            primary: true,
            onClick: () => handleDelete()
        },
        {
            label: 'Cancel',
            primary: false,
            onClick: () => console.log('Cancelled')
        }
    ]
});
```

### **Alert with Multiple Actions**
```jsx
showAlert({
    title: 'Choose an Option',
    message: 'How would you like to proceed?',
    type: 'info',
    actions: [
        {
            label: 'Option 1',
            primary: true,
            onClick: () => handleOption1()
        },
        {
            label: 'Option 2',
            primary: false,
            onClick: () => handleOption2()
        },
        {
            label: 'Cancel',
            primary: false,
            onClick: () => console.log('Cancelled')
        }
    ]
});
```

---

## 🎯 **Common Use Cases**

### **1. Form Submission Success**
```jsx
showAlert({
    title: 'Message Sent!',
    message: 'Thank you for your message! We will get back to you shortly.',
    type: 'success'
});
```

### **2. File Upload Error**
```jsx
showAlert({
    title: 'Upload Failed',
    message: 'Please upload a PDF file only.',
    type: 'error'
});
```

### **3. Session Expired**
```jsx
showAlert({
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    type: 'warning',
    actions: [
        {
            label: 'Login',
            primary: true,
            onClick: () => navigate('/login')
        }
    ]
});
```

### **4. Coming Soon Feature**
```jsx
showAlert({
    title: 'Coming Soon',
    message: 'This feature is currently under development and will be available soon.',
    type: 'info'
});
```

### **5. Login Required**
```jsx
showAlert({
    title: 'Login Required',
    message: 'You must be logged in to access this feature.',
    type: 'login',
    actions: [
        {
            label: 'Login Now',
            primary: true,
            onClick: () => navigate('/login')
        },
        {
            label: 'Go Home',
            primary: false,
            onClick: () => navigate('/')
        }
    ]
});
```

### **6. Confirmation Dialog**
```jsx
showAlert({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed with this action?',
    type: 'warning',
    actions: [
        {
            label: 'Yes, Proceed',
            primary: true,
            onClick: () => handleConfirm()
        },
        {
            label: 'Cancel',
            primary: false
        }
    ]
});
```

---

## 🔧 **Alert Properties**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | No | - | Alert title/heading |
| `message` | string | Yes | - | Main alert message |
| `type` | string | No | 'info' | Alert type: 'success', 'error', 'warning', 'info', 'login' |
| `actions` | array | No | `[{label: 'OK'}]` | Array of action buttons |

### **Action Button Properties**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | Yes | Button text |
| `primary` | boolean | No | If true, button has gradient background |
| `onClick` | function | No | Function to call when clicked |

---

## 🎨 **Visual Features**

All alerts include:
- ✨ Animated entrance (scale + fade)
- 🎭 Backdrop blur effect
- 🌈 Color-coded borders and icons
- 💫 Pulsing ring around icon
- 🎪 Icon rotation animation
- 🌊 Animated gradient background
- 🎯 Ripple effect on icon
- 🖱️ Hover effects on buttons
- 📱 Responsive design
- 🚪 Click outside to dismiss

---

## 📚 **Quick Reference**

```jsx
// Import at top of component
import { useAlert } from '../components/CustomAlert';

// Inside component
const { showAlert } = useAlert();

// Basic usage
showAlert({ message: 'Hello!' });

// With type
showAlert({ 
    message: 'Success!', 
    type: 'success' 
});

// Full featured
showAlert({
    title: 'Title Here',
    message: 'Message here',
    type: 'success', // or 'error', 'warning', 'info', 'login'
    actions: [
        { label: 'Primary', primary: true, onClick: () => {} },
        { label: 'Secondary', primary: false, onClick: () => {} }
    ]
});

// Close programmatically
const { hideAlert } = useAlert();
hideAlert();
```

---

## 🎯 **Best Practices**

1. **Choose the right type:**
   - Success: Green for positive outcomes
   - Error: Red for failures
   - Warning: Orange for cautions
   - Info: Blue for neutral messages
   - Login: Purple for authentication

2. **Keep messages concise:**
   - Title: 2-5 words
   - Message: 1-2 sentences

3. **Use actions wisely:**
   - Max 2-3 actions per alert
   - Make primary action clear
   - Always provide a way to dismiss

4. **Be consistent:**
   - Use same type for similar actions
   - Maintain consistent wording
   - Follow established patterns
