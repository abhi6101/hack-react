import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-bottom-nav.css';

const AdminBottomNav = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const navItems = [
        { id: 'home',     icon: 'fa-home',         label: 'Home',     action: () => navigate('/') },
        { id: 'users',    icon: 'fa-users',         label: 'Users',    action: () => setActiveTab('users') },
        { id: 'jobs',     icon: 'fa-briefcase',     label: 'Jobs',     action: () => setActiveTab('jobs') },
        { id: 'students', icon: 'fa-user-graduate', label: 'Students', action: () => setActiveTab('students') },
        { id: 'menu',     icon: 'fa-bars',          label: 'Menu',     action: () => setActiveTab('menu') },
    ];

    return (
        <nav className="admin-bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999 }}>
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={`bottom-nav-item ${
                        item.id !== 'home' && (
                            activeTab === item.id ||
                            (item.id === 'menu' && !['users', 'jobs', 'students', 'dashboard'].includes(activeTab))
                        ) ? 'active' : ''
                    }`}
                    onClick={item.action}
                >
                    <i className={`fas ${item.icon}`}></i>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default AdminBottomNav;
