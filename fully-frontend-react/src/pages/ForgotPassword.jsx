import API_BASE_URL from '../config';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('OTP sent to your email! Redirecting...');
                // Store email in sessionStorage for next step
                sessionStorage.setItem('recoveryEmail', email);

                // check if coming from Admin login
                if (location.state?.fromAdmin) {
                    sessionStorage.setItem('isAdminRecovery', 'true');
                } else {
                    sessionStorage.removeItem('isAdminRecovery');
                }

                // Redirect to OTP verification page after 2 seconds
                setTimeout(() => {
                    navigate('/verify-otp');
                }, 2000);
            } else {
                setError(data.message || 'Failed to send OTP. Please try again.');
            }
            setLoading(false);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError('Network error. Please check your connection and try again.');
            setLoading(false);
        }
    };

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow">
                    <Link to="/login" style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        color: '#667eea',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        <i className="fas fa-arrow-left"></i> Back to Login
                    </Link>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: '#fff'
                        }}>
                            <i className="fas fa-key"></i>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Forgot Password?</h1>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                            No worries! Enter your email and we'll send you an OTP to reset your password.
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert" style={{ display: 'block', marginBottom: '1rem' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert" role="alert" style={{
                            display: 'block',
                            marginBottom: '1rem',
                            background: 'rgba(74, 222, 128, 0.1)',
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                            color: '#4ade80'
                        }}>
                            <i className="fas fa-check-circle"></i> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="Enter your registered email"
                                aria-label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading || success}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || success}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Sending OTP...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i> Send OTP
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#aaa'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                            <i className="fas fa-info-circle"></i> <strong>What happens next?</strong>
                        </p>
                        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                            <li>We'll send a 6-digit OTP to your email</li>
                            <li>Enter the OTP to verify your identity</li>
                            <li>Set a new password or complete verification</li>
                        </ol>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForgotPassword;
