import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step 1: Email input
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP + password

    // Step 2: OTP and password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('OTP sent to your email! Check your inbox.');
                setStep(2); // Move to OTP input step
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <i className="fas fa-lock" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
                    <h2>{step === 1 ? 'Forgot Password?' : 'Reset Password'}</h2>
                    <p>{step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}</p>
                </div>

                {message && (
                    <div className="alert alert-success">
                        <i className="fas fa-check-circle"></i> {message}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {step === 1 ? (
                    // Step 1: Email Input
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Sending...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i> Send OTP
                                </>
                            )}
                        </button>

                        <div className="auth-footer">
                            <Link to="/login" className="auth-link">
                                <i className="fas fa-arrow-left"></i> Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    // Step 2: OTP + Password Input
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="otp">
                                <i className="fas fa-key"></i> Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                disabled={loading}
                                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">
                                <i className="fas fa-lock"></i> New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Enter new password"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                <i className="fas fa-check"></i> Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Confirm new password"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Resetting...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check"></i> Reset Password
                                </>
                            )}
                        </button>

                        <div className="auth-footer">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="auth-link"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <i className="fas fa-arrow-left"></i> Change Email
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
