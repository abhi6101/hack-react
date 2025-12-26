import React, { useEffect, useState } from 'react';
import '../styles/preloader.css';

const Preloader = ({ onComplete }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        // Total duration matches the CSS animation + a small pause
        // Animation timeline:
        // 0s: Text starts filling
        // 1.5s: Text full
        // 2.0s: Slide up starts

        const timer = setTimeout(() => {
            setExit(true);

            // Wait for slide-up transition (0.8s) to finish before unmounting
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 800);

        }, 2200);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`preloader-container ${exit ? 'exit' : ''}`}>
            <div className="preloader-content">
                <h1 className="preloader-text reveal-text">
                    Hack-2-Hired
                </h1>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
