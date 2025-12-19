// TEST: Check Profile Status Response
// Open browser console and paste this:

const token = localStorage.getItem('authToken');
console.log('Auth Token:', token ? 'EXISTS ✅' : 'MISSING ❌');

if (token) {
    fetch('https://placement-portal-backend-production.up.railway.app/api/auth/profile-status', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log('Profile Status Response:', data);
            console.log('Needs Update:', data.needsUpdate);
            console.log('Current Name:', data.currentName);
            console.log('Current Phone:', data.currentPhone);
            console.log('Current Branch:', data.currentBranch);
            console.log('Current Semester:', data.currentSemester);
        })
        .catch(err => console.error('Error:', err));
}
