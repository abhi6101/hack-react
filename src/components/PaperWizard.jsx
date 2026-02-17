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
        newBranch: '',
        isNewBranch: false,
        semester: '',
        newSemester: '',
        isNewSemester: false,
        subject: '',
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
            const finalBranch = formData.isNewBranch ? formData.newBranch : formData.branch;
            const finalSemester = formData.isNewSemester ? formData.newSemester : formData.semester;

            if (uploadMode === 'manual') {
                const data = new FormData();
                data.append('branch', finalBranch);
                data.append('semester', finalSemester);
                data.append('subject', formData.subject);
                data.append('year', 0); // Backend will extract from filename or use 0
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
                data.append('year', 0); // Automatic extraction

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
            branch: '', newBranch: '', isNewBranch: false,
            semester: '', newSemester: '', isNewSemester: false,
            subject: '', examType: 'End-Sem', university: 'DAVV',
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
                    <h2><i className="fas fa-magic"></i> Paper Wizard</h2>
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
                                    <h3>Step 1: Branch Selection</h3>
                                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label>Choose Existing or Create New</label>
                                            <button
                                                className="btn-sm"
                                                onClick={() => setFormData({ ...formData, isNewBranch: !formData.isNewBranch })}
                                                style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                            >
                                                {formData.isNewBranch ? "Select from list" : "+ Create New Branch"}
                                            </button>
                                        </div>

                                        {formData.isNewBranch ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Branch Code (e.g. CSE, MCA)"
                                                value={formData.newBranch}
                                                onChange={e => setFormData({ ...formData, newBranch: e.target.value.toUpperCase() })}
                                            />
                                        ) : (
                                            <select className="form-control" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                                <option value="">-- Select Branch --</option>
                                                {departments.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '2.5rem', textAlign: 'right' }}>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={formData.isNewBranch ? !formData.newBranch : !formData.branch}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="step-content">
                                    <h3>Step 2: Semester Selection</h3>
                                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label>Select Semester</label>
                                            <button
                                                className="btn-sm"
                                                onClick={() => setFormData({ ...formData, isNewSemester: !formData.isNewSemester })}
                                                style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                            >
                                                {formData.isNewSemester ? "Choose from list" : "+ Custom/New Semester"}
                                            </button>
                                        </div>

                                        {formData.isNewSemester ? (
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter Semester Number"
                                                value={formData.newSemester}
                                                onChange={e => setFormData({ ...formData, newSemester: e.target.value })}
                                            />
                                        ) : (
                                            <div className="semester-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setFormData({ ...formData, semester: s })}
                                                        style={{
                                                            padding: '1rem', borderRadius: '12px', border: formData.semester === s ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                            background: formData.semester === s ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                                            cursor: 'pointer', transition: '0.3s'
                                                        }}
                                                    >Sem {s}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={formData.isNewSemester ? !formData.newSemester : !formData.semester}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="step-content">
                                    <h3>Step 3: Choose Files</h3>
                                    <div
                                        style={{
                                            border: '2px dashed var(--primary)', borderRadius: '12px', padding: '3rem', textAlign: 'center', marginTop: '1.5rem',
                                            background: 'rgba(0, 212, 255, 0.02)', cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('wizard-files').click()}
                                    >
                                        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '1.1rem' }}>Select one or more PDF papers</p>
                                        <input type="file" id="wizard-files" hidden multiple accept=".pdf" onChange={handleFileChange} />
                                    </div>

                                    {formData.files.length > 0 && (
                                        <div style={{ marginTop: '1.5rem', maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                            {formData.files.map((f, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem' }}><i className="fas fa-file-pdf" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>{f.name}</span>
                                                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={formData.files.length === 0}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="step-content">
                                    <h3>Step 4: Paper Details</h3>
                                    <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                                        <div className="form-group full-width">
                                            <label>Subject Name</label>
                                            <input type="text" className="form-control" placeholder="e.g. Computer Graphics" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Year will be auto-extracted from file names.</p>
                                        </div>
                                        <div className="form-group">
                                            <label>Exam Category</label>
                                            <select className="form-control" value={formData.examType} onChange={e => setFormData({ ...formData, examType: e.target.value })}>
                                                <option value="End-Sem">End-Sem</option>
                                                <option value="Mid-Sem">Mid-Sem</option>
                                                <option value="Internal">Internal</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>University</label>
                                            <input type="text" className="form-control" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={!formData.subject}>Review <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="step-content">
                                    <h3>Step 5: Review & Confirm</h3>
                                    <div className="surface-glow" style={{ padding: '1.5rem', marginTop: '1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                                        <p><strong>Branch:</strong> {formData.isNewBranch ? formData.newBranch : formData.branch}</p>
                                        <p><strong>Semester:</strong> {formData.isNewSemester ? formData.newSemester : formData.semester}</p>
                                        <p><strong>Subject:</strong> {formData.subject}</p>
                                        <p><strong>Total Files:</strong> {formData.files.length}</p>
                                        <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}><i className="fas fa-info-circle"></i> Year will be extracted from each PDF file name automatically.</p>
                                    </div>

                                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button className="btn btn-secondary" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-success" onClick={handleUpload} disabled={isUploading}>
                                            {isUploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-check"></i> Finalize Upload</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="bulk-step" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                            <div className="step-content">
                                <h3>Bulk ZIP Upload</h3>
                                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                    <label>Default University</label>
                                    <input type="text" className="form-control" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                                </div>
                                <div
                                    style={{
                                        border: '2px dashed var(--primary)', borderRadius: '12px', padding: '3rem', textAlign: 'center', marginTop: '1rem',
                                        background: 'rgba(0, 212, 255, 0.02)', cursor: 'pointer'
                                    }}
                                    onClick={() => document.getElementById('zip-file').click()}
                                >
                                    <i className="fas fa-file-archive" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                                    <p>Select ZIP archive</p>
                                    <input type="file" id="zip-file" hidden accept=".zip" onChange={handleFileChange} />
                                </div>
                                {formData.files.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <i className="fas fa-file-archive" style={{ color: 'orange', marginRight: '10px' }}></i> {formData.files[0].name}
                                    </div>
                                )}
                                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                    <button className="btn btn-primary" onClick={handleUpload} disabled={formData.files.length === 0 || isUploading}>
                                        {isUploading ? "Processing..." : "Start Import"}
                                    </button>
                                </div>
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
