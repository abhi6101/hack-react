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
    const [careerOpen, setCareerOpen] = useState(false);
    const [academicsOpen, setAcademicsOpen] = useState(false);
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
        setCareerOpen(false);
        setAcademicsOpen(false);
        setResourcesOpen(false);
        setExploreOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setCareerOpen(false);
                setAcademicsOpen(false);
                setResourcesOpen(false);
                setExploreOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleDropdown = (dropdownName, e) => {
        e.stopPropagation(); // Prevent document click from immediately closing it
        setCareerOpen(dropdownName === 'career' ? !careerOpen : false);
        setAcademicsOpen(dropdownName === 'academics' ? !academicsOpen : false);
        setResourcesOpen(dropdownName === 'resources' ? !resourcesOpen : false);
        setExploreOpen(dropdownName === 'explore' ? !exploreOpen : false);
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    const getCareerLabel = () => {
        if (location.pathname === '/jobs') return 'Jobs';
        if (location.pathname === '/resume-builder') return 'Resume Builder';
        if (location.pathname === '/interview') return 'Interviews';
        return 'Career';
    };
    const isCareerActive = () => ['/jobs', '/resume-builder', '/interview'].includes(location.pathname);

    const getAcademicsLabel = () => {
        if (location.pathname === '/papers') return 'Previous Papers';
        if (location.pathname === '/notes') return 'Study Notes';
        if (location.pathname === '/upload-paper') return 'Upload Paper';
        return 'Academics';
    };
    const isAcademicsActive = () => ['/papers', '/notes', '/upload-paper'].includes(location.pathname);

    const getResourcesLabel = () => {
        if (location.pathname === '/quiz') return 'Quiz';
        if (location.pathname === '/courses') return 'Courses';
        return 'Resources';
    };
    const isResourcesActive = () => ['/quiz', '/courses'].includes(location.pathname);

    const getExploreLabel = () => {
        if (location.pathname === '/gallery') return 'Gallery';
        if (location.pathname === '/blog') return 'Blog';
        return 'Explore';
    };
    const isExploreActive = () => ['/gallery', '/blog'].includes(location.pathname);

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
                
                <div className="dropdown">
                    <button className={`dropdown-toggle ${careerOpen || isCareerActive() ? 'active' : ''}`} style={careerOpen || isCareerActive() ? { color: 'var(--primary)', borderBottom: '2px solid var(--primary)', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' } : {}} onClick={(e) => toggleDropdown('career', e)}>
                        <i className="fas fa-briefcase"></i> {getCareerLabel()} <i className="fas fa-chevron-down"></i>
                    </button>
                    <div className={`dropdown-menu ${careerOpen ? 'show' : ''}`}>
                        <Link to="/jobs" className={isActive('/jobs')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-search-dollar"></i> Jobs</Link>
                        <Link to="/resume-builder" className={isActive('/resume-builder')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-file-alt"></i> Resume Builder</Link>
                        <Link to="/interview" className={isActive('/interview')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-comments"></i> Interviews</Link>
                    </div>
                </div>

                <div className="dropdown">
                    <button className={`dropdown-toggle ${academicsOpen || isAcademicsActive() ? 'active' : ''}`} style={academicsOpen || isAcademicsActive() ? { color: 'var(--primary)', borderBottom: '2px solid var(--primary)', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' } : {}} onClick={(e) => toggleDropdown('academics', e)}>
                        <i className="fas fa-graduation-cap"></i> {getAcademicsLabel()} <i className="fas fa-chevron-down"></i>
                    </button>
                    <div className={`dropdown-menu ${academicsOpen ? 'show' : ''}`}>
                        <Link to="/papers" className={isActive('/papers')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-copy"></i> Previous Papers</Link>
                        <Link to="/notes" className={isActive('/notes')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-sticky-note"></i> Study Notes</Link>
                        <Link to="/upload-paper" className={isActive('/upload-paper')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-upload"></i> Upload Paper</Link>
                    </div>
                </div>

                <div className="dropdown">
                    <button className={`dropdown-toggle ${resourcesOpen || isResourcesActive() ? 'active' : ''}`} style={resourcesOpen || isResourcesActive() ? { color: 'var(--primary)', borderBottom: '2px solid var(--primary)', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' } : {}} onClick={(e) => toggleDropdown('resources', e)}>
                        <i className="fas fa-book-reader"></i> {getResourcesLabel()} <i className="fas fa-chevron-down"></i>
                    </button>
                    <div className={`dropdown-menu ${resourcesOpen ? 'show' : ''}`}>
                        <Link to="/quiz" className={isActive('/quiz')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-brain"></i> Quiz</Link>
                        <Link to="/courses" className={isActive('/courses')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-book"></i> Courses</Link>
                    </div>
                </div>

                <div className="dropdown">
                    <button className={`dropdown-toggle ${exploreOpen || isExploreActive() ? 'active' : ''}`} style={exploreOpen || isExploreActive() ? { color: 'var(--primary)', borderBottom: '2px solid var(--primary)', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' } : {}} onClick={(e) => toggleDropdown('explore', e)}>
                        <i className="fas fa-compass"></i> {getExploreLabel()} <i className="fas fa-chevron-down"></i>
                    </button>
                    <div className={`dropdown-menu ${exploreOpen ? 'show' : ''}`}>
                        <Link to="/gallery" className={isActive('/gallery')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-images"></i> Gallery</Link>
                        <Link to="/blog" className={isActive('/blog')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-blog"></i> Blog</Link>
                    </div>
                </div>

                {isAdminUser && (
                    <Link to="/admin" className={isActive('/admin')} onClick={() => setIsMenuOpen(false)}><i className="fas fa-shield-alt"></i> Admin</Link>
                )}
                {isLoggedIn && userRole === 'USER' && (
                    <Link to="/dashboard" className={isActive('/dashboard')}><i className="fas fa-user-circle"></i> Dashboard</Link>
                )}
            </div>

            {/* ===== AUTH SECTION (Apna-style, always visible on right) ===== */}
            <div className="navbar-auth">
                {isLoggedIn ? (
                    <>
                        <Link to="/dashboard" className="navbar-user-chip" style={{ textDecoration: 'none' }}>
                            <div className="navbar-user-avatar">
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                            <span className="navbar-user-name">Hi, {firstName}</span>
                        </Link>
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
