import React, { useState } from 'react';
import { useToast } from '../components/CustomToast';
import '../styles/contact.css';

const Contact = () => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Submitted:', formData);
        showToast({
            message: 'Thank you for your message! We will get back to you shortly.',
            type: 'success'
        });
        setFormData({
            name: '',
            email: '',
            subject: 'General Inquiry',
            message: ''
        });
    };

    return (
        <>
            <header className="hero">
                <div className="hero-content">
                    <h1>Get In Touch</h1>
                    <p className="subtitle">We're here to help. Reach out with any questions or inquiries, and our team will get back to you shortly.</p>
                </div>
            </header>

            <main className="contact-page-container">
                <div className="contact-grid">
                    {/* Contact Info Card */}
                    <div className="contact-card surface-glow">
                        <h3>Contact Information</h3>
                        <div className="contact-item">
                            <i className="fas fa-phone-alt"></i>
                            <div>
                                <h4>Phone</h4>
                                <a href="tel:+916266017070">+91-6266017070</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <h4>Email</h4>
                                <a href="mailto:hack2hired.official@gmail.com">hack2hired.official@gmail.com</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <div>
                                <h4>Main Office</h4>
                                <p>103, Sukhmani Apt, Bhawarkuan, Indore, MP 452014</p>
                            </div>
                        </div>
                        <div className="social-links">
                            <a href="https://www.linkedin.com/in/abhi-jain-a1a723298" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            <a href="https://www.instagram.com/_abhi__jain___/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    {/* Contact Form Card */}
                    <div className="contact-card surface-glow">
                        <h3>Send Us a Message</h3>
                        <form id="contactForm" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Placement">Placement Assistance</option>
                                    <option value="Courses">Course Information</option>
                                    <option value="Feedback">Feedback</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Your Message</label>
                                <textarea id="message" name="message" required rows="5" placeholder="How can we help you?" value={formData.message} onChange={handleChange}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Send Message <i className="fas fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>

                {/* Map Section */}
                <div className="map-section surface-glow">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.527339794689!2d75.8752250742111!3d22.756191925345717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd2b99217631%3A0x6b4455855f89e4c1!2s5%2C%20Vishnu%20Puri%2C%20103%2C%20Sukhmani%20Apartment%2C%20Above%20Union%20Bank%2C%20AB%20Road%20Bhawarkuan%2C%20Indore%2C%20Madhya%20Pradesh%20452014!5e0!3m2!1sen!2sin!4v1717604593415!5m2!1sen!2sin"
                        allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map"
                    >
                    </iframe>
                </div>
            </main>
        </>
    );
};

export default Contact;
