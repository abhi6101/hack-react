import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css'; // Import the new footer styles

const Footer = () => {
    return (
        <footer className="modern-footer">
            <div className="modern-footer-top">
                <div className="modern-footer-column">
                    <h3>Links</h3>
                    <ul>
                        <li><Link to="/">Download App</Link></li>
                        <li><Link to="/jobs">Free Job Alerts</Link></li>
                        <li><Link to="/jobs">Careers</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/contact">Vulnerability Disclosure</Link></li>
                    </ul>
                </div>
                <div className="modern-footer-column">
                    <h3>Legal</h3>
                    <ul>
                        <li><Link to="/">Privacy Policy</Link></li>
                        <li><Link to="/">User Terms & Conditions</Link></li>
                    </ul>
                </div>
                <div className="modern-footer-column">
                    <h3>Resources</h3>
                    <ul>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/">Sitemap</Link></li>
                    </ul>
                </div>
            </div>

            <div className="modern-footer-bottom">
                <div className="modern-footer-bottom-content">
                    <div className="footer-brand-social">
                        <div className="footer-brand">
                            Hack-2-<span>Hired</span>
                        </div>
                        <div className="social-icons">
                            <a href="https://www.linkedin.com/in/abhi-jain-a1a723298" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            <a href="https://www.instagram.com/_abhi__jain___/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="https://github.com/abhi6101" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github"></i></a>
                        </div>
                    </div>

                    <div className="footer-divider"></div>

                    <div className="footer-legal">
                        <p>© 2026 Hack-2-Hired | All rights reserved</p>
                        <div className="footer-legal-links">
                            <Link to="/">Privacy Policy</Link>
                            <Link to="/">Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
