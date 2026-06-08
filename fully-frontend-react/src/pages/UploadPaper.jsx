import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import '../styles/index.css';

const UploadPaper = () => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiData, setAiData] = useState({ subject: '', semester: '', branch: '', year: '' });
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleAnalyze = async () => {
        if (files.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setLoading(true);
        setError('');
        setStep(2); // Move to scanning step

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/papers/analyze`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setAiData({
                    subject: data.subject || '',
                    semester: data.semester || '',
                    branch: data.branch || '',
                    year: data.year || ''
                });
                setStep(3); // Verification step
            } else {
                setError(data.message || data || "Analysis failed.");
                setStep(1); // Go back
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStep(4); // Submitting step

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('subject', aiData.subject);
        formData.append('semester', aiData.semester);
        formData.append('branch', aiData.branch);
        formData.append('year', aiData.year);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/papers/submit`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setStep(5); // Success step
            } else {
                const text = await response.text();
                setError(text || "Submission failed.");
                setStep(3); // Go back to verification
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '100px 20px 50px', background: 'var(--dark-bg)' }}>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: 'var(--surface-bg)', borderRadius: '16px', padding: '30px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: `${(step/5)*100}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.3s ease' }}></div>
                        {[1,2,3,4,5].map(num => (
                            <div key={num} style={{ 
                                width: '30px', height: '30px', borderRadius: '50%', 
                                background: step >= num ? 'var(--primary)' : 'var(--surface-bg)', 
                                color: step >= num ? '#000' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 2, border: `2px solid ${step >= num ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
                                fontWeight: 'bold'
                            }}>
                                {num}
                            </div>
                        ))}
                    </div>

                    <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Smart Paper Upload</h1>
                    {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                    Take photos of an official university exam paper. Ensure the text is clear and legible.
                                </p>
                                
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ 
                                        border: '2px dashed var(--primary)', borderRadius: '12px', padding: '40px 20px', 
                                        textAlign: 'center', cursor: 'pointer', background: 'rgba(0, 212, 255, 0.05)',
                                        marginBottom: '20px', transition: 'all 0.3s ease'
                                    }}
                                >
                                    <i className="fas fa-camera" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}></i>
                                    <h3>Tap to Capture or Select Files</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Supports multiple images</p>
                                </div>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    capture="environment" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileSelect} 
                                />

                                {files.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p><strong>{files.length} file(s) selected</strong></p>
                                    </div>
                                )}

                                <button onClick={handleAnalyze} className="btn btn-primary" style={{ width: '100%' }} disabled={files.length === 0}>
                                    <i className="fas fa-brain"></i> Analyze with Vision AI
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                                <i className="fas fa-robot fa-spin" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}></i>
                                <h3>AI is analyzing your paper...</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Extracting subject, branch, and verifying quality.</p>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                                <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '15px', borderRadius: '8px', color: '#4ade80', marginBottom: '20px', border: '1px solid rgba(74,222,128,0.3)' }}>
                                    <i className="fas fa-check-circle"></i> Quality Check Passed! Please verify the extracted details below.
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Subject Code/Name</label>
                                        <input type="text" value={aiData.subject} onChange={e => setAiData({...aiData, subject: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Semester (Number)</label>
                                        <input type="number" value={aiData.semester} onChange={e => setAiData({...aiData, semester: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Branch (e.g., IMCA)</label>
                                        <input type="text" value={aiData.branch} onChange={e => setAiData({...aiData, branch: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '25px' }}>
                                        <label>Year (e.g., 2025)</label>
                                        <input type="text" value={aiData.year} onChange={e => setAiData({...aiData, year: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                        <i className="fas fa-paper-plane"></i> Submit Paper
                                    </button>
                                    <button type="button" onClick={() => setStep(1)} className="btn" style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff' }}>
                                        Back
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}></i>
                                <h3>Compiling PDF & Uploading...</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Stitching images and applying watermark.</p>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '30px 0' }}>
                                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem', color: '#fff' }}>
                                    <i className="fas fa-check"></i>
                                </div>
                                <h2>Awesome!</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Your paper was successfully submitted and is now pending Admin approval. You will earn 50 Contribution Points once approved!</p>
                                <button onClick={() => navigate('/papers')} className="btn btn-primary">
                                    Browse Papers
                                </button>
                                <button onClick={() => { setStep(1); setFiles([]); }} className="btn" style={{ marginLeft: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff' }}>
                                    Upload Another
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
};

export default UploadPaper;
