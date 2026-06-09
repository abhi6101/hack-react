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
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const [aiData, setAiData] = useState({ subject: '', semester: '', branch: '', year: new Date().getFullYear().toString(), month: currentMonth, university: 'RGPV' });
    const [departments, setDepartments] = useState([]);
    const [existingSubjects, setExistingSubjects] = useState([]);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
        } else {
            fetch(`${API_BASE_URL}/public/departments`)
                .then(r => r.json())
                .then(d => setDepartments(d))
                .catch(e => console.error('Failed to fetch departments', e));

            // Fetch user profile to pre-fill branch and semester
            fetch(`${API_BASE_URL}/student-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : {})
                .then(data => {
                    setAiData(prev => ({
                        ...prev,
                        branch: data.branch || prev.branch,
                        semester: data.semester || prev.semester
                    }));
                })
                .catch(e => console.error('Failed to fetch user profile', e));
        }
    }, [navigate]);

    React.useEffect(() => {
        if (aiData.branch && aiData.semester) {
            const token = localStorage.getItem('authToken');
            fetch(`${API_BASE_URL}/papers?branch=${aiData.branch}&semester=${aiData.semester}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
                .then(r => r.ok ? r.json() : [])
                .then(data => {
                    if (Array.isArray(data)) {
                        const uniqueSubjects = [...new Set(data.map(p => p.subject))].sort();
                        setExistingSubjects(uniqueSubjects);
                    }
                })
                .catch(e => console.error('Failed to fetch existing subjects', e));
        } else {
            setExistingSubjects([]);
        }
    }, [aiData.branch, aiData.semester]);

    // Scroll to top whenever step changes
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleNext = () => {
        if (files.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setError('');
        setStep(2); // Go directly to verification/details form
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStep(3); // Submitting step

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('subject', aiData.subject);
        formData.append('semester', aiData.semester);
        formData.append('branch', aiData.branch);
        formData.append('university', aiData.university);
        formData.append('year', `${aiData.month} ${aiData.year}`.trim());

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/papers/submit`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setStep(4); // Success step
            } else {
                const text = await response.text();
                setError(text || "Submission failed.");
                setStep(2); // Go back to form
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="papers-page-wrapper">
            <div className="decorative-blob blob-1"></div>
            <div className="decorative-blob blob-2"></div>
            <div style={{ minHeight: '100vh', padding: '80px 15px 30px', position: 'relative', zIndex: 2 }}>
                <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: 'var(--surface-bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.3s ease' }}></div>
                        {[1, 2, 3, 4].map(num => (
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

                    <h1 style={{ textAlign: 'center', marginBottom: '15px', fontSize: 'clamp(1.5rem, 5vw, 2rem)', lineHeight: '1.2' }}>Smart Paper Upload</h1>
                    {error && <div className="alert alert-error" style={{ marginBottom: '15px' }}>{error}</div>}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.9rem' }}>
                                    Take photos of an official university exam paper. Ensure the text is clear and legible.
                                </p>
                                
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div 
                                        onClick={() => cameraInputRef.current.click()}
                                        style={{ 
                                            flex: 1, border: '2px dashed var(--primary)', borderRadius: '12px', padding: '15px 10px', 
                                            textAlign: 'center', cursor: 'pointer', background: 'rgba(0, 212, 255, 0.05)', transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className="fas fa-camera" style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '8px' }}></i>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Take Photo</h4>
                                    </div>
                                    <div 
                                        onClick={() => fileInputRef.current.click()}
                                        style={{ 
                                            flex: 1, border: '2px dashed #10B981', borderRadius: '12px', padding: '15px 10px', 
                                            textAlign: 'center', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.05)', transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className="fas fa-images" style={{ fontSize: '1.8rem', color: '#10B981', marginBottom: '8px' }}></i>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Gallery</h4>
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

                                <button onClick={handleNext} className="btn btn-primary" style={{ width: '100%' }} disabled={files.length === 0}>
                                    Next <i className="fas fa-arrow-right"></i>
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>

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
                                        <label>University</label>
                                        <input type="text" value={aiData.university} onChange={e => setAiData({...aiData, university: e.target.value})} required placeholder="E.g. RGPV, DAVV" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Branch / Department</label>
                                        <select value={aiData.branch} onChange={e => setAiData({...aiData, branch: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', WebkitAppearance: 'none', appearance: 'none' }}>
                                            <option value="">Select Branch</option>
                                            {departments.length > 0 ? departments.map(d => (
                                                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                                            )) : <option value="IMCA">IMCA</option>}
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Semester</label>
                                        <select value={aiData.semester} onChange={e => setAiData({...aiData, semester: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', WebkitAppearance: 'none', appearance: 'none' }}>
                                            <option value="">Select Semester</option>
                                            {[1,2,3,4,5,6,7,8,9,10].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Subject Code/Name</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input type="text" value={aiData.subject} onChange={e => setAiData({...aiData, subject: e.target.value})} required placeholder="Type subject or select below" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                            {existingSubjects.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Previously uploaded subjects:</div>
                                                    {existingSubjects.map(sub => (
                                                        <div 
                                                            key={sub}
                                                            onClick={() => setAiData({...aiData, subject: sub})}
                                                            style={{ padding: '6px 12px', background: aiData.subject === sub ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: aiData.subject === sub ? '#000' : '#fff', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                        >
                                                            {sub}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '15px' }}>
                                        <label>Exam Month (Session)</label>
                                        <select value={aiData.month} onChange={e => setAiData({...aiData, month: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', WebkitAppearance: 'none', appearance: 'none' }}>
                                            <option value="">Select Month</option>
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'May-June', 'Nov-Dec'].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '25px' }}>
                                        <label>Year (e.g., 2025)</label>
                                        <input type="text" value={aiData.year} onChange={e => setAiData({...aiData, year: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: '25px' }}>
                                        <label>Generated File Name</label>
                                        <input 
                                            type="text" 
                                            value={`${aiData.subject || 'Subject'}_${aiData.branch || 'Branch'}_Sem${aiData.semester || 'X'}_${aiData.month || 'Month'}_${aiData.year || 'Year'}.pdf`.replace(/ /g, '_')} 
                                            readOnly 
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'not-allowed', outline: 'none' }} 
                                        />
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

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}></i>
                                <h3>Uploading & Processing...</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Stitching images and applying watermark.</p>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '30px 0' }}>
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
        </div>
    );
};

export default UploadPaper;
