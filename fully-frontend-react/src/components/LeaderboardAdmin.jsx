import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config';

const ADMIN_API_URL = `${API_BASE_URL}/admin`;
const PUBLIC_API_URL = `${API_BASE_URL}/public`;

const TableSkeleton = ({ cols = 4, rows = 2 }) => (
    <div className="table-responsive" style={{ padding: '1rem', overflowX: 'auto', width: '100%' }}>
        <table className="table" style={{ width: '100%' }}>
            <thead>
                <tr>
                    {Array.from({ length: cols }).map((_, i) => (
                        <th key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="skeleton skeleton-text" style={{ width: '60%', height: '16px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                        {Array.from({ length: cols }).map((_, colIndex) => (
                            <td key={colIndex} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <div className="skeleton skeleton-text" style={{ width: colIndex === 0 ? '80%' : '50%', height: '16px', background: 'rgba(255, 255, 255, 0.05)' }}></div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const LeaderboardAdmin = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${PUBLIC_API_URL}/leaderboard`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        
        const handleRefresh = () => fetchLeaderboard();
        window.addEventListener('refreshLeaderboard', handleRefresh);
        
        const handleExport = () => {
            if (!leaderboard || leaderboard.length === 0) return;
            const headers = ['Rank', 'Name', 'Username', 'Points'];
            const csvContent = [
                headers.join(','),
                ...leaderboard.map((user, idx) => `"${idx + 1}","${user.name || ''}","${user.username || ''}","${user.contributionPoints || 0}"`)
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leaderboard.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        window.addEventListener('exportLeaderboard', handleExport);
        
        return () => {
            window.removeEventListener('refreshLeaderboard', handleRefresh);
            window.removeEventListener('exportLeaderboard', handleExport);
        };
    }, [leaderboard]);

    const handleResetPoints = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to reset points for ${username} to 0?`)) return;

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const response = await fetch(`${ADMIN_API_URL}/users/${userId}/reset-points`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                // Update local state instead of refetching to be fast
                setLeaderboard(prev => prev.filter(user => user.id !== userId));
                alert(`Points reset to 0 for ${username}.`);
            } else {
                alert('Failed to reset points. Only ADMIN or SUPER_ADMIN can do this.');
            }
        } catch (err) {
            console.error('Error resetting points:', err);
            alert('Failed to reset points. Only ADMIN or SUPER_ADMIN can do this.');
        }
    };

    const actionRow = (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', width: '100%', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
            <input 
                type="text" 
                className="form-control desktop-only" 
                placeholder="Search contributors..." 
                style={{ width: '100%', maxWidth: '400px' }} 
            />
        </div>
    );

    if (loading) {
        return (
            <div className="animate-in">
                {actionRow}
                <div className="table-responsive surface-glow-premium" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                    <TableSkeleton cols={4} rows={2} />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            {actionRow}

            {leaderboard.length === 0 ? (
                <div className="empty-state surface-glow-premium" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '4.5rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}></i>
                    <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>No Data</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>The leaderboard is currently empty.</p>
                </div>
            ) : (
                <div className="table-responsive surface-glow-premium" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                    <table className="admin-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Rank</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Points</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((user, idx) => (
                                <motion.tr 
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{
                                            width: '30px', height: '30px', borderRadius: '50%', 
                                            background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                                            color: idx < 3 ? '#000' : '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '0.9rem'
                                        }}>
                                            #{idx + 1}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 'bold' }}>{user.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user.username}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{user.contributionPoints}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button 
                                            className="btn btn-danger" 
                                            onClick={() => handleResetPoints(user.id, user.username)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <i className="fas fa-eraser"></i> Reset to 0
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LeaderboardAdmin;
