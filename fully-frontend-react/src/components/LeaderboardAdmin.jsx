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
    }, []);

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

    if (loading) {
        return (
            <div className="animate-in">
                <div className="section-header">
                    <h2>Leaderboard Management</h2>
                    <p>View top contributors and reset their points if necessary.</p>
                </div>
                <div className="table-responsive surface-glow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <TableSkeleton cols={4} rows={2} />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="section-header">
                <h2>Leaderboard Management</h2>
                <p>View top contributors and reset their points if necessary.</p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="empty-state surface-glow">
                    <i className="fas fa-trophy" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}></i>
                    <h3>No Contributors Yet</h3>
                    <p>The leaderboard is currently empty.</p>
                </div>
            ) : (
                <div className="table-responsive surface-glow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((user, idx) => (
                                <motion.tr 
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <td>
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
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 'bold' }}>{user.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user.username}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{user.contributionPoints} pts</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-danger" 
                                            onClick={() => handleResetPoints(user.id, user.username)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
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
