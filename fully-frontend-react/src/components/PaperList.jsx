import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useToast } from '../components/CustomToast';

const PaperList = () => {
    const { showToast } = useToast();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/papers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPapers(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this paper?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/papers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPapers(papers.filter(p => p.id !== id));
                showToast({ message: 'Paper deleted', type: 'success' });
            }
        } catch (e) {
            showToast({ message: 'Delete failed', type: 'error' });
        }
    };

    const handleView = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/public/papers/download/${id}?action=VIEW&t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to load PDF");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        } catch (e) {
            console.error("View error:", e);
            showToast({ message: 'Failed to access document.', type: 'error' });
        }
    };

    // Calculate Unique Options for Filters
    const branches = [...new Set(papers.map(p => p.branch))].sort();
    const semesters = [...new Set(papers.map(p => p.semester))].sort((a, b) => a - b);
    const subjects = [...new Set(papers.map(p => p.subject))].sort();

    // Filter Logic
    const filteredPapers = papers.filter(p => {
        return (
            (selectedBranch === '' || p.branch === selectedBranch) &&
            (selectedSemester === '' || p.semester.toString() === selectedSemester.toString()) &&
            (selectedSubject === '' || p.subject === selectedSubject)
        );
    });

    const resetFilters = () => {
        setSelectedBranch('');
        setSelectedSemester('');
        setSelectedSubject('');
    };

    return (
        <div className="card surface-glow-premium" style={{ marginTop: '2rem' }}>
            {/* Filter Bar */}
            <div className="filter-bar" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                alignItems: 'end'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Branch</label>
                    <select
                        className="form-control"
                        style={{ padding: '0.5rem' }}
                        value={selectedBranch}
                        onChange={e => setSelectedBranch(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Semester</label>
                    <select
                        className="form-control"
                        style={{ padding: '0.5rem' }}
                        value={selectedSemester}
                        onChange={e => setSelectedSemester(e.target.value)}
                    >
                        <option value="">All Semesters</option>
                        {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subject</label>
                    <select
                        className="form-control"
                        style={{ padding: '0.5rem' }}
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-premium" style={{ flex: 1, borderRadius: '10px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={fetchPapers}>
                        <i className="fas fa-sync-alt" style={{ marginRight: '5px' }}></i> Refresh
                    </button>
                    {(selectedBranch || selectedSemester || selectedSubject) && (
                        <button
                            className="btn-premium"
                            onClick={resetFilters}
                            style={{ flex: 1, borderRadius: '10px', height: '38px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <i className="fas fa-times" style={{ marginRight: '5px' }}></i> Clear
                        </button>
                    )}
                    {filteredPapers.length > 0 && (
                        <button
                            className="btn-premium"
                            onClick={async () => {
                                if (!window.confirm("Are you sure you want to delete all papers?")) return;

                                setLoading(true);
                                let successCount = 0;

                                for (const paper of filteredPapers) {
                                    try {
                                        const res = await fetch(`${API_BASE_URL}/papers/${paper.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        if (res.ok) successCount++;
                                    } catch (e) {
                                        console.error("Failed to delete paper", paper.id, e);
                                    }
                                }

                                showToast({ message: `Deleted ${successCount} papers.`, type: 'success' });
                                fetchPapers(); // Refresh list
                            }}
                            style={{ flex: 1, borderRadius: '10px', height: '38px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <i className="fas fa-trash-alt" style={{ marginRight: '5px' }}></i> Delete All
                        </button>
                    )}
                </div>
            </div>

            {loading ? <div className="loading-indicator">Processing...</div> : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Topic/Subject</th>
                                <th>Details</th>
                                <th>University</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPapers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        <i className="fas fa-filter" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }}></i>
                                        <p>No papers found matching your filters.</p>
                                    </td>
                                </tr>
                            ) : filteredPapers.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <i className="fas fa-file-pdf" style={{ color: '#ff477b' }}></i>
                                            <div>
                                                <strong>{p.title}</strong>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.subject}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span className="badge badge-primary">{p.branch}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Sem {p.semester}</span>
                                        </div>
                                    </td>
                                    <td>{p.university || 'RGPV'}</td>
                                    <td><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{p.category}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleView(p.id)}
                                                className="btn-premium" style={{ borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                                                title="View Paper"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button className="btn-premium" style={{ borderRadius: '10px', padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center' }} onClick={() => handleDelete(p.id)}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PaperList;
