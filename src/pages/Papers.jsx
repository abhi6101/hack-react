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
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableSems, setAvailableSems] = useState([]);
    const [branch, setBranch] = useState('IMCA');
    const [deptList, setDeptList] = useState([]);

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

    const renderPaperList = () => (
        <div className="paper-list-view fade-in">
            <div className="view-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSemester(null)}>
                    <i className="fas fa-arrow-left"></i> Back to Semesters
                </button>
                <h2 style={{ margin: 0 }}>{branch} - Semester {selectedSemester} Papers</h2>
            </div>

            {loading ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                    <p>Fetching papers from archive...</p>
                </div>
            ) : papers.length === 0 ? (
                <div className="empty-state surface-glow" style={{ textAlign: 'center', padding: '4rem', borderRadius: '16px' }}>
                    <i className="fas fa-ghost" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}></i>
                    <h3>No papers found for this semester.</h3>
                    <p>Try checking back later or contact your department admin.</p>
                </div>
            ) : (
                <div className="papers-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {papers.map(paper => (
                        <div key={paper.id} className="paper-item surface-glow" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255, 71, 123, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-file-pdf" style={{ color: '#ff477b' }}></i>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{paper.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{paper.subject}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <span className="badge badge-primary">{paper.category}</span>
                                <span className="badge badge-secondary">{paper.university}</span>
                            </div>

                            <button className="btn btn-primary" onClick={() => handleDownload(paper)} style={{ marginTop: 'auto', width: '100%' }}>
                                <i className="fas fa-download"></i> Download Paper
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <header className="page-header" style={{ position: 'relative' }}>
                {!selectedSemester && (
                    <div style={{ position: 'absolute', top: '2rem', right: '5%', zIndex: 10 }}>
                        <select
                            className="form-control"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 15px' }}
                        >
                            <option value="IMCA">IMCA Department</option>
                            {deptList.filter(d => d.code !== 'IMCA').map(d => (
                                <option key={d.id} value={d.code}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <h1>{branch} Exam Papers Archive</h1>
                <p className="subtitle">
                    {selectedSemester
                        ? `Available papers for ${branch} Semester ${selectedSemester}`
                        : "Select a semester to view and download all available previous year papers."}
                </p>
            </header>

            <main className="papers-container" style={{ padding: '2rem 5%' }}>
                {selectedSemester ? renderPaperList() : renderSemesterGrid()}
            </main>
        </>
    );
};

export default Papers;
