import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/index.css';
import '../styles/dropdown.css';
import '../styles/navbar-professional.css';

const Navbar = ({ menuOpen = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('authToken');
    const userName = localStorage.getItem('name') || localStorage.getItem('username') || 'Student';
    const userRole = localStorage.getItem('userRole');
    const isAdminUser = ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'].includes(userRole);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    // Get first name only for compact display
    const firstName = userName.split(' ')[0];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'solid' : ''}`}>
            <Link to="/" className="logo">Hack-2-<span className="highlight">Hired</span></Link>

            {/* Mobile Drawer Overlay */}
            <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
                {/* Mobile Drawer Header */}
                <div className="mobile-drawer-header">
                    <div className="logo">Hack-2-<span className="highlight">Hired</span></div>
                    <button className="close-drawer" onClick={toggleMenu}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <Link to="/" className={isActive('/')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-home"></i> Home</Link>
                <Link to="/jobs" className={isActive('/jobs')}><i className="fas fa-briefcase"></i> Jobs</Link>
                <Link to="/resume-builder" className={isActive('/resume-builder')}><i className="fas fa-file-alt"></i> Resume</Link>
                <Link to="/interview" className={isActive('/interview')}><i className="fas fa-comments"></i> Interviews</Link>
                <Link to="/papers" className={isActive('/papers')}><i className="fas fa-copy"></i> Papers</Link>
                <Link to="/notes" className={isActive('/notes')}><i className="fas fa-sticky-note"></i> Notes</Link>

                {/* Resources Dropdown */}
                <div className="dropdown"
                    onMouseEnter={() => setResourcesOpen(true)}
                    onMouseLeave={() => setResourcesOpen(false)}
                    onClick={() => setResourcesOpen(!resourcesOpen)}>
                    <button className="dropdown-toggle">
                        <i className="fas fa-book-reader"></i> Resources <i className="fas fa-chevron-down"></i>
                    </button>
                    <div className={`dropdown-menu ${resourcesOpen ? 'show' : ''}`}>
                        <Link to="/quiz" className={isActive('/quiz')}><i className="fas fa-brain"></i> Quiz</Link>
                        <Link to="/videos" className={isActive('/videos')}><i className="fas fa-video"></i> Study Videos</Link>
                        <Link to="/courses" className={isActive('/courses')}><i className="fas fa-book"></i> Courses</Link>
                    </div>
                </div>

                {/* Explore Dropdown */}
                <div className="dropdown"
                    onMouseEnter={() => setExploreOpen(true)}
                    onMouseLeave={() => setExploreOpen(false)}
                    onClick={() => setExploreOpen(!exploreOpen)}>
                    <button className="dropdown-toggle">
                        <i className="fas fa-compass"></i> Explore <i className="fas fa-chevron-down"></i>
                    </button>
                    <div className={`dropdown-menu ${exploreOpen ? 'show' : ''}`}>
                        <Link to="/gallery" className={isActive('/gallery')}><i className="fas fa-images"></i> Gallery</Link>
                        <Link to="/blog" className={isActive('/blog')}><i className="fas fa-blog"></i> Blog</Link>
                    </div>
                </div>

                {isAdminUser && (
                    <Link to="/admin" className={isActive('/admin')}><i className="fas fa-shield-alt"></i> Admin</Link>
                )}
                <Link to="/upload-paper" className={`btn-upload-paper ${isActive('/upload-paper')}`}>
                    <i className="fas fa-upload"></i> Upload Paper
                </Link>
                {isLoggedIn && userRole === 'USER' && (
                    <Link to="/dashboard" className={isActive('/dashboard')}><i className="fas fa-user-circle"></i> Dashboard</Link>
                )}
            </div>

            {/* ===== AUTH SECTION (Apna-style, always visible on right) ===== */}
            <div className="navbar-auth">
                {isLoggedIn ? (
                    <>
                        <div className="navbar-user-chip">
                            <div className="navbar-user-avatar">
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                            <span className="navbar-user-name">Hi, {firstName}</span>
                        </div>
                        <button className="navbar-logout-btn" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-signin-btn">
                            <i className="fas fa-sign-in-alt"></i>
                            <span>Sign In</span>
                        </Link>
                        <Link to="/register" className="navbar-register-btn">
                            <i className="fas fa-user-plus"></i>
                            <span>Register</span>
                        </Link>
                    </>
                )}
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <i className="fas fa-bars"></i>
            </div>
        </nav>
    );
};

export default Navbar;
