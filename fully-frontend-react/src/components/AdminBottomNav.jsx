import React, { useState, useEffect } from 'react';
import '../styles/admin-bottom-nav.css';

const AdminBottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', icon: 'fa-home', label: 'Home' },
        { id: 'users', icon: 'fa-users', label: 'Users' },
        { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs' },
        { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
        { id: 'menu', icon: 'fa-bars', label: 'Menu' }
    ];

    return (
        <nav className="admin-bottom-nav">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    className={`bottom-nav-item ${activeTab === item.id || (item.id === 'menu' && !['dashboard', 'users', 'jobs', 'students'].includes(activeTab)) ? 'active' : ''}`}
                    onClick={() => {
                        if(item.id === 'menu') {
                            setActiveTab('menu');
                        } else {
                            setActiveTab(item.id);
                        }
                    }}
                >
                    <i className={`fas ${item.icon}`}></i>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default AdminBottomNav;
