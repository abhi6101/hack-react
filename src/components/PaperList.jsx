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
        <div className="card surface-glow" style={{ marginTop: '2rem' }}>
            <div className="card-header">
                <h3 style={{ marginBottom: 0 }}><i className="fas fa-database"></i> Managed Papers Archive</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="badge badge-primary">{filteredPapers.length} Papers</span>
                    <button className="btn btn-secondary btn-sm" onClick={fetchPapers}><i className="fas fa-sync"></i> Refresh</button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar" style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Branch</label>
                    <select
                        className="form-control"
                        style={{ padding: '0.5rem', minWidth: '150px' }}
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
                        style={{ padding: '0.5rem', minWidth: '120px' }}
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
                        style={{ padding: '0.5rem', minWidth: '200px' }}
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {(selectedBranch || selectedSemester || selectedSubject) && (
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={resetFilters}
                        style={{ height: '38px', marginTop: 'auto', padding: '0 1rem' }}
                    >
                        <i className="fas fa-times"></i> Clear Filters
                    </button>
                )}

                {filteredPapers.length > 0 && (
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={async () => {
                            if (!window.confirm(`Are you sure you want to delete ALL ${filteredPapers.length} currently shown papers? This cannot be undone.`)) return;

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
                        style={{ height: '38px', marginTop: 'auto', padding: '0 1rem', marginLeft: 'auto' }}
                    >
                        <i className="fas fa-trash-alt"></i> Delete All Shown
                    </button>
                )}
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
                                    <td>{p.university || 'DAVV'}</td>
                                    <td><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{p.category}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a href={`${API_BASE_URL.replace('/api', '')}${p.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><i className="fas fa-eye"></i></a>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><i className="fas fa-trash"></i></button>
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
