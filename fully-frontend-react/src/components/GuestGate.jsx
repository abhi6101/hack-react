import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/guest-gate.css';

const GuestGate = ({ children, title = "this feature" }) => {
    const isGuest = !localStorage.getItem('authToken');

    if (!isGuest) return <>{children}</>;

    return (
        <div className="guest-gate-container">
            <div className="guest-gate-blurred">
                {children}
            </div>
            <div className="guest-gate-overlay">
                <div className="guest-gate-card">
                    <div className="guest-gate-icon">
                        <i className="fas fa-lock"></i>
                    </div>
                    <h2>Unlock {title}</h2>
                    <p>This premium content is reserved for verified students.</p>
                    <div className="guest-gate-buttons">
                        <Link to="/register" className="guest-gate-primary">Verify & Join</Link>
                        <Link to="/login" className="guest-gate-secondary">Login</Link>
                    </div>
                    <p className="guest-gate-footer">Takes only 30 seconds to join our community.</p>
                </div>
            </div>
        </div>
    );
};

export default GuestGate;
