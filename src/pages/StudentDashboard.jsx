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
    const [jobApplications, setJobApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to access dashboard');
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

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

        // Fetch job applications
        try {
            const jobAppsRes = await fetch(`${API_BASE_URL}/job-applications/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (jobAppsRes.ok) {
                const jobAppsData = await jobAppsRes.json();
                setJobApplications(jobAppsData);
            }
        } catch (err) {
            console.error('Failed to load job applications');
        }

        // Fetch interviews
        try {
            const interviewRes = await fetch(`${API_BASE_URL}/interview-drives`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (interviewRes.ok) {
                const interviewData = await interviewRes.json();
                setInterviews(interviewData);
            }
        } catch (err) {
            console.error('Failed to load interviews');
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
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                                }}
                            >
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
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

                    {/* Job Applications Status */}
                    <div style={{
                        background: 'rgba(236, 72, 153, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
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
                            borderBottom: '2px solid rgba(236, 72, 153, 0.3)'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                            }}>
                                <i className="fas fa-briefcase"></i>
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: '#ec4899',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                Job Applications ({jobApplications.length})
                            </h3>
                        </div>
                        {jobApplications.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}>
                                <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No job applications yet. Start applying!</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {jobApplications.map(app => (
                                    <div key={app.id} style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, marginBottom: '0.5rem' }}>
                                                {app.job?.title || 'Job Position'}
                                            </h4>
                                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', margin: 0 }}>
                                                {app.job?.companyName || 'Company'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                            </span>
                                            <span style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                background: app.status === 'PENDING' ? 'rgba(251, 191, 36, 0.2)' :
                                                    app.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.2)' :
                                                        app.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                                                color: app.status === 'PENDING' ? '#fbbf24' :
                                                    app.status === 'ACCEPTED' ? '#22c55e' :
                                                        app.status === 'REJECTED' ? '#ef4444' : '#9ca3af'
                                            }}>
                                                {app.status || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Interviews */}
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
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
                            borderBottom: '2px solid rgba(139, 92, 246, 0.3)'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                            }}>
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: '#8b5cf6',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                Upcoming Interviews ({interviews.filter(i => new Date(i.interviewDate) > new Date()).length})
                            </h3>
                        </div>
                        {interviews.filter(i => new Date(i.interviewDate) > new Date()).length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}>
                                <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No upcoming interviews scheduled</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {interviews.filter(i => new Date(i.interviewDate) > new Date()).slice(0, 6).map(interview => (
                                    <div key={interview.id} style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, marginBottom: '1rem' }}>
                                            {interview.companyName}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                                <i className="fas fa-calendar"></i>
                                                <span>{new Date(interview.interviewDate).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                                <i className="fas fa-map-marker-alt"></i>
                                                <span>{interview.venue || 'Venue TBA'}</span>
                                            </div>
                                            {interview.jobRole && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                                    <i className="fas fa-briefcase"></i>
                                                    <span>{interview.jobRole}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
