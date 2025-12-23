import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/login.css';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: email,
                    code: code
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message || 'Invalid verification code');
            }
            setLoading(false);
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="login-body-wrapper">
            <section className="login-section">
                <div className="login-card surface-glow">
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
                            <i className="fas fa-envelope-open-text"></i>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Verify Your Email</h1>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                            We sent a verification code to<br />
                            <strong style={{ color: '#667eea' }}>{email}</strong>
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
                            <label htmlFor="code">
                                <i className="fas fa-key"></i> Verification Code
                            </label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                required
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={loading || success}
                                maxLength="6"
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
                                    <i className="fas fa-spinner fa-spin"></i> Verifying...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check-circle"></i> Verify Email
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
                        color: '#aaa',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0 }}>
                            Didn't receive the code? Check your spam folder or contact support.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VerifyAccount;
