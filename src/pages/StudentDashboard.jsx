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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <div style={{
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto'
            }}>
                {/* Header Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                color: '#fff',
                                margin: 0,
                                marginBottom: '0.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '700'
                            }}>
                                Welcome Back! 👋
                            </h1>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', margin: 0 }}>
                                {user?.username || 'Student'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <i className="fas fa-edit"></i> Edit Profile
                        </button>
                    </div>
                </div>

                {/* User Information Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* ID Card Details */}
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}>
                                <i className="fas fa-id-card"></i>
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: '#667eea',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                ID Card Details
                            </h3>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.fullName || user?.name || 'Not provided'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Father's Name</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.fatherName || 'Not provided'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Institution</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.institution || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Aadhar Card Details */}
                    <div style={{
                        background: 'rgba(52, 211, 153, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        boxShadow: '0 8px 32px rgba(52, 211, 153, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '2px solid rgba(52, 211, 153, 0.3)'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(52, 211, 153, 0.4)'
                            }}>
                                <i className="fas fa-address-card"></i>
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: '#34d399',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                Aadhar Card Details
                            </h3>
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            maxWidth: '400px'
                        }}>
                            <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Aadhar Number</strong>
                            <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500', letterSpacing: '2px' }}>{user?.aadharNumber || 'Not provided'}</p>
                        </div>
                    </div>

                    {/* Registration Details */}
                    <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        boxShadow: '0 8px 32px rgba(251, 191, 36, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '2px solid rgba(251, 191, 36, 0.3)'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)'
                            }}>
                                <i className="fas fa-edit"></i>
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: '#fbbf24',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                Registration Details
                            </h3>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500', wordBreak: 'break-word' }}>{user?.email || 'N/A'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Primary</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.mobilePrimary || user?.phone || 'Not provided'}</p>
                            </div>
                            {user?.mobileSecondary && (
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Secondary</strong>
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.mobileSecondary}</p>
                                </div>
                            )}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Branch</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.branch || 'Not set'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Semester</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.semester || 'Not set'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Session</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.session || user?.batch || 'Not set'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Computer Code</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.computerCode || 'Not set'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Enrollment Number</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.enrollmentNumber || 'Not set'}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Start Year</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.startYear || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
