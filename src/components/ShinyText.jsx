import React from 'react';
import './ShinyText.css';

const ShinyText = ({ text = "Loading...", className = '' }) => {
    return (
        <div className={`shiny-text-container ${className}`}>
            <span className="shiny-text">
                {text}
            </span>
        </div>
    );
};

export default ShinyText;
