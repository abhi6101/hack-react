import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import StarBackground from '../components/StarBackground';
import Typewriter from '../components/Typewriter';
import '../styles/papers.css';

const Papers = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableSems, setAvailableSems] = useState([]);
    const [branch, setBranch] = useState('IMCA');
    const [deptList, setDeptList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [viewPdfUrl, setViewPdfUrl] = useState(null);

    const getToken = () => localStorage.getItem("authToken");

    const deptFullName = deptList.find(d => d.code === branch)?.name || branch;

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) setDeptList(await res.json());
            else if (res.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const currentToken = getToken();
        if (!currentToken) {
            showAlert({
                title: 'Login Required',
                message: 'You must be logged in to view this page.',
                type: 'login',
                actions: [
                    { label: 'Login Now', primary: true, onClick: () => navigate('/login') },
                    { label: 'Go Home', primary: false, onClick: () => navigate('/') }
                ]
            });
            return;
        }

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
            navigate('/login');
        }
    }, [navigate, showAlert]);

    useEffect(() => {
        if (selectedSemester) {
            fetchPapers(selectedSemester);
        }
        fetchAvailableMetadata();
    }, [branch]);

    const fetchAvailableMetadata = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/papers?branch=${branch}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const all = await res.json();
                const sems = [...new Set(all.map(p => p.semester))].sort((a, b) => a - b);
                setAvailableSems(sems);
            } else if (res.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPapers = async (sem) => {
        setLoading(true);
        setSelectedSemester(sem);
        try {
            const res = await fetch(`${API_BASE_URL}/papers?semester=${sem}&branch=${branch}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPapers(data);
            } else if (res.status === 401) {
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
        try {
            // 1. Fetch the blob securely using the token
            const res = await fetch(`${API_BASE_URL}/papers/proxy/${paper.id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (res.ok) {
                // 2. Create a Blob from the PDF data
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);

                // 3. Open in Modal (In-App Viewer)
                setViewPdfUrl(url); // Triggers the modal
            } else {
                if (res.status === 401) {
                    showAlert({
                        title: 'Access Denied',
                        message: 'Please log in to view this paper.',
                        type: 'error'
                    });
                    navigate('/login');
                } else {
                    showToast({ message: 'Error loading paper. Please try again.', type: 'error' });
                }
            }
        } catch (e) {
            console.error("Download error:", e);
            showToast({ message: 'Failed to access document.', type: 'error' });
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
                        onClick={() => fetchPapers(sem)}
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
                            onClick={() => setSelectedSemester(null)}
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
                                    onClick={() => setSelectedSubject(sub)}
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
                                onClick={() => { setSelectedSubject(null); setSearchQuery(''); }}
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
                                <div className="year-badge">{paper.year !== "0" ? paper.year : 'N/A'}</div>
                            </div>

                            <div className="card-body">
                                <h4 className="paper-title">{paper.title}</h4>
                                <div className="tag-group">
                                    <span className="premium-tag category">{paper.category}</span>
                                    <span className="premium-tag uni">{paper.university}</span>
                                </div>
                            </div>

                            <motion.button
                                className="download-btn-premium"
                                onClick={() => handleDownload(paper)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span style={{ flex: 1 }}>Download PDF</span>
                                <div className="btn-icon">
                                    <i className="fas fa-arrow-down"></i>
                                </div>
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="papers-page-wrapper">
            <StarBackground />
            <div className="decorative-blob blob-1"></div>
            <div className="decorative-blob blob-2"></div>

            <header className="papers-hero">
                <AnimatePresence>
                    {!selectedSemester && (
                        <motion.div
                            className="dept-selector-container"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="custom-dropdown" onClick={() => setIsDeptOpen(!isDeptOpen)}>
                                <div className="dropdown-trigger">
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
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="hero-tag">
                        <Typewriter text="Digital Library" delay={50} infinite={false} />
                    </div>
                    <h1 className="hero-title">
                        {branch} <span className="highlight">Archive</span>
                    </h1>
                    <p className="hero-subtitle">
                        {selectedSemester
                            ? `Curated examination materials for Semester ${selectedSemester}`
                            : "Access a comprehensive collection of previous year question papers and academic resources."}
                    </p>

                    {/* Floating Icons */}
                    <motion.div
                        className="floating-icon"
                        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '3rem', color: 'rgba(0, 212, 255, 0.2)', pointerEvents: 'none' }}
                    >
                        <i className="fas fa-file-alt"></i>
                    </motion.div>
                    <motion.div
                        className="floating-icon"
                        animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '4rem', color: 'rgba(255, 71, 123, 0.2)', pointerEvents: 'none' }}
                    >
                        <i className="fas fa-atom"></i>
                    </motion.div>
                    <motion.div
                        className="floating-icon"
                        animate={{ x: [0, 30, 0], rotate: [0, 20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        style={{ position: 'absolute', top: '30%', right: '25%', fontSize: '2.5rem', color: 'rgba(255, 255, 255, 0.1)', pointerEvents: 'none' }}
                    >
                        <i className="fas fa-laptop-code"></i>
                    </motion.div>
                </motion.div>
            </header>

            <main className="papers-container" style={{ padding: '0 5% 5rem', position: 'relative', zIndex: 2 }}>
                <AnimatePresence mode="wait">
                    {selectedSemester === null ? (
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
                            style={{
                                width: '90%',
                                height: '90%',
                                background: '#1a1a1a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <iframe
                                src={`${viewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title="Secure PDF Viewer"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Papers;
