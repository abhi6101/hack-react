import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useToast } from '../components/CustomToast';

const AdminPaperManager = () => {
    const { showToast } = useToast();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [semester, setSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const [isAddingNewBranch, setIsAddingNewBranch] = useState(false);
    const [newBranchData, setNewBranchData] = useState({ name: '', code: '' });

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchDepartments();
        fetchPapers();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDepartments(await res.json());
        } catch (e) {
            console.error("Failed to fetch departments", e);
        }
    };

    const handleQuickAddBranch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: newBranchData.name,
                    code: newBranchData.code,
                    maxSemesters: 8 // Default
                })
            });
            if (res.ok) {
                showToast({ message: 'Branch created successfully!', type: 'success' });
                await fetchDepartments();
                setSelectedDept(newBranchData.code);
                setIsAddingNewBranch(false);
                setNewBranchData({ name: '', code: '' });
            } else {
                const err = await res.text();
                showToast({ message: err || 'Failed to create branch', type: 'error' });
            }
        } catch (e) {
            showToast({ message: 'Error creating branch', type: 'error' });
        }
    };

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
            console.error("Failed to fetch papers", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            showToast({ message: 'Please select at least one file', type: 'error' });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('branch', selectedDept);
        formData.append('semester', semester);
        formData.append('subject', subject);
        formData.append('year', year);
        formData.append('title', subject);
        formData.append('category', 'End-Sem');

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/papers/upload-multiple`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                showToast({ message: 'Papers uploaded successfully!', type: 'success' });
                setFiles([]);
                setSubject('');
                fetchPapers();
                // Clear the file input manually
                const fileInput = document.getElementById('paper-files');
                if (fileInput) fileInput.value = '';
            } else {
                const errorText = await res.text();
                showToast({ message: `Upload failed: ${errorText}`, type: 'error' });
            }
        } catch (e) {
            console.error("Upload error", e);
            showToast({ message: 'Error uploading files', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this paper permanently?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/papers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPapers(papers.filter(p => p.id !== id));
                showToast({ message: 'Paper deleted', type: 'success' });
            } else {
                showToast({ message: 'Failed to delete paper', type: 'error' });
            }
        } catch (e) {
            showToast({ message: 'Delete failed', type: 'error' });
        }
    };

    return (
        <div className="admin-paper-manager" style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card surface-glow">
                <div className="card-header">
                    <h3><i className="fas fa-file-upload"></i> Upload Question Papers</h3>
                </div>

                {isAddingNewBranch ? (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}><i className="fas fa-plus-circle"></i> Quick Add Branch</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Branch Name</label>
                                <input type="text" className="form-control" placeholder="e.g. Mechanical Engineering" value={newBranchData.name} onChange={e => setNewBranchData({ ...newBranchData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Branch Code (Unique)</label>
                                <input type="text" className="form-control" placeholder="e.g. ME" value={newBranchData.code} onChange={e => setNewBranchData({ ...newBranchData, code: e.target.value.toUpperCase() })} />
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={handleQuickAddBranch}>Save Branch</button>
                            <button className="btn btn-secondary" onClick={() => setIsAddingNewBranch(false)}>Cancel</button>
                        </div>
                    </div>
                ) : null}

                <form onSubmit={handleUpload}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Branch / Department</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className="form-control"
                                    style={{ flex: 1 }}
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    required={!isAddingNewBranch}
                                    disabled={isAddingNewBranch}
                                >
                                    <option value="">Select Branch</option>
                                    {departments.map(dept => (
                                        <option key={dept.code} value={dept.code}>{dept.name} ({dept.code})</option>
                                    ))}
                                </select>
                                <button type="button" className="btn btn-secondary" title="Add New Branch" onClick={() => setIsAddingNewBranch(true)}>
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <select
                                className="form-control"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                            >
                                <option value="">Select Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                    <option key={s} value={s}>Semester {s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Subject Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Data Structures"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Exam Year</label>
                            <input
                                type="number"
                                className="form-control"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Select PDF Files (One or more)</label>
                            <div
                                style={{
                                    border: '1px dashed var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('paper-files').click()}
                            >
                                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                                <p style={{ margin: 0 }}>Click to select files or drag and drop</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accepts multiple PDF files</p>
                                <input
                                    type="file"
                                    id="paper-files"
                                    style={{ display: 'none' }}
                                    multiple
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {files.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong style={{ color: 'var(--primary)' }}>Selected Files ({files.length}):</strong>
                                    <ul style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', listStyle: 'none', padding: 0 }}>
                                        {files.map((file, i) => (
                                            <li key={i}><i className="fas fa-file-pdf" style={{ marginRight: '8px', color: '#ff477b' }}></i>{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={isUploading || !selectedDept || !semester}>
                            {isUploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-upload"></i> Upload Papers</>}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setFiles([]); setSubject(''); }}>
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            <div className="card surface-glow">
                <div className="card-header">
                    <h3><i className="fas fa-list"></i> Managed Papers</h3>
                    <button className="btn btn-secondary btn-sm" onClick={fetchPapers}>
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                {loading ? <div className="loading-indicator">Loading papers...</div> : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Branch</th>
                                    <th>Sem</th>
                                    <th>Year</th>
                                    <th>Date Added</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {papers.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No papers found in the database.</td></tr>
                                ) : (
                                    papers.map(paper => (
                                        <tr key={paper.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <i className="fas fa-file-pdf" style={{ color: '#ff477b' }}></i>
                                                    <strong>{paper.title}</strong>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-primary">{paper.branch}</span></td>
                                            <td>Sem {paper.semester}</td>
                                            <td>{paper.year}</td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {paper.uploadedAt ? new Date(paper.uploadedAt).toLocaleString() : 'N/A'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <a href={`${API_BASE_URL.replace('/api', '')}${paper.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>
                                                        <i className="fas fa-eye"></i>
                                                    </a>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(paper.id)} style={{ padding: '4px 8px' }}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPaperManager;
