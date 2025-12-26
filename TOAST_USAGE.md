# Toast Notification System - Usage Guide

## 🎉 **What are Toast Notifications?**

Toast notifications are small, non-blocking messages that appear in the bottom-right corner of the screen. They:
- ✅ Auto-dismiss after 5 seconds
- ✅ Have a close button (X)
- ✅ Show a progress bar
- ✅ Can stack multiple toasts
- ✅ Don't block user interaction
- ✅ Slide in from the right with animation

---

## 📋 **When to Use Toasts vs Modals**

### **Use Toast Notifications For:**
- ✅ Success messages ("Profile updated!")
- ✅ Error notifications ("Upload failed")
- ✅ Info messages ("Coming soon")
- ✅ Quick feedback
- ✅ Non-critical alerts
- ✅ Status updates

### **Use Modal Alerts For:**
- ✅ Login required
- ✅ Confirmations ("Are you sure?")
- ✅ Critical errors
- ✅ Actions requiring user choice
- ✅ Important information that must be acknowledged

---

## 🚀 **How to Use**

### **1. Import the Hook**
```jsx
import { useToast } from '../components/CustomToast';
```

### **2. Get the Function**
```jsx
const { showToast } = useToast();
```

### **3. Show a Toast**
```jsx
showToast({
    message: 'Profile updated successfully!',
    type: 'success'
});
```

---

## 🎨 **Toast Types**

### **1. Success Toast** (Green ✅)
```jsx
showToast({
    message: 'Profile updated successfully!',
    type: 'success'
});
```

### **2. Error Toast** (Red ❌)
```jsx
showToast({
    message: 'Failed to upload file.',
    type: 'error'
});
```

### **3. Warning Toast** (Orange ⚠️)
```jsx
showToast({
    message: 'Session will expire in 5 minutes.',
    type: 'warning'
});
```

### **4. Info Toast** (Blue ℹ️)
```jsx
showToast({
    message: 'This feature is coming soon!',
    type: 'info'
});
```

---

## ⚙️ **Configuration Options**

### **Custom Duration**
```jsx
showToast({
    message: 'This will stay for 10 seconds',
    type: 'info',
    duration: 10000  // milliseconds
});
```

### **No Auto-Dismiss**
```jsx
showToast({
    message: 'This stays until manually closed',
    type: 'warning',
    duration: 0  // Won't auto-dismiss
});
```

---

## 📝 **Complete Example**

```jsx
import React from 'react';
import { useToast } from '../components/CustomToast';

const MyComponent = () => {
    const { showToast } = useToast();

    const handleSave = async () => {
        try {
            await saveProfile();
            showToast({
                message: 'Profile saved successfully!',
                type: 'success'
            });
        } catch (error) {
            showToast({
                message: 'Failed to save profile.',
                type: 'error'
            });
        }
    };

    return (
        <button onClick={handleSave}>
            Save Profile
        </button>
    );
};
```

---

## 🎯 **Common Use Cases**

### **Form Submission**
```jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await submitForm(formData);
        showToast({
            message: 'Form submitted successfully!',
            type: 'success'
        });
    } catch (error) {
        showToast({
            message: 'Submission failed. Please try again.',
            type: 'error'
        });
    }
};
```

### **File Upload**
```jsx
const handleUpload = async (file) => {
    if (!file.type.includes('pdf')) {
        showToast({
            message: 'Please upload a PDF file only.',
            type: 'error'
        });
        return;
    }
    
    try {
        await uploadFile(file);
        showToast({
            message: 'File uploaded successfully!',
            type: 'success'
        });
    } catch (error) {
        showToast({
            message: 'Upload failed. Please try again.',
            type: 'error'
        });
    }
};
```

### **Coming Soon Feature**
```jsx
const handleFeatureClick = () => {
    showToast({
        message: 'This feature is coming soon!',
        type: 'info',
        duration: 3000
    });
};
```

### **Session Warning**
```jsx
useEffect(() => {
    const timer = setTimeout(() => {
        showToast({
            message: 'Your session will expire in 5 minutes.',
            type: 'warning',
            duration: 0  // Stays until closed
        });
    }, 25 * 60 * 1000);  // 25 minutes
    
    return () => clearTimeout(timer);
}, []);
```

---

## 🎨 **Visual Features**

Each toast includes:
- **Icon** - Color-coded emoji (✅ ❌ ⚠️ ℹ️)
- **Message** - Your custom text
- **Close Button** - X button with hover effect
- **Progress Bar** - Shows time remaining
- **Animated Background** - Subtle gradient pulse
- **Slide Animation** - Slides in from right
- **Stack Support** - Multiple toasts stack vertically

---

## 🔧 **API Reference**

### **showToast(options)**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | - | The toast message |
| `type` | string | No | 'info' | Toast type: 'success', 'error', 'warning', 'info' |
| `duration` | number | No | 5000 | Auto-dismiss time in ms (0 = no auto-dismiss) |

---

## 💡 **Tips**

1. **Keep messages short** - 1-2 lines max
2. **Use appropriate types** - Match the color to the message
3. **Don't overuse** - Too many toasts can be annoying
4. **Stack limit** - System handles up to 5 toasts at once
5. **Mobile friendly** - Toasts are responsive

---

## 🆚 **Toast vs Modal Comparison**

| Feature | Toast | Modal |
|---------|-------|-------|
| Position | Bottom-right | Center |
| Blocking | No | Yes |
| Auto-dismiss | Yes (5s) | No |
| Close button | Yes | Yes |
| Multiple | Yes (stacked) | No |
| User action | Optional | Required |
| Use case | Quick feedback | Important decisions |

---

## 🎬 **Migration from alert()**

### **Before:**
```jsx
alert('Profile updated successfully!');
```

### **After:**
```jsx
showToast({
    message: 'Profile updated successfully!',
    type: 'success'
});
```

Much better! 🎉
