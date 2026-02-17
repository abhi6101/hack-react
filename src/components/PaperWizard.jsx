import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import { useToast } from '../components/CustomToast';
import MultiSubjectUpload from './MultiSubjectUpload';

const PaperWizard = ({ onUploadSuccess }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [uploadMode, setUploadMode] = useState('manual'); // 'manual', 'bulk', or 'multi'

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
        university: 'RGPV',
        files: []
    });

    const [departments, setDepartments] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [showUniManager, setShowUniManager] = useState(false);
    const [newUniName, setNewUniName] = useState('');
    const [existingPapers, setExistingPapers] = useState([]);
    const [semesterSubjects, setSemesterSubjects] = useState([]);
    const [useExistingSubject, setUseExistingSubject] = useState(false);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchDepartments();
        fetchUniversities();
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

    const fetchUniversities = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/universities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setUniversities(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddUniversity = async () => {
        if (!newUniName.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/universities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newUniName })
            });
            if (res.ok) {
                setNewUniName('');
                fetchUniversities();
                showToast({ message: 'University added!', type: 'success' });
            }
        } catch (e) {
            showToast({ message: 'Failed to add university', type: 'error' });
        }
    };

    const handleDeleteUniversity = async (id) => {
        if (!window.confirm('Delete this university?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/universities/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUniversities();
                showToast({ message: 'University deleted!', type: 'success' });
            }
        } catch (e) {
            showToast({ message: 'Failed to delete university', type: 'error' });
        }
    };

    useEffect(() => {
        if (step === 4) {
            fetchAllSemesterSubjects();
        }
    }, [step, formData.branch, formData.newBranch, formData.semester, formData.newSemester]);

    const fetchAllSemesterSubjects = async () => {
        try {
            const branch = formData.isNewBranch ? formData.newBranch : formData.branch;
            const semester = formData.isNewSemester ? formData.newSemester : formData.semester;
            const res = await fetch(`${API_BASE_URL}/papers?branch=${branch}&semester=${semester}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const all = await res.json();
                // Get unique subject names
                const subjects = [...new Set(all.map(p => p.subject))].sort();
                setSemesterSubjects(subjects);
                // Auto-toggle: If subjects exist, use dropdown. Otherwise use manual input.
                if (subjects.length > 0) {
                    setUseExistingSubject(true);
                } else {
                    setUseExistingSubject(false);
                    setFormData(prev => ({ ...prev, subject: '' }));
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (step === 4 && formData.subject.length > 1) {
            fetchExistingPapers();
        }
    }, [step, formData.subject, formData.branch, formData.newBranch, formData.semester, formData.newSemester]);

    const fetchExistingPapers = async () => {
        setLoadingExisting(true);
        try {
            const branch = formData.isNewBranch ? formData.newBranch : formData.branch;
            const semester = formData.isNewSemester ? formData.newSemester : formData.semester;
            const res = await fetch(`${API_BASE_URL}/papers?branch=${branch}&semester=${semester}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const all = await res.json();
                const matches = all.filter(p =>
                    p.subject.toLowerCase().includes(formData.subject.toLowerCase())
                );
                setExistingPapers(matches);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingExisting(false);
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

    const handleMultiSubjectUpload = async (subjects) => {
        setIsUploading(true);
        const totalSubjects = subjects.length;
        let successCount = 0;
        let failedSubjects = [];

        try {
            const finalBranch = formData.isNewBranch ? formData.newBranch : formData.branch;
            const finalSemester = formData.isNewSemester ? formData.newSemester : formData.semester;

            for (let i = 0; i < subjects.length; i++) {
                const subject = subjects[i];
                const progress = ((i + 1) / totalSubjects) * 100;
                setUploadProgress(progress);

                showToast({ message: `Uploading ${subject.subject} (${i + 1}/${totalSubjects})...`, type: 'info' });

                try {
                    const data = new FormData();
                    data.append('branch', finalBranch);
                    data.append('semester', finalSemester);
                    data.append('subject', subject.subject);
                    data.append('year', 0);
                    data.append('category', formData.examType);
                    data.append('university', formData.university);
                    data.append('title', subject.subject);
                    subject.files.forEach(file => data.append('files', file));

                    const res = await fetch(`${API_BASE_URL}/papers/upload-multiple`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: data
                    });

                    if (res.ok) {
                        successCount++;
                        showToast({ message: `✓ ${subject.subject} uploaded!`, type: 'success' });
                    } else {
                        throw new Error(await res.text());
                    }
                } catch (e) {
                    failedSubjects.push(subject.subject);
                    showToast({ message: `✗ ${subject.subject} failed`, type: 'error' });
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (successCount === totalSubjects) {
                showToast({ message: `🎉 All ${totalSubjects} subjects uploaded!`, type: 'success' });
                onUploadSuccess?.();
                resetForm();
            } else if (successCount > 0) {
                showToast({ message: `⚠️ ${successCount}/${totalSubjects} uploaded`, type: 'warning' });
            }
        } catch (e) {
            showToast({ message: `Upload failed: ${e.message}`, type: 'error' });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
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
            subject: '', examType: 'End-Sem', university: 'RGPV',
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
            {(uploadMode === 'bulk' ? [1] : [1, 2, 3]).map(i => (
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>Select Branch</label>
                                            <button
                                                className={`btn-sm ${formData.isNewBranch ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, isNewBranch: !formData.isNewBranch })}
                                                style={{
                                                    fontSize: '0.8rem',
                                                    background: formData.isNewBranch ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    color: formData.isNewBranch ? '#000' : 'var(--primary)',
                                                    cursor: 'pointer',
                                                    padding: '6px 15px',
                                                    borderRadius: '8px',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                {formData.isNewBranch ? "← Back to List" : "+ Create New Branch"}
                                            </button>
                                        </div>

                                        {formData.isNewBranch ? (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter Branch Code (e.g. CSE, MCA, AI)"
                                                    value={formData.newBranch}
                                                    onChange={e => setFormData({ ...formData, newBranch: e.target.value.toUpperCase() })}
                                                    style={{ padding: '1rem', fontSize: '1.1rem' }}
                                                />
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                                    <i className="fas fa-info-circle"></i> This will automatically create a new department if it doesn't exist.
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <select
                                                className="form-control"
                                                value={formData.branch}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({ ...formData, branch: val });
                                                    if (val) nextStep();
                                                }}
                                                style={{ padding: '1.2rem', borderRadius: '14px', fontWeight: '500', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                                            >
                                                <option value="">-- Select Your Department --</option>
                                                {departments.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '3.5rem', textAlign: 'right' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={nextStep}
                                            disabled={formData.isNewBranch ? !formData.newBranch : !formData.branch}
                                            style={{
                                                padding: '1rem 3rem',
                                                borderRadius: '14px',
                                                fontWeight: '700',
                                                fontSize: '1.1rem',
                                                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Next Step <i className="fas fa-chevron-right" style={{ marginLeft: '10px' }}></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="step-content">
                                    <h3>Step 2: Semester Selection</h3>
                                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>Choose Semester</label>
                                            <button
                                                className={`btn-sm ${formData.isNewSemester ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, isNewSemester: !formData.isNewSemester })}
                                                style={{
                                                    fontSize: '0.8rem',
                                                    background: formData.isNewSemester ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    color: formData.isNewSemester ? '#000' : 'var(--primary)',
                                                    cursor: 'pointer',
                                                    padding: '6px 15px',
                                                    borderRadius: '8px',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                {formData.isNewSemester ? "← Back to Grid" : "+ Custom Semester"}
                                            </button>
                                        </div>

                                        {formData.isNewSemester ? (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Enter Semester Number (e.g. 9)"
                                                    value={formData.newSemester}
                                                    onChange={e => setFormData({ ...formData, newSemester: e.target.value })}
                                                    style={{ padding: '1.2rem', borderRadius: '14px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.2)' }}
                                                />
                                            </motion.div>
                                        ) : (
                                            <div className="semester-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => {
                                                            setFormData({ ...formData, semester: s });
                                                            nextStep();
                                                        }}
                                                        style={{
                                                            padding: '1.5rem 1rem', borderRadius: '16px',
                                                            border: formData.semester === s ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                                            background: formData.semester === s ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                                                            color: formData.semester === s ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                                                            fontWeight: '700',
                                                            fontSize: '1.1rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: formData.semester === s ? '0 0 20px rgba(0,212,255,0.15)' : 'none'
                                                        }}
                                                    >
                                                        Sem {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={prevStep}
                                            style={{
                                                padding: '0.8rem 2rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <i className="fas fa-arrow-left"></i> Back
                                        </button>
                                        <button className="btn btn-primary" onClick={nextStep} disabled={formData.isNewSemester ? !formData.newSemester : !formData.semester} style={{ padding: '0.8rem 2.5rem' }}>Next <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <MultiSubjectUpload
                                    branch={formData.isNewBranch ? formData.newBranch : formData.branch}
                                    semester={formData.isNewSemester ? formData.newSemester : formData.semester}
                                    semesterSubjects={semesterSubjects}
                                    onBack={prevStep}
                                    onUpload={handleMultiSubjectUpload}
                                    isUploading={isUploading}
                                />
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
