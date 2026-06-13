const fs = require('fs');

const adminContent = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const extractFunction = (funcName) => {
    const startStr = `const ${funcName} =`;
    const startIdx = adminContent.indexOf(startStr);
    if (startIdx === -1) return '';
    const endStr = '    };\n';
    const endIdx = adminContent.indexOf(endStr, startIdx);
    return adminContent.substring(startIdx, endIdx + endStr.length);
};

const funcs = [
    extractFunction('loadUsers'),
    extractFunction('handleUserSubmit'),
    extractFunction('deleteUser'),
    extractFunction('startEditUser'),
    extractFunction('clearUserForm')
].join('\n');

const uiContent = fs.readFileSync('users_extract.txt', 'utf8')
    .replace("case 'users':", '')
    .replace('return (', '')
    .replace(/;\n\s*$/, ''); // remove the last semicolon and return

const componentCode = `import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import ToggleSwitch from '../components/ToggleSwitch';

const ManageUsers = ({
    users, setUsers, loadingUsers, setLoadingUsers,
    departments, isCompanyAdmin, isSuperAdmin, myCompanyName, role,
    getToken, handleUnauthorized, showToast
}) => {
    const ADMIN_API_URL = \`\${API_BASE_URL}/admin\`;
    const [message, setMessage] = useState({ text: '', type: '' });
    const [userSearch, setUserSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER',
        adminBranch: '',
        allowedDepartments: [],
        companyName: '',
        computerCode: '',
        batch: '',
        branch: ''
    });

    // We only call loadUsers once if it's not handled upstream, but upstream usually handles it.
    // If upstream handles it, we don't strictly need loadUsers, but we have to define it here if we extracted the logic.
    // Actually, AdminDashboard handles the initial load of users, so we can just re-use the passed 'users' prop.

${funcs}

    // the UI
    const filteredUsers = users.filter(user => {
        if (!user) return false;
        const s = userSearch.toLowerCase();
        const matchesSearch = 
            (user.username && user.username.toLowerCase().includes(s)) ||
            (user.email && user.email.toLowerCase().includes(s)) ||
            (user.role && user.role.toLowerCase().includes(s)) ||
            (user.computerCode && String(user.computerCode).toLowerCase().includes(s)) ||
            (user.batch && String(user.batch).toLowerCase().includes(s));
            
        if (!matchesSearch) return false;

        // Role-based filtering
        if (role === 'COMPANY_ADMIN') {
            return user.role === 'USER'; 
        }
        if (role === 'DEPT_ADMIN') {
            const myBranch = localStorage.getItem('adminBranch');
            return user.role === 'USER' && user.branch === myBranch;
        }
        return true;
    });

    return (
        ${uiContent}
    );
};

export default ManageUsers;
`;

fs.writeFileSync('src/pages/admin/ManageUsers.jsx', componentCode);
console.log('ManageUsers.jsx created');
