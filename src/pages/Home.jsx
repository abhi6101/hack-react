import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from '../components/CountUp';
import TextType from '../components/TextType';
import '../styles/index.css';

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

    // Scroll Animation Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
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
        navigate('/login');
    };

    return (
        <main>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 id="heroHeading" style={{ minHeight: 'auto', display: 'block' }}>
                        <TextType
                            text="Launch Your Career with Ease!"
                            speed={80}
                            delay={500}
                            cursor={true}
                        />
                    </h1>
                    {user && (
                        <div id="userWelcome" className="surface-glow">
                            <h2>Welcome, <span id="displayUsername">{user.username}</span>!</h2>
                            <p>Account type: <span id="displayRole">{user.role}</span></p>
                        </div>
                    )}
                    <p id="heroSubtitle">Your gateway to top-tier job placements, resume mastery, and interview excellence. Your future starts here.</p>
                    <div className="cta-btns">
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
                    </div>
                </div>
            </section>


            {/* NEW: Learning Roadmap Section (Learnext Inspired) */}
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
                        <div className="hub-card surface-glow">
                            <i className="fas fa-flask"></i>
                            <h3>Web Security Academy</h3>
                            <p>The definitive free resource for learning web application security from the creators of Burp Suite.</p>
                            <span className="hub-link">Explore Platform <i className="fas fa-arrow-right"></i></span>
                        </div>
                    </a>

                    <a href="https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37" target="_blank" rel="noopener noreferrer" className="hub-card-link">
                        <div className="hub-card surface-glow">
                            <i className="fab fa-js-square"></i>
                            <h3>Chai aur JavaScript</h3>
                            <p>Deep dive into JavaScript with Hitesh Choudhary. Perfect for mastering modern web development.</p>
                            <span className="hub-link">Watch Now <i className="fas fa-arrow-right"></i></span>
                        </div>
                    </a>

                    <a href="https://www.hackthebox.com/" target="_blank" rel="noopener noreferrer" className="hub-card-link">
                        <div className="hub-card surface-glow">
                            <i className="fas fa-cube"></i>
                            <h3>Hack The Box</h3>
                            <p>Challenge your abilities with real-world lab scenarios and compete with a global community.</p>
                            <span className="hub-link">Explore Platform <i className="fas fa-arrow-right"></i></span>
                        </div>
                    </a>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3><CountUp end={500} suffix="+" duration={2500} /></h3>
                        <p>Companies Hiring</p>
                    </div>
                    <div className="stat-item">
                        <h3><CountUp end={10000} suffix="+" duration={2500} /></h3>
                        <p>Successful Placements</p>
                    </div>
                    <div className="stat-item">
                        <h3><CountUp end={95} suffix="%" duration={2500} /></h3>
                        <p>Placement Rate</p>
                    </div>
                    <div className="stat-item">
                        <h3><CountUp end={50} suffix="+" duration={2500} /></h3>
                        <p>Career Resources</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <h2>Success Stories</h2>
                <div className="testimonial-cards">
                    <div className="testimonial-card surface-glow">
                        <p>"The resume builder and mock interviews were game-changers! Landed my dream job at a top tech company..."</p>
                        <div className="testimonial-author">
                            <img src="/images/i-priya.jpg" alt="Priya Sharma" />
                            <div className="author-info"><h4>Priya Sharma</h4><p>Software Engineer at Google</p></div>
                        </div>
                    </div>
                    <div className="testimonial-card surface-glow">
                        <p>"I went from zero calls to 5 job offers in 2 months. The interview prep resources are pure gold."</p>
                        <div className="testimonial-author">
                            <img src="/images/i-rahul.jpg" alt="Rahul Verma" />
                            <div className="author-info"><h4>Rahul Verma</h4><p>Data Analyst at Amazon</p></div>
                        </div>
                    </div>
                    <div className="testimonial-card surface-glow">
                        <p>"Personalized career guidance helped me transition into a higher-paying role. Highly recommended!"</p>
                        <div className="testimonial-author">
                            <img src="/images/i-neha.jpg" alt="Neha Patel" />
                            <div className="author-info"><h4>Neha Patel</h4><p>Product Manager at Microsoft</p></div>
                        </div>
                    </div>
                </div>
            </section>

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
            <section className="contact-teaser" style={{ textAlign: 'center', background: 'var(--surface-bg)' }}>
                <h2>Ready to Start Your Journey?</h2>
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
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
