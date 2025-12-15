import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateResumeFromHTML } from '../utils/resumePDFGenerator';
import '../styles/resume.css';

const Resume = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        portfolio: '',
        objective: '',
        education: '',
        experience: '',
        skills: '',
        projects: '',
        certifications: '',
        softSkills: 'Problem-Solving | Team Collaboration | Time Management | Strong Communication',
        declaration: '',
        template: 'classic'
    });
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'https://placement-portal-backend-nwaj.onrender.com/api';

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You must be logged in to create a resume.");
            navigate('/login');
        }

        // Load saved data


        // Load saved data
        const savedData = localStorage.getItem('resumeFormData');
        if (savedData) {
            try {
                setFormData(JSON.parse(savedData));
            } catch (e) {
                console.error("Error parsing saved resume data", e);
            }
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newVal = type === 'checkbox' ? (checked ? value : '') : value;
        // Note: template is radio, but works with value. declaration is textarea.

        const updatedData = { ...formData, [name]: newVal };
        setFormData(updatedData);
        localStorage.setItem('resumeFormData', JSON.stringify(updatedData));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate PDF using frontend utility
            generateResumeFromHTML(formData);
            alert('Resume generated successfully! Use your browser\'s print dialog to save as PDF.');

            // Optionally clear form after generation
            // localStorage.removeItem('resumeFormData');
        } catch (error) {
            console.error('Resume generation error:', error);
            alert(`Error generating resume: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="resume-builder-container">
            <header className="page-header">
                <h1>Create Your Professional CV</h1>
                <p className="subtitle">Fill in your details below. Your progress is saved automatically.</p>
            </header>

            <form id="resumeForm" className="surface-glow" onSubmit={handleSubmit}>
                {/* Personal Details */}
                <div className="form-section">
                    <div className="section-title"><i className="fas fa-user-circle"></i><h2>Personal Details</h2></div>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="name">Full Name</label><input type="text" id="name" name="name" required placeholder="e.g., John Doe" value={formData.name} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="email">Email Address</label><input type="email" id="email" name="email" required placeholder="e.g., john.doe@email.com" value={formData.email} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" name="phone" required placeholder="e.g., +91 98765 43210" value={formData.phone} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="address">Current Address</label><input type="text" id="address" name="address" required placeholder="e.g., 123 Tech Park, Silicon Valley" value={formData.address} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="linkedin">LinkedIn Profile URL</label><input type="url" id="linkedin" name="linkedin" placeholder="e.g., linkedin.com/in/yourname" value={formData.linkedin} onChange={handleChange} /></div>
                        <div className="form-group"><label htmlFor="portfolio">Portfolio/GitHub URL</label><input type="url" id="portfolio" name="portfolio" placeholder="e.g., github.com/yourusername" value={formData.portfolio} onChange={handleChange} /></div>
                    </div>
                </div>

                {/* Professional Summary */}
                <div className="form-section">
                    <div className="section-title"><i className="fas fa-bullseye"></i><h2>Professional Summary</h2></div>
                    <div className="form-group full-width">
                        <textarea id="objective" name="objective" required placeholder="e.g., A highly motivated..." rows="4" value={formData.objective} onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* Education & Experience */}
                <div className="form-section">
                    <div className="form-grid">
                        <div>
                            <div className="section-title"><i className="fas fa-graduation-cap"></i><h2>Education</h2></div>
                            <div className="form-group"><textarea id="education" name="education" required placeholder="B.Tech in CS..." rows="6" value={formData.education} onChange={handleChange}></textarea></div>
                        </div>
                        <div>
                            <div className="section-title"><i className="fas fa-briefcase"></i><h2>Work Experience</h2></div>
                            <div className="form-group"><textarea id="experience" name="experience" placeholder="Software Engineer Intern..." rows="6" value={formData.experience} onChange={handleChange}></textarea></div>
                        </div>
                    </div>
                </div>

                {/* Skills & Projects */}
                <div className="form-section">
                    <div className="form-grid">
                        <div>
                            <div className="section-title"><i className="fas fa-cogs"></i><h2>Skills</h2></div>
                            <div className="form-group"><textarea id="skills" name="skills" required placeholder="Programming Languages..." rows="6" value={formData.skills} onChange={handleChange}></textarea></div>
                        </div>
                        <div>
                            <div className="section-title"><i className="fas fa-project-diagram"></i><h2>Projects</h2></div>
                            <div className="form-group"><textarea id="projects" name="projects" placeholder="Placement Portal..." rows="6" value={formData.projects} onChange={handleChange}></textarea></div>
                        </div>
                    </div>
                </div>

                {/* Soft Skills */}
                <div className="form-section">
                    <div className="section-title"><i className="fas fa-users"></i><h2>Soft Skills</h2></div>
                    <div className="form-group full-width">
                        <textarea id="softSkills" name="softSkills" placeholder="e.g., Problem-Solving | Team Collaboration | Time Management | Strong Communication" rows="2" value={formData.softSkills} onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* Certifications (Optional) */}
                <div className="form-section">
                    <div className="section-title"><i className="fas fa-certificate"></i><h2>Certifications</h2></div>
                    <div className="form-group full-width">
                        <textarea id="certifications" name="certifications" placeholder="e.g., AWS Certified Cloud Practitioner..." rows="3" value={formData.certifications} onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* Declaration */}
                <div className="form-section">
                    <div className="section-title"><i className="fas fa-gavel"></i><h2>Declaration</h2></div>
                    <div className="form-group full-width">
                        <textarea id="declaration" name="declaration" required placeholder="I hereby declare that the information provided is true..." rows="3" value={formData.declaration} onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="form-section">
                    <div className="section-title"><i className="fas fa-palette"></i><h2>Choose a Template</h2></div>
                    <div className="template-options">
                        <label className="template-option">
                            <input type="radio" name="template" value="classic" checked={formData.template === 'classic'} onChange={handleChange} required />
                            <img src="/images/resume-classic.png" alt="Classic Template" />
                            <span>Classic Professional</span>
                        </label>
                        <label className="template-option">
                            <input type="radio" name="template" value="modern" checked={formData.template === 'modern'} onChange={handleChange} required />
                            <img src="/images/resume-modern.png" alt="Modern Template" />
                            <span>Modern Tech</span>
                        </label>
                        <label className="template-option">
                            <input type="radio" name="template" value="creative" checked={formData.template === 'creative'} onChange={handleChange} required />
                            <img src="/images/resume-creative.png" alt="Creative Template" />
                            <span>Creative Bold</span>
                        </label>
                    </div>
                </div>

                <div className="form-submission">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <span><i className="fas fa-spinner fa-spin"></i> Generating...</span> : <span>Generate Resume <i className="fas fa-file-download"></i></span>}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default Resume;
