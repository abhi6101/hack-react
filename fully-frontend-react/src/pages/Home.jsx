import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import FloatingCodeBackground from '../components/FloatingCodeBackground';
import Typewriter from '../components/Typewriter';
import LeaderboardComponent from '../components/LeaderboardComponent';

import '../styles/index.css';
import '../styles/home-interactive.css';

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const scaleHover = {
    hover: {
        y: -5,
        scale: 1.02,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        transition: { type: "spring", stiffness: 300 }
    }
};

const FeatureCard = ({ icon, title, desc, color }) => (
    <motion.div
        className="glass-card"
        whileHover={{ y: -10, boxShadow: `0 10px 30px -10px ${color}` }}
        style={{
            padding: '2rem',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
        }}
    >
        <div style={{
            fontSize: '2.5rem',
            color: color,
            marginBottom: '0.5rem',
            filter: `drop-shadow(0 0 10px ${color})`
        }}>
            <i className={icon}></i>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
);

const RoadmapScroll = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    const steps = [
        { id: 1, title: "Learn Skills", desc: "Master trending tech with our structured courses.", icon: "fas fa-laptop-code" },
        { id: 2, title: "Build Projects", desc: "Apply knowledge by building real-world applications.", icon: "fas fa-hammer" },
        { id: 3, title: "Perfect Resume", desc: "Craft a resume that passes ATS scanners.", icon: "fas fa-file-signature" },
        { id: 4, title: "Get Hired", desc: "Ace the interview and launch your career.", icon: "fas fa-rocket" }
    ];

    return (
        <section ref={targetRef} style={{ height: "300vh", position: "relative" }}>
            <div className="sticky-wrapper" style={{
                position: "sticky",
                top: 0,
                height: "100vh",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}
                >
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Your Path to Success</h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        Scroll to explore our proven 4-step roadmap.
                    </p>
                </motion.div>

                <motion.div style={{ x, display: 'flex', gap: '40px', paddingLeft: '5vw' }}>
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            /* className="surface-glow" Removed to ensure full transparency */
                            whileHover={{ y: -15, scale: 1.02, textShadow: "0 0 8px rgba(0,212,255,0.5)" }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{
                                minWidth: '400px',
                                height: '500px',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: '32px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'default',
                                flexShrink: 0
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                fontSize: '12rem',
                                fontWeight: 900,
                                opacity: 0.05,
                                lineHeight: 1,
                                fontFamily: 'var(--font-heading)'
                            }}>
                                0{step.id}
                            </div>

                            <div style={{ zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: 'rgba(14, 165, 233, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    <i className={`${step.icon}`} style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>{step.title}</h3>
                                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const LearningHubScroll = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

    const resources = [
        {
            title: "Web Security Academy",
            icon: "fas fa-flask",
            desc: "The definitive free resource for learning web application security from the creators of Burp Suite.",
            link: "https://portswigger.net/web-security",
            cta: "Explore Platform"
        },
        {
            title: "Chai aur JavaScript",
            icon: "fab fa-js-square",
            desc: "Deep dive into JavaScript with Hitesh Choudhary. Perfect for mastering modern web development.",
            link: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37",
            cta: "Watch Now"
        },
        {
            title: "Hack The Box",
            icon: "fas fa-cube",
            desc: "Challenge your abilities with real-world lab scenarios and compete with a global community.",
            link: "https://www.hackthebox.com/",
            cta: "Explore Platform"
        }
    ];

    return (
        <section ref={targetRef} style={{ height: "250vh", position: "relative" }}>
            <div className="sticky-wrapper" style={{
                position: "sticky",
                top: 0,
                height: "100vh",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}
                >
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Start Your Learning Journey</h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        Hand-picked resources to build your skills and prepare you for the industry.
                    </p>
                </motion.div>

                <motion.div style={{ x, display: 'flex', gap: '40px', paddingLeft: '5vw' }}>
                    {resources.map((res, index) => (
                        <motion.a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            /* className="surface-glow" Removed */
                            whileHover={{ y: -15, scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                minWidth: '320px',
                                height: '400px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                textDecoration: 'none',
                                color: 'inherit',
                                position: 'relative',
                                flexShrink: 0
                            }}
                        >
                            <div>
                                <i className={res.icon} style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.2rem' }}></i>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.8rem', fontWeight: 700 }}>{res.title}</h3>
                                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{res.desc}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem' }}>
                                {res.cta} <i className="fas fa-arrow-right" style={{ marginLeft: '10px' }}></i>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const Home = () => {
    const [user, setUser] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHomeSearchFocused, setIsHomeSearchFocused] = useState(false);
    const [homeSearchQuery, setHomeSearchQuery] = useState('');

    const galleryImages = [
        "/images/4E9A7129-copy.jpg",
        "/images/lab1.jpg",
        "/images/Group-photo-1-copy-4.jpg",
        "/images/fair.jpg",
        "/images/DSCF2122-copy.jpg"
    ];

    const nextSlide = () => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevSlide = () => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    const navigate = useNavigate();

    // Auto-Slideshow Effect
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Check for logged in user using individual keys set by Login.jsx
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('authToken');
        const storedName = localStorage.getItem('name');

        if (storedUsername && token) {
            setUser({
                username: storedUsername,
                name: storedName || storedUsername,
                role: storedRole || 'User'
            });
        } else {
            // Inconsistent state: Username but no token -> Clear it
            if (storedUsername) {
                localStorage.removeItem('username');
                localStorage.removeItem('userRole');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload(); // Refresh to update UI state
    };

    return (
        <main>
            <FloatingCodeBackground />



            {/* Hero Section */}
            <section className="hero">
                <div className="hero-main-container">
                    <motion.div
                        className="hero-content"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}
                    >

                        <motion.div variants={fadeInUp} className="hero-text-content">
                            <h1 id="heroHeadingDesktop" className="hero-heading" style={{ minHeight: 'auto', display: 'inline-block', fontWeight: '800' }}>
                                Bridge the Gap from <span className="text-gradient">Campus to Career</span>
                            </h1>
                            <p className="hero-subheadline" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                Connect with top recruiters from <span style={{color: '#fff', fontWeight: 600}}>100+ global tech giants</span> and land your perfect role.
                            </p>
                            
                            <div className="hero-ctas" style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                <Link to="/jobs" className="cta-btn primary-btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px', background: '#00d4ff', color: '#000', fontWeight: '700', textDecoration: 'none', border: '1px solid #00d4ff', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    Find Jobs
                                </Link>
                                <Link to="/resume" className="cta-btn secondary-btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.5)'; e.currentTarget.style.borderColor = '#00d4ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    Build Resume
                                </Link>
                            </div>
                        </motion.div>







                    </motion.div>

                    <motion.div
                        className="hero-image-side"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                        style={{ position: 'relative' }}
                    >
                        <div className="hero-illustration-wrapper" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingTop: '1rem' }}>
                            {/* Glowing geometric background */}
                            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0) 70%)', borderRadius: '50%', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, filter: 'blur(30px)' }}></div>
                            <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0) 70%)', borderRadius: '50%', top: '20%', left: '60%', transform: 'translate(-50%, -50%)', zIndex: 0, filter: 'blur(40px)' }}></div>
                            
                            <div className="boy-image-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '20px' }}>
                                <img src="/images/Boy.png" alt="Career Aspirant" className="hero-boy-img" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }} />
                                <div className="image-glow-effect"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust Stats Ribbon (Refactored) */}
            <div className="trust-stats-section" style={{ height: '80px', display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', alignItems: 'center', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#00d4ff', textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>10,000+</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Students Placed</p>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} className="desktop-only"></div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#00d4ff', textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>500+</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Jobs Posted</p>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} className="desktop-only"></div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#00d4ff', textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>50+</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Partner Colleges</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Community Champions Section - Moved below Hero */}
            <section className="community-champions-section" style={{ padding: '1.5rem 0', background: 'linear-gradient(to bottom, rgba(15,23,42,0), rgba(15,23,42,0.5))', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Community <span className="text-gradient">Champions</span></h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Recognizing the top contributors who help their peers succeed.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch', justifyContent: 'center' }}>
                        <div style={{ flex: '2 1 400px', maxWidth: '800px' }}>
                            <LeaderboardComponent limit={5} />
                        </div>
                        
                        {/* Share Papers CTA (Redesigned & Repositioned) */}
                        <div className="mobile-share-papers-cta glass-card" style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '2rem', cursor: 'pointer', textAlign: 'center', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease' }} onClick={() => navigate('/upload-paper')} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.15)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.8rem', color: '#10b981' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#fff', fontWeight: '600' }}>Share Your Papers</h3>
                            <p style={{ fontSize: '0.9rem', margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>Help your juniors by contributing study materials. Every contribution counts!</p>
                            
                            <button style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', width: '100%', transition: 'all 0.3s ease' }}>
                                Contribute Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="partners-static-section" style={{ padding: '0 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container">
                    <div className="partners-header" style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
                        <h2 className="partners-title" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Trusted By <span>100+ Companies</span>
                        </h2>
                    </div>

                    <div className="glass-marquee-container" style={{ overflow: 'hidden', width: '100%' }}>
                        <div className="glass-marquee-track" style={{ display: "flex", flexWrap: "nowrap", width: "max-content", gap: "2rem", margin: "0 auto" }}>
                            {[
                                { name: 'Google', icon: 'fab fa-google', color: '#4285F4' },
                                { name: 'Microsoft', icon: 'fab fa-microsoft', color: '#00A4EF' },
                                { name: 'Amazon', icon: 'fab fa-amazon', color: '#FF9900' },
                                { name: 'Apple', icon: 'fab fa-apple', color: '#FFFFFF' },
                                { name: 'Meta', icon: 'fab fa-meta', color: '#0668E1' },
                                { name: 'Netflix', icon: 'fab fa-netflix', color: '#E50914' },
                                { name: 'Spotify', icon: 'fab fa-spotify', color: '#1DB954' },
                                { name: 'Google', icon: 'fab fa-google', color: '#4285F4' },
                                { name: 'Microsoft', icon: 'fab fa-microsoft', color: '#00A4EF' },
                                { name: 'Amazon', icon: 'fab fa-amazon', color: '#FF9900' },
                                { name: 'Apple', icon: 'fab fa-apple', color: '#FFFFFF' },
                                { name: 'Meta', icon: 'fab fa-meta', color: '#0668E1' },
                                { name: 'Netflix', icon: 'fab fa-netflix', color: '#E50914' },
                                { name: 'Spotify', icon: 'fab fa-spotify', color: '#1DB954' }
                            ].map((company, index) => (
                                <div className="trusted-logo-item" key={index} style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.8rem', 
                                    color: company.color, 
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    padding: '1rem 2rem',
                                    filter: 'opacity(0.85)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.filter = 'opacity(1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'opacity(0.85)'; }}
                                >
                                    <i className={company.icon} style={{ fontSize: '1.8rem' }}></i>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{company.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Removed Old Upload Paper CTA Card */}

            {/* NEW: How It Works Section */}
            <section className="how-it-works-section">
                <div className="how-it-works-header">
                    <h2 className="how-it-works-title">How it <span>Works</span></h2>
                    <p className="how-it-works-subtitle">
                        Seamlessly move through the process and secure your ideal role.
                    </p>
                </div>

                <div className="container" style={{ position: 'relative', marginTop: '1.5rem', paddingBottom: '0.5rem' }}>
                    {/* Horizontal Dashed Line */}
                    <div className="desktop-only" style={{ position: 'absolute', top: '40px', left: '15%', right: '15%', height: '2px', borderTop: '2px dashed rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                    
                    <div className="how-steps-horizontal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', position: 'relative', zIndex: 1 }}>
                        <div className="step-card" style={{ flex: '1 1 250px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#0B1120' }}>
                                <i className="fas fa-file-invoice" style={{ fontSize: '2rem', color: '#10b981' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>1. Build Resume</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Create a standout resume tailored for applicant tracking systems.</p>
                        </div>

                        <div className="step-card" style={{ flex: '1 1 250px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#0B1120' }}>
                                <i className="fas fa-briefcase" style={{ fontSize: '2rem', color: '#00d4ff' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>2. Find & Apply</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Search for roles that match your skill set and apply seamlessly.</p>
                        </div>

                        <div className="step-card" style={{ flex: '1 1 250px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#0B1120' }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#8b5cf6' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>3. Get Hired</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Connect with employers, ace the interviews, and start your career.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Removed old Leaderboard Mobile Wrapper */}            {/* Testimonials Section (Removed per user request) */}
            {/* <motion.section
                className="testimonials"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
            >
                <motion.h2 variants={fadeInUp}>Success Stories</motion.h2>
                <div className="testimonial-cards">
                    <motion.div className="testimonial-card surface-glow" variants={fadeInUp} whileHover={{ y: -5 }}>
                        <p>"The resume builder and mock interviews were game-changers! Landed my dream job at a top tech company..."</p>
                        <div className="testimonial-author">
                            <img src="/images/i-priya.jpg" alt="Priya Sharma" loading="lazy" />
                            <div className="author-info"><h4>Priya Sharma</h4><p>Software Engineer at Google</p></div>
                        </div>
                    </motion.div>
                    <motion.div className="testimonial-card surface-glow" variants={fadeInUp} whileHover={{ y: -5 }}>
                        <p>"I went from zero calls to 5 job offers in 2 months. The interview prep resources are pure gold."</p>
                        <div className="testimonial-author">
                            <img src="/images/i-rahul.jpg" alt="Rahul Verma" loading="lazy" />
                            <div className="author-info"><h4>Rahul Verma</h4><p>Data Analyst at Amazon</p></div>
                        </div>
                    </motion.div>
                    <motion.div className="testimonial-card surface-glow" variants={fadeInUp} whileHover={{ y: -5 }}>
                        <p>"Personalized career guidance helped me transition into a higher-paying role. Highly recommended!"</p>
                        <div className="testimonial-author">
                            <img src="/images/i-neha.jpg" alt="Neha Patel" loading="lazy" />
                            <div className="author-info"><h4>Neha Patel</h4><p>Product Manager at Microsoft</p></div>
                        </div>
                    </motion.div>
                </div>
            </motion.section> */}

            {/* Community Champions Section (Moved) */}

            {/* Gallery Section */}
            <section className="gallery">
                <h2>Moments & Memories</h2>
                <div className="slideshow-container moments-slideshow desktop-only" style={{ position: 'relative', overflow: 'hidden', height: '500px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AnimatePresence>
                        {galleryImages.map((img, idx) => {
                            let position = 'other';
                            if (idx === currentImageIndex) position = 'center';
                            else if (idx === (currentImageIndex - 1 + galleryImages.length) % galleryImages.length) position = 'left';
                            else if (idx === (currentImageIndex + 1) % galleryImages.length) position = 'right';

                            if (position === 'other') return null;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={false}
                                    animate={{
                                        x: position === 'center' ? 0 : position === 'left' ? '-40%' : '40%',
                                        scale: position === 'center' ? 1 : 0.8,
                                        zIndex: position === 'center' ? 10 : 5,
                                        opacity: position === 'center' ? 1 : 0.5
                                    }}
                                    transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
                                    style={{
                                        position: 'absolute',
                                        width: '60%',
                                        height: 'auto',
                                        aspectRatio: '16/9',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: position === 'center' ? '0 0 40px rgba(0, 212, 255, 0.4)' : 'none',
                                        filter: position === 'center' ? 'blur(0px)' : 'blur(4px)',
                                        opacity: position === 'center' ? 1 : 0.5,
                                        transition: 'filter 0.5s, box-shadow 0.5s, opacity 0.5s'
                                    }}
                                >
                                    <img src={img} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <a className="prev" onClick={prevSlide} style={{
                        cursor: 'pointer', position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', transition: '0.3s ease', borderRadius: '50%', userSelect: 'none', left: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>&#10094;</a>

                    <a className="next" onClick={nextSlide} style={{
                        cursor: 'pointer', position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', transition: '0.3s ease', borderRadius: '50%', userSelect: 'none', right: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>&#10095;</a>
                </div>

                {/* Dots (Desktop Only) */}
                <div className="desktop-only" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    {galleryImages.map((_, idx) => (
                        <span
                            key={idx}
                            className="dot"
                            style={{
                                cursor: 'pointer',
                                height: '12px',
                                width: '12px',
                                margin: '0 6px',
                                backgroundColor: idx === currentImageIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                                display: 'inline-block',
                                transition: 'background-color 0.3s'
                            }}
                            onClick={() => setCurrentImageIndex(idx)}
                        ></span>
                    ))}
                </div>

                {/* Mobile 2x2 Grid */}
                <div className="mobile-moments-grid-container" style={{ display: 'none' }}>
                    <div className="mobile-moments-grid">
                        {galleryImages.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="moment-thumb" style={{
                                backgroundImage: `url(${img})`
                            }}></div>
                        ))}
                    </div>
                </div>
                <style jsx>{`
                    @media (max-width: 768px) {
                        .mobile-moments-grid-container { display: block !important; }
                    }
                `}</style>
            </section>



        </main>
    );
};

export default Home;
