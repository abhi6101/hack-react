import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/verify-account.css';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const email = searchParams.get('email');
        if (email) {
            setIdentifier(decodeURIComponent(email));
        }
    }, [searchParams]);

    const handleCodeChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 6);
        setVerificationCode(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!identifier || !verificationCode || verificationCode.length !== 6) {
            setMessage({ text: "Please enter a valid identifier and 6-digit code.", type: "error" });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("https://placement-portal-backend-nwaj.onrender.com/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, code: verificationCode })
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ text: result.message || "Account verified successfully! Redirecting to login...", type: "success" });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setMessage({ text: result.message || "Verification failed. Please check your code.", type: "error" });
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Verification error:", error);
            setMessage({ text: "A network error occurred. Please try again.", type: "error" });
            setIsLoading(false);
        }
    };

    return (
        <section className="verification-section">
            <div className="verification-card surface-glow">
                <h1>Verify Your Account</h1>
                <p className="subtitle">A verification code has been sent to your email. If you don't see it, please check your Spam or Junk folder.</p>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form id="verifyCodeForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="identifier">Your Email or Username</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            required
                            placeholder="Enter your registered email or username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="verificationCode">Verification Code (OTP)</label>
                        <input
                            type="text"
                            id="verificationCode"
                            name="verificationCode"
                            required
                            maxLength="6"
                            placeholder="123456"
                            value={verificationCode}
                            onChange={handleCodeChange}
                        />
                    </div>
                    <button type="submit" id="verifyButton" className={`btn btn-primary ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>
                        <span className="button-text">Verify Account <i className="fas fa-check-circle"></i></span>
                        <span className="spinner"></span>
                    </button>
                </form>
            </div>
        </section>
    );
};

export default VerifyAccount;
