import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
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
                setMessage(data.message || 'If the email exists, a reset link has been sent.');
                setEmail('');
            } else {
                setError(data.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card surface-glow">
                <div className="auth-header">
                    <i className="fas fa-key" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                    <h2>Forgot Password?</h2>
                    <p>Enter your email and we'll send you a reset link</p>
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
                        <label htmlFor="email">
                            <i className="fas fa-envelope"></i> Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your registered email"
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
                                <i className="fas fa-paper-plane"></i> Send Reset Link
                            </>
                        )}
                    </button>

                    <div className="auth-footer">
                        <Link to="/login" className="auth-link">
                            <i className="fas fa-arrow-left"></i> Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
