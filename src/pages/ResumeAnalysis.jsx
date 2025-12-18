import React, { useState } from 'react';
import API_BASE_URL from '../config';
import '../styles/dashboard.css'; // Reuse dashboard styles for glass effect

const ResumeAnalysis = () => {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (uploadedFile) => {
        if (uploadedFile.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }
        setFile(uploadedFile);
        setResult(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setAnalyzing(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            // Mocking the AI response for now until backend is ready
            // const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
            //     method: 'POST',
            //     body: formData
            // });
            // const data = await response.json();

            // SImulate Delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock Response
            const mockData = {
                score: Math.floor(Math.random() * (95 - 60) + 60),
                summary: "Your resume is strong in technical skills but lacks quantitative impact in project descriptions.",
                keywords: ["Java", "Spring Boot", "React", "SQL"],
                missingDetails: ["GitHub Link not clickable", "Leadership experience missing"],
                formatting: "Good utilization of white space. Font size is readable."
            };

            setResult(mockData);

        } catch (error) {
            alert("Analysis failed. Please try again.");
            console.error(error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="dashboard-layout" style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
                        AI Resume Analyzer
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Get instant feedback on your resume using our advanced AI engine. Improve your ATS score and get hired faster.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Upload Section */}
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}><i className="fas fa-cloud-upload-alt"></i> Upload Resume</h2>

                        <div
                            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{
                                border: '2px dashed rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: '3rem',
                                transition: 'all 0.3s ease',
                                background: dragActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            <input
                                type="file"
                                id="resume-upload"
                                accept=".pdf"
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="resume-upload" style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}>
                                {file ? (
                                    <div className="file-preview">
                                        <i className="fas fa-file-pdf" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{file.name}</p>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <>
                                        <i className="fas fa-file-import" style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & drop your resume (PDF)</p>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>or click to browse</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || analyzing}
                            className="btn btn-primary"
                            style={{
                                marginTop: '2rem',
                                width: '100%',
                                fontSize: '1.1rem',
                                padding: '1rem',
                                opacity: (!file || analyzing) ? 0.6 : 1
                            }}
                        >
                            {analyzing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Analyzing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic"></i> Analyze Performance
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0 }}><i className="fas fa-chart-pie"></i> Analysis Result</h2>
                                <div style={{
                                    background: result.score >= 80 ? 'rgba(34, 197, 94, 0.2)' : result.score >= 60 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#eab308' : '#ef4444',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '50px',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    Score: {result.score}/100
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Summary</h3>
                                <p style={{ lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                    {result.summary}
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Detected Keywords</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {result.keywords.map((k, i) => (
                                        <span key={i} className="skill-tag" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>{k}</span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Improvements Needed</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {result.missingDetails.map((item, i) => (
                                        <li key={i} style={{
                                            marginBottom: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            padding: '0.8rem',
                                            borderRadius: '6px',
                                            color: '#fca5a5'
                                        }}>
                                            <i className="fas fa-exclamation-circle"></i> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalysis;
