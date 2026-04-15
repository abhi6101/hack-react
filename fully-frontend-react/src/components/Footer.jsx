import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-column">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/jobs">Jobs</Link></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Resources</h3>
                    <ul>
                        <li><Link to="/resume">Resume Builder</Link></li>
                        <li><Link to="/interview">Interview Prep</Link></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Company</h3>
                    <ul>
                        <li><Link to="/contact">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>Connect</h3>
                    <div className="social-links">
                        <a href="https://www.linkedin.com/in/abhi-jain-a1a723298" target="_blank" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                        <a href="https://www.instagram.com/_abhi__jain___/" target="_blank" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="https://github.com/abhi6101" target="_blank" aria-label="GitHub"><i className="fab fa-github"></i></a>
                    </div>
                </div>
            </div>
            <p>Made with <span className="heart">❤️</span> by Abhi</p>
            <p>2026 Hack-2-Hired. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
