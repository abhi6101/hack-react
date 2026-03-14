import React, { useState, useEffect } from 'react';
import './Typewriter.css';

const Typewriter = ({ text, delay = 100, infinite = false }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let timeout;

        if (currentIndex < text.length) {
            timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + text[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, delay);
        } else if (infinite) {
            timeout = setTimeout(() => {
                setCurrentIndex(0);
                setCurrentText('');
            }, 3000); // Wait before restarting
        }

        return () => clearTimeout(timeout);
    }, [currentIndex, delay, infinite, text]);

    return (
        <span className="typewriter-text">
            {currentText}
            <span className="cursor">|</span>
        </span>
    );
};

export default Typewriter;
