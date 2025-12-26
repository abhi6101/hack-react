import React, { useEffect, useState } from 'react';
import '../styles/preloader.css';

const Preloader = ({ onComplete }) => {
    const [exit, setExit] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Counter Animation
        const duration = 2000; // 2 seconds to reach 100
        const steps = 100;
        const intervalTime = duration / steps;

        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 1;
            });
        }, intervalTime);

        // Exit Sequence
        const exitTimer = setTimeout(() => {
            setExit(true); // Trigger slide up

            // Wait for CSS transition (0.8s) to finish
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 800);

        }, 2200); // Start exit slightly after counter reaches 100

        return () => {
            clearInterval(timer);
            clearTimeout(exitTimer);
        };
    }, [onComplete]);

    return (
        <div className={`preloader-container ${exit ? 'exit' : ''}`}>
            <div className="preloader-content">
                <h1 className="preloader-text reveal-text">
                    Hack-2-Hired
                </h1>
            </div>
            {/* Percentage Counter */}
            <div className="preloader-counter">
                {count}%
            </div>
        </div>
    );
};

export default Preloader;
