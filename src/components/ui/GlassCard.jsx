import React from 'react';
import './GlassCard.css';

const GlassCard = ({ children, className, padding, ...props }) => {
    return (
        <div
            className={`premium-glass-card ${className || ''}`}
            style={{ padding: padding || '2rem' }}
            {...props}
        >
            {children}
            <div className="premium-glass-glow"></div>
        </div>
    );
};

export default GlassCard;
