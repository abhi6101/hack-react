import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import AuthPromptModal from '../components/AuthPromptModal';
import API_BASE_URL from '../config';

import Typewriter from '../components/Typewriter';
import '../styles/papers.css';

const Papers = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    const selectedSemester = searchParams.get('semester') ? parseInt(searchParams.get('semester'), 10) : null;
    const selectedSubject = searchParams.get('subject') || null;

    const handleSemesterSelect = (sem) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (sem === null) {
                next.delete('semester');
            } else {
                next.set('semester', sem);
            }
            next.delete('subject');
            return next;
        });
    };

    const handleSubjectSelect = (sub) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (sub === null) {
                next.delete('subject');
            } else {
                next.set('subject', sub);
            }
            return next;
        });
    };
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableSems, setAvailableSems] = useState([]);
    const [branch, setBranch] = useState('IMCA');
    const [deptList, setDeptList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [viewPdfUrl, setViewPdfUrl] = useState(null);
    const [currentPaper, setCurrentPaper] = useState(null); // For SEO Filename
    const [userRole, setUserRole] = useState(null);
    const [userSemester, setUserSemester] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isBlurred, setIsBlurred] = useState(false);
    const [securityViolationMessage, setSecurityViolationMessage] = useState(null);
    const [paperDownloadEnabled, setPaperDownloadEnabled] = useState(false);
    const [screenshotRestrictionEnabled, setScreenshotRestrictionEnabled] = useState(true);
    const [branchPapers, setBranchPapers] = useState([]);
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const getToken = () => localStorage.getItem("authToken");

    const deptFullName = deptList.find(d => d.code === branch)?.name || branch;

    const fetchPaperSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/public/papers/settings`);
            if (res.ok) {
                const data = await res.json();
                setPaperDownloadEnabled(data.paperDownloadEnabled);
                setScreenshotRestrictionEnabled(data.screenshotRestrictionEnabled);
            }
        } catch (e) {
            console.error("Failed to fetch paper settings", e);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchPaperSettings();
    }, []);

    const fetchDepartments = async () => {
        // Students don't need the department list and aren't allowed to fetch it
        if (userRole === 'STUDENT') return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/public/departments`);
            if (res.ok) {
                setDeptList(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch departments publicly:", e);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
                setUserRole(data.role);
                setUserSemester(data.semester);
                if (data.role === 'STUDENT' && data.branch) {
                    setBranch(data.branch);
                } else if (data.role !== 'STUDENT') {
                    fetchDepartments();
                }
            }
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }
    };

    useEffect(() => {
        const currentToken = getToken();
        if (currentToken) {
            try {
                const payload = JSON.parse(atob(currentToken.split('.')[1]));
                if (payload.exp < Date.now() / 1000) {
                    showAlert({
                        title: 'Session Expired',
                        message: 'Your session has expired. Please log in again.',
                        type: 'warning',
                        actions: [
                            { label: 'Login', primary: true, onClick: () => { localStorage.clear(); navigate('/login'); } }
                        ]
                    });
                    localStorage.clear();
                }
            } catch (e) {
                console.error("Invalid token");
                localStorage.clear();
            }
        }
    }, [navigate, showAlert]);

    const triggerSecurityViolation = (reason) => {
        setIsBlurred(true);
        setSecurityViolationMessage(`Security Restriction: ${reason}. Access revoked! Redirecting to main portal in 3 seconds...`);
        showToast({ message: `Security restriction: ${reason}`, type: 'error' });
        
        if (viewPdfUrl) {
            try {
                window.URL.revokeObjectURL(viewPdfUrl);
            } catch (err) {}
        }
        setViewPdfUrl(null);

        // Notify backend of the security violation
        const token = getToken();
        if (token) {
            fetch(`${API_BASE_URL}/public/papers/violation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Violation log failed");
            })
            .then(data => {
                if (data.isLocked) {
                    setSecurityViolationMessage(`CRITICAL VIOLATION: ${data.message} Logging out...`);
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/login', { state: { locked: true, message: data.message, secondsLeft: data.secondsLeft } });
                    }, 3000);
                } else {
                    const strikes = data.strikes || 0;
                    const chancesLeft = Math.max(0, 5 - strikes);
                    setSecurityViolationMessage(`Security Restriction: ${reason}. Strikes used: ${strikes}/5. You have ${chancesLeft} chances left before your account is locked!`);
                    showToast({ message: `Warning: ${strikes}/5 strikes used. ${chancesLeft} chances left!`, type: 'warning' });
                    
                    setTimeout(() => {
                        setSecurityViolationMessage(null);
                        setIsBlurred(false);
                        navigate('/');
                    }, 5000);
                }
            })
            .catch(err => {
                console.error("Error logging security violation:", err);
                setTimeout(() => {
                    setSecurityViolationMessage(null);
                    setIsBlurred(false);
                    navigate('/');
                }, 3000);
            });
        } else {
            setTimeout(() => {
                setSecurityViolationMessage(null);
                setIsBlurred(false);
                navigate('/');
            }, 3000);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!screenshotRestrictionEnabled) return;
            if (viewPdfUrl) {
                // Ctrl+P / Cmd+P (Print)
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    triggerSecurityViolation('Print attempt detected');
                }
                // Ctrl+S / Cmd+S (Save)
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    triggerSecurityViolation('Save/Download attempt detected');
                }
                // Win+Shift+S / Cmd+Shift+S / PrintScreen / Snip Tool shortcut detection - KICK TO HOME!
                if (
                    e.key === 'PrintScreen' || 
                    ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S'))
                ) {
                    e.preventDefault();
                    setIsBlurred(true);
                    try {
                        navigator.clipboard.writeText(''); // Wipe clipboard
                    } catch (err) {}
                    triggerSecurityViolation('Screenshot attempt detected');
                }
            }
        };

        const handleTouchStart = (e) => {
            if (!screenshotRestrictionEnabled) return;
            if (viewPdfUrl && e.touches.length >= 3) {
                e.preventDefault();
                setIsBlurred(true);
                triggerSecurityViolation('Multi-finger screenshot gesture detected');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchStart, { passive: false });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchStart);
        };
    }, [viewPdfUrl, userRole, showToast]);

    useEffect(() => {
        if (selectedSemester) {
            fetchPapers(selectedSemester);
        }
    }, [selectedSemester, branch]);

    useEffect(() => {
        fetchAvailableMetadata();
    }, [branch]);

    const fetchAvailableMetadata = async () => {
        try {
            const token = getToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE_URL}/papers?branch=${branch}`, {
                headers: headers
            });
            if (res.ok) {
                const all = await res.json();
                setBranchPapers(all);
                let sems = [...new Set(all.map(p => p.semester))].sort((a, b) => a - b);
                
                // --- STRICT FILTER FOR STUDENTS ---
                if (userRole === 'STUDENT' && userSemester) {
                    // Only show their current semester box
                    sems = [userSemester];
                }
                
                setAvailableSems(sems);
            } else if (res.status === 401 && token) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPapers = async (sem) => {
        setLoading(true);
        try {
            const token = getToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE_URL}/papers?semester=${sem}&branch=${branch}`, {
                headers: headers
            });
            if (res.ok) {
                const data = await res.json();
                setPapers(data);
            } else if (res.status === 401 && token) {
                localStorage.clear();
                navigate('/login');
            } else {
                showToast({ message: 'Failed to fetch papers', type: 'error' });
            }
        } catch (e) {
            console.error(e);
            showToast({ message: 'Error connecting to server', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (paper) => {
        const token = getToken();
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/public/papers/download/${paper.id}?action=VIEW&t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to load PDF");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setViewPdfUrl(blobUrl);
            setCurrentPaper(paper);
        } catch (e) {
            console.error("Download error:", e);
            showToast({ message: 'Failed to access document securely.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleActualDownload = async (paper) => {
        const token = getToken();
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/public/papers/download/${paper.id}?action=DOWNLOAD&t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to download PDF");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            
            const cleanTitle = paper.title.replace(/[^a-zA-Z0-9]/g, "_") || 'paper';
            link.setAttribute('download', `${cleanTitle}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            
            showToast({ message: 'Paper downloaded successfully!', type: 'success' });
        } catch (e) {
            console.error("Download error:", e);
            showToast({ message: 'Failed to download paper.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const downloadBatch = (subject = null) => {
        const url = new URL(`${API_BASE_URL}/papers/batch-download`);
        url.searchParams.append('branch', branch);
        url.searchParams.append('semester', selectedSemester);
        if (subject) url.searchParams.append('subject', subject);

        // Use hidden anchor to trigger download
        const link = document.createElement('a');
        link.href = url.toString();
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderSemesterGrid = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="view-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Academic Archive</h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a semester folder to view subject materials</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="global-search-container" style={{
                        position: 'relative',
                        width: '380px',
                        maxWidth: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        padding: '0 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        transition: 'all 0.3s ease'
                    }}>
                        <i className="fas fa-search" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                        <input
                            type="text"
                            placeholder="Search papers by subject, title, course, or year..."
                            value={globalSearchQuery}
                            onChange={(e) => setGlobalSearchQuery(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.95rem',
                                width: '100%',
                                outline: 'none',
                                padding: '1rem 0'
                            }}
                        />
                        {globalSearchQuery && (
                            <i 
                                className="fas fa-times" 
                                onClick={() => setGlobalSearchQuery('')}
                                style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                            ></i>
                        )}
                    </div>

                    {userRole !== 'STUDENT' && (
                        <div className="dept-selector-inline" style={{ position: 'relative', zIndex: 100 }}>
                            <div className="custom-dropdown" onClick={() => setIsDeptOpen(!isDeptOpen)}>
                                <div className="dropdown-trigger" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <i className="fas fa-graduation-cap"></i>
                                    <span>{deptFullName}</span>
                                    <i className={`fas fa-chevron-down ${isDeptOpen ? 'open' : ''}`}></i>
                                </div>

                                <AnimatePresence>
                                    {isDeptOpen && (
                                        <motion.div
                                            className="dropdown-menu surface-glow"
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            style={{ right: 0, left: 'auto' }}
                                        >
                                            <div
                                                className={`dropdown-item ${branch === 'IMCA' ? 'active' : ''}`}
                                                onClick={() => { setBranch('IMCA'); setIsDeptOpen(false); }}
                                            >
                                                IMCA Department
                                            </div>
                                            {deptList.filter(d => d.code !== 'IMCA').map(d => (
                                                <div
                                                    key={d.id}
                                                    className={`dropdown-item ${branch === d.code ? 'active' : ''}`}
                                                    onClick={() => { setBranch(d.code); setIsDeptOpen(false); }}
                                                >
                                                    {d.name}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <motion.div
                className="semester-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {availableSems.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}></i>
                        <h3>No Semesters found for {branch}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try selecting a different department or check back later.</p>
                    </div>
                ) : (
                    availableSems.map((sem, idx) => (
                        <motion.div
                            key={sem}
                            className="semester-card"
                            onClick={() => handleSemesterSelect(sem)}
                            style={{ cursor: 'pointer' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="card-icon">
                                <i className={`fas fa-folder${selectedSemester === sem ? '-open' : ''}`}></i>
                            </div>
                            <div className="card-content">
                                <h2>Semester {sem}</h2>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );

    const renderSubjectGrid = () => {
        const subjects = [...new Set(papers.map(p => p.subject))].sort();

        return (
            <motion.div
                className="subject-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
            >
                <div className="view-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <motion.button
                            className="back-btn"
                            onClick={() => handleSemesterSelect(null)}
                            whileHover={{ x: -5 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </motion.button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Semester {selectedSemester} Subjects</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a subject folder to view papers</p>
                        </div>
                    </div>


                </div>

                <div className="subject-grid">
                    {subjects.length === 0 ? (
                        <div className="empty-state surface-glow" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '24px', gridColumn: '1/-1' }}>
                            <i className="fas fa-folder-open" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }}></i>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Subjects Found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any papers categorized for this semester yet.</p>
                        </div>
                    ) : (
                        subjects.map((sub, idx) => {
                            const count = papers.filter(p => p.subject === sub).length;
                            return (
                                <motion.div
                                    key={sub}
                                    className="subject-folder"
                                    onClick={() => handleSubjectSelect(sub)}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: 10 }}
                                >
                                    <div className="folder-icon-wrapper">
                                        <div className="folder-icon">
                                            <i className="fas fa-folder"></i>
                                            <span className="file-count">{count}</span>
                                        </div>
                                    </div>
                                    <div className="folder-info">
                                        <h3 className="folder-name">{sub}</h3>
                                        <span className="folder-desc">Examination Papers</span>
                                    </div>
                                    <div className="folder-arrow">
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </motion.div>
        );
    };

    const renderPaperList = () => {
        const filteredPapers = papers.filter(p =>
            p.subject === selectedSubject &&
            (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
            <motion.div
                className="paper-list-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
            >
                <div className="view-header" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <motion.button
                                className="back-btn"
                                onClick={() => { handleSubjectSelect(null); setSearchQuery(''); }}
                                whileHover={{ x: -5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </motion.button>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>{selectedSubject}</h2>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Semester {selectedSemester} Archive</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>


                            <div className="search-box-container">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search by paper title or year..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="papers-grid">
                    {filteredPapers.map((paper, idx) => (
                        <motion.div
                            key={paper.id}
                            className="paper-card-premium surface-glow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -10 }}
                        >
                            <div className="card-top">
                                <div className="file-icon">
                                    <i className="fas fa-file-pdf"></i>
                                </div>
                            </div>

                            <div className="card-body">
                                <h4 className="paper-title">{paper.title}</h4>
                                <div className="tag-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                    <span className="premium-tag category">{paper.category}</span>
                                    <span className="premium-tag uni">{paper.university}</span>
                                    <span className="premium-tag available" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
                                        PDF Available ✓
                                    </span>
                                </div>
                            </div>

                            <div className="card-buttons-container" style={{ display: 'flex', gap: '10px', marginTop: 'auto', width: '100%' }}>
                                <motion.button
                                    className="download-btn-premium"
                                    onClick={() => handleDownload(paper)}
                                    style={{ flex: 1, marginTop: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span style={{ flex: 1 }}>View Paper</span>
                                    <div className="btn-icon">
                                        <i className="fas fa-eye"></i>
                                    </div>
                                </motion.button>

                                {getToken() && paperDownloadEnabled && (
                                    <motion.button
                                        className="download-btn-premium"
                                        onClick={() => handleActualDownload(paper)}
                                        style={{ flex: 1, marginTop: 0, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)', color: '#000' }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span style={{ flex: 1 }}>Download</span>
                                        <div className="btn-icon" style={{ background: 'rgba(0,0,0,0.1)' }}>
                                            <i className="fas fa-download"></i>
                                        </div>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    };

    const renderSearchResults = () => {
        const query = globalSearchQuery.toLowerCase();
        const filtered = branchPapers.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.subject.toLowerCase().includes(query) ||
            (p.year && p.year.toLowerCase().includes(query)) ||
            `semester ${p.semester}`.includes(query) ||
            p.branch.toLowerCase().includes(query)
        );

        return (
            <motion.div
                className="paper-list-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
            >
                <div className="view-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Search Results</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Found {filtered.length} paper(s) matching "{globalSearchQuery}"
                        </p>
                    </div>
                    <motion.button
                        className="back-btn"
                        onClick={() => setGlobalSearchQuery('')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        <i className="fas fa-times"></i> Clear Search
                    </motion.button>
                </div>

                {filtered.length === 0 ? (
                    <div className="empty-state surface-glow" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '24px' }}>
                        <i className="fas fa-search" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }}></i>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Papers Found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any papers matching your search. Try adjusting your keywords.</p>
                    </div>
                ) : (
                    <div className="papers-grid">
                        {filtered.map((paper, idx) => (
                            <motion.div
                                key={paper.id}
                                className="paper-card-premium surface-glow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="card-top">
                                    <div className="file-icon">
                                        <i className="fas fa-file-pdf"></i>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <h4 className="paper-title">{paper.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0.8rem' }}>
                                        {paper.subject} • Semester {paper.semester}
                                    </p>
                                    <div className="tag-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        <span className="premium-tag category">{paper.category}</span>
                                        <span className="premium-tag uni">{paper.university}</span>
                                        <span className="premium-tag available" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
                                            PDF Available ✓
                                        </span>
                                    </div>
                                </div>

                                <div className="card-buttons-container" style={{ display: 'flex', gap: '10px', marginTop: 'auto', width: '100%' }}>
                                    <motion.button
                                        className="download-btn-premium"
                                        onClick={() => handleDownload(paper)}
                                        style={{ flex: 1, marginTop: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span style={{ flex: 1 }}>View Paper</span>
                                        <div className="btn-icon">
                                            <i className="fas fa-eye"></i>
                                        </div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="papers-page-wrapper">
            <Helmet>
                <title>Hack-2-Hired</title>
                <meta name="description" content="Download exclusive RGPV Integrated MCA (IMCA) question papers. Access the complete collection of 1st to 10th semester papers to ace your exams." />
            </Helmet>

            <div className="decorative-blob blob-1"></div>
            <div className="decorative-blob blob-2"></div>

            <main className="papers-container" style={{ padding: '6.5rem 5% 5rem', position: 'relative', zIndex: 2 }}>
                <AnimatePresence mode="wait">
                    {globalSearchQuery.trim() !== '' ? (
                        <div key="search-results">{renderSearchResults()}</div>
                    ) : selectedSemester === null ? (
                        <div key="sem-grid">{renderSemesterGrid()}</div>
                    ) : (
                        selectedSubject === null ? (
                            <div key="sub-grid">{renderSubjectGrid()}</div>
                        ) : (
                            <div key="paper-list">{renderPaperList()}</div>
                        )
                    )}
                </AnimatePresence>
            </main>


            {/* PDF Viewer Model */}
            <AnimatePresence>
                {viewPdfUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        {/* Close Button */}
                        <motion.button
                            onClick={() => {
                                setViewPdfUrl(null);
                                setCurrentPaper(null);
                                window.URL.revokeObjectURL(viewPdfUrl);
                            }}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                zIndex: 10000
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </motion.button>



                        {/* PDF Frame */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onContextMenu={(e) => { if (screenshotRestrictionEnabled) e.preventDefault(); }}
                            style={{
                                width: '90%',
                                height: '90%',
                                background: '#1a1a1a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                position: 'relative'
                            }}
                        >
                            <iframe
                                src={`${viewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=100`}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                style={{ border: 'none', filter: isBlurred ? 'blur(20px)' : 'none', transition: 'filter 0.15s ease' }}
                                title="Secure PDF Viewer"
                                onLoad={(e) => {
                                    if (!screenshotRestrictionEnabled) return;
                                    try {
                                        const iframeWin = e.target.contentWindow;
                                        const iframeDoc = e.target.contentDocument || iframeWin.document;

                                        // Block right click inside iframe document
                                        // Disabled wheel listener
                                         if (false) iframeDoc.addEventListener('wheel', (evt) => {
                                             if (evt.ctrlKey) {
                                                 evt.preventDefault();
                                             }
                                         }, { passive: false });

                                        iframeDoc.addEventListener('contextmenu', (evt) => {
                                            evt.preventDefault();
                                        });

                                        // Block saving/printing inside iframe document
                                        iframeDoc.addEventListener('keydown', (evt) => {
                                             // Ctrl+S / Cmd+S
                                             if ((evt.ctrlKey || evt.metaKey) && evt.key === 's') {
                                                evt.preventDefault();
                                                showToast({ message: 'Saving is strictly prohibited.', type: 'error' });
                                            }
                                            // Ctrl+P / Cmd+P
                                            if ((evt.ctrlKey || evt.metaKey) && evt.key === 'p') {
                                                evt.preventDefault();
                                                showToast({ message: 'Printing is strictly prohibited.', type: 'error' });
                                            }
                                            // Ctrl+C / Cmd+C (Copy)
                                            if ((evt.ctrlKey || evt.metaKey) && evt.key === 'c') {
                                                evt.preventDefault();
                                                showToast({ message: 'Copying content is prohibited.', type: 'error' });
                                            }
                                            // PrintScreen / Snip Tool shortcut detection - KICK TO HOME!
                                            if (
                                                evt.key === 'PrintScreen' || 
                                                ((evt.metaKey || evt.ctrlKey) && evt.shiftKey && (evt.key === 's' || evt.key === 'S'))
                                            ) {
                                                evt.preventDefault();
                                                setIsBlurred(true);
                                                try {
                                                    iframeWin.navigator.clipboard.writeText(''); 
                                                } catch (err) {}
                                                triggerSecurityViolation('Screenshot attempt detected inside secure frame');
                                            }
                                        });
                                    } catch (err) {
                                        console.warn("Could not inject keyboard listeners inside iframe due to browser PDF plugin sandboxing.", err);
                                    }
                                }}
                            />

                             {/* Blur indicator when snipping tool/focus loss is detected */}
                             {isBlurred && (
                                 <div style={{
                                     position: 'absolute',
                                     top: 0,
                                     left: 0,
                                     width: '100%',
                                     height: '100%',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     gap: '1.5rem',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     backgroundColor: 'rgba(0,0,0,0.9)',
                                     color: '#ff4d4d',
                                     fontSize: '1.6rem',
                                     fontWeight: 'bold',
                                     zIndex: 100000,
                                     textAlign: 'center',
                                     padding: '2rem',
                                     backdropFilter: 'blur(30px)'
                                 }}>
                                     <i className="fas fa-exclamation-triangle" style={{ fontSize: '3.5rem', color: '#ff4d4d' }}></i>
                                     <div style={{ maxWidth: '80%', lineHeight: '1.6' }}>
                                         {securityViolationMessage || "Content blurred due to screen utility active!"}
                                     </div>
                                 </div>
                             )}

                            {/* Secure transparent watermark overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 9,
                                overflow: 'hidden'
                            }}>
                                {/* Repeating Diagonal Watermark */}
                                {userProfile && (
                                    <div style={{
                                        position: 'absolute',
                                        width: '200%',
                                        height: '200%',
                                        top: '-50%',
                                        left: '-50%',
                                        transform: 'rotate(-30deg)',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gridGap: '80px',
                                        justifyItems: 'center',
                                        alignItems: 'center',
                                        opacity: 0.08,
                                        userSelect: 'none'
                                    }}>
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <div key={i} style={{
                                                color: '#fff',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {userProfile.fullName} ({userProfile.username}) - CONFIDENTIAL HACK2HIRED
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AuthPromptModal */}
            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="🔒 Login Required"
                subtitle="This paper is available on our platform."
                description="Please login or create an account to view and download the paper."
            />
        </div >
    );
};

export default Papers;
