import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileUpdateModal from '../components/ProfileUpdateModal';
import API_BASE_URL from '../config';
import '../styles/dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to access dashboard');
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        const token = localStorage.getItem('authToken');

        // Fetch user info
        try {
            const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
            }
        } catch (err) {
            console.error('Failed to load user data');
        }

        setLoading(false);
    };

    if (loading) return <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

    return (
        <div className="dashboard-layout">
            <main className="dashboard-main-content">
                <header className="dashboard-topbar">
                    <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '2rem', color: '#fff', margin: 0 }}>
                                Welcome, {user?.username || 'Student'}! 👋
                            </h1>
                            <button
                                onClick={() => setShowEditModal(true)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                        </div>

                        {/* User Information - Organized by Source */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* ID Card Details */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.3)'
                            }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    color: '#667eea',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="fas fa-id-card"></i> ID Card Details
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Full Name</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.fullName || user?.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Father's Name</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.fatherName || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Institution</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.institution || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Aadhar Card Details */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(52, 211, 153, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(52, 211, 153, 0.3)'
                            }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    color: '#34d399',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="fas fa-address-card"></i> Aadhar Card Details
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Aadhar Number</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.aadharNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Form Details */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'rgba(251, 191, 36, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(251, 191, 36, 0.3)'
                            }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    color: '#fbbf24',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="fas fa-edit"></i> Registration Details
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Email</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0, wordBreak: 'break-word' }}>{user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Mobile Primary</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.mobilePrimary || user?.phone || 'Not provided'}</p>
                                    </div>
                                    {user?.mobileSecondary && (
                                        <div>
                                            <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Mobile Secondary</strong>
                                            <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.mobileSecondary}</p>
                                        </div>
                                    )}
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Branch</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.branch || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Semester</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.semester || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Session</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.session || user?.batch || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Computer Code</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.computerCode || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Enrollment Number</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.enrollmentNumber || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Start Year</strong>
                                        <p style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{user?.startYear || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </header>

            </main>

            {/* Profile Update Modal */}
            <ProfileUpdateModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onUpdate={() => {
                    setShowEditModal(false);
                    fetchData(); // Refresh data after update
                }}
            />
        </div>
    );
};

export default StudentDashboard;
