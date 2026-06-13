import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-bottom-nav.css';

/* ── Inline SVG icon components ─────────────────────────────────────── */
const HomeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
);

const UsersIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const BriefcaseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="12"/>
        <path d="M2 12h20"/>
    </svg>
);

const GraduationCapIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
    </svg>
);

const MenuIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6"  x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
);

/* ── Component ───────────────────────────────────────────────────────── */
const AdminBottomNav = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const navItems = [
        { id: 'home',     Icon: HomeIcon,           label: 'Home',     action: () => navigate('/') },
        { id: 'users',    Icon: UsersIcon,           label: 'Users',    action: () => setActiveTab('users') },
        { id: 'jobs',     Icon: BriefcaseIcon,       label: 'Jobs',     action: () => setActiveTab('jobs') },
        { id: 'students', Icon: GraduationCapIcon,   label: 'Students', action: () => setActiveTab('students') },
        { id: 'menu',     Icon: MenuIcon,            label: 'Menu',     action: () => setActiveTab('menu') },
    ];

    return (
        <nav className="admin-bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999 }}>
            {navItems.map(({ id, Icon, label, action }) => {
                const isActive =
                    id !== 'home' && (
                        activeTab === id ||
                        (id === 'menu' && !['users', 'jobs', 'students', 'dashboard'].includes(activeTab))
                    );
                return (
                    <button
                        key={id}
                        className={`bottom-nav-item${isActive ? ' active' : ''}`}
                        onClick={action}
                    >
                        <Icon />
                        <span>{label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default AdminBottomNav;
