import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';

const ResetSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileIncomplete, computerCode, name, email, message } = location.state || {};

    useEffect(() => {
        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            if (profileIncomplete) {
                navigate('/register', { state: { isUpdate: true, email } });
            } else {
                navigate('/login');
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate, profileIncomplete, email]);

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 1.5rem',
                        background: profileIncomplete
                            ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #4ade80 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#fff',
                        animation: 'pulse 2s infinite'
                    }}>
                        <i className={`fas fa-${profileIncomplete ? 'exclamation-triangle' : 'check'}`}></i>
                    </div>

                    <h1 style={{ marginBottom: '1rem', color: profileIncomplete ? '#fbbf24' : '#4ade80' }}>
                        {profileIncomplete ? 'Registration Incomplete' : 'Password Reset Successful!'}
                    </h1>

                    <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1rem' }}>
                        {message || 'Your password has been updated successfully.'}
                    </p>

                    {profileIncomplete ? (
                        // OLD USER - Profile Incomplete
                        <div style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#fbbf24' }}>
                                <i className="fas fa-clipboard-check"></i> Complete Registration Required
                            </h3>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Your password has been reset successfully, but you need to complete the following steps to login:
                            </p>
                            <ol style={{ color: '#aaa', fontSize: '0.9rem', paddingLeft: '1.5rem', margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#fff' }}>Step 1:</strong> Scan your College ID Card
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#fff' }}>Step 2:</strong> Scan your Aadhar Card
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#fff' }}>Step 3:</strong> Complete registration form
                                </li>
                            </ol>
                            <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: '1rem', marginBottom: 0 }}>
                                <i className="fas fa-info-circle"></i> After completion, you'll receive your Computer Code to login.
                            </p>
                        </div>
                    ) : (
                        // NEW USER - Profile Complete
                        computerCode && (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                                    <i className="fas fa-key"></i> Your Login Credentials
                                </h3>
                                <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
                                    {name && (
                                        <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                            <strong>Name:</strong> <span style={{ color: '#fff' }}>{name}</span>
                                        </p>
                                    )}
                                    <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                        <strong>Computer Code:</strong> <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>{computerCode}</span>
                                    </p>
                                    <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                        <strong>Password:</strong> <span style={{ color: '#fff' }}>[Your new password]</span>
                                    </p>
                                </div>
                            </div>
                        )
                    )}

                    <div style={{
                        background: profileIncomplete
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(74, 222, 128, 0.1)',
                        border: `1px solid ${profileIncomplete ? 'rgba(251, 191, 36, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`,
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '2rem',
                        fontSize: '0.85rem',
                        color: profileIncomplete ? '#fbbf24' : '#4ade80'
                    }}>
                        <p style={{ margin: 0 }}>
                            <i className="fas fa-info-circle"></i> Redirecting in 5 seconds...
                        </p>
                    </div>

                    {profileIncomplete ? (
                        <Link
                            to="/register"
                            state={{ isUpdate: true, email }}
                            className="btn btn-primary"
                            style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}
                        >
                            <i className="fas fa-clipboard-check"></i> Complete Registration
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="btn btn-primary"
                            style={{ display: 'inline-block', textDecoration: 'none' }}
                        >
                            <i className="fas fa-sign-in-alt"></i> Login Now
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ResetSuccess;
