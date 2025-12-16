import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ResumeBuilder = () => {
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
    });

    const [isGenerating, setIsGenerating] = useState(false);

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

    const generatePDF = () => {
        setIsGenerating(true);
        const doc = new jsPDF();

        // Colors & Fonts
        const primaryColor = [67, 97, 238]; // Your theme blue
        const darkColor = [22, 22, 34];

        doc.setFont("helvetica");

        // --- Header ---
        doc.setFillColor(...darkColor);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(formData.name.toUpperCase(), 105, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const contactLine = `${formData.email} | ${formData.phone} | ${formData.linkedin} | ${formData.github}`;
        doc.text(contactLine, 105, 25, { align: 'center' });

        let yPos = 50;

        // --- Summary ---
        if (formData.summary) {
            doc.setTextColor(...primaryColor);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("PROFESSIONAL SUMMARY", 14, yPos);
            doc.line(14, yPos + 1, 196, yPos + 1); // Underline
            yPos += 7;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const summaryLines = doc.splitTextToSize(formData.summary, 180);
            doc.text(summaryLines, 14, yPos);
            yPos += (summaryLines.length * 5) + 5;
        }

        // --- Education ---
        if (formData.education.length > 0) {
            doc.setTextColor(...primaryColor);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("EDUCATION", 14, yPos);
            doc.line(14, yPos + 1, 196, yPos + 1);
            yPos += 5;

            const eduData = formData.education.map(edu => [
                edu.institution,
                edu.degree,
                edu.year,
                edu.score
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Institution', 'Degree', 'Year', 'Score/CGPA']],
                body: eduData,
                theme: 'grid',
                headStyles: { fillColor: primaryColor, textColor: 255 },
                styles: { fontSize: 10, cellPadding: 2 },
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }

        // --- Skills ---
        if (formData.skills) {
            doc.setTextColor(...primaryColor);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("TECHNICAL SKILLS", 14, yPos);
            doc.line(14, yPos + 1, 196, yPos + 1);
            yPos += 7;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const skillsLines = doc.splitTextToSize(formData.skills, 180);
            doc.text(skillsLines, 14, yPos);
            yPos += (skillsLines.length * 5) + 5;
        }

        // --- Experience ---
        if (formData.experience.length > 0 && formData.experience[0].company) {
            doc.setTextColor(...primaryColor);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("WORK EXPERIENCE", 14, yPos);
            doc.line(14, yPos + 1, 196, yPos + 1);
            yPos += 7;

            formData.experience.forEach(exp => {
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(`${exp.role} at ${exp.company}`, 14, yPos);

                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.text(exp.duration, 196, yPos, { align: 'right' });
                yPos += 5;

                doc.setFont("helvetica", "normal");
                const descLines = doc.splitTextToSize(exp.description, 180);
                doc.text(descLines, 14, yPos);
                yPos += (descLines.length * 5) + 5;
            });
            yPos += 5;
        }

        // --- Projects ---
        if (formData.projects.length > 0 && formData.projects[0].title) {
            doc.setTextColor(...primaryColor);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("PROJECTS", 14, yPos);
            doc.line(14, yPos + 1, 196, yPos + 1);
            yPos += 7;

            formData.projects.forEach(proj => {
                // Check page break
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(proj.title, 14, yPos);

                if (proj.techStack) {
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(100);
                    doc.text(`Stack: ${proj.techStack}`, 196, yPos, { align: 'right' });
                }
                yPos += 5;

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                const descLines = doc.splitTextToSize(proj.description, 180);
                doc.text(descLines, 14, yPos);
                yPos += (descLines.length * 5) + 5;
            });
        }

        doc.save(`${formData.name.replace(/\s+/g, '_')}_Resume.pdf`);
        setIsGenerating(false);
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
                        <p className="text-muted">Fill out the form and generate your resume instantly.</p>
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
