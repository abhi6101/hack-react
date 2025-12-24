import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/index.css';
import '../styles/home.css';
import '../styles/reactbits-effects.css';

const GALLERY_IMAGES = [
    "/images/4E9A7129-copy.jpg",
    "/images/lab1.jpg",
    "/images/Group-photo-1-copy-4.jpg",
    "/images/fair.jpg",
    "/images/DSCF2122-copy.jpg"
];

const Home = () => {
    const [user, setUser] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [decryptComplete, setDecryptComplete] = useState(false);
    const navigate = useNavigate();
    const spotlightRefs = useRef([]);

    // Custom Hook for Scroll Animations
    useScrollAnimation();

    // Decrypt text animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setDecryptComplete(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Spotlight effect for cards
    const handleMouseMove = (e, index) => {
        const card = spotlightRefs.current[index];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    };

    const nextSlide = () => {
        setCurrentImageIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    };

    const prevSlide = () => {
        setCurrentImageIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    };

    // Auto-Slideshow Effect
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
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
        navigate('/login');
    };

    return (
        <main>
            {/* Aurora Background Effect */}
            <div className="aurora-bg"></div>
            <div className="grid-motion-bg"></div>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content stagger-children">
                    <h1 id="heroHeading" className={`hero-heading-block gradient-text-animated ${decryptComplete ? 'decrypt-text' : ''}`}>
                        {"Launch Your Career with Ease!".split('').map((char, i) => (
                            <span key={i} style={{ animationDelay: `${i * 0.03}s` }}>
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </h1>
                    {user && (
                        <div id="userWelcome" className="fluid-glass spotlight-card blur-in"
                            ref={el => spotlightRefs.current[0] = el}
                            onMouseMove={(e) => handleMouseMove(e, 0)}>
                            <h2>Welcome, <span id="displayUsername">{user.username}</span>!</h2>
                            <p>Account type: <span id="displayRole">{user.role}</span></p>
                        </div>
                    )}
                    <p id="heroSubtitle" className="blur-in" style={{ animationDelay: '0.3s' }}>Your gateway to top-tier job placements, resume mastery, and interview excellence. Your future starts here.</p>
                    <div className="cta-btns scale-in" style={{ animationDelay: '0.5s' }}>
                        {localStorage.getItem('authToken') ? (
                            <>
                                <Link to="/jobs" className="shiny-btn magnet-element">Explore Jobs <i className="fas fa-arrow-right"></i></Link>
                                <button onClick={handleLogout} className="shiny-btn magnet-element" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/register" id="registerBtn" className="shiny-btn magnet-element">Register Now</Link>
                                <Link to="/login" className="shiny-btn magnet-element">Login</Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* NEW: Learning Roadmap Section */}
            <section className="roadmap-section animate-on-scroll">
                <h2>Your Path to Success</h2>
                <p className="subtitle">Follow our proven 4-step roadmap to land your dream job.</p>
                <div className="roadmap-container">
                    <div className="roadmap-step">
                        <div className="step-icon"><i className="fas fa-laptop-code"></i></div>
                        <div className="step-content">
                            <h3>1. Learn Skills</h3>
                            <p>Master trending tech with our structured courses.</p>
                        </div>
                    </div>
                    <div className="roadmap-step">
                        <div className="step-icon"><i className="fas fa-hammer"></i></div>
                        <div className="step-content">
                            <h3>2. Build Projects</h3>
                            <p>Apply knowledge by building real-world applications.</p>
                        </div>
                    </div>
                    <div className="roadmap-step">
                        <div className="step-icon"><i className="fas fa-file-signature"></i></div>
                        <div className="step-content">
                            <h3>3. Perfect Resume</h3>
                            <p>Craft a resume that passes ATS scanners.</p>
                        </div>
                    </div>
                    <div className="roadmap-step">
                        <div className="step-icon"><i className="fas fa-rocket"></i></div>
                        <div className="step-content">
                            <h3>4. Get Hired</h3>
                            <p>Ace the interview and launch your career.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Learning Hub Section */}
            <section className="learning-hub-section animate-on-scroll">
                <h2>Start Your Learning Journey</h2>
                <p className="subtitle">Hand-picked resources to build your skills and prepare you for the industry.</p>

                <div className="hub-grid">
                    <a href="https://portswigger.net/web-security" target="_blank" rel="noopener noreferrer" className="hub-card-link">
                        <GlassCard className="hub-card fluid-glass spotlight-card electric-border glare-effect"
                            ref={el => spotlightRefs.current[1] = el}
                            onMouseMove={(e) => handleMouseMove(e, 1)}>
                            <i className="fas fa-flask"></i>
                            <h3>Web Security Academy</h3>
                            <p>The definitive free resource for learning web application security from the creators of Burp Suite.</p>
                            <span className="hub-link">Explore Platform <i className="fas fa-arrow-right"></i></span>
                        </GlassCard>
                    </a>

                    <a href="https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37" target="_blank" rel="noopener noreferrer" className="hub-card-link">
                        <GlassCard className="hub-card fluid-glass spotlight-card electric-border glare-effect"
                            ref={el => spotlightRefs.current[2] = el}
                            onMouseMove={(e) => handleMouseMove(e, 2)}>
                            <i className="fab fa-js-square"></i>
                            <h3>Chai aur JavaScript</h3>
                            <p>Deep dive into JavaScript with Hitesh Choudhary. Perfect for mastering modern web development.</p>
                            <span className="hub-link">Watch Now <i className="fas fa-arrow-right"></i></span>
                        </GlassCard>
                    </a>

                    <a href="https://www.hackthebox.com/" target="_blank" rel="noopener noreferrer" className="hub-card-link">
                        <GlassCard className="hub-card fluid-glass spotlight-card electric-border glare-effect"
                            ref={el => spotlightRefs.current[3] = el}
                            onMouseMove={(e) => handleMouseMove(e, 3)}>
                            <i className="fas fa-cube"></i>
                            <h3>Hack The Box</h3>
                            <p>Challenge your abilities with real-world lab scenarios and compete with a global community.</p>
                            <span className="hub-link">Explore Platform <i className="fas fa-arrow-right"></i></span>
                        </GlassCard>
                    </a>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-item"><h3>500+</h3><p>Companies Hiring</p></div>
                    <div className="stat-item"><h3>10,000+</h3><p>Successful Placements</p></div>
                    <div className="stat-item"><h3>95%</h3><p>Placement Rate</p></div>
                    <div className="stat-item"><h3>50+</h3><p>Career Resources</p></div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <h2>Success Stories</h2>
                <div className="testimonial-cards">
                    <GlassCard className="testimonial-card">
                        <p>"The resume builder and mock interviews were game-changers! Landed my dream job at a top tech company..."</p>
                        <div className="testimonial-author">
                            <img src="/images/i-priya.jpg" alt="Priya Sharma" />
                            <div className="author-info"><h4>Priya Sharma</h4><p>Software Engineer at Google</p></div>
                        </div>
                    </GlassCard>
                    <GlassCard className="testimonial-card">
                        <p>"I went from zero calls to 5 job offers in 2 months. The interview prep resources are pure gold."</p>
                        <div className="testimonial-author">
                            <img src="/images/i-rahul.jpg" alt="Rahul Verma" />
                            <div className="author-info"><h4>Rahul Verma</h4><p>Data Analyst at Amazon</p></div>
                        </div>
                    </GlassCard>
                    <GlassCard className="testimonial-card">
                        <p>"Personalized career guidance helped me transition into a higher-paying role. Highly recommended!"</p>
                        <div className="testimonial-author">
                            <img src="/images/i-neha.jpg" alt="Neha Patel" />
                            <div className="author-info"><h4>Neha Patel</h4><p>Product Manager at Microsoft</p></div>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="gallery">
                <h2>Moments & Memories</h2>
                <div className="gallery-container">
                    {/* Active Image */}
                    <div className="gallery-slide fade">
                        <img
                            src={GALLERY_IMAGES[currentImageIndex]}
                            alt={`Moments & Memories ${currentImageIndex + 1}`}
                            className="gallery-image"
                        />
                    </div>

                    {/* Navigation Arrows */}
                    <a className="gallery-nav gallery-prev" onClick={prevSlide}>&#10094;</a>
                    <a className="gallery-nav gallery-next" onClick={nextSlide}>&#10095;</a>
                </div>

                {/* Dots */}
                <div className="gallery-dots-container">
                    {GALLERY_IMAGES.map((_, idx) => (
                        <span
                            key={idx}
                            className={`gallery-dot ${idx === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(idx)}
                        ></span>
                    ))}
                </div>
            </section>

            {/* Partners Section */}
            <section className="companies">
                <h2>Our Valued Placement Partners</h2>
                <p className="subtitle">We are proud to collaborate with industry leaders to create unparalleled opportunities for our students.</p>
                <div className="logos-marquee-container">
                    <div className="logos-marquee-track">
                        {/* 1st Set of Logos */}
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

                        {/* Duplicate Set for Seamless Scroll */}
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
                    </div>
                </div>
            </section>

            {/* Contact Teaser Section */}
            <section className="contact-teaser-section">
                <h2>Ready to Start Your Journey?</h2>
                <p className="subtitle contact-teaser-subtitle">
                    Have questions or need assistance? Our team is here to help you every step of the way.
                </p>
                <Link to="/contact" className="btn btn-primary">
                    <i className="fas fa-envelope"></i> Contact Us
                </Link>
            </section>
        </main>
    );
};

export default Home;
