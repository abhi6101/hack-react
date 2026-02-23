import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import API_BASE_URL from '../config';
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
                            <h1 id="heroHeading" style={{ minHeight: 'auto', display: 'block' }}>
                                <span style={{ whiteSpace: 'nowrap' }}>Get Your Dream Job with</span> <br />
                                <span style={{ whiteSpace: 'nowrap' }}>hack-2-hired</span>
                            </h1>
                        </motion.div>

                        {user && (
                            <motion.div
                                id="userWelcome"
                                variants={fadeInUp}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    padding: 0,
                                    textAlign: 'left', // Aligned left now
                                    marginTop: '1rem'
                                }}
                            >
                                <h2 style={{ textAlign: 'left' }}>Welcome, <span id="displayUsername">{user.username}</span>!</h2>
                                <p style={{ textAlign: 'left' }}>Account type: <span id="displayRole">{user.role}</span></p>
                            </motion.div>
                        )}

                        <motion.p id="heroSubtitle" variants={fadeInUp} style={{ textAlign: 'left', margin: '0.75rem 0 1.5rem' }}>
                            Your gateway to top-tier job placements, resume mastery, and interview excellence. Your future starts here.
                        </motion.p>

                        <motion.div className="cta-btns" variants={fadeInUp} style={{ justifyContent: 'flex-start' }}>
                            {localStorage.getItem('authToken') ? (
                                <>
                                    <Link to="/jobs" className="btn btn-outline">Explore Jobs <i className="fas fa-arrow-right"></i></Link>
                                    <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--neon-pink)', color: 'white' }}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" id="registerBtn" className="btn btn-outline">Register Now</Link>
                                    <Link to="/login" className="btn btn-outline">Login</Link>
                                </>
                            )}
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

            {/* Partners Logo Scrolling Section */}
            <section className="partners-scroll-section">
                <div className="container">
                    <div className="partners-header">
                        <div className="status-pill">
                            <span className="dot"></span> Trusted Worldwide
                        </div>
                        <h2 className="partners-title">
                            Trusted By <span>100+ Companies</span>
                        </h2>
                        <p className="partners-subtitle">
                            Join thousands of leading companies that trust us to connect them with top talent and help professionals find their dream careers.
                        </p>
                    </div>

                    <div className="logo-marquee-container">
                        <div className="logo-scroll-track">
                            {[
                                'Google.png', 'Amazon.png', 'Microsoft.png', 'Meta.png',
                                'Netflix.png', 'Spotify.png', 'Oracle.png', 'Walmart.png',
                                'Slack.png', 'Figma.png', 'Pinterest.png',
                                'Google.png', 'Amazon.png', 'Microsoft.png', 'Meta.png',
                                'Netflix.png', 'Spotify.png', 'Oracle.png', 'Walmart.png',
                                'Slack.png', 'Figma.png', 'Pinterest.png'
                            ].map((logo, index) => (
                                <div className="logo-item" key={index}>
                                    <img src={`/images/${logo}`} alt="Partner Logo" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="metrics-grid">
                        <div className="metric-card">
                            <h3>100+</h3>
                            <p>Companies</p>
                        </div>
                        <div className="metric-card">
                            <h3>1K+</h3>
                            <p>Job Seekers</p>
                        </div>
                        <div className="metric-card">
                            <h3>5K+</h3>
                            <p>Jobs Posted</p>
                        </div>
                        <div className="metric-card">
                            <h3>95%</h3>
                            <p>Success Rate</p>
                        </div>
                    </div>
                </div>
            </section>

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
                                <img src="/images/Boy.png" alt="Profile" />
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
                                    <h3>Build Your Resume</h3>
                                    <p>Create a standout resume with your skills.</p>
                                </div>
                            </div>

                            <div className="how-step-item">
                                <div className="step-icon-box">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <div className="step-text">
                                    <h3>Apply for Job</h3>
                                    <p>Find and apply for jobs that match your skills.</p>
                                </div>
                            </div>

                            <div className="how-step-item">
                                <div className="step-icon-box">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="step-text">
                                    <h3>Get Hired</h3>
                                    <p>Connect with employers and start your new job.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Feature Grid Section (User Request) */}
            <section className="feature-grid-section" style={{ padding: '4rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
                {/* Left: 2x2 Grid */}
                <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', flex: '1', width: '100%', maxWidth: '800px' }}>
                    {/* Card 1 */}
                    <FeatureCard icon="fas fa-lightbulb" title="Mentorship" desc="Weekly check-ins, real guidance, and accountability from industry mentors." color="#fbbf24" />
                    {/* Card 2 */}
                    <FeatureCard icon="fas fa-laptop-code" title="Coding & CGPA" desc="Master C, ace your CGPA, and start coding for placements from day one." color="#a855f7" />
                    {/* Card 3 */}
                    <FeatureCard icon="fas fa-globe" title="Web & App Dev" desc="Kickstart your dev journey with hands-on web and app projects." color="#3b82f6" />
                    {/* Card 4 */}
                    <FeatureCard icon="fas fa-rocket" title="Career Roadmap" desc="Get a clear, actionable plan for internships and projects." color="#ef4444" />
                </div>
            </section>





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
                <div className="slideshow-container" style={{ position: 'relative', overflow: 'hidden', height: '500px', borderRadius: '16px' }}>

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

                {/* Dots */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
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
            </section>


        </main>
    );
};

export default Home;
