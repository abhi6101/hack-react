import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/index.css';
import '../styles/dropdown.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="logo">Hack-2-<span className="highlight">Hired</span></div>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
                <Link to="/" className={isActive('/')}><i className="fas fa-home"></i> Home</Link>
                <Link to="/jobs" className={isActive('/jobs')}><i className="fas fa-briefcase"></i> Jobs</Link>
                <Link to="/resume" className={isActive('/resume')}><i className="fas fa-file-alt"></i> Resume Builder</Link>

                <Link to="/interview" className={isActive('/interview')}><i className="fas fa-comments"></i> Interviews</Link>
                <Link to="/papers" className={isActive('/papers')}><i className="fas fa-copy"></i> Previous Year</Link>

                {/* Show dropdown menus only if authenticated */}
                {localStorage.getItem('authToken') && (
                    <>
                        {/* Resources Dropdown */}
                        <div className="dropdown"
                            onMouseEnter={() => setResourcesOpen(true)}
                            onMouseLeave={() => setResourcesOpen(false)}>
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
                            onMouseLeave={() => setExploreOpen(false)}>
                            <button className="dropdown-toggle">
                                <i className="fas fa-compass"></i> Explore <i className="fas fa-chevron-down"></i>
                            </button>
                            <div className={`dropdown-menu ${exploreOpen ? 'show' : ''}`}>
                                <Link to="/gallery" className={isActive('/gallery')}><i className="fas fa-images"></i> Gallery</Link>
                                <Link to="/blog" className={isActive('/blog')}><i className="fas fa-blog"></i> Blog</Link>
                            </div>
                        </div>
                    </>
                )}

                {localStorage.getItem('userRole') === 'ADMIN' && (
                    <Link to="/admin" className={isActive('/admin')}><i className="fas fa-shield-alt"></i> Admin Dashboard</Link>
                )}
                {localStorage.getItem('authToken') && localStorage.getItem('userRole') === 'USER' && (
                    <Link to="/dashboard" className={isActive('/dashboard')}><i className="fas fa-tachometer-alt"></i> My Dashboard</Link>
                )}
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </div>
        </nav>
    );
};

export default Navbar;
