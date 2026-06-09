import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/user-bottom-nav.css';

const UserMobileMenu = ({ setIsMobileMenuOpen }) => {
    const menuGroups = [
        {
            title: 'Placement & Career',
            icon: 'fa-briefcase',
            items: [
                { path: '/jobs', icon: 'fa-briefcase', label: 'Jobs Listing' },
                { path: '/interview', icon: 'fa-comments', label: 'Interview Drives' },
                { path: '/resume-builder', icon: 'fa-file-alt', label: 'Build Resume' },
                { path: '/resume', icon: 'fa-magic', label: 'AI Resume Review' }
            ]
        },
        {
            title: 'Study Resources',
            icon: 'fa-book-reader',
            items: [
                { path: '/papers', icon: 'fa-copy', label: 'Question Papers' },
                { path: '/upload-paper', icon: 'fa-upload', label: 'Contribute Paper' },
                { path: '/notes', icon: 'fa-sticky-note', label: 'Subject Notes' },
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
        },
        {
            title: 'Student Portal',
            icon: 'fa-user-circle',
            items: [
                { path: '/dashboard', icon: 'fa-user-circle', label: 'My Dashboard' },
                { path: '/profile', icon: 'fa-id-card', label: 'Profile Details' }
            ]
        }
    ];

    const handleNavigation = () => {
        setIsMobileMenuOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <div className="user-mobile-menu-container animate-in">
            <h2 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.6rem', fontWeight: '700' }}>App Menu</h2>
            
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
