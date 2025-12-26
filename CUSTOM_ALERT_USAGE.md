# Custom Alert System Usage

## How to Use

Import the hook in any component:

```jsx
import { useAlert } from '../components/CustomAlert';

function MyComponent() {
    const { showAlert } = useAlert();

    // Simple alert
    showAlert({
        title: 'Success!',
        message: 'Your action was completed successfully.',
        type: 'success' // 'success', 'error', 'warning', 'info', 'login'
    });

    // Alert with custom actions
    showAlert({
        title: 'Login Required',
        message: 'You must be logged in to continue.',
        type: 'login',
        actions: [
            {
                label: 'Login Now',
                primary: true,
                onClick: () => navigate('/login')
            },
            {
                label: 'Cancel',
                primary: false,
                onClick: () => navigate('/')
            }
        ]
    });
}
```

## Alert Types

- `success` - Green checkmark ✅
- `error` - Red X ❌
- `warning` - Yellow warning ⚠️
- `info` - Blue info ℹ️
- `login` - Purple lock 🔒

## Replace Old Alerts

**Before:**
```jsx
alert('Something happened!');
```

**After:**
```jsx
const { showAlert } = useAlert();
showAlert({
    message: 'Something happened!',
    type: 'info'
});
```
