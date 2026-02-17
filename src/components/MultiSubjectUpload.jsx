import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MultiSubjectUpload = ({
    branch,
    semester,
    semesterSubjects = [],
    onBack,
    onUpload,
    isUploading = false
}) => {
    const [subjects, setSubjects] = useState([
        { id: Date.now(), name: '', files: [], customName: '' }
    ]);
    const [currentStep, setCurrentStep] = useState('select'); // 'select' or 'review'

    // Add a new subject row
    const addSubject = () => {
        setSubjects([...subjects, {
            id: Date.now(),
            name: '',
            files: [],
            customName: ''
        }]);
    };

    // Remove a subject row
    const removeSubject = (id) => {
        if (subjects.length === 1) return; // Keep at least one
        setSubjects(subjects.filter(s => s.id !== id));
    };

    // Update subject name
    const updateSubjectName = (id, name) => {
        setSubjects(subjects.map(s =>
            s.id === id ? { ...s, name, customName: '' } : s
        ));
    };

    // Update custom subject name
    const updateCustomName = (id, customName) => {
        setSubjects(subjects.map(s =>
            s.id === id ? { ...s, customName, name: '' } : s
        ));
    };

    // Handle file selection for a subject
    const handleFileChange = (id, e) => {
        const files = Array.from(e.target.files);
        setSubjects(subjects.map(s =>
            s.id === id ? { ...s, files } : s
        ));
    };

    // Remove a file from a subject
    const removeFile = (subjectId, fileIndex) => {
        setSubjects(subjects.map(s =>
            s.id === subjectId
                ? { ...s, files: s.files.filter((_, i) => i !== fileIndex) }
                : s
        ));
    };

    // Validate form
    const isValid = () => {
        return subjects.every(s =>
            (s.name || s.customName.trim()) && s.files.length > 0
        );
    };

    // Get total file count
    const getTotalFiles = () => {
        return subjects.reduce((total, s) => total + s.files.length, 0);
    };

    // Handle upload
    const handleUpload = () => {
        if (!isValid()) return;

        const uploadData = subjects.map(s => ({
            subject: s.customName.trim() || s.name,
            files: s.files
        }));

        onUpload(uploadData);
    };

    if (currentStep === 'review') {
        return (
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="step-content"
            >
                <h3>📋 Review Your Upload</h3>

                <div style={{
                    background: 'rgba(0, 212, 255, 0.05)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginTop: '1.5rem',
                    border: '1px solid rgba(0, 212, 255, 0.2)'
                }}>
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Branch:</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{branch}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Semester:</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{semester}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Subjects:</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{subjects.length}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Files:</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{getTotalFiles()}</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    {subjects.map((subject, index) => (
                        <div
                            key={subject.id}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                        {subject.customName || subject.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {subject.files.length} file{subject.files.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                paddingLeft: '3rem'
                            }}>
                                {subject.files.map((file, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <i className="fas fa-file-pdf" style={{ color: 'var(--accent)' }}></i>
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(0, 212, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    fontSize: '0.9rem',
                    color: 'var(--primary)'
                }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                    <strong>Note:</strong> Subjects will be uploaded one by one. You'll see progress for each subject.
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentStep('select')}
                        disabled={isUploading}
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
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={isUploading}
                        style={{
                            padding: '0.8rem 2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isUploading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Uploading...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check"></i> Finalize Upload
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="step-content"
        >
            <h3>📚 Upload Multiple Subjects</h3>

            <div style={{
                background: 'rgba(0, 212, 255, 0.05)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                fontSize: '0.9rem'
            }}>
                <i className="fas fa-lightbulb" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
                Select files first, then assign a subject name!
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                {subjects.map((subject, index) => (
                    <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative'
                        }}
                    >
                        {/* Subject Number Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            {index + 1}
                        </div>

                        {/* Remove Button */}
                        {subjects.length > 1 && (
                            <button
                                onClick={() => removeSubject(subject.id)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(255, 0, 0, 0.1)',
                                    border: '1px solid rgba(255, 0, 0, 0.3)',
                                    color: '#ff4444',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 0, 0, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 0, 0, 0.1)';
                                }}
                            >
                                <i className="fas fa-trash-alt"></i> Remove
                            </button>
                        )}

                        <div style={{ paddingLeft: '3rem', paddingTop: '0.5rem' }}>

                            {/* 1. File Upload (MOVED TO TOP) */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Step 1: Select PDF Files ({subject.files.length} selected)
                                </label>

                                <div
                                    style={{
                                        border: '2px dashed rgba(0, 212, 255, 0.3)',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        background: 'rgba(0, 212, 255, 0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => document.getElementById(`file-${subject.id}`).click()}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                                    }}
                                >
                                    <i className="fas fa-cloud-upload-alt" style={{
                                        fontSize: '2rem',
                                        color: 'var(--primary)',
                                        marginBottom: '0.5rem'
                                    }}></i>
                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                        {subject.files.length > 0
                                            ? `${subject.files.length} file(s) selected - Click to change`
                                            : 'Click to select PDF files'
                                        }
                                    </p>
                                    <input
                                        type="file"
                                        id={`file-${subject.id}`}
                                        hidden
                                        multiple
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange(subject.id, e)}
                                    />
                                </div>

                                {/* File List */}
                                {subject.files.length > 0 && (
                                    <div style={{
                                        marginTop: '1rem',
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '0.5rem',
                                        borderRadius: '6px'
                                    }}>
                                        {subject.files.map((file, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.5rem',
                                                    borderBottom: i < subject.files.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <i className="fas fa-file-pdf" style={{ color: 'var(--accent)' }}></i>
                                                    {file.name}
                                                </span>
                                                <button
                                                    onClick={() => removeFile(subject.id, i)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--accent)',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem 0.5rem'
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Arrow Indicator */}
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }}>
                                <i className="fas fa-arrow-down"></i>
                            </div>

                            {/* 2. Subject Selection (MOVED BELOW FILES) */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Step 2: Assign Subject Name
                                </label>

                                {semesterSubjects.length > 0 ? (
                                    <select
                                        value={subject.name}
                                        onChange={(e) => updateSubjectName(subject.id, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="">-- Select Subject --</option>
                                        {semesterSubjects.map((subj, i) => (
                                            <option key={i} value={subj}>{subj}</option>
                                        ))}
                                        <option value="__custom__">✏️ Enter Custom Name</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Enter subject name (e.g., COMM, MATH)"
                                        value={subject.customName}
                                        onChange={(e) => updateCustomName(subject.id, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                )}

                                {subject.name === '__custom__' && (
                                    <input
                                        type="text"
                                        placeholder="Enter custom subject name"
                                        value={subject.customName}
                                        onChange={(e) => updateCustomName(subject.id, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            marginTop: '0.5rem'
                                        }}
                                    />
                                )}
                            </div>

                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add More Subject Button */}
            <button
                onClick={addSubject}
                style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '2px dashed rgba(0, 212, 255, 0.3)',
                    color: 'var(--primary)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 212, 255, 0.15)';
                    e.target.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                }}
            >
                <i className="fas fa-plus-circle"></i> Add Another Subject
            </button>

            {/* Summary */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '0.9rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Subjects</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {subjects.length}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Files</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {getTotalFiles()}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <button
                    className="btn btn-secondary"
                    onClick={onBack}
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
                <button
                    className="btn btn-primary"
                    onClick={() => setCurrentStep('review')}
                    disabled={!isValid()}
                    style={{
                        padding: '0.8rem 2.5rem',
                        opacity: isValid() ? 1 : 0.5,
                        cursor: isValid() ? 'pointer' : 'not-allowed'
                    }}
                >
                    Review & Upload <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </motion.div>
    );
};

export default MultiSubjectUpload;
