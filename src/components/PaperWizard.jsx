import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import { useToast } from '../components/CustomToast';

const PaperWizard = ({ onUploadSuccess }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'bulk'

    // Form State
    const [formData, setFormData] = useState({
        branch: '',
        semester: '',
        subject: '',
        year: new Date().getFullYear(),
        examType: 'End-Sem',
        university: 'DAVV',
        files: []
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDepartments(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleUpload = async () => {
        setIsUploading(true);
        setUploadProgress(10);

        try {
            if (uploadMode === 'manual') {
                const data = new FormData();
                data.append('branch', formData.branch);
                data.append('semester', formData.semester);
                data.append('subject', formData.subject);
                data.append('year', formData.year);
                data.append('category', formData.examType);
                data.append('university', formData.university);
                data.append('title', formData.subject);

                formData.files.forEach(file => data.append('files', file));

                const res = await fetch(`${API_BASE_URL}/papers/upload-multiple`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: data
                });

                if (res.ok) {
                    showToast({ message: 'Papers uploaded successfully!', type: 'success' });
                    onUploadSuccess?.();
                    resetForm();
                } else {
                    throw new Error(await res.text());
                }
            } else {
                // ZIP Bulk Upload
                const data = new FormData();
                data.append('file', formData.files[0]);
                data.append('university', formData.university);
                data.append('year', formData.year);

                const res = await fetch(`${API_BASE_URL}/papers/bulk-upload-zip`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: data
                });

                if (res.ok) {
                    showToast({ message: 'ZIP upload processed successfully!', type: 'success' });
                    onUploadSuccess?.();
                    resetForm();
                } else {
                    throw new Error(await res.text());
                }
            }
        } catch (e) {
            showToast({ message: `Upload failed: ${e.message}`, type: 'error' });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setFormData({
            branch: '', semester: '', subject: '',
            year: new Date().getFullYear(),
            examType: 'End-Sem', university: 'DAVV',
            files: []
        });
        setStep(1);
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    const renderStepIndicators = () => (
        <div className="wizard-steps" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: step >= i ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    color: step >= i ? '#000' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', transition: 'all 0.3s'
                }}>{i}</div>
            ))}
        </div>
    );

    return (
        <div className="paper-wizard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="surface-glow" style={{ padding: '2rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2><i className="fas fa-magic"></i> Paper Upload Wizard</h2>
                    <div className="mode-toggle" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px' }}>
                        <button
                            className={`btn-sm ${uploadMode === 'manual' ? 'active' : ''}`}
                            onClick={() => { setUploadMode('manual'); setStep(1); }}
                            style={{ background: uploadMode === 'manual' ? 'var(--primary)' : 'transparent', border: 'none', color: uploadMode === 'manual' ? '#000' : '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >Manual</button>
                        <button
                            className={`btn-sm ${uploadMode === 'bulk' ? 'active' : ''}`}
                            onClick={() => { setUploadMode('bulk'); setStep(1); }}
                            style={{ background: uploadMode === 'bulk' ? 'var(--primary)' : 'transparent', border: 'none', color: uploadMode === 'bulk' ? '#000' : '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >Bulk (ZIP)</button>
                    </div>
                </div>

                {renderStepIndicators()}

                <AnimatePresence mode="wait">
                    {uploadMode === 'manual' ? (
                        <motion.div key={`step-${step}`} variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                            {step === 1 && (
                                <div className="step-content">
                                    <h3>Step 1: Choose Branch</h3>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Select Branch</label>
                                        <select className="form-control" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                            <option value="">-- Choose Branch --</option>
                                            {departments.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                                        </select>
                                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Branch not found? It will be created automatically if you type a new code in Subject name (standardized later).</p>
                                    </div>
                                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={!formData.branch}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="step-content">
                                    <h3>Step 2: Choose Semester</h3>
                                    <div className="semester-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setFormData({ ...formData, semester: s })}
                                                style={{
                                                    padding: '1.5rem', borderRadius: '12px', border: formData.semester === s ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                    background: formData.semester === s ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                                    cursor: 'pointer', transition: '0.3s'
                                                }}
                                            >Sem {s}</button>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={!formData.semester}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="step-content">
                                    <h3>Step 3: Subject & Details</h3>
                                    <div className="form-grid" style={{ marginTop: '1rem' }}>
                                        <div className="form-group full-width">
                                            <label>Subject Name</label>
                                            <input type="text" className="form-control" placeholder="e.g. Computer Networks" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Exam Year</label>
                                            <input type="number" className="form-control" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Exam Type</label>
                                            <select className="form-control" value={formData.examType} onChange={e => setFormData({ ...formData, examType: e.target.value })}>
                                                <option value="End-Sem">End-Sem (Final)</option>
                                                <option value="Mid-Sem">Mid-Sem</option>
                                                <option value="Internal">Internal / MST</option>
                                                <option value="Quiz">Quiz / Assignment</option>
                                            </select>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>University / School</label>
                                            <input type="text" className="form-control" placeholder="e.g. DAVV, RGPV" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={!formData.subject}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="step-content">
                                    <h3>Step 4: Upload Files</h3>
                                    <div
                                        style={{
                                            border: '2px dashed var(--primary)', borderRadius: '12px', padding: '3rem', textAlign: 'center', marginTop: '1rem',
                                            background: 'rgba(0, 212, 255, 0.02)', cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('wizard-files').click()}
                                    >
                                        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '1.2rem' }}>Drag & drop papers or click here</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>Accepts multiple PDF files</p>
                                        <input type="file" id="wizard-files" hidden multiple accept=".pdf" onChange={handleFileChange} />
                                    </div>

                                    {formData.files.length > 0 && (
                                        <div style={{ marginTop: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                            {formData.files.map((f, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                    <span><i className="fas fa-file-pdf" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>{f.name}</span>
                                                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={formData.files.length === 0}>Review <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="step-content">
                                    <h3>Step 5: Review & Confirm</h3>
                                    <div className="surface-glow" style={{ padding: '1.5rem', marginTop: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                                        <p><strong>Branch:</strong> {formData.branch}</p>
                                        <p><strong>Semester:</strong> Sem {formData.semester}</p>
                                        <p><strong>Subject:</strong> {formData.subject}</p>
                                        {uploadMode === 'manual' && <p><strong>Year:</strong> {formData.year}</p>}
                                        <p><strong>Category:</strong> {formData.examType}</p>
                                        <p><strong>University:</strong> {formData.university}</p>
                                        <p><strong>Total Files:</strong> {formData.files.length}</p>
                                    </div>

                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-success" onClick={handleUpload} disabled={isUploading}>
                                            {isUploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-check"></i> Confirm & Upload</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="bulk-step" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                            <div className="step-content">
                                <h3>Bulk ZIP Upload</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                    Upload a ZIP file containing folders structured as:<br />
                                    <strong>Branch → Semester X → Subject → Files.pdf</strong>
                                </p>

                                {step === 1 && (
                                    <>
                                        <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                                            <div className="form-group full-width">
                                                <label>Default University</label>
                                                <input type="text" className="form-control" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                border: '2px dashed var(--primary)', borderRadius: '12px', padding: '3rem', textAlign: 'center',
                                                background: 'rgba(0, 212, 255, 0.02)', cursor: 'pointer'
                                            }}
                                            onClick={() => document.getElementById('zip-file').click()}
                                        >
                                            <i className="fas fa-file-archive" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                                            <p style={{ fontSize: '1.2rem' }}>Select ZIP archive</p>
                                            <input type="file" id="zip-file" hidden accept=".zip" onChange={handleFileChange} />
                                        </div>
                                        {formData.files.length > 0 && (
                                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <i className="fas fa-file-archive" style={{ color: 'orange', marginRight: '10px' }}></i> {formData.files[0].name}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                            <button className="btn btn-primary" onClick={handleUpload} disabled={formData.files.length === 0 || isUploading}>
                                                {isUploading ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-upload"></i> Process ZIP</>}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isUploading && (
                    <div className="progress-bar-container" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            style={{ height: '100%', background: 'var(--primary)' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaperWizard;
