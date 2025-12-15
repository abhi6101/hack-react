import React, { useState } from 'react';
import '../styles/resume-analyzer.css';
import { Link } from 'react-router-dom';

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError('');
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/resume/analyze', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze resume. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="resume-analyzer-page">
            <div className="resume-analyzer-container">
                <div className="analyzer-header">
                    <h1><i className="fas fa-magic"></i> AI Resume Analyzer</h1>
                    <p>Upload your resume to get instant AI-powered feedback, scoring, and job recommendations.</p>
                </div>

                {!result && !analyzing && (
                    <div className="upload-section" onClick={() => document.getElementById('resume-upload').click()}>
                        <i className="fas fa-cloud-upload-alt upload-icon"></i>
                        <h3>
                            {file ? file.name : "Drag & Drop your Resume (PDF)"}
                        </h3>
                        <p className="text-muted">or click to browse</p>
                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf"
                            hidden
                            onChange={handleFileChange}
                        />
                        {file && (
                            <button
                                className="btn btn-primary mt-4"
                                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                                style={{ marginTop: '1.5rem', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                            >
                                Analyze Now <i className="fas fa-bolt"></i>
                            </button>
                        )}
                        {error && <div className="alert alert-danger mt-3" style={{ marginTop: '1rem', color: '#f87171' }}>{error}</div>}
                    </div>
                )}

                {analyzing && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <h2>Analyzing your profile...</h2>
                        <p className="text-muted">Our AI is reading your skills, experience, and formatting.</p>
                    </div>
                )}

                {result && (
                    <div className="analysis-dashboard">
                        {/* Left Column: Score */}
                        <div className="score-card">
                            <h3>Resume Score</h3>
                            <div className="score-circle" style={{ '--score': `${result.score}%` }}>
                                <span className="score-value">{result.score}</span>
                            </div>
                            <div className={`badge ${result.score >= 70 ? 'badge-success' : 'badge-warning'}`}>
                                {result.score >= 70 ? 'Excellent' : 'Needs Improvement'}
                            </div>
                            <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
                                Based on keyword density, formatting, and completeness.
                            </p>
                            <button className="btn btn-outline" onClick={() => setResult(null)} style={{ marginTop: 'auto' }}>
                                Analyze Another
                            </button>
                        </div>

                        {/* Right Column: Feedback */}
                        <div className="feedback-section">
                            <div className="feedback-card">
                                <h3><i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Strong Points</h3>
                                <div className="tag-cloud">
                                    {result.strengths.map((s, i) => (
                                        <span key={i} className="tag success">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="feedback-card">
                                <h3><i className="fas fa-exclamation-triangle" style={{ color: '#f87171' }}></i> Missing Keywords</h3>
                                <div className="tag-cloud">
                                    {result.missingKeywords.map((k, i) => (
                                        <span key={i} className="tag danger">{k}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="feedback-card">
                                <h3><i className="fas fa-briefcase" style={{ color: '#38bdf8' }}></i> Recommended Role</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{result.recommendedRole}</span>
                                    <Link to="/jobs" className="btn btn-sm btn-primary">Find Jobs</Link>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    Your profile strongly matches <b>{result.recommendedRole}</b> positions.
                                </p>
                            </div>

                            <div className="feedback-card">
                                <h3><i className="fas fa-robot"></i> AI Summary</h3>
                                <p style={{ lineHeight: '1.6', color: '#e2e8f0' }}>{result.summary}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
