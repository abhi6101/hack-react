import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useToast } from './CustomToast';

const TableSkeleton = ({ cols = 5, rows = 2 }) => (
    <div className="table-responsive" style={{ padding: '1rem', overflowX: 'auto', width: '100%' }}>
        <table className="table" style={{ width: '100%' }}>
            <thead>
                <tr>
                    {Array.from({ length: cols }).map((_, i) => (
                        <th key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="skeleton skeleton-text" style={{ width: '60%', height: '16px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                        {Array.from({ length: cols }).map((_, colIndex) => (
                            <td key={colIndex} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <div className="skeleton skeleton-text" style={{ width: colIndex === 0 ? '80%' : '50%', height: '16px', background: 'rgba(255, 255, 255, 0.05)' }}></div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PendingPapersAdmin = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchPendingPapers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/papers/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPapers(data);
            }
        } catch (error) {
            showToast({ message: 'Error fetching pending papers', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPapers();
    }, []);

    const handleAction = async (id, action) => {
        const token = localStorage.getItem('authToken');
        let url = `${API_BASE_URL}/papers/${id}/${action}`;
        
        let formData = new FormData();
        if (action === 'reject') {
            const reason = prompt("Reason for rejection:");
            if (!reason) return; // User cancelled
            formData.append('reason', reason);
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: action === 'reject' ? formData : null
            });
            
            if (res.ok) {
                showToast({ message: `Paper ${action}ed successfully!`, type: 'success' });
                fetchPendingPapers(); // refresh list
            } else {
                showToast({ message: `Failed to ${action} paper`, type: 'error' });
            }
        } catch (error) {
            showToast({ message: `Network error on ${action}`, type: 'error' });
        }
    };

    if (loading) {
        return (
            <div style={{ background: 'var(--surface-bg)', padding: '20px', borderRadius: '12px' }}>
                <h2>Pending Smart Uploads</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Review and approve papers uploaded by students. Approving awards the student 50 points.
                </p>
                <div className="table-responsive surface-glow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <TableSkeleton cols={5} rows={2} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--surface-bg)', padding: '20px', borderRadius: '12px' }}>
            <h2>Pending Smart Uploads</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Review and approve papers uploaded by students. Approving awards the student 50 points.
            </p>

            {papers.length === 0 ? (
                <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-check-circle"></i> All caught up! No pending papers.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '15px' }}>Subject</th>
                                <th>Branch/Sem</th>
                                <th>Year</th>
                                <th>Uploader</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {papers.map(paper => (
                                <tr key={paper.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>
                                        <strong>{paper.subject}</strong>
                                    </td>
                                    <td>{paper.branch} / Sem {paper.semester}</td>
                                    <td>{paper.year}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {(paper.uploadedBy?.name || paper.uploadedBy?.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span>{paper.uploadedBy?.name || paper.uploadedBy?.username}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {paper.driveFileId && (
                                                <a 
                                                    href={paper.driveFileId} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="btn" 
                                                    style={{ padding: '5px 15px', fontSize: '0.8rem', borderRadius: '6px', background: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(0,212,255,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <i className="fas fa-eye"></i> View
                                                </a>
                                            )}
                                            <button 
                                                className="btn-primary" 
                                                style={{ padding: '5px 15px', fontSize: '0.8rem', borderRadius: '6px' }}
                                                onClick={() => handleAction(paper.id, 'approve')}
                                            >
                                                <i className="fas fa-check"></i> Approve
                                            </button>
                                            <button 
                                                className="btn" 
                                                style={{ padding: '5px 15px', fontSize: '0.8rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                                                onClick={() => handleAction(paper.id, 'reject')}
                                            >
                                                <i className="fas fa-times"></i> Reject
                                            </button>
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

export default PendingPapersAdmin;
