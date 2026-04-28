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
        location: '',
        linkedin: '',
        github: '',
        summary: '',
        education: [{ institution: '', degree: '', year: '', score: '' }],
        experience: [{ company: '', role: '', duration: '', description: '' }],
        projects: [{ title: '', description: '', techStack: '' }],
        skills: '', // Comma separated
        achievements: '',
        strengths: '',
        template: 'sde', // Default to SDE format
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const initialData = {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        summary: '',
        education: [{ institution: '', degree: '', year: '', score: '' }],
        experience: [{ company: '', role: '', duration: '', description: '' }],
        projects: [{ title: '', description: '', techStack: '' }],
        skills: '',
        achievements: '',
        strengths: '',
        template: 'sde',
    };

    const dummyData = {
        name: 'ALEX JOHNSON',
        email: 'alex.johnson@example.com',
        phone: '+1 555-0123-456',
        location: 'San Francisco, CA, USA',
        linkedin: 'linkedin.com/in/alexj',
        github: 'github.com/alexcodex',
        summary: 'Highly motivated Full Stack Developer with 2 years of experience building scalable web applications. Proficient in React, Node.js, and Cloud technologies. Eager to solve complex software engineering challenges and deliver high-quality code in a fast-paced agile environment.',
        education: [
            { institution: 'Tech University, California', degree: 'B.S. - Computer Science', year: '2020 - 2024', score: '3.8 / 4.0 GPA' },
            { institution: 'City High School', degree: 'High School Diploma (Science)', year: '2020', score: '95%' }
        ],
        experience: [
            { company: 'Innovate Tech', role: 'Frontend Developer', duration: 'June 2024 - Present', description: 'Developed responsive UI components using React and Redux architectures.\nImproved site performance by 30% through comprehensive code splitting and lazy loading techniques.' },
            { company: 'Startup Hub', role: 'Backend Intern', duration: 'Jan 2024 - May 2024', description: 'Assisted in building scalable RESTful APIs using Node.js and Express.\nCollaborated directly with the UX team to implement precise pixel-perfect layouts.' }
        ],
        projects: [
            { title: 'E-Commerce Platform', techStack: 'MERN Stack, Redux, Stripe', description: 'Built a full-featured e-commerce site with user authentication, product search, and secure payment processing.\nImplemented caching and database indexing to handle over 1,000 concurrent active users seamlessly.' },
            { title: 'Task Manager Collaborative App', techStack: 'React, Firebase, TailwindCSS', description: 'Engineered a real-time task management application featuring drag-and-drop workflow columns.\nIntegrated instant websocket team collaboration features reducing communication latency across tasks.' }
        ],
        skills: 'Frontend: React.js, JavaScript, HTML5, CSS3, TailwindCSS\nBackend: Node.js, Express, Java, Spring Boot, Python\nDatabases: MySQL, PostgreSQL, MongoDB, Redis\nTools & Deployments: Git, Docker, AWS (EC2/S3), CI/CD Actions',
        achievements: 'Awarded 1st place out of 50 teams at the Regional University Hackathon 2023.\nMaintained Dean\'s List Scholar honors for 6 consecutive academic semesters.\nPublished a technical article on state management reaching over 10,000 individual reads on Dev.to.',
        strengths: 'Analytical Problem Solver, Self-Motivated, Team Collaboration, Agile Adaptable, Effective Communicator',
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

            const addSectionHeader = (title) => {
                if(yPos > 270) { doc.addPage(); yPos = 20; }
                yPos += 5;
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(31, 78, 121);
                doc.text(title.toUpperCase(), margin, yPos);

                yPos += 2;
                doc.setDrawColor(31, 78, 121);
                doc.setLineWidth(0.8);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 5;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(9.5);
            };

            const autoPageBreak = (spaceNeeded) => {
                if (yPos + spaceNeeded > 285) {
                    doc.addPage();
                    yPos = 20;
                }
            };

            // --- HEADER ---
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(31, 78, 121);
            doc.text((formData.name || "YOUR NAME").toUpperCase(), pageWidth / 2, yPos, { align: "center" });

            yPos += 6;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);

            const contacts = [];
            if (formData.email) contacts.push(formData.email);
            if (formData.phone) contacts.push(formData.phone);
            if (formData.linkedin) contacts.push(formData.linkedin.replace('https://', '').replace('www.', ''));
            if (formData.github) contacts.push(formData.github.replace('https://', '').replace('www.', ''));
            if (formData.location) contacts.push(formData.location);

            doc.text(contacts.join("  |  "), pageWidth / 2, yPos, { align: "center" });

            yPos += 4;
            doc.setDrawColor(31, 78, 121);
            doc.setLineWidth(1.2);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;
            
            doc.setTextColor(0,0,0);

            // --- CAREER OBJECTIVE ---
            if (formData.summary) {
                addSectionHeader("CAREER OBJECTIVE");
                const splitSummary = doc.splitTextToSize(formData.summary, pageWidth - (margin * 2));
                autoPageBreak(splitSummary.length * 4.5);
                doc.text(splitSummary, margin, yPos);
                yPos += (splitSummary.length * 4.5) + 2;
            }

            // --- EDUCATION ---
            if (formData.education && formData.education.length > 0 && formData.education[0].institution) {
                addSectionHeader("EDUCATION");
                formData.education.forEach(edu => {
                    autoPageBreak(12);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9.5);
                    doc.text(edu.degree, margin, yPos);
                    yPos += 4.5;

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setTextColor(100, 100, 100);
                    const eduParts = [];
                    if(edu.institution) eduParts.push(edu.institution);
                    if(edu.year) eduParts.push(edu.year);
                    if(edu.score) eduParts.push(`CGPA/Score: ${edu.score}`);
                    
                    doc.text(eduParts.join("  |  "), margin + 2, yPos);
                    doc.setTextColor(0,0,0);
                    yPos += 5.5;
                });
            }

            // --- WORK EXPERIENCE ---
            if (formData.experience && formData.experience.length > 0 && formData.experience[0].company) {
                addSectionHeader("EXPERIENCE");
                formData.experience.forEach(exp => {
                    autoPageBreak(20);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9.5);
                    doc.text(exp.role, margin, yPos);
                    yPos += 4.5;
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setTextColor(100, 100, 100);
                    const expParts = [];
                    if(exp.company) expParts.push(exp.company);
                    if(exp.duration) expParts.push(exp.duration);
                    
                    doc.text(expParts.join("  |  "), margin + 2, yPos);
                    doc.setTextColor(0,0,0);
                    yPos += 4.5;

                    doc.setFontSize(9);
                    if (exp.description) {
                        const bullets = exp.description.split('\n');
                        bullets.forEach(bullet => {
                            if(bullet.trim()) {
                                const splitBullet = doc.splitTextToSize(`• ${bullet.trim()}`, pageWidth - margin - 6 - margin);
                                autoPageBreak(splitBullet.length * 4.5);
                                doc.text(splitBullet, margin + 4, yPos);
                                yPos += (splitBullet.length * 4.5);
                            }
                        });
                        yPos += 2;
                    }
                });
            }

            // --- PROJECTS ---
            if (formData.projects && formData.projects.length > 0 && formData.projects[0].title) {
                addSectionHeader("PROJECTS");
                formData.projects.forEach(proj => {
                    autoPageBreak(20);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9.5);
                    doc.text(proj.title, margin, yPos);
                    yPos += 4.5;
                    
                    if (proj.techStack) {
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(8.5);
                        doc.setTextColor(120, 120, 120);
                        doc.text(`Components/Tech: ${proj.techStack}`, margin + 2, yPos);
                        yPos += 4.5;
                    }

                    doc.setTextColor(0,0,0);
                    doc.setFontSize(9);
                    if (proj.description) {
                        const bullets = proj.description.split('\n');
                        bullets.forEach(bullet => {
                            if(bullet.trim()) {
                                const splitBullet = doc.splitTextToSize(`• ${bullet.trim()}`, pageWidth - margin - 6 - margin);
                                autoPageBreak(splitBullet.length * 4.5);
                                doc.text(splitBullet, margin + 4, yPos);
                                yPos += (splitBullet.length * 4.5);
                            }
                        });
                        yPos += 2;
                    }
                });
            }

            // --- SKILLS ---
            if (formData.skills) {
                addSectionHeader("TECHNICAL SKILLS");
                const lines = formData.skills.split('\n');
                lines.forEach(line => {
                    if (line.includes(':')) {
                        const [boldPart, rest] = line.split(':');
                        doc.setFont("helvetica", "bold");
                        doc.text(boldPart + ":", margin, yPos);
                        doc.setFont("helvetica", "normal");
                        doc.text(" " + rest, margin + doc.getTextWidth(boldPart + ":"), yPos);
                        yPos += 5;
                    } else {
                        const splitSkills = doc.splitTextToSize(line, pageWidth - (margin * 2));
                        autoPageBreak(splitSkills.length * 4.5);
                        doc.text(splitSkills, margin, yPos);
                        yPos += (splitSkills.length * 4.5) + 0.5;
                    }
                });
                yPos += 2;
            }

            // --- ACHIEVEMENTS & ACTIVITIES ---
            if (formData.achievements) {
                addSectionHeader("ACHIEVEMENTS & ACTIVITIES");
                const bullets = formData.achievements.split('\n');
                bullets.forEach(bullet => {
                    if(bullet.trim()) {
                        const splitBullet = doc.splitTextToSize(`• ${bullet.trim()}`, pageWidth - margin - 4 - margin);
                        autoPageBreak(splitBullet.length * 4.5);
                        doc.text(splitBullet, margin + 4, yPos);
                        yPos += (splitBullet.length * 4.5);
                    }
                });
                yPos += 2;
            }

            // --- KEY STRENGTHS ---
            if (formData.strengths) {
                addSectionHeader("KEY STRENGTHS");
                autoPageBreak(10);
                const strengthArr = formData.strengths.split(',').map(s => s.trim()).filter(s => s);
                doc.text(strengthArr.join('  •  '), pageWidth / 2, yPos, { align: "center" });
                yPos += 8;
            }

            // --- DECLARATION ---
            addSectionHeader("DECLARATION");
            autoPageBreak(25);
            doc.setFont("helvetica", "italic");
            doc.text("I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.", margin, yPos);
            yPos += 15;
            doc.setFont("helvetica", "bold");
            doc.text((formData.name || "Name").toUpperCase(), pageWidth - margin - 10, yPos, {align: "right"});

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
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="page-header">
                <h1>ATS-Friendly Resume Builder</h1>
                <p>Create a professional, clean resume in seconds.</p>
            </div>

            <div className="resume-layout-grid">
                {/* Form Side */}
                <div className="resume-form-container">

                    {/* 1. Personal Info */}
                    <SectionCard title="Personal Details" icon="user">
                        <div className="form-grid-2">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            <Input label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                            <Input label="Location (City, State)" name="location" value={formData.location} onChange={handleChange} placeholder="Indore, India" />
                            <Input label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/john" />
                            <Input label="GitHub/Portfolio" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/john" />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <label className="form-label">Career Objective / Summary</label>
                            <textarea
                                className="form-input"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Motivated Engineering student seeking an internship..."
                            ></textarea>
                        </div>
                    </SectionCard>

                    {/* 2. Education */}
                    <SectionCard title="Education" icon="graduation-cap">
                        {formData.education.map((edu, index) => (
                            <div key={index} className="repeater-item">
                                <div className="form-grid-2">
                                    <Input label="Institution" value={edu.institution} onChange={(e) => handleArrayChange(index, 'institution', e.target.value, 'education')} placeholder="IES Academy, Indore" />
                                    <Input label="Degree / Course" value={edu.degree} onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')} placeholder="B.Tech - Computer Science" />
                                    <Input label="Year" value={edu.year} onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')} placeholder="2024 - 2028" />
                                    <Input label="Score/CGPA" value={edu.score} onChange={(e) => handleArrayChange(index, 'score', e.target.value, 'education')} placeholder="8.6 / 10" />
                                </div>
                                {index > 0 && <button className="btn-remove" onClick={() => removeItem('education', index)}>Remove</button>}
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('education', { institution: '', degree: '', year: '', score: '' })}>+ Add Education</button>
                    </SectionCard>

                    {/* 3. Skills */}
                    <SectionCard title="Technical Skills" icon="code">
                        <label className="form-label">Skills (Separate categories by newline. Use 'Category: Skills' format)</label>
                        <textarea
                            className="form-input"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Electrical: Circuit Analysis, Transformers&#10;Software: Java, React, SQL"
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
                                    <label className="form-label">Description (New lines become bullet points)</label>
                                    <textarea className="form-input" value={proj.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'projects')} placeholder="Designed and implemented...&#10;Applied load distribution..." rows="2" />
                                </div>
                                {index > 0 && <button className="btn-remove" onClick={() => removeItem('projects', index)}>Remove</button>}
                            </div>
                        ))}
                        <button className="btn-add" onClick={() => addItem('projects', { title: '', description: '', techStack: '' })}>+ Add Project</button>
                    </SectionCard>

                    {/* 6. Achievements */}
                    <SectionCard title="Achievements & Activities" icon="trophy">
                        <label className="form-label">Achievements (New lines become bullet points)</label>
                        <textarea
                            className="form-input"
                            name="achievements"
                            value={formData.achievements}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Scored 86.8% in Class 12 Science...&#10;Maintaining CGPA 8.6/10..."
                        ></textarea>
                    </SectionCard>

                    {/* 7. Key Strengths */}
                    <SectionCard title="Key Strengths" icon="star">
                        <label className="form-label">Key Strengths (Comma separated)</label>
                        <textarea
                            className="form-input"
                            name="strengths"
                            value={formData.strengths}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Quick Learner, Team Player, Adaptable..."
                        ></textarea>
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
                .resume-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                }
                @media (max-width: 768px) {
                    .resume-layout-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .form-grid-2 {
                        grid-template-columns: 1fr !important;
                    }
                    .sticky-box {
                        position: static;
                    }
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
