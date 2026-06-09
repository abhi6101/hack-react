import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/user-bottom-nav.css';

const UserMobileMenu = ({ setIsMobileMenuOpen }) => {
    const isLoggedIn = !!localStorage.getItem('authToken');
    const name = localStorage.getItem('name') || '';
    const username = localStorage.getItem('username') || '';

    const handleLogout = () => {
        localStorage.clear();
        setIsMobileMenuOpen(false);
        window.location.href = '/';
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
                ...(isLoggedIn ? [{ path: '/jobs', icon: 'fa-briefcase', label: 'Jobs Listing' }] : []),
                { path: '/interview', icon: 'fa-comments', label: 'Interview Drives' },
                ...(isLoggedIn ? [{ path: '/resume-builder', icon: 'fa-file-alt', label: 'Build Resume' }] : [])
            ]
        },
        {
            title: 'Study Resources',
            icon: 'fa-book-reader',
            items: [
                { path: '/papers', icon: 'fa-copy', label: 'Question Papers' },
                ...(isLoggedIn ? [{ path: '/upload-paper', icon: 'fa-upload', label: 'Contribute Paper' }] : []),
                ...(isLoggedIn ? [{ path: '/notes', icon: 'fa-sticky-note', label: 'Subject Notes' }] : []),
                { path: '/quiz', icon: 'fa-brain', label: 'Interactive Quiz' },
                { path: '/videos', icon: 'fa-video', label: 'Lecture Videos' },
                { path: '/courses', icon: 'fa-book', label: 'Skill Courses' }
            ]
        },
        {
            title: 'Explore & Support',
            icon: 'fa-compass',
            items: [
                { path: '/gallery', icon: 'fa-images', label: 'Campus Gallery' },
                { path: '/blog', icon: 'fa-blog', label: 'Placement Blog' },
                { path: '/contact', icon: 'fa-envelope', label: 'Help & Support' }
            ]
        }
    ].filter(group => group.items.length > 0);

    return (
        <div className="user-mobile-menu-container animate-in">
            
            {/* Student Portal - Always at the top */}
            <div className="mobile-menu-group card surface-glow" style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                            onClick={handleLogout}
                            className="mobile-menu-logout-btn"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <Link
                            to="/login"
                            onClick={handleNavigation}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.9rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textDecoration: 'none'
                            }}
                            className="mobile-menu-item"
                        >
                            <i className="fas fa-sign-in-alt" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}></i>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', textAlign: 'center' }}>Sign In</span>
                        </Link>
                        <Link
                            to="/register"
                            onClick={handleNavigation}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.9rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textDecoration: 'none'
                            }}
                            className="mobile-menu-item"
                        >
                            <i className="fas fa-user-plus" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}></i>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', textAlign: 'center' }}>Register</span>
                        </Link>
                    </div>
                )}
            </div>

            {menuGroups.map(group => (
                <div key={group.title} className="mobile-menu-group card surface-glow" style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}>
                        <i className={`fas ${group.icon}`}></i> {group.title}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {group.items.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavigation}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.9rem',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none'
                                }}
                                className="mobile-menu-item"
                            >
                                <i className={`fas ${item.icon}`} style={{ fontSize: '1.25rem', color: 'var(--primary)' }}></i>
                                <span style={{ fontSize: '0.8rem', fontWeight: '500', textAlign: 'center' }}>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserMobileMenu;
