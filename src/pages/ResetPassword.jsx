import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const email = sessionStorage.getItem('recoveryEmail');
    const token = sessionStorage.getItem('recoveryToken');
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    // Redirect if missing required data
    useEffect(() => {
        if (!email || !token) {
            navigate('/forgot-password');
        }
    }, [email, token, navigate]);

    // Password strength calculator
    useEffect(() => {
        let strength = 0;
        if (newPassword.length >= 8) strength++;
        if (/[A-Z]/.test(newPassword)) strength++;
        if (/[0-9]/.test(newPassword)) strength++;
        if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
        setPasswordStrength(strength);
    }, [newPassword]);

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return '#ef4444';
            case 2: return '#f59e0b';
            case 3: return '#10b981';
            case 4: return '#4ade80';
            default: return '#666';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength < 2) {
            setError('Please choose a stronger password');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear session storage
                sessionStorage.removeItem('recoveryEmail');
                sessionStorage.removeItem('recoveryToken');
                sessionStorage.removeItem('userData');

                // Redirect to success page
                navigate('/reset-success', {
                    state: {
                        computerCode: userData.computerCode,
                        name: userData.name
                    }
                });
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');
            }
            setLoading(false);
        } catch (err) {
            console.error('Reset password error:', err);
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    if (!email || !token) return null;

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #4ade80 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: '#fff'
                        }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Account Verified</h1>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Your account is already verified!
                        </p>

                        {/* User Info */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <p style={{ margin: '0.25rem 0', color: '#aaa', fontSize: '0.85rem' }}>
                                <strong>Name:</strong> <span style={{ color: '#fff' }}>{userData.name}</span>
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#aaa', fontSize: '0.85rem' }}>
                                <strong>Computer Code:</strong> <span style={{ color: '#4ade80' }}>{userData.computerCode}</span>
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#aaa', fontSize: '0.85rem' }}>
                                <strong>Email:</strong> <span style={{ color: '#667eea' }}>{email}</span>
                            </p>
                        </div>

                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                            Simply set a new password to continue.
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert" style={{ display: 'block', marginBottom: '1rem' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="newPassword">
                                <i className="fas fa-lock"></i> New Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    required
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <i
                                    className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </div>

                            {/* Password Strength Indicator */}
                            {newPassword && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{
                                        height: '4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(passwordStrength / 4) * 100}%`,
                                            height: '100%',
                                            background: getStrengthColor(),
                                            transition: 'all 0.3s ease'
                                        }}></div>
                                    </div>
                                    <p style={{
                                        margin: '0.25rem 0 0 0',
                                        fontSize: '0.75rem',
                                        color: getStrengthColor()
                                    }}>
                                        Strength: {getStrengthText()}
                                    </p>
                                </div>
                            )}

                            {/* Password Requirements */}
                            <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#aaa'
                            }}>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <i className={`fas fa-${newPassword.length >= 8 ? 'check' : 'times'}`}
                                        style={{ color: newPassword.length >= 8 ? '#4ade80' : '#666' }}></i>
                                    {' '}At least 8 characters
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <i className={`fas fa-${/[A-Z]/.test(newPassword) ? 'check' : 'times'}`}
                                        style={{ color: /[A-Z]/.test(newPassword) ? '#4ade80' : '#666' }}></i>
                                    {' '}One uppercase letter
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <i className={`fas fa-${/[0-9]/.test(newPassword) ? 'check' : 'times'}`}
                                        style={{ color: /[0-9]/.test(newPassword) ? '#4ade80' : '#666' }}></i>
                                    {' '}One number
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <i className={`fas fa-${/[^A-Za-z0-9]/.test(newPassword) ? 'check' : 'times'}`}
                                        style={{ color: /[^A-Za-z0-9]/.test(newPassword) ? '#4ade80' : '#666' }}></i>
                                    {' '}One special character
                                </p>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">
                                <i className="fas fa-check-circle"></i> Confirm Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            {confirmPassword && (
                                <p style={{
                                    margin: '0.25rem 0 0 0',
                                    fontSize: '0.75rem',
                                    color: newPassword === confirmPassword ? '#4ade80' : '#ef4444'
                                }}>
                                    <i className={`fas fa-${newPassword === confirmPassword ? 'check' : 'times'}`}></i>
                                    {' '}{newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Resetting Password...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check"></i> Reset Password
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.9rem' }}>
                            <i className="fas fa-arrow-left"></i> Back to Login
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResetPassword;
