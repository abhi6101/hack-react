import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import API_BASE_URL from '../config';
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

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDeptList(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!token) {
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
            const payload = JSON.parse(atob(token.split('.')[1]));
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
    }, [navigate, showAlert, token]);

    useEffect(() => {
        if (selectedSemester) {
            fetchPapers(selectedSemester);
        }
        fetchAvailableMetadata();
    }, [branch]);

    const fetchAvailableMetadata = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/papers?branch=${branch}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const all = await res.json();
                const sems = [...new Set(all.map(p => p.semester))].sort((a, b) => a - b);
                setAvailableSems(sems);
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPapers(data);
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

    const handleDownload = (paper) => {
        // Construct clear download URL
        const downloadUrl = `${API_BASE_URL.replace('/api', '')}${paper.downloadUrl || paper.pdfUrl}`;
        window.open(downloadUrl, '_blank');
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
        <div className="semester-grid">
            {availableSems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                    <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}></i>
                    <h3>No Semesters found for {branch}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try selecting a different department or check back later.</p>
                </div>
            ) : (
                availableSems.map(sem => (
                    <div key={sem} className="semester-card surface-glow" onClick={() => fetchPapers(sem)} style={{ cursor: 'pointer' }}>
                        <div className="card-content">
                            <h2>Semester {sem}</h2>
                        </div>
                        <div className="card-icon">
                            <i className={`fas fa-folder${selectedSemester === sem ? '-open' : ''}`}></i>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderSubjectGrid = () => {
        const subjects = [...new Set(papers.map(p => p.subject))].sort();

        return (
            <div className="subject-view fade-in">
                <div className="view-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button className="back-btn" onClick={() => setSelectedSemester(null)}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Semester {selectedSemester} Subjects</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a subject folder to view papers</p>
                        </div>
                    </div>

                    {subjects.length > 0 && (
                        <button
                            className="download-all-btn surface-glow"
                            onClick={() => downloadBatch()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '14px',
                                border: '1px solid rgba(0, 212, 255, 0.2)',
                                color: 'var(--primary)',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <i className="fas fa-cloud-download-alt"></i>
                            Download Full Semester
                        </button>
                    )}
                </div>

                <div className="subject-grid">
                    {subjects.length === 0 ? (
                        <div className="empty-state surface-glow" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '24px', gridColumn: '1/-1' }}>
                            <i className="fas fa-folder-open" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }}></i>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Subjects Found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any papers categorized for this semester yet.</p>
                        </div>
                    ) : (
                        subjects.map(sub => {
                            const count = papers.filter(p => p.subject === sub).length;
                            return (
                                <div key={sub} className="subject-folder surface-glow" onClick={() => setSelectedSubject(sub)}>
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
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    const renderPaperList = () => {
        const filteredPapers = papers.filter(p =>
            p.subject === selectedSubject &&
            (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
            <div className="paper-list-view fade-in">
                <div className="view-header" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <button className="back-btn" onClick={() => { setSelectedSubject(null); setSearchQuery(''); }}>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>{selectedSubject}</h2>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Semester {selectedSemester} Archive</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button
                                className="download-batch-btn"
                                onClick={() => downloadBatch(selectedSubject)}
                                style={{
                                    height: '48px',
                                    padding: '0 1.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--primary)',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className="fas fa-file-archive"></i>
                                Bundle Download
                            </button>

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
                    {filteredPapers.map(paper => (
                        <div key={paper.id} className="paper-card-premium surface-glow">
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

                            <button className="download-btn-premium" onClick={() => handleDownload(paper)}>
                                <span style={{ flex: 1 }}>Download PDF</span>
                                <div className="btn-icon">
                                    <i className="fas fa-arrow-down"></i>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="papers-hero">
                {!selectedSemester && (
                    <div className="dept-selector-container">
                        <select
                            className="dept-select-premium"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                        >
                            <option value="IMCA">IMCA Department</option>
                            {deptList.filter(d => d.code !== 'IMCA').map(d => (
                                <option key={d.id} value={d.code}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="hero-content">
                    <span className="hero-tag">Digital Library</span>
                    <h1 className="hero-title">
                        {branch} <span className="highlight">Archive</span>
                    </h1>
                    <p className="hero-subtitle">
                        {selectedSemester
                            ? `Curated examination materials for Semester ${selectedSemester}`
                            : "Access a comprehensive collection of previous year question papers and academic resources."}
                    </p>
                </div>
            </header>

            <main className="papers-container" style={{ padding: '2rem 5%' }}>
                {selectedSemester === null ? renderSemesterGrid() : (selectedSubject === null ? renderSubjectGrid() : renderPaperList())}
            </main>
        </>
    );
};

export default Papers;
