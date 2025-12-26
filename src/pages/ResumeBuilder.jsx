import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import API_BASE_URL from '../config';

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        summary: '',
        education: [{ institution: '', degree: '', year: '', score: '' }],
        experience: [{ company: '', role: '', duration: '', description: '' }],
        projects: [{ title: '', description: '', techStack: '' }],
        skills: '', // Comma separated
        template: 'sde', // Default to SDE format
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const initialData = {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        summary: '',
        education: [{ institution: '', degree: '', year: '', score: '' }],
        experience: [{ company: '', role: '', duration: '', description: '' }],
        projects: [{ title: '', description: '', techStack: '' }],
        skills: '',
        template: 'sde',
    };

    const dummyData = {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '+1 555-0123-456',
        linkedin: 'linkedin.com/in/alexj',
        github: 'github.com/alexcodex',
        summary: 'Passionate Full Stack Developer with 2 years of experience building scalable web applications. Proficient in React, Node.js, and Cloud technologies. Eager to solve complex problems and deliver high-quality code.',
        education: [
            { institution: 'Tech University', degree: 'B.Tech in Computer Science', year: '2023', score: '8.5 CGPA' },
            { institution: 'City High School', degree: 'Senior Secondary', year: '2019', score: '92%' }
        ],
        experience: [
            { company: 'Innovate Tech', role: 'Frontend Developer', duration: 'June 2023 - Present', description: 'Developed responsive UI components using React and Redux. Improved site performance by 30% through code splitting and lazy loading.' },
            { company: 'Startup Hub', role: 'Intern', duration: 'Jan 2023 - May 2023', description: 'Assisted in building RESTful APIs using Node.js and Express. Collaborated with the design team to implement pixel-perfect layouts.' }
        ],
        projects: [
            { title: 'E-Commerce Platform', techStack: 'MERN Stack, Redux, Stripe', description: 'Built a full-featured e-commerce site with user authentication, product search, and secure payment processing.' },
            { title: 'Task Manager App', techStack: 'React, Firebase', description: 'Real-time task management application with drag-and-drop functionality and team collaboration features.' }
        ],
        skills: 'JavaScript, React.js, Node.js, Java, Spring Boot, SQL, MongoDB, Git, Docker, AWS',
        template: 'sde',
    };

    const fillDummyData = () => {
        setFormData(dummyData);
    };

    const clearData = () => {
        if (window.confirm('Are you sure you want to clear all data?')) {
            setFormData(initialData);
        }
    };

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showAlert({
                title: 'Login Required',
                message: 'You must be logged in to use the Resume Builder.',
                type: 'login',
                actions: [
                    {
                        label: 'Login Now',
                        primary: true,
                        onClick: () => navigate('/login')
                    },
                    {
                        label: 'Go Home',
                        primary: false,
                        onClick: () => navigate('/')
                    }
                ]
            });
        }
    }, [navigate, showAlert]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleArrayChange = (index, field, value, section) => {
        const updatedSection = [...formData[section]];
        updatedSection[index][field] = value;
        setFormData({ ...formData, [section]: updatedSection });
    };

    const addItem = (section, initialItem) => {
        setFormData({ ...formData, [section]: [...formData[section], initialItem] });
    };

    const removeItem = (section, index) => {
        const updatedSection = [...formData[section]];
        updatedSection.splice(index, 1);
        setFormData({ ...formData, [section]: updatedSection });
    };

    const generatePDF = async () => {
        setIsGenerating(true);

        // Dynamically import jsPDF to ensure it loads on client side
        const { jsPDF } = await import('jspdf');

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            let yPos = 20;

            // Helper to add text and update yPos
            const addText = (text, x, y, options = {}) => {
                doc.text(text, x, y, options);
            };

            const addSectionHeader = (title) => {
                yPos += 5;
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(title.toUpperCase(), margin, yPos);

                // Draw line under header
                yPos += 2;
                doc.setLineWidth(0.5);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
            };

            // --- HEADER ---
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text(formData.name || "YOUR NAME", pageWidth / 2, yPos, { align: "center" });

            yPos += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            // Build contact line: Email | Phone | LinkedIn | GitHub
            const contacts = [];
            if (formData.email) contacts.push(formData.email);
            if (formData.phone) contacts.push(formData.phone);
            if (formData.linkedin) contacts.push(formData.linkedin.replace('https://', '').replace('www.', ''));
            if (formData.github) contacts.push(formData.github.replace('https://', '').replace('www.', ''));

            doc.text(contacts.join("  |  "), pageWidth / 2, yPos, { align: "center" });

            yPos += 10;

            // --- SUMMARY ---
            if (formData.summary) {
                // Determine layout
                const splitSummary = doc.splitTextToSize(formData.summary, pageWidth - (margin * 2));
                doc.text(splitSummary, margin, yPos);
                yPos += (splitSummary.length * 5) + 5;
            }

            // --- EDUCATION ---
            if (formData.education && formData.education.length > 0 && formData.education[0].institution) {
                addSectionHeader("EDUCATION");

                formData.education.forEach(edu => {
                    // Institution & Year
                    doc.setFont("helvetica", "bold");
                    doc.text(edu.institution, margin, yPos);

                    doc.setFont("helvetica", "normal");
                    if (edu.year) {
                        doc.text(edu.year, pageWidth - margin, yPos, { align: "right" });
                    }
                    yPos += 5;

                    // Degree & Score
                    const degreeLine = `${edu.degree}${edu.score ? ` (${edu.score})` : ''}`;
                    doc.setFont("helvetica", "italic");
                    doc.text(degreeLine, margin, yPos);
                    yPos += 6;
                });
            }

            // --- EXPERIENCE ---
            if (formData.experience && formData.experience.length > 0 && formData.experience[0].company) {
                addSectionHeader("EXPERIENCE");

                formData.experience.forEach(exp => {
                    doc.setFont("helvetica", "bold");
                    doc.text(exp.company, margin, yPos);

                    doc.setFont("helvetica", "normal");
                    if (exp.duration) {
                        doc.text(exp.duration, pageWidth - margin, yPos, { align: "right" });
                    }
                    yPos += 5;

                    doc.setFont("helvetica", "italic");
                    doc.text(exp.role, margin, yPos);
                    yPos += 5;

                    doc.setFont("helvetica", "normal");
                    if (exp.description) {
                        const splitDesc = doc.splitTextToSize(exp.description, pageWidth - (margin * 2));
                        doc.text(splitDesc, margin, yPos);
                        yPos += (splitDesc.length * 4) + 3;
                    }
                });
            }

            // --- PROJECTS ---
            if (formData.projects && formData.projects.length > 0 && formData.projects[0].title) {
                addSectionHeader("PROJECTS");

                formData.projects.forEach(proj => {
                    doc.setFont("helvetica", "bold");
                    doc.text(proj.title, margin, yPos);

                    if (proj.techStack) {
                        doc.setFont("helvetica", "italic");
                        const techText = `[ ${proj.techStack} ]`;
                        const textWidth = doc.getTextWidth(proj.title);
                        doc.text(techText, margin + textWidth + 2, yPos);
                    }
                    yPos += 5;

                    doc.setFont("helvetica", "normal");
                    if (proj.description) {
                        const splitDesc = doc.splitTextToSize(proj.description, pageWidth - (margin * 2));
                        doc.text(splitDesc, margin, yPos);
                        yPos += (splitDesc.length * 4) + 3;
                    }
                });
            }

            // --- SKILLS ---
            if (formData.skills) {
                addSectionHeader("TECHNICAL SKILLS");
                doc.setFont("helvetica", "normal");
                const splitSkills = doc.splitTextToSize(formData.skills, pageWidth - (margin * 2));
                doc.text(splitSkills, margin, yPos);
                yPos += (splitSkills.length * 5);
            }

            // Save the PDF
            doc.save(`${formData.name.replace(/\s+/g, '_')}_Resume.pdf`);

            showToast({
                message: 'Resume downloaded successfully!',
                type: 'success'
            });

        } catch (err) {
            console.error(err);
            showToast({
                message: `Error generating PDF: ${err.message}`,
                type: 'error'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '6rem' }}>
            <div className="page-header">
                <h1>ATS-Friendly Resume Builder</h1>
                <p>Create a professional, clean resume in seconds.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Form Side */}
                <div className="resume-form-container">

                    {/* 1. Personal Info */}
                    <SectionCard title="Personal Details" icon="user">
                        <div className="form-grid-2">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            <Input label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                            <Input label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/john" />
                            <Input label="GitHub/Portfolio" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/john" />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <label className="form-label">Professional Summary</label>
                            <textarea
                                className="form-input"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Brief overview of your skills and experience..."
                            ></textarea>
                        </div>
                    </SectionCard>

                    {/* 2. Education */}
                    <SectionCard title="Education" icon="graduation-cap">
                        {formData.education.map((edu, index) => (
                            <div key={index} className="repeater-item">
                                <div className="form-grid-2">
                                    <Input label="Institution" value={edu.institution} onChange={(e) => handleArrayChange(index, 'institution', e.target.value, 'education')} />
                                    <Input label="Degree" value={edu.degree} onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')} />
                                    <Input label="Year" value={edu.year} onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')} />
                                    <Input label="Score/CGPA" value={edu.score} onChange={(e) => handleArrayChange(index, 'score', e.target.value, 'education')} />
                                </div>
                                {index > 0 && <button className="btn-remove" onClick={() => removeItem('education', index)}>Remove</button>}
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('education', { institution: '', degree: '', year: '', score: '' })}>+ Add Education</button>
                    </SectionCard>

                    {/* 3. Skills */}
                    <SectionCard title="Skills" icon="code">
                        <label className="form-label">Technical Skills (Comma separated)</label>
                        <textarea
                            className="form-input"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Java, React, Spring Boot, MySQL, Git..."
                        ></textarea>
                    </SectionCard>

                    {/* 4. Experience */}
                    <SectionCard title="Work Experience" icon="briefcase">
                        {formData.experience.map((exp, index) => (
                            <div key={index} className="repeater-item">
                                <div className="form-grid-2">
                                    <Input label="Company" value={exp.company} onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'experience')} />
                                    <Input label="Role" value={exp.role} onChange={(e) => handleArrayChange(index, 'role', e.target.value, 'experience')} />
                                    <Input label="Duration" value={exp.duration} onChange={(e) => handleArrayChange(index, 'duration', e.target.value, 'experience')} placeholder="Jan 2023 - Present" />
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Input label="Description" value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} placeholder="Key responsibilities..." />
                                </div>
                                {index > 0 && <button className="btn-remove" onClick={() => removeItem('experience', index)}>Remove</button>}
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('experience', { company: '', role: '', duration: '', description: '' })}>+ Add Experience</button>
                    </SectionCard>

                    {/* 5. Projects */}
                    <SectionCard title="Projects" icon="project-diagram">
                        {formData.projects.map((proj, index) => (
                            <div key={index} className="repeater-item">
                                <div className="form-grid-2">
                                    <Input label="Project Title" value={proj.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'projects')} />
                                    <Input label="Tech Stack" value={proj.techStack} onChange={(e) => handleArrayChange(index, 'techStack', e.target.value, 'projects')} />
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Input label="Description" value={proj.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'projects')} placeholder="What did you build?" />
                                </div>
                                {index > 0 && <button className="btn-remove" onClick={() => removeItem('projects', index)}>Remove</button>}
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('projects', { title: '', description: '', techStack: '' })}>+ Add Project</button>
                    </SectionCard>

                </div>

                {/* Preview/Action Side (Sticky) */}
                <div className="resume-actions-sidebar">
                    <div className="sticky-box">
                        <h3>Actions</h3>
                        <p className="text-muted">Choose your template and generate instantly.</p>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Select Template</label>
                            <select
                                className="form-input"
                                name="template"
                                value={formData.template}
                                onChange={handleChange}
                                style={{ background: 'rgba(255,255,255,0.1)' }}
                            >
                                <option value="sde" style={{ color: 'black' }}>SDE Format (IIT Standard)</option>
                                <option value="professional" style={{ color: 'black' }}>Professional (Simple)</option>
                                <option value="creative" style={{ color: 'black' }}>Creative</option>
                                <option value="modern" style={{ color: 'black' }}>Modern</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button className="btn-secondary" onClick={fillDummyData} style={{ flex: 1, padding: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>
                                <i className="fas fa-magic"></i> Demo
                            </button>
                            <button className="btn-danger-outline" onClick={clearData} style={{ flex: 1, padding: '0.5rem', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', borderRadius: '6px' }}>
                                <i className="fas fa-trash"></i> Clear
                            </button>
                        </div>

                        <button className="btn-download" onClick={generatePDF} disabled={isGenerating}>
                            {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                            Download PDF Resume
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline CSS for this page specifically */}
            <style jsx>{`
                .resume-form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .section-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 1.5rem;
                    color: var(--primary);
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .form-label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .form-input {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    padding: 0.7rem;
                    color: #fff;
                    font-family: inherit;
                }
                .form-input:focus {
                    border-color: var(--primary);
                    outline: none;
                }
                .repeater-item {
                    border-left: 2px solid var(--primary);
                    padding-left: 1rem;
                    margin-bottom: 1.5rem;
                }
                .btn-add {
                    background: none;
                    border: 1px dashed var(--primary);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                }
                .btn-add:hover {
                    background: rgba(67, 97, 238, 0.1);
                }
                .btn-remove {
                    background: none;
                    border: none;
                    color: #ef4444;
                    font-size: 0.8rem;
                    cursor: pointer;
                    margin-top: 0.5rem;
                }
                .sticky-box {
                    position: sticky;
                    top: 100px;
                    background: rgba(22, 22, 34, 0.9);
                    border: 1px solid var(--primary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 0 20px rgba(67, 97, 238, 0.15);
                }
                .btn-download {
                    width: 100%;
                    background: var(--primary);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: bold;
                    margin-top: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                }
                .btn-download:hover {
                    background: #304ffe;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.4);
                }
            `}</style>
        </div>
    );
};

// Helper Components
const SectionCard = ({ title, icon, children }) => (
    <div className="section-card">
        <div className="section-header">
            <i className={`fas fa-${icon}`}></i>
            <span>{title}</span>
        </div>
        {children}
    </div>
);

const Input = ({ label, name, value, onChange, placeholder }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        <input className="form-input" type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
);

export default ResumeBuilder;
