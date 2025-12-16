import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserInfoBar = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');

    // Don't show if not logged in
    if (!authToken) return null;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getRoleBadgeStyle = () => {
        switch (role) {
            case 'SUPER_ADMIN':
                return { background: 'linear-gradient(135deg, #f72585, #b5179e)', label: 'SUPER ADMIN' };
            case 'COMPANY_ADMIN':
                return { background: 'linear-gradient(135deg, #4361ee, #3a0ca3)', label: 'COMPANY ADMIN' };
            case 'ADMIN':
                return { background: 'linear-gradient(135deg, #06ffa5, #00d9ff)', label: 'ADMIN' };
            default:
                return { background: 'linear-gradient(135deg, #4cc9f0, #0096c7)', label: 'STUDENT' };
        }
    };

    const badgeStyle = getRoleBadgeStyle();

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: '70px',
            zIndex: 999,
            backdropFilter: 'blur(10px)'
        }}>
            {/* Left Side: Username and Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: badgeStyle.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: 'white',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                }}>
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <div style={{ fontWeight: '600', color: 'white', fontSize: '1rem' }}>
                        @{username || 'user'}
                    </div>
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: badgeStyle.background,
                        color: 'white',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'inline-block',
                        marginTop: '0.2rem'
                    }}>
                        {badgeStyle.label}
                    </span>
                </div>
            </div>

            {/* Right Side: Logout Button */}
            <button
                onClick={handleLogout}
                style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '0.6rem 1.2rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    );
};

export default UserInfoBar;
