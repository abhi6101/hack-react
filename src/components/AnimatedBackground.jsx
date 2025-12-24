import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
    return (
        <>
            <div className="animated-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="orb orb-4"></div>
                <div className="orb orb-5"></div>
            </div>
            <div className="grain-overlay"></div>
        </>
    );
};

export default AnimatedBackground;
