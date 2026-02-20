import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import API_BASE_URL from '../config';
import StarBackground from '../components/StarBackground';
import FloatingCodeBackground from '../components/FloatingCodeBackground';
import Typewriter from '../components/Typewriter';

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

const FeatureCard = ({ icon, title, desc, color }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const { left, top } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="glass-feature-card"
            style={{ '--card-glow': `${color}33` }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
        >
            <div className="icon-wrapper" style={{ color: color, boxShadow: `0 0 20px ${color}33` }}>
                <i className={icon}></i>
            </div>
            <h3 className="card-title">{title}</h3>
            <p className="card-desc">{desc}</p>
        </motion.div>
    );
};

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
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem' }}>Your Path to <span className="highlight-gradient">Success</span></h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>
                        Scroll to explore our proven 4-step roadmap.
                    </p>
                </motion.div>

                <motion.div style={{ x, display: 'flex', gap: '40px', paddingLeft: '5vw' }}>
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            whileHover={{ y: -15, scale: 1.02 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{
                                minWidth: '400px',
                                height: '500px',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: '40px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.02)',
                                backdropFilter: 'blur(10px)',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'default',
                                flexShrink: 0
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-10px',
                                fontSize: '15rem',
                                fontWeight: 900,
                                opacity: 0.03,
                                lineHeight: 1,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {step.id}
                            </div>

                            <div style={{ zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '24px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2.5rem'
                                }}>
                                    <i className={`${step.icon}`} style={{ fontSize: '2.8rem', color: 'var(--primary)' }}></i>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>{step.title}</h3>
                                <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{step.desc}</p>
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
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem' }}>Start Your <span className="highlight-gradient">Journey</span></h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>
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
                            whileHover={{ y: -15, scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                minWidth: '350px',
                                height: '450px',
                                padding: '2.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(10px)',
                                textDecoration: 'none',
                                color: 'inherit',
                                position: 'relative',
                                flexShrink: 0
                            }}
                        >
                            <div>
                                <i className={res.icon} style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1.5rem' }}></i>
                                <h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>{res.title}</h3>
                                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{res.desc}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>
                                {res.cta} <i className="fas fa-arrow-right" style={{ marginLeft: '12px' }}></i>
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

        if (storedUsername && token) {
            setUser({
                username: storedUsername,
                role: storedRole || 'User'
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload(); // Refresh to update UI state
    };

    return (
        <div className="home-page-wrapper">
            <StarBackground />
            <FloatingCodeBackground />
            <div className="decorative-blob blob-1"></div>
            <div className="decorative-blob blob-2"></div>

            {/* Hero Section */}
            <section className="hero">
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}
                >
                    <motion.div variants={fadeInUp}>
                        <div className="digital-tag" style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: 'rgba(0, 212, 255, 0.1)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--primary)',
                            marginBottom: '2rem',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            <Typewriter text="New Era of Placement" delay={100} infinite={false} />
                        </div>
                        <h1 id="heroHeading">
                            Launch Your Career <br />
                            <span className="highlight-gradient">With Confidence</span>
                        </h1>
                    </motion.div>

                    {user && (
                        <motion.div
                            id="userWelcome"
                            variants={fadeInUp}
                            className="user-welcome-card"
                            style={{ margin: '2rem auto', maxWidth: '400px' }}
                        >
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{user.username}</span></h2>
                            <p style={{ opacity: 0.7 }}>Account type: {user.role}</p>
                        </motion.div>
                    )}

                    <motion.p id="heroSubtitle" variants={fadeInUp}>
                        Explore top-tier job opportunities, master your skills, and connect with global recruiters. Your journey to professional excellence starts here.
                    </motion.p>

                    <motion.div className="cta-btns" variants={fadeInUp}>
                        {localStorage.getItem('authToken') ? (
                            <>
                                <Link to="/jobs" className="btn-premium btn-neon-primary">
                                    Explore Jobs <i className="fas fa-arrow-right"></i>
                                </Link>
                                <button onClick={handleLogout} className="btn-premium btn-glass-pill">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn-premium btn-neon-primary">
                                    Get Started
                                </Link>
                                <Link to="/login" className="btn-premium btn-glass-pill">
                                    Login
                                </Link>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </section>

            {/* Feature Grid Section */}
            <section className="feature-grid-section" style={{ padding: '8rem 5%', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '5rem' }}
                >
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem' }}>Global High-Tech <span className="highlight-gradient">Ecosystem</span></h2>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto' }}>
                        Everything you need to transform from a student to an industry-ready professional.
                    </p>
                </motion.div>

                <div className="features-grid">
                    <FeatureCard icon="fas fa-lightbulb" title="Mentorship" desc="Weekly check-ins, real guidance, and accountability from industry mentors." color="#fbbf24" />
                    <FeatureCard icon="fas fa-laptop-code" title="Coding & CGPA" desc="Master C, ace your CGPA, and start coding for placements from day one." color="#a855f7" />
                    <FeatureCard icon="fas fa-globe" title="Web & App Dev" desc="Kickstart your dev journey with hands-on web and app projects." color="#3b82f6" />
                    <FeatureCard icon="fas fa-rocket" title="Career Roadmap" desc="Get a clear, actionable plan for internships and projects." color="#ef4444" />
                </div>
            </section>

            <StatsSection />
            <RoadmapScroll />
            <LearningHubScroll />

            {/* Gallery Section */}
            <section className="gallery">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: ' clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem' }}>Moments & <span className="highlight-gradient">Memories</span></h2>
                </div>
                <div className="slideshow-container" style={{ position: 'relative', overflow: 'hidden', height: '600px' }}>
                    <div className="mySlides fade" style={{ display: 'block', height: '100%', width: '100%' }}>
                        <img
                            src={galleryImages[currentImageIndex]}
                            alt={`Moments & Memories ${currentImageIndex + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <a className="prev" onClick={prevSlide} style={{
                        cursor: 'pointer', position: 'absolute', top: '50%', width: 'auto', padding: '24px', marginTop: '-30px',
                        color: 'white', fontWeight: 'bold', fontSize: '24px', transition: '0.6s ease', borderRadius: '0 8px 8px 0',
                        userSelect: 'none', left: '10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)'
                    }}>&#10094;</a>
                    <a className="next" onClick={nextSlide} style={{
                        cursor: 'pointer', position: 'absolute', top: '50%', width: 'auto', padding: '24px', marginTop: '-30px',
                        color: 'white', fontWeight: 'bold', fontSize: '24px', transition: '0.6s ease', borderRadius: '8px 0 0 8px',
                        userSelect: 'none', right: '10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)'
                    }}>&#10095;</a>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    {galleryImages.map((_, idx) => (
                        <span
                            key={idx}
                            className="dot"
                            style={{
                                cursor: 'pointer',
                                height: '12px',
                                width: '12px',
                                margin: '0 8px',
                                backgroundColor: idx === currentImageIndex ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                display: 'inline-block',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: idx === currentImageIndex ? 'scale(1.5)' : 'scale(1)'
                            }}
                            onClick={() => setCurrentImageIndex(idx)}
                        ></span>
                    ))}
                </div>
            </section>

            {/* Partners Section */}
            <section className="companies" style={{ padding: '8rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem', padding: '0 5%' }}>
                    <h2 style={{ fontSize: ' clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem' }}>Our Valued <span className="highlight-gradient">Partners</span></h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '800px', margin: '0 auto' }}>
                        Collaborating with industry leaders to create unparalleled opportunities.
                    </p>
                </div>
                <div className="logos-marquee-container">
                    <div className="logos-marquee-track">
                        <PartnerLogos />
                        <PartnerLogos />
                    </div>
                </div>
            </section>

            {/* Contact Teaser Section */}
            <section className="contact-teaser" style={{ padding: '10rem 5%', textAlign: 'center', background: 'transparent' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '5rem 2rem', borderRadius: '40px', backdropFilter: 'blur(20px)' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Ready to <span className="highlight-gradient">Level Up?</span></h2>
                    <p className="subtitle" style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem' }}>
                        Have questions or need assistance? Our team is here to help you every step of the way.
                    </p>
                    <Link to="/contact" className="btn-premium btn-neon-primary" style={{ padding: '1.2rem 3rem' }}>
                        <i className="fas fa-envelope"></i> Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
};

const StatsSection = () => (
    <section className="stats" style={{ padding: '0 5% 10rem' }}>
        <div className="stats-container">
            <div className="stat-item"><h3>500+</h3><p>Companies Hiring</p></div>
            <div className="stat-item"><h3>10,000+</h3><p>Successful Placements</p></div>
            <div className="stat-item"><h3>95%</h3><p>Placement Rate</p></div>
            <div className="stat-item"><h3>50+</h3><p>Career Resources</p></div>
        </div>
    </section>
);

const PartnerLogos = () => (
    <>
        <div className="company-logo-item"><img src="/images/accenture-logo.jpg" alt="Accenture" /></div>
        <div className="company-logo-item"><img src="/images/wipro-logo.jpg" alt="Wipro" /></div>
        <div className="company-logo-item"><img src="/images/infosys-logo.jpg" alt="Infosys" /></div>
        <div className="company-logo-item"><img src="/images/tcs-logo.jpg" alt="TCS" /></div>
        <div className="company-logo-item"><img src="/images/capgemini-logo.jpg" alt="Capgemini" /></div>
        <div className="company-logo-item"><img src="/images/persistent-logo.jpg" alt="Persistent" /></div>
        <div className="company-logo-item"><img src="/images/google.png" alt="Google" /></div>
        <div className="company-logo-item"><img src="/images/microsoft.png" alt="Microsoft" /></div>
        <div className="company-logo-item"><img src="/images/amazon.jpg" alt="Amazon" /></div>
        <div className="company-logo-item"><img src="/images/ibm.jpg" alt="IBM" /></div>
        <div className="company-logo-item"><img src="/images/hexaware-logo.jpg" alt="Hexaware" /></div>
        <div className="company-logo-item"><img src="/images/deleoite.jpg" alt="Deloitte" /></div>
    </>
);

export default Home;

