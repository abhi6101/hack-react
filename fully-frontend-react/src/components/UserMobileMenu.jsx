import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/user-bottom-nav.css';

const UserMobileMenu = ({ setIsMobileMenuOpen }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const isLoggedIn = !!localStorage.getItem('authToken');
    const name = localStorage.getItem('name') || '';
    const username = localStorage.getItem('username') || '';

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.clear();
        setIsMobileMenuOpen(false);
        window.location.href = '/';
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleNavigation = () => {
        setIsMobileMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const getInitials = (fullName) => {
        if (!fullName) return 'S';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return fullName.charAt(0).toUpperCase();
    };

    const menuGroups = [
        {
            title: 'Placement & Career',
            icon: 'fa-briefcase',
            items: [
                { path: '/interview', icon: 'fa-comments', label: 'Interview Drives' },
                ...(isLoggedIn ? [{ path: '/resume-builder', icon: 'fa-file-alt', label: 'Build Resume' }] : [])
            ]
        },
        {
            title: 'Study Resources',
            icon: 'fa-book-reader',
            items: [
                ...(isLoggedIn ? [{ path: '/upload-paper', icon: 'fa-upload', label: 'Contribute Paper' }] : []),
                ...(isLoggedIn ? [{ path: '/notes', icon: 'fa-sticky-note', label: 'Subject Notes' }] : []),
                { path: '/quiz', icon: 'fa-brain', label: 'Interactive Quiz' }
            ]
        },
        {
            title: 'Explore & Support',
            icon: 'fa-compass',
            items: [
                { path: '/gallery', icon: 'fa-images', label: 'Campus Gallery' },
                { path: '/contact', icon: 'fa-envelope', label: 'Help & Support' },
                ...(['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'].includes(localStorage.getItem('userRole')) ? [{ path: '/admin', icon: 'fa-shield-alt', label: 'Admin Portal' }] : [])
            ]
        }
    ].filter(group => group.items.length > 0);

    return (
        <div className="user-mobile-menu-container animate-in">
            
            {/* Student Portal - Always at the top */}
            <div className="mobile-menu-group card surface-glow mobile-profile-container">
                {isLoggedIn ? (
                    <div className="user-profile-card">
                        <div className="user-profile-header">
                            <div className="user-profile-avatar">
                                {getInitials(name)}
                            </div>
                            <div className="user-profile-info">
                                <h4 className="user-profile-name">{name || 'Student User'}</h4>
                                <p className="user-profile-code">
                                    <i className="fas fa-id-card"></i> {username || 'Student ID'}
                                </p>
                                <span className="user-profile-badge">
                                    <i className="fas fa-check-circle"></i> Verified Profile
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            className="mobile-menu-logout-btn"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="mobile-category-grid">
                        <Link
                            to="/login"
                            onClick={handleNavigation}
                            className="mobile-menu-item"
                        >
                            <i className="fas fa-sign-in-alt"></i>
                            <span>Sign In</span>
                        </Link>
                        <Link
                            to="/register"
                            onClick={handleNavigation}
                            className="mobile-menu-item"
                        >
                            <i className="fas fa-user-plus"></i>
                            <span>Register</span>
                        </Link>
                    </div>
                )}
            </div>

            {menuGroups.map(group => (
                <div key={group.title} className="mobile-menu-group card surface-glow mobile-category-container">
                    <h3 className="mobile-category-header">
                        <i className={`fas ${group.icon}`}></i> {group.title}
                    </h3>
                    <div className="mobile-category-grid">
                        {group.items.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavigation}
                                className="mobile-menu-item"
                            >
                                <i className={`fas ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 10000,
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#0f172a', /* Premium Dark Glassmorphism */
                        width: '100%', padding: '2rem 1.5rem',
                        borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                        textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 1.5rem auto' }}></div>
                        <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm Logout</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Are you sure you want to log out?</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={cancelLogout} style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, transition: 'all 0.2s' }}>Cancel</button>
                            <button onClick={confirmLogout} style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', fontWeight: 600, transition: 'all 0.2s' }}>Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMobileMenu;
