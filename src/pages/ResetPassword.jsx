import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
            setValidatingToken(false);
            return;
        }

        // Validate token
        const validateToken = async () => {
            try {
                const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/validate-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok && data.valid) {
                    setTokenValid(true);
                } else {
                    setError(data.message || 'Invalid or expired reset link');
                }
            } catch (err) {
                setError('Failed to validate reset link');
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
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

    if (validatingToken) {
        return (
            <div className="auth-container">
                <div className="auth-card surface-glow">
                    <div className="auth-header">
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
                        <p>Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="auth-container">
                <div className="auth-card surface-glow">
                    <div className="auth-header">
                        <i className="fas fa-times-circle" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
                        <h2>Invalid Reset Link</h2>
                        <p>{error}</p>
                    </div>
                    <Link to="/forgot-password" className="btn btn-primary btn-block">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card surface-glow">
                <div className="auth-header">
                    <i className="fas fa-lock" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                    <h2>Reset Password</h2>
                    <p>Enter your new password</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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

                    <div className="form-group">
                        <label htmlFor="newPassword">
                            <i className="fas fa-key"></i> New Password
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
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
