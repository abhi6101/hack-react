import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';
import API_BASE_URL from '../config';
import '../styles/index.css';

const UploadPaper = () => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiData, setAiData] = useState({ subject: '', semester: '', branch: '', year: '' });
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
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

        try {
            const firstImage = files[0];
            
            // Perform OCR locally using Tesseract.js
            const result = await Tesseract.recognize(
                firstImage,
                'eng'
            );

            const text = result.data.text;
            
            // Simple heuristics
            let guessedSubject = "";
            let guessedYear = new Date().getFullYear().toString();
            let guessedBranch = "B.Tech";
            let guessedSemester = "1";

            const yearMatch = text.match(/\b(20[1-3][0-9])\b/);
            if (yearMatch) guessedYear = yearMatch[1];
            
            const semMatch = text.match(/(?:semester|sem)\s*([1-8]|i{1,3}|iv|v|vi|vii|viii)/i);
            if (semMatch) {
                let sem = semMatch[1].toLowerCase();
                if(sem === 'i') guessedSemester = '1';
                else if(sem === 'ii') guessedSemester = '2';
                else if(sem === 'iii') guessedSemester = '3';
                else if(sem === 'iv') guessedSemester = '4';
                else if(sem === 'v') guessedSemester = '5';
                else if(sem === 'vi') guessedSemester = '6';
                else if(sem === 'vii') guessedSemester = '7';
                else if(sem === 'viii') guessedSemester = '8';
                else guessedSemester = sem;
            }

            setAiData({
                subject: guessedSubject,
                semester: guessedSemester,
                branch: guessedBranch,
                year: guessedYear
            });
            
            setStep(3); // Verification step
        } catch (err) {
            console.error(err);
            setError("Local OCR Scan failed. Please enter details manually.");
            setStep(3); // Go to verification anyway so they can type it in
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
                                
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                    <div 
                                        onClick={() => cameraInputRef.current.click()}
                                        style={{ 
                                            flex: 1, border: '2px dashed var(--primary)', borderRadius: '12px', padding: '25px 10px', 
                                            textAlign: 'center', cursor: 'pointer', background: 'rgba(0, 212, 255, 0.05)', transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className="fas fa-camera" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}></i>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Take Photo</h4>
                                    </div>
                                    <div 
                                        onClick={() => fileInputRef.current.click()}
                                        style={{ 
                                            flex: 1, border: '2px dashed #10B981', borderRadius: '12px', padding: '25px 10px', 
                                            textAlign: 'center', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.05)', transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className="fas fa-images" style={{ fontSize: '2rem', color: '#10B981', marginBottom: '10px' }}></i>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Gallery</h4>
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    ref={cameraInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileSelect} 
                                />
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileSelect} 
                                />

                                {files.length > 0 && (
                                    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {files.map((file, index) => (
                                            <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt={`preview ${index}`} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFiles(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    style={{ 
                                                        position: 'absolute', top: '-5px', right: '-5px', 
                                                        background: 'red', color: 'white', border: 'none', 
                                                        borderRadius: '50%', width: '20px', height: '20px', 
                                                        fontSize: '12px', cursor: 'pointer', display: 'flex', 
                                                        alignItems: 'center', justifyContent: 'center', zIndex: 10 
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button onClick={handleAnalyze} className="btn btn-primary" style={{ width: '100%' }} disabled={files.length === 0}>
                                    <i className="fas fa-search"></i> Scan First Page
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                                <i className="fas fa-search fa-bounce" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}></i>
                                <h3>Scanning Document Locally...</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Extracting text on your device. No data is sent to AI servers.</p>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                                <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '15px', borderRadius: '8px', color: '#4ade80', marginBottom: '20px', border: '1px solid rgba(74,222,128,0.3)' }}>
                                    <i className="fas fa-check-circle"></i> OCR Analysis Complete! Please verify the extracted details below.
                                </div>

                                {files.length > 0 && (
                                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Reference Image</p>
                                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', justifyContent: files.length === 1 ? 'center' : 'flex-start' }}>
                                            {files.map((file, idx) => (
                                                <img 
                                                    key={idx}
                                                    src={URL.createObjectURL(file)} 
                                                    alt={`Scanned paper ${idx + 1}`} 
                                                    style={{ height: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', objectFit: 'contain', background: '#000' }} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
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
