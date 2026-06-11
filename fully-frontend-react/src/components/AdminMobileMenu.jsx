import React from 'react';

const AdminMobileMenu = ({ menuGroups, menuItems, role, setActiveTab }) => {
    // Items that are already in the bottom nav shouldn't be duplicated if possible,
    // but putting them here as well is fine for completeness.
    // However, to keep it clean, we might filter them out or just show all.
    // Let's show all that the user has access to, grouped nicely.

    const handleNavigation = (id) => {
        setActiveTab(id);
        window.scrollTo(0, 0);
    };

    return (
        <div className="mobile-menu-container animate-in">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>App Menu</h2>
            
            {menuGroups.map(group => {
                const groupItems = menuItems.filter(item => group.items.includes(item.id) && item.roles.some(r => r.toUpperCase() === String(role).toUpperCase()));
                
                if (groupItems.length === 0) return null;

                return (
                    <div key={group.title} className="mobile-menu-group card surface-glow" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <i className={`fas ${group.icon}`}></i> {group.title}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {groupItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.id)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                >
                                    <i className={`fas ${item.icon}`} style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '500', textAlign: 'center' }}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminMobileMenu;
