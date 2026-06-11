import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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

                        <motion.div variants={fadeInUp}>
                            <h1 id="heroHeadingDesktop" className="hero-heading" style={{ minHeight: 'auto', display: 'inline-block', fontWeight: '800' }}>
                                Bridge the Gap from <span className="text-gradient">Campus to Career</span>
                            </h1>
                            <p className="hero-subheadline" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                Connect with top recruiters from <span style={{color: '#fff', fontWeight: 600}}>100+ global tech giants</span> and land your perfect role.
                            </p>
                            
                            <div className="hero-ctas" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <Link to="/jobs" className="cta-btn primary-btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)', color: '#000', fontWeight: '600', textDecoration: 'none', border: 'none' }}>
                                    Find Jobs
                                </Link>
                                <Link to="/resume" className="cta-btn secondary-btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: '600', textDecoration: 'none' }}>
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
                    >
                        <div className="boy-image-container">
                            <img src="/images/Boy.png" alt="Career Aspirant" className="hero-boy-img" />
                            <div className="image-glow-effect"></div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="partners-static-section" style={{ padding: '2rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container">
                    <div className="partners-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 className="partners-title" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Trusted By <span>100+ Companies</span>
                        </h2>
                    </div>

                    <div className="trusted-logos-row" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {[
                            { name: 'Google', icon: 'fab fa-google' },
                            { name: 'Microsoft', icon: 'fab fa-microsoft' },
                            { name: 'Amazon', icon: 'fab fa-amazon' },
                            { name: 'Apple', icon: 'fab fa-apple' },
                            { name: 'Meta', icon: 'fab fa-meta' },
                        ].map((company, index) => (
                            <div className="trusted-logo-item" key={index} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                color: '#94a3b8', 
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <i className={company.icon} style={{ fontSize: '2rem' }}></i>
                                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{company.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEW: Upload Paper CTA Card */}
            <div className="upload-cta-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '20px', margin: '20px auto', maxWidth: '400px' }}>
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
                    width: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: '#10b981' }}></i>
                    <div style={{ color: '#fff' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Got Previous Year Papers?</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Help your juniors by sharing your exam papers.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/upload-paper')}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Share Papers Now
                    </button>
                </div>
            </div>

            {/* NEW: How It Works Section */}
            <section className="how-it-works-section">
                <div className="how-it-works-header">
                    <h2 className="how-it-works-title">How it <span>Works</span></h2>
                    <p className="how-it-works-subtitle">
                        Seamlessly move through the process and secure your ideal role.
                    </p>
                </div>

                <div className="how-it-works-container">
                    {/* Left: Illustration */}
                    <div className="how-left-side">
                        <div className="girl-image-container">
                            <img src="/images/Girl.png" alt="How it works" className="how-girl-img" />
                            {/* Floating Profile Card */}
                            <div className="floating-profile-card">
                                <img src="/images/avatar1.png" alt="Profile" />
                                <h4>Complete your profile</h4>
                                <p>70% Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Step List */}
                    <div className="how-right-side">
                        <div className="how-steps-list">
                            <div className="how-step-item">
                                <div className="step-icon-box">
                                    <i className="fas fa-file-invoice"></i>
                                </div>
                                <div className="step-text">
                                    <h3>Resume</h3>
                                    <p>Create a standout resume with your skills.</p>
                                </div>
                            </div>

                            <div className="how-step-item">
                                <div className="step-icon-box">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <div className="step-text">
                                    <h3>Apply</h3>
                                    <p>Find and apply for jobs that match your skills.</p>
                                </div>
                            </div>

                            <div className="how-step-item">
                                <div className="step-icon-box">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="step-text">
                                    <h3>Hired</h3>
                                    <p>Connect with employers and start your new job.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Mobile Wrapper */}
            <div className="mobile-only leaderboard-mobile-wrapper" style={{ margin: '10px 0' }}>
                <LeaderboardComponent limit={3} />
            </div>






            {/* Testimonials Section (Removed per user request) */}
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

            {/* Gallery Section */}
            <section className="gallery">
                <h2>Moments & Memories</h2>
                <div className="slideshow-container moments-slideshow desktop-only" style={{ position: 'relative', overflow: 'hidden', height: '500px', borderRadius: '16px' }}>

                    {/* Active Image */}
                    <div className="mySlides fade" style={{ display: 'block', height: '100%', width: '100%' }}>
                        <img
                            src={galleryImages[currentImageIndex]}
                            alt={`Moments & Memories ${currentImageIndex + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Navigation Arrows */}
                    <a className="prev" onClick={prevSlide} style={{
                        cursor: 'pointer', position: 'absolute', top: '50%', width: 'auto', padding: '16px', marginTop: '-22px',
                        color: 'white', fontWeight: 'bold', fontSize: '18px', transition: '0.6s ease', borderRadius: '0 3px 3px 0',
                        userSelect: 'none', left: '0', background: 'rgba(0,0,0,0.3)'
                    }}>&#10094;</a>

                    <a className="next" onClick={nextSlide} style={{
                        cursor: 'pointer', position: 'absolute', top: '50%', width: 'auto', padding: '16px', marginTop: '-22px',
                        color: 'white', fontWeight: 'bold', fontSize: '18px', transition: '0.6s ease', borderRadius: '3px 0 0 3px',
                        userSelect: 'none', right: '0', background: 'rgba(0,0,0,0.3)'
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
                <div className="mobile-only mobile-moments-grid">
                    {galleryImages.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="moment-thumb" style={{
                            backgroundImage: `url(${img})`
                        }}></div>
                    ))}
                </div>
            </section>


        </main>
    );
};

export default Home;
