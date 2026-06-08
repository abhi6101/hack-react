import React, { useState, useEffect } from 'react';
import '../styles/admin-bottom-nav.css';

const AdminBottomNav = ({ activeTab, setActiveTab }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let timeoutId;

        const handleScroll = () => {
            setIsVisible(true);
            
            // Clear any existing timeout
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            // Hide after 5 seconds of inactivity
            timeoutId = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Initial timeout when component mounts
        timeoutId = setTimeout(() => {
            setIsVisible(false);
        }, 5000);

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    const navItems = [
        { id: 'dashboard', icon: 'fa-home', label: 'Home' },
        { id: 'users', icon: 'fa-users', label: 'Users' },
        { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs' },
        { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
        { id: 'menu', icon: 'fa-bars', label: 'Menu' }
    ];

    return (
        <nav className={`admin-bottom-nav ${!isVisible ? 'hidden' : ''}`}>
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
