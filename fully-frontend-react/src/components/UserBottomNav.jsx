import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/user-bottom-nav.css';

const UserBottomNav = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const isLoggedIn = !!localStorage.getItem('authToken');
    
    const navItems = isLoggedIn ? [
        { id: 'home', icon: 'fa-home', label: 'Home', path: '/' },
        { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs', path: '/jobs' },
        { id: 'papers', icon: 'fa-copy', label: 'Papers', path: '/papers' },
        { id: 'dashboard', icon: 'fa-user-circle', label: 'Dashboard', path: '/dashboard' },
    ] : [
        { id: 'home', icon: 'fa-home', label: 'Home', path: '/' },
        { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs', path: '/jobs' },
        { id: 'papers', icon: 'fa-copy', label: 'Papers', path: '/papers' },
        { id: 'notes', icon: 'fa-sticky-note', label: 'Notes', path: '/notes' },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="user-bottom-nav">
            {navItems.map(item => (
                <Link 
                    key={item.id}
                    to={item.path}
                    className={`bottom-nav-item ${isActive(item.path) && !isMobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <i className={`fas ${item.icon}`}></i>
                    <span>{item.label}</span>
                </Link>
            ))}
            <button 
                className={`bottom-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ background: 'transparent', border: 'none', padding: 0 }}
            >
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                <span>Menu</span>
            </button>
        </nav>
    );
};

export default UserBottomNav;
