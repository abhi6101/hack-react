import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
// ProfileUpdateModal import removed
import API_BASE_URL from '../config';
import '../styles/dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // Read-only mode
    const [editedData, setEditedData] = useState({});
    const [jobApplications, setJobApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);

    const getToken = () => localStorage.getItem('authToken');

    useEffect(() => {
        if (!getToken()) {
            showAlert({
                title: 'Login Required',
                message: 'Please login to access dashboard',
                type: 'login',
                actions: [
                    { label: 'Login Now', primary: true, onClick: () => navigate('/login') },
                    { label: 'Go Home', primary: false, onClick: () => navigate('/') }
                ]
            });
            return;
        }
        fetchData();
    }, [navigate, showAlert]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    // handleEdit removed as it is no longer needed (always editing)

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedData)
            });

            if (response.ok) {
                // Fetch fresh data to ensure UI sync
                fetchData();
                showToast({
                    message: 'Profile updated successfully!',
                    type: 'success'
                });
            } else if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
            } else {
                showToast({
                    message: 'Failed to update profile',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast({
                message: 'Error updating profile',
                type: 'error'
            });
        }
    };

    // handleCancel removed

    const handleFieldChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const fetchData = async () => {
        const token = getToken();
        if (!token) {
            navigate('/login');
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Launch all API requests concurrently
        const fetchUser = fetch(`${API_BASE_URL}/auth/me`, { headers })
            .then(async res => {
                if (res.ok) return await res.json();
                if (res.status === 401) { localStorage.clear(); navigate('/login'); }
                return null;
            })
            .catch(err => { console.error('Failed to load user data'); return null; });

        const userStr = localStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : {};
        const isStudent = userObj.role === 'STUDENT' || !userObj.role;

        const fetchJobs = isStudent 
            ? fetch(`${API_BASE_URL}/job-applications/my`, { headers })
                .then(async res => res.ok ? await res.json() : [])
                .catch(err => { console.error('Failed to load job applications'); return []; })
            : Promise.resolve([]);

        const fetchInterviews = fetch(`${API_BASE_URL}/interview-drives`, { headers })
            .then(async res => res.ok ? await res.json() : [])
            .catch(err => { console.error('Failed to load interviews'); return []; });

        // Wait for all to complete simultaneously
        const [userData, jobAppsData, interviewData] = await Promise.all([fetchUser, fetchJobs, fetchInterviews]);

        if (userData) {
            setUser(userData);
            setEditedData({
                fullName: userData.fullName || userData.name || '',
                fatherName: userData.fatherName || '',
                institution: userData.institution || '',
                aadharNumber: userData.aadharNumber || '',
                mobilePrimary: userData.mobilePrimary || userData.phone || '',
                mobileSecondary: userData.mobileSecondary || '',
                enrollmentNumber: userData.enrollmentNumber || '',
                startYear: userData.startYear || ''
            });
        }
        
        if (jobAppsData) setJobApplications(jobAppsData);
        if (interviewData) setInterviews(interviewData);

        setLoading(false);
    };

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            padding: '6rem 2rem 2rem 2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -800px 0; }
                    100% { background-position: 800px 0; }
                }
                .sk {
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%);
                    background-size: 800px 100%;
                    animation: shimmer 1.5s infinite linear;
                    border-radius: 10px;
                }
            `}</style>
            <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Header card skeleton */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="sk" style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className="sk" style={{ width: 200, height: 28 }} />
                            <div className="sk" style={{ width: 140, height: 18 }} />
                        </div>
                    </div>
                    <div className="sk" style={{ width: 110, height: 44, borderRadius: '12px' }} />
                </div>

                {/* ID Card skeleton */}
                <div style={{ background: 'rgba(102,126,234,0.08)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(102,126,234,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div className="sk" style={{ width: 40, height: 40, borderRadius: '10px' }} />
                        <div className="sk" style={{ width: 160, height: 24 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="sk" style={{ width: '60%', height: 12 }} />
                                <div className="sk" style={{ width: '85%', height: 20 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registration Details skeleton */}
                <div style={{ background: 'rgba(251,191,36,0.08)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div className="sk" style={{ width: 40, height: 40, borderRadius: '10px' }} />
                        <div className="sk" style={{ width: 190, height: 24 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="sk" style={{ width: '55%', height: 12 }} />
                                <div className="sk" style={{ width: '80%', height: 20 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Job Applications skeleton */}
                <div style={{ background: 'rgba(236,72,153,0.08)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(236,72,153,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div className="sk" style={{ width: 40, height: 40, borderRadius: '10px' }} />
                        <div className="sk" style={{ width: 220, height: 24 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {[1,2].map(i => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="sk" style={{ width: '70%', height: 22 }} />
                                <div className="sk" style={{ width: '50%', height: 16 }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <div className="sk" style={{ width: '40%', height: 14 }} />
                                    <div className="sk" style={{ width: 80, height: 30, borderRadius: '20px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            padding: '6rem 2rem 2rem 2rem',
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
                    padding: '1.25rem 1.75rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#fff',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}>
                        <i className="fas fa-user-graduate"></i>
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                            margin: 0,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '700',
                            wordBreak: 'break-word'
                        }}>
                            {user?.fullName || user?.name || user?.username || 'Student'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: 0, marginTop: '0.2rem', letterSpacing: '0.5px' }}>
                            {user?.computerCode ? `#${user.computerCode}` : ''}{user?.computerCode && user?.branch ? '  ·  ' : ''}{user?.branch || ''}
                        </p>
                    </div>
                </div>

                {/* User Information Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* ID Card Details */}
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.8rem',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#fff',
                                boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
                            }}>
                                <i className="fas fa-id-card"></i>
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
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
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user?.fullName || user?.name || ''}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '1rem',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.fullName || user?.name || 'Not provided'}</p>
                                )}
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Father's Name</strong>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user?.fatherName || ''}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '1rem',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.fatherName || 'Not provided'}</p>
                                )}
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Institution</strong>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user?.institution || ''}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '1rem',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.institution || 'Not provided'}</p>
                                )}
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                gridColumn: '1 / -1'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Address</strong>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user?.address || ''}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '1rem',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.address || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                        {user?.idCardImage && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>College ID Card</strong>
                                <div style={{
                                    maxWidth: '300px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                }}>
                                    <img
                                        src={user.idCardImage}
                                        alt="College ID Card"
                                        style={{ width: '100%', display: 'block' }}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Registration Details */}
                    <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        boxShadow: '0 8px 32px rgba(251, 191, 36, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.8rem',
                            borderBottom: '2px solid rgba(251, 191, 36, 0.3)'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#fff',
                                boxShadow: '0 4px 10px rgba(251, 191, 36, 0.3)'
                            }}>
                                <i className="fas fa-edit"></i>
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
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
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.mobilePrimary || ''}
                                        onChange={(e) => handleFieldChange('mobilePrimary', e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: '#fff',
                                            color: '#000',
                                            border: '2px solid #3b82f6',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            fontWeight: '600'
                                        }}
                                        placeholder="Enter Mobile Number"
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.mobilePrimary || user?.phone || 'Not provided'}</p>
                                )}
                            </div>
                            {(isEditing || user?.mobileSecondary) && (
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Secondary</strong>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedData.mobileSecondary || ''}
                                            onChange={(e) => handleFieldChange('mobileSecondary', e.target.value)}
                                            style={{
                                                width: '100%',
                                                background: '#fff',
                                                color: '#000',
                                                border: '2px solid #3b82f6',
                                                borderRadius: '8px',
                                                padding: '0.75rem',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                fontWeight: '600'
                                            }}
                                            placeholder="Enter Secondary Mobile"
                                        />
                                    ) : (
                                        <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.mobileSecondary}</p>
                                    )}
                                </div>
                            )}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Branch</strong>
                                <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>
                                    {(user?.branch === 'INTG' || user?.branch === 'intg') ? 'Integrated MCA' : (user?.branch || 'Not set')}
                                </p>
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
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.enrollmentNumber || ''}
                                        onChange={(e) => {
                                            // ALLOW ONLY ALPHANUMERIC (Remove special chars like @)
                                            const cleanValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                            handleFieldChange('enrollmentNumber', cleanValue);
                                        }}
                                        style={{
                                            width: '100%',
                                            background: '#fff',
                                            color: '#000',
                                            border: '2px solid #3b82f6',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            fontWeight: '600'
                                        }}
                                        placeholder="Enter Enrollment Number (No Special Chars)"
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.enrollmentNumber || 'Not set'}</p>
                                )}
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Start Year</strong>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editedData.startYear || ''}
                                        onChange={(e) => handleFieldChange('startYear', e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: '#fff',
                                            color: '#000',
                                            border: '2px solid #3b82f6',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            fontWeight: '600'
                                        }}
                                        placeholder="Year"
                                    />
                                ) : (
                                    <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{user?.startYear || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid-2col">
                    {/* Job Applications Status */}
                    <div className="dashboard-grid-item" style={{
                        background: 'rgba(236, 72, 153, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.8rem',
                            borderBottom: '2px solid rgba(236, 72, 153, 0.3)'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#fff',
                                boxShadow: '0 4px 10px rgba(236, 72, 153, 0.3)'
                            }}>
                                <i className="fas fa-briefcase"></i>
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
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
                                {[...jobApplications].sort((a, b) => {
                                    const wA = a.status === 'ACTIVE' ? 3 : a.status === 'PENDING' ? 2 : a.status === 'ACCEPTED' ? 1 : 0;
                                    const wB = b.status === 'ACTIVE' ? 3 : b.status === 'PENDING' ? 2 : b.status === 'ACCEPTED' ? 1 : 0;
                                    if (wA !== wB) return wB - wA;
                                    return new Date(b.appliedAt) - new Date(a.appliedAt);
                                }).map(app => (
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
                    <div className="dashboard-grid-item" style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.8rem',
                            borderBottom: '2px solid rgba(139, 92, 246, 0.3)'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#fff',
                                boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                            }}>
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
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
                                {interviews.filter(i => new Date(i.interviewDate) > new Date()).sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate)).slice(0, 6).map(interview => (
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
            </div>

            {/* Profile Update Modal removed - switched to inline editing */}
        </div>
    );
};

export default StudentDashboard;
