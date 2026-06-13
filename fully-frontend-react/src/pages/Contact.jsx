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


            <main className="contact-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="contact-grid" style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'center' }}>
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
                                <p>Infront of westend A.B road, Indore, MP 452012</p>
                            </div>
                        </div>
                        <div className="social-links">
                            <a href="https://www.linkedin.com/in/abhi-jain-a1a723298" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            <a href="https://www.instagram.com/_abhi__jain___/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>


                </div>


            </main>
        </>
    );
};

export default Contact;
