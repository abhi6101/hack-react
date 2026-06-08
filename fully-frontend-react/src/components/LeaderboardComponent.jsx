import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const LeaderboardComponent = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking the fetch for now, since we haven't built the explicit /leaderboard endpoint in the backend.
        // In a real scenario, you'd fetch from `${API_BASE_URL}/users/leaderboard`
        // which sorts users by contributionPoints DESC.
        
        // For demonstration, we'll just simulate a slight delay and then show empty or mock data
        setTimeout(() => {
            setLeaders([
                { id: 1, username: 'abhijeet', name: 'Abhijeet Singh', points: 450 },
                { id: 2, username: 'riya', name: 'Riya Sharma', points: 300 },
                { id: 3, username: 'rahul', name: 'Rahul Verma', points: 150 }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div style={{ background: 'var(--surface-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--primary)', fontSize: '2rem' }}></i>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--surface-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-trophy" style={{ color: '#fbbf24' }}></i> Top Contributors
            </h3>
            
            {leaders.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No contributors yet. Be the first!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {leaders.map((user, index) => (
                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: index === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ 
                                    width: '35px', height: '35px', borderRadius: '50%', 
                                    background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : index === 1 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' : index === 2 ? 'linear-gradient(135deg, #b45309, #d97706)' : 'var(--primary)', 
                                    color: index < 3 ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' 
                                }}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem', color: index === 0 ? '#fbbf24' : '#fff' }}>
                                        {user.name || user.username}
                                        {index === 0 && <span style={{ marginLeft: '5px' }}>👑</span>}
                                    </h4>
                                    {index === 0 && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)' }}>Verified Contributor</p>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{user.points}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaderboardComponent;
