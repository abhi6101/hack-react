# 🚨 Custom Alert Modal Usage Guide

The `CustomAlert` system replaces the browser's native `alert()`, `confirm()`, and `prompt()` with a beautiful, glassmorphic modal.

## 📦 Usage

### 1. Import the Hook
```javascript
import { useAlert } from '../components/CustomAlert';
```

### 2. Access the Function
```javascript
const { showAlert } = useAlert();
```

### 3. Trigger the Alert
Call `showAlert` with an object configuration.

```javascript
showAlert({
  title: 'Session Expired',
  message: 'Please log in again to continue.',
  type: 'warning', // 'info', 'success', 'warning', 'error'
  actions: [
    { 
      label: 'Login', 
      primary: true, 
      onClick: () => navigate('/login') 
    }
  ]
});
```

---

## 🎨 Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | 'Alert' | The main heading of the modal. |
| `message` | string | '' | The body text of the modal. |
| `type` | string | 'info' | Determines icon and color theme ('info', 'success', 'warning', 'error'). |
| `actions` | array | `[{ label: 'OK', primary: true }]` | Array of button objects. |

### Action Object Structure
```javascript
{
  label: 'Button Text',   // Text to display
  primary: boolean,       // If true, button uses theme color (filled). If false, it's outlined/ghost.
  onClick: function       // Callback function when clicked
}
```

---

## 💡 Examples

### Basic Info Alert
```javascript
showAlert({
  title: 'Welcome',
  message: 'Welcome to the Student Portal!',
  type: 'info'
});
```

### Success Confirmation
```javascript
showAlert({
  title: 'Success',
  message: 'Your profile has been updated successfully.',
  type: 'success'
});
```

### Critical Error (Blocking)
```javascript
showAlert({
  title: 'Access Denied',
  message: 'You do not have permission to view this page.',
  type: 'error',
  actions: [
    { label: 'Go Home', primary: true, onClick: () => navigate('/') }
  ]
});
```

### Confirmation Dialog (Yes/No)
Replaces `window.confirm()`:

```javascript
const handleDelete = () => {
    showAlert({
        title: 'Delete Item?',
        message: 'Are you sure you want to delete this job? This action cannot be undone.',
        type: 'warning',
        actions: [
            { 
                label: 'Cancel', 
                primary: false, 
                onClick: () => console.log('Cancelled') 
            },
            { 
                label: 'Delete', 
                primary: true, 
                onClick: () => performDelete() 
            }
        ]
    });
};
```

---

## ⚠️ Notes
- The modal automatically closes when any action button is clicked.
- Since it uses React Context, it can be triggered from anywhere in the component tree inside `<AlertProvider>`.
