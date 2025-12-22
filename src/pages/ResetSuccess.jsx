import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';

const ResetSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { computerCode, name } = location.state || {};

    useEffect(() => {
        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #4ade80 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#fff',
                        animation: 'pulse 2s infinite'
                    }}>
                        <i className="fas fa-check"></i>
                    </div>

                    <h1 style={{ marginBottom: '1rem', color: '#4ade80' }}>
                        Password Reset Successful!
                    </h1>

                    <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1rem' }}>
                        Your password has been updated successfully.
                    </p>

                    {computerCode && (
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
                                <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                    <strong>Name:</strong> <span style={{ color: '#fff' }}>{name}</span>
                                </p>
                                <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                    <strong>Computer Code:</strong> <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>{computerCode}</span>
                                </p>
                                <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                    <strong>Password:</strong> <span style={{ color: '#fff' }}>[Your new password]</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '2rem',
                        fontSize: '0.85rem',
                        color: '#fbbf24'
                    }}>
                        <p style={{ margin: 0 }}>
                            <i className="fas fa-info-circle"></i> Redirecting to login in 5 seconds...
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="btn btn-primary"
                        style={{ display: 'inline-block', textDecoration: 'none' }}
                    >
                        <i className="fas fa-sign-in-alt"></i> Login Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default ResetSuccess;
