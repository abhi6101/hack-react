import React, { useState, useEffect } from 'react';
import './TextType.css';

const TextType = ({
    text = "Hello World",
    speed = 100,
    delay = 0,
    cursor = true,
    loop = false,
    className = ''
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Initial delay before starting
        const startTimeout = setTimeout(() => {
            if (currentIndex < text.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText(prev => prev + text[currentIndex]);
                    setCurrentIndex(prev => prev + 1);
                }, speed);

                return () => clearTimeout(timeout);
            } else {
                setIsComplete(true);

                // If loop is enabled, reset after a pause
                if (loop) {
                    const resetTimeout = setTimeout(() => {
                        setDisplayedText('');
                        setCurrentIndex(0);
                        setIsComplete(false);
                    }, 2000); // Wait 2 seconds before restarting

                    return () => clearTimeout(resetTimeout);
                }
            }
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [currentIndex, text, speed, delay, loop]);

    return (
        <span className={`text-type ${className}`}>
            {displayedText}
            {cursor && !isComplete && <span className="text-type-cursor">|</span>}
        </span>
    );
};

export default TextType;
