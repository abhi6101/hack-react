import API_BASE_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const email = sessionStorage.getItem('recoveryEmail');

    // Redirect if no email in session
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newOtp.every(digit => digit !== '') && index === 5) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();

        // Auto-submit if complete
        if (pastedData.length === 6) {
            handleVerifyOTP(pastedData);
        }
    };

    const handleVerifyOTP = async (otpValue) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: otpValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store recovery token
                sessionStorage.setItem('recoveryToken', data.token);

                // Check route based on user data completeness
                if (data.route === 'SIMPLE_RESET') {
                    // User has complete data → Simple password reset
                    sessionStorage.setItem('userData', JSON.stringify(data.userData));
                    navigate('/reset-password');
                } else if (data.route === 'FULL_VERIFICATION') {
                    // User needs full verification → Account recovery flow
                    sessionStorage.setItem('userData', JSON.stringify(data.userData));
                    navigate('/account-recovery');
                } else {
                    setError('Unexpected response from server. Please try again.');
                }
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
            setLoading(false);
        } catch (err) {
            console.error('OTP verification error:', err);
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setResendCooldown(60); // 60 second cooldown
                setTimeLeft(600); // Reset timer
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                // Show success briefly
                setError('');
                setTimeout(() => {
                    setError('');
                }, 3000);
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
            setResendLoading(false);
        } catch (err) {
            setError('Network error. Please try again.');
            setResendLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length === 6) {
            handleVerifyOTP(otpValue);
        } else {
            setError('Please enter all 6 digits');
        }
    };

    if (!email) return null;

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow">
                    <Link to="/forgot-password" style={{
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
                        <i className="fas fa-arrow-left"></i> Back
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
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Verify Your Email</h1>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                            We sent a 6-digit OTP to<br />
                            <strong style={{ color: '#667eea' }}>{email}</strong>
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert" style={{ display: 'block', marginBottom: '1rem' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>
                                Enter OTP
                            </label>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        disabled={loading}
                                        style={{
                                            width: '50px',
                                            height: '60px',
                                            fontSize: '1.5rem',
                                            textAlign: 'center',
                                            border: '2px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#fff',
                                            outline: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                            e.target.style.background = 'rgba(255,255,255,0.05)';
                                        }}
                                    />
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.85rem',
                                color: '#aaa'
                            }}>
                                <span>
                                    {timeLeft > 0 ? (
                                        <>
                                            <i className="fas fa-clock"></i> Expires in {formatTime(timeLeft)}
                                        </>
                                    ) : (
                                        <span style={{ color: '#ef4444' }}>
                                            <i className="fas fa-exclamation-triangle"></i> OTP Expired
                                        </span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendLoading || resendCooldown > 0}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: resendCooldown > 0 ? '#666' : '#667eea',
                                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.85rem',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {resendLoading ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                                    ) : resendCooldown > 0 ? (
                                        `Resend in ${resendCooldown}s`
                                    ) : (
                                        <><i className="fas fa-redo"></i> Resend OTP</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || otp.some(d => !d)}
                            style={{ width: '100%' }}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Verifying...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check-circle"></i> Verify OTP
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default VerifyOTP;
