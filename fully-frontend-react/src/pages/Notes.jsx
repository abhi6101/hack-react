import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPromptModal from '../components/AuthPromptModal';
import API_BASE_URL from '../config';
import '../styles/papers.css'; // Reuses the unified glassmorphic resources styling

const Notes = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    // Data States
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [deptList, setDeptList] = useState([]);

    // UI & Modal States
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadSubject, setUploadSubject] = useState('');
    const [uploadSemester, setUploadSemester] = useState('');
    const [uploadBranch, setUploadBranch] = useState('');
    const [uploadVisibility, setUploadVisibility] = useState('PUBLIC');
    const [uploadFile, setUploadFile] = useState(null);

    // Profile States
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const getToken = () => localStorage.getItem("authToken");

    useEffect(() => {
        fetchUserProfile();
        fetchNotes();
        fetchDepartments();
    }, []);

    const fetchUserProfile = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
                setUserRole(data.role);
                // Set default branch filters for students to make browsing simpler
                if (data.role === 'STUDENT' && data.branch) {
                    setBranchFilter(data.branch);
                }
            }
        } catch (e) {
            console.error("Failed to fetch profile:", e);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/public/departments`);
            if (res.ok) {
                setDeptList(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch departments publicly:", e);
        }
    };

    const fetchNotes = async () => {
        setLoading(true);
        const token = getToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        try {
            const res = await fetch(`${API_BASE_URL}/notes`, { headers });
            if (res.ok) {
                setNotes(await res.json());
            }
        } catch (e) {
            showToast({ message: 'Failed to retrieve study notes index', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) {
            showToast({ message: 'Please select a PDF file to upload', type: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('title', uploadTitle);
        formData.append('subject', uploadSubject);
        if (uploadSemester) formData.append('semester', uploadSemester);
        if (uploadBranch) formData.append('branch', uploadBranch);
        formData.append('visibility', uploadVisibility);
        formData.append('file', uploadFile);

        setUploading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/notes/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });

            if (res.ok) {
                showToast({ message: 'Study notes uploaded successfully!', type: 'success' });
                setShowUploadModal(false);
                // Reset form
                setUploadTitle('');
                setUploadSubject('');
                setUploadSemester('');
                setUploadBranch('');
                setUploadVisibility('PUBLIC');
                setUploadFile(null);
                fetchNotes();
            } else {
                const err = await res.text();
                showToast({ message: `Upload failed: ${err}`, type: 'error' });
            }
        } catch (e) {
            showToast({ message: 'Network error occurred during upload', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        showAlert({
            title: 'Delete Study Note',
            message: 'Are you sure you want to permanently delete this study note?',
            type: 'danger',
            actions: [
                { label: 'Cancel', primary: false },
                {
                    label: 'Delete',
                    primary: true,
                    onClick: async () => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${getToken()}` }
                            });
                            if (res.ok) {
                                showToast({ message: 'Notes deleted successfully', type: 'success' });
                                fetchNotes();
                            } else {
                                showToast({ message: 'Failed to delete note', type: 'error' });
                            }
                        } catch (e) {
                            showToast({ message: 'Connection error during deletion', type: 'error' });
                        }
                    }
                }
            ]
        });
    };

    const handleViewNote = (note) => {
        const token = getToken();
        const vis = note.visibility || 'PUBLIC';

        if ('PUBLIC'.equalsIgnoreCase(vis)) {
            // Public notes are freely accessible via secure direct streaming
            window.open(`${API_BASE_URL}/notes/download/${note.id}`, '_blank');
        } else if (!token) {
            // Restricted note clicked by guest -> intercept with lock dialog
            setShowAuthModal(true);
        } else {
            // Authorized student/admin session -> proceed to open PDF
            window.open(`${API_BASE_URL}/notes/download/${note.id}?token=${token}`, '_blank');
        }
    };

    // Case-insensitive helpers
    String.prototype.equalsIgnoreCase = function (another) {
        return this.toLowerCase() === another.toLowerCase();
    };

    // Filter Logic
    const filteredNotes = notes.filter(note => {
        const matchesQuery = searchQuery === '' || 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            note.subject.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSemester = semesterFilter === '' || 
            (note.semester && note.semester.toString() === semesterFilter);

        const matchesBranch = branchFilter === '' || 
            (note.branch && note.branch.trim().equalsIgnoreCase(branchFilter.trim()));

        return matchesQuery && matchesSemester && matchesBranch;
    });

    const getVisibilityLabel = (vis) => {
        if ('PUBLIC'.equalsIgnoreCase(vis)) return 'Everyone';
        if ('STUDENT'.equalsIgnoreCase(vis)) return 'Students Only';
        if ('BRANCH'.equalsIgnoreCase(vis)) return 'Branch Only';
        return 'Admin Private';
    };

    const getVisibilityBadgeClass = (vis) => {
        if ('PUBLIC'.equalsIgnoreCase(vis)) return 'visibility-badge public';
        if ('STUDENT'.equalsIgnoreCase(vis)) return 'visibility-badge student';
        if ('BRANCH'.equalsIgnoreCase(vis)) return 'visibility-badge branch';
        return 'visibility-badge admin';
    };

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN'].includes(userRole);

    return (
        <div className="papers-container" style={{ minHeight: '90vh', paddingTop: '6.5rem' }}>
            <Helmet>
                <title>Study Notes - Hack-2-Hired</title>
            </Helmet>

            {/* Premium Header Banner */}
            <div className="papers-header">
                <motion.h1
                    initial={{ opacity: 0, y: -25 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="papers-title"
                >
                    Study Notes <span>Hub</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="papers-subtitle"
                >
                    Access premium course materials, subject guides, and semester folders shared by faculty and top performers.
                </motion.p>
            </div>

            <div className="papers-content-wrapper">
                {/* Search & Filter Toolbar */}
                <div className="papers-search-section">
                    <div className="search-bar-container">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search by note title, subject code or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="papers-search-input"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    <div className="filters-grid" style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                        {/* Semester Filter */}
                        <div className="filter-select-wrapper" style={{ flex: 1, minWidth: '150px' }}>
                            <select
                                value={semesterFilter}
                                onChange={(e) => setSemesterFilter(e.target.value)}
                                className="papers-search-input"
                                style={{ padding: '0.8rem 1rem' }}
                            >
                                <option value="">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem.toString()}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        {/* Branch Filter */}
                        <div className="filter-select-wrapper" style={{ flex: 1, minWidth: '180px' }}>
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="papers-search-input"
                                style={{ padding: '0.8rem 1rem' }}
                                disabled={userRole === 'STUDENT'} // Students are locked to their own branches
                            >
                                <option value="">All Branches</option>
                                {deptList.map(dept => (
                                    <option key={dept.id} value={dept.code}>{dept.name} ({dept.code})</option>
                                ))}
                                {!deptList.some(d => d.code === 'IMCA') && <option value="IMCA">IMCA</option>}
                            </select>
                        </div>

                        {/* Admin Action: Upload Notes */}
                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn btn-primary"
                                onClick={() => setShowUploadModal(true)}
                                style={{
                                    borderRadius: '12px',
                                    padding: '0.8rem 1.6rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginLeft: 'auto'
                                }}
                            >
                                <i className="fas fa-file-upload"></i> Upload Notes
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Notes Grid Directory */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4rem 0' }}>
                        <div className="premium-loader-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                        <p style={{ marginTop: '1.2rem', color: 'var(--text-secondary)' }}>Retrieving study directories...</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        margin: '2rem 0'
                    }}>
                        <i className="fas fa-sticky-note" style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }}></i>
                        <h3>No Study Notes Found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try broadening your branch/semester filter selections or try a different search phrase.</p>
                    </div>
                ) : (
                    <div className="papers-grid" style={{ marginTop: '2rem' }}>
                        {filteredNotes.map(note => {
                            const isPublic = 'PUBLIC'.equalsIgnoreCase(note.visibility);
                            const token = getToken();
                            const isLocked = !isPublic && !token;

                            return (
                                <motion.div
                                    key={note.id}
                                    layout
                                    className="paper-card"
                                    whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0, 212, 255, 0.15)' }}
                                    style={{
                                        background: 'rgba(22, 22, 34, 0.7)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleViewNote(note)}
                                >
                                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <span className="year-badge">{note.subject.toUpperCase()}</span>
                                        <span className={getVisibilityBadgeClass(note.visibility)}>
                                            {getVisibilityLabel(note.visibility)}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff', fontWeight: '600', lineHeight: 1.4 }}>
                                        {note.title}
                                    </h3>

                                    <div className="meta-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                        {note.semester && <div><i className="fas fa-university"></i> Semester {note.semester}</div>}
                                        {note.branch && <div><i className="fas fa-graduation-cap"></i> Branch: {note.branch}</div>}
                                        <div><i className="fas fa-calendar-alt"></i> Uploaded: {new Date(note.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    </div>

                                    {/* Locked Preview Badge Indicator */}
                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {isLocked ? (
                                            <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <i className="fas fa-lock"></i> Premium Notes
                                            </span>
                                        ) : (
                                            <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <i className="fas fa-check-circle"></i> Notes Available ✓
                                            </span>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={`action-btn view-btn ${isLocked ? 'locked-btn' : ''}`}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '0.5rem 1rem',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {isLocked ? (
                                                    <>
                                                        <i className="fas fa-sign-in-alt"></i> Unlock Notes
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-file-pdf"></i> Read Notes
                                                    </>
                                                )}
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => handleDelete(note.id, e)}
                                                    className="action-btn delete-btn"
                                                    title="Delete Note"
                                                    style={{
                                                        borderRadius: '8px',
                                                        padding: '0.5rem',
                                                        border: 'none',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom Modal: UPLOAD NOTES FORM */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(5, 5, 8, 0.85)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="login-card surface-glow"
                            style={{
                                maxWidth: '500px',
                                width: '100%',
                                padding: '2.5rem',
                                background: 'rgba(22, 22, 34, 0.8)',
                                border: '1px solid rgba(0, 212, 255, 0.15)',
                                borderRadius: '24px',
                                position: 'relative'
                            }}
                        >
                            {/* Close Trigger */}
                            <button
                                onClick={() => setShowUploadModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>

                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                Upload Study <span>Notes</span>
                            </h2>

                            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div className="input-group">
                                    <label>Note Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Intro to Neural Networks & Weights"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Subject / Topic</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Deep Learning, CSE-401"
                                        value={uploadSubject}
                                        onChange={(e) => setUploadSubject(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label>Semester (Optional)</label>
                                        <select
                                            value={uploadSemester}
                                            onChange={(e) => setUploadSemester(e.target.value)}
                                            className="papers-search-input"
                                            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.9rem', color: '#fff' }}
                                        >
                                            <option value="" style={{ color: '#000' }}>General Notes</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                <option key={sem} value={sem} style={{ color: '#000' }}>Sem {sem}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label>Branch (Optional)</label>
                                        <select
                                            value={uploadBranch}
                                            onChange={(e) => setUploadBranch(e.target.value)}
                                            className="papers-search-input"
                                            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.9rem', color: '#fff' }}
                                        >
                                            <option value="" style={{ color: '#000' }}>All Branches</option>
                                            {deptList.map(dept => (
                                                <option key={dept.id} value={dept.code} style={{ color: '#000' }}>{dept.code}</option>
                                            ))}
                                            {!deptList.some(d => d.code === 'IMCA') && <option value="IMCA" style={{ color: '#000' }}>IMCA</option>}
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Visibility Setting</label>
                                    <select
                                        value={uploadVisibility}
                                        onChange={(e) => setUploadVisibility(e.target.value)}
                                        className="papers-search-input"
                                        style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.9rem', color: '#fff' }}
                                    >
                                        <option value="PUBLIC" style={{ color: '#000' }}>Public (Visible to guests/everyone)</option>
                                        <option value="STUDENT" style={{ color: '#000' }}>Registered Students (Requires Student Login)</option>
                                        <option value="BRANCH" style={{ color: '#000' }}>Branch Specific (Only matching branch/sem students)</option>
                                        <option value="ADMIN" style={{ color: '#000' }}>Private Draft (Admin only view)</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Select PDF File</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        style={{ border: 'none', padding: '0.5rem 0' }}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={uploading}
                                    style={{
                                        marginTop: '1rem',
                                        borderRadius: '12px',
                                        padding: '0.9rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem'
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="premium-loader-spinner"></span>
                                            <span>Uploading Document...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            <span>Upload Notes File</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Reusable Auth Prompt modal for Locked notes */}
            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default Notes;
