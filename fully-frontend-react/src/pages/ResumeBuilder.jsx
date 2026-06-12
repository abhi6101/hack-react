import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import AuthPromptModal from '../components/AuthPromptModal';
import API_BASE_URL from '../config';
import '../styles/papers.css';

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
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const confirmClearData = () => {
        setFormData(initialData);
        setShowClearModal(false);
    };

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setShowAuthModal(true);
        }
    }, []);


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

        const { jsPDF } = await import('jspdf');

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 12; // Tighter margin
            let yPos = 15; // Closer to the top edge

            const addSectionHeader = (title) => {
                if(yPos > 280) { doc.addPage(); yPos = 15; }
                yPos += 4;
                doc.setFontSize(10.5);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(31, 78, 121);
                doc.text(title.toUpperCase(), margin, yPos);

                yPos += 1.5;
                doc.setDrawColor(31, 78, 121);
                doc.setLineWidth(0.6);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 3.5;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(9);
            };

            const autoPageBreak = (spaceNeeded) => {
                if (yPos + spaceNeeded > 288) {
                    doc.addPage();
                    yPos = 15;
                }
            };

            // --- HEADER ---
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(31, 78, 121);
            doc.text((formData.name || "YOUR NAME").toUpperCase(), pageWidth / 2, yPos, { align: "center" });

            yPos += 5.5;
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);

            const contacts = [];
            if (formData.email) contacts.push(formData.email);
            if (formData.phone) contacts.push(formData.phone);
            if (formData.linkedin) contacts.push(formData.linkedin.replace('https://', '').replace('www.', ''));
            if (formData.github) contacts.push(formData.github.replace('https://', '').replace('www.', ''));
            if (formData.location) contacts.push(formData.location);

            doc.text(contacts.join("  |  "), pageWidth / 2, yPos, { align: "center" });

            yPos += 3.5;
            doc.setDrawColor(31, 78, 121);
            doc.setLineWidth(1.0);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 4;
            
            doc.setTextColor(0,0,0);

            // --- CAREER OBJECTIVE ---
            if (formData.summary) {
                addSectionHeader("CAREER OBJECTIVE");
                const splitSummary = doc.splitTextToSize(formData.summary, pageWidth - (margin * 2));
                autoPageBreak(splitSummary.length * 3.8);
                doc.text(splitSummary, margin, yPos);
                yPos += (splitSummary.length * 3.8) + 1;
            }

            // --- EDUCATION ---
            if (formData.education && formData.education.length > 0 && formData.education[0].institution) {
                addSectionHeader("EDUCATION");
                formData.education.forEach(edu => {
                    autoPageBreak(10);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.text(edu.degree, margin, yPos);
                    yPos += 4;

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8.5);
                    doc.setTextColor(100, 100, 100);
                    const eduParts = [];
                    if(edu.institution) eduParts.push(edu.institution);
                    if(edu.year) eduParts.push(edu.year);
                    if(edu.score) eduParts.push(`CGPA/Score: ${edu.score}`);
                    
                    doc.text(eduParts.join("  |  "), margin + 1.5, yPos);
                    doc.setTextColor(0,0,0);
                    yPos += 4.5;
                });
            }

            // --- WORK EXPERIENCE ---
            if (formData.experience && formData.experience.length > 0 && formData.experience[0].company) {
                addSectionHeader("EXPERIENCE");
                formData.experience.forEach(exp => {
                    autoPageBreak(15);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.text(exp.role, margin, yPos);
                    yPos += 4;
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8.5);
                    doc.setTextColor(100, 100, 100);
                    const expParts = [];
                    if(exp.company) expParts.push(exp.company);
                    if(exp.duration) expParts.push(exp.duration);
                    
                    doc.text(expParts.join("  |  "), margin + 1.5, yPos);
                    doc.setTextColor(0,0,0);
                    yPos += 4;

                    doc.setFontSize(8.5);
                    if (exp.description) {
                        const bullets = exp.description.split('\n');
                        bullets.forEach(bullet => {
                            if(bullet.trim()) {
                                const splitBullet = doc.splitTextToSize(`• ${bullet.trim()}`, pageWidth - margin - 5 - margin);
                                autoPageBreak(splitBullet.length * 3.8);
                                doc.text(splitBullet, margin + 4, yPos);
                                yPos += (splitBullet.length * 3.8);
                            }
                        });
                        yPos += 1;
                    }
                });
            }

            // --- PROJECTS ---
            if (formData.projects && formData.projects.length > 0 && formData.projects[0].title) {
                addSectionHeader("PROJECTS");
                formData.projects.forEach(proj => {
                    autoPageBreak(15);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.text(proj.title, margin, yPos);
                    yPos += 4;
                    
                    if (proj.techStack) {
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(8);
                        doc.setTextColor(120, 120, 120);
                        doc.text(`Components/Tech: ${proj.techStack}`, margin + 1.5, yPos);
                        yPos += 4;
                    }

                    doc.setTextColor(0,0,0);
                    doc.setFontSize(8.5);
                    if (proj.description) {
                        const bullets = proj.description.split('\n');
                        bullets.forEach(bullet => {
                            if(bullet.trim()) {
                                const splitBullet = doc.splitTextToSize(`• ${bullet.trim()}`, pageWidth - margin - 5 - margin);
                                autoPageBreak(splitBullet.length * 3.8);
                                doc.text(splitBullet, margin + 4, yPos);
                                yPos += (splitBullet.length * 3.8);
                            }
                        });
                        yPos += 1;
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
                        yPos += 4.5;
                    } else {
                        const splitSkills = doc.splitTextToSize(line, pageWidth - (margin * 2));
                        autoPageBreak(splitSkills.length * 3.8);
                        doc.text(splitSkills, margin, yPos);
                        yPos += (splitSkills.length * 3.8);
                    }
                });
                yPos += 1;
            }

            // --- ACHIEVEMENTS & ACTIVITIES ---
            if (formData.achievements) {
                addSectionHeader("ACHIEVEMENTS & ACTIVITIES");
                const bullets = formData.achievements.split('\n');
                bullets.forEach(bullet => {
                    if(bullet.trim()) {
                        const splitBullet = doc.splitTextToSize(`• ${bullet.trim()}`, pageWidth - margin - 4 - margin);
                        autoPageBreak(splitBullet.length * 3.8);
                        doc.text(splitBullet, margin + 3, yPos);
                        yPos += (splitBullet.length * 3.8);
                    }
                });
                yPos += 1;
            }

            // --- KEY STRENGTHS ---
            if (formData.strengths) {
                addSectionHeader("KEY STRENGTHS");
                autoPageBreak(8);
                const strengthArr = formData.strengths.split(',').map(s => s.trim()).filter(s => s);
                doc.text(strengthArr.join('  •  '), pageWidth / 2, yPos, { align: "center" });
                yPos += 5;
            }

            // --- DECLARATION ---
            if(yPos < 265) {
                // Only push declaration if space permits
                addSectionHeader("DECLARATION");
                autoPageBreak(15);
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8.5);
                doc.text("I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.", margin, yPos);
                yPos += 10;
                doc.setFont("helvetica", "bold");
                doc.text((formData.name || "Name").toUpperCase(), pageWidth - margin - 6, yPos, {align: "right"});
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
        <div className="papers-page-wrapper">
            <div className="decorative-blob blob-1"></div>
            <div className="decorative-blob blob-2"></div>
            <div className="container mobile-resume-container" style={{ minHeight: '100vh', padding: '112px 2rem 50px', position: 'relative', zIndex: 2 }}>
            <div className="papers-header-container mobile-resume-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="papers-header-left" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 2.5rem)', display: 'block', overflow: 'visible', maxWidth: '100%', fontWeight: '800', lineHeight: '1.2', textAlign: 'center' }}>ATS-Friendly <span style={{ color: 'var(--primary)' }}>Resume Builder</span></h2>
                    <p className="sr-only">Create a professional, clean resume in seconds.</p>
                </div>

            </div>

            <div className="resume-layout-grid">
                {/* Form Side */}
                <div className="resume-form-container mobile-resume-form" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

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
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Actions</h3>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '0.8rem', borderRadius: '12px' }} onClick={fillDummyData}>
                                <i className="fas fa-magic"></i> Demo
                            </button>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#EF4444' }} onClick={() => setShowClearModal(true)}>
                                <i className="fas fa-trash-alt"></i> Clear
                            </button>
                        </div>
                        
                        <div style={{ background: 'rgba(0, 212, 255, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <p style={{ margin: 0 }}><i className="fas fa-info-circle" style={{ color: 'var(--primary)', marginRight: '5px' }}></i> This tool generates a single-page PDF optimized for Applicant Tracking Systems.</p>
                        </div>

                        <button 
                            className="btn-download" 
                            onClick={generatePDF} 
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> Generating...</>
                            ) : (
                                <><i className="fas fa-file-pdf"></i> Download PDF Resume</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline CSS for this page specifically */}
            <style jsx>{`
                .resume-header-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 1.5rem 2rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                }
                .resume-header-left {
                    flex: 1;
                }
                .resume-header-right {
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                }
                .resume-form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .section-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.05);
                }
                .custom-dropdown {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
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
                    border-radius: 8px;
                    padding: 0.7rem 1rem;
                    color: #fff;
                    font-family: inherit; width: 100%; box-sizing: border-box;
                    transition: all 0.3s ease;
                }
                .form-input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
                }
                .template-select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
                    background-repeat: no-repeat;
                    background-position: right 0.7em top 50%;
                    background-size: 0.65em auto;
                    padding-right: 2rem !important;
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
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    width: 100%;
                    transition: background 0.3s ease;
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
                    top: 100px; /* sticky top-24 */
                    background: rgba(22, 22, 34, 0.75);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    padding: 2.5rem;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.05);
                    backdrop-filter: blur(20px);
                }
                .btn-download {
                    width: 100%;
                    background: linear-gradient(135deg, #00d4ff 0%, #007aff 100%);
                    color: #fff;
                    padding: 1.2rem;
                    border-radius: 12px;
                    border: none;
                    font-weight: bold;
                    margin-top: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    font-size: 1.1rem;
                    box-shadow: 0 10px 25px rgba(0, 212, 255, 0.4);
                    transition: all 0.3s ease;
                }
                .btn-download:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(0, 212, 255, 0.6);
                }
                .resume-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                    align-items: start;
                }
                @media (max-width: 1024px) {
                    .resume-header-container {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }
                    .resume-header-right {
                        justify-content: flex-start;
                    }
                    .resume-layout-grid {
                        grid-template-columns: 1fr;
                    }
                    .sticky-box {
                        position: static;
                        box-shadow: none;
                    }
                }
                @media (max-width: 768px) {
                    .form-grid-2 {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    navigate('/');
                }}
                title="🔒 Login Required"
                subtitle="This service is available on our platform."
                description="Please login or create an account to use the Resume Builder."
            />

            {/* Custom Clear Data Modal */}
            {showClearModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444', fontSize: '2rem' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Clear All Data?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>This action cannot be undone. All your form progress will be lost permanently.</p>
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <button 
                                onClick={confirmClearData}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                Yes, Clear Data
                            </button>
                            <button 
                                onClick={() => setShowClearModal(false)}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                Keep My Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
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
