import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useToast } from '../components/CustomToast';

const PaperList = () => {
    const { showToast } = useToast();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
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

    return (
        <div className="card surface-glow" style={{ marginTop: '2rem' }}>
            <div className="card-header">
                <h3><i className="fas fa-database"></i> Managed Papers Archive</h3>
                <button className="btn btn-secondary btn-sm" onClick={fetchPapers}><i className="fas fa-sync"></i> Refresh</button>
            </div>
            {loading ? <div className="loading-indicator">Loading Archive...</div> : (
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
                            {papers.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center' }}>Archive is empty.</td></tr> : papers.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <i className="fas fa-file-pdf" style={{ color: '#ff477b' }}></i>
                                            <strong>{p.title}</strong>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{p.branch}</span> | Sem {p.semester}</td>
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
