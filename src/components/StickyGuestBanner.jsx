import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/guest-banner.css';

const StickyGuestBanner = () => {
    const isGuest = !localStorage.getItem('authToken');

    if (!isGuest) return null;

    return (
        <div className="guest-banner">
            <div className="guest-banner-content">
                <span className="guest-text">
                    🚀 <strong>Browsing as Guest:</strong> Join 1,000+ students from <strong>IPS Academy</strong> to unlock full job applications and papers.
                </span>
                <div className="guest-actions">
                    <Link to="/register" className="guest-signup-btn">Get Started</Link>
                    <Link to="/login" className="guest-login-btn">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default StickyGuestBanner;
