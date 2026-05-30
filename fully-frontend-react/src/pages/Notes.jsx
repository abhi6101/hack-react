import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPromptModal from '../components/AuthPromptModal';
import API_BASE_URL from '../config';
import '../styles/papers.css'; // Reuses the unified glassmorphic layout

const TreeNode = ({ node, level, handleViewFile, getToken }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!node.isDirectory) {
        const isPublic = node.visibility?.toUpperCase() === 'ALL';
        const token = getToken();
        const isLocked = !isPublic && !token;
        
        return (
            <motion.div
                whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                onClick={() => handleViewFile(node)}
                style={{
                    padding: `0.5rem 1rem`,
                    paddingLeft: `${(level * 1.5) + 1.5}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    transition: 'color 0.2s'
                }}
            >
                <i className="fas fa-file-pdf" style={{ color: '#EF4444', fontSize: '1.2rem' }}></i>
                <span style={{ flex: 1, fontSize: '0.95rem' }}>{node.name}</span>
                {isLocked ? (
                    <i className="fas fa-lock" style={{ color: '#EF4444', fontSize: '0.8rem' }}></i>
                ) : (
                    <i className="fas fa-eye" style={{ color: '#10B981', fontSize: '0.8rem' }}></i>
                )}
            </motion.div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <motion.div
                whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: `0.6rem 1rem`,
                    paddingLeft: `${(level * 1.5) + 1.5}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.02)'
                }}
            >
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', width: '12px', textAlign: 'center' }}></i>
                <i className={`fas fa-folder${isExpanded ? '-open' : ''}`} style={{ color: '#ffd700', fontSize: '1.2rem' }}></i>
                <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{node.name}</span>
            </motion.div>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {Object.values(node.children).map(child => (
                            <TreeNode 
                                key={child.name} 
                                node={child} 
                                level={level + 1} 
                                handleViewFile={handleViewFile} 
                                getToken={getToken}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Notes = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const fileInputRef = useRef(null);

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
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [dragActive, setDragActive] = useState(false);

    // Form States
    const [uploadTitle, setUploadTitle] = useState(''); // Groups all files under this root folder
    const [uploadSubject, setUploadSubject] = useState('');
    const [uploadSemester, setUploadSemester] = useState('');
    const [uploadBranch, setUploadBranch] = useState('');
    const [uploadVisibility, setUploadVisibility] = useState('ALL'); // ALL (All students), BRANCH (Targeted branch/sem), ADMIN (Private)
    const [uploadFiles, setUploadFiles] = useState([]); // Array of files
    const [uploadPaths, setUploadPaths] = useState([]); // Array of relative paths matching files

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
                if (data.role === 'STUDENT' && data.branch) {
                    setBranchFilter(data.branch);
                }
            }
        } catch (e) {
            console.error("Failed to fetch user profile", e);
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

    // Tree Builder: Reconstruct flat notes array into a folder tree
    const buildDirectoryTree = (notesList) => {
        const rootDirs = {};

        notesList.forEach(note => {
            const path = note.relativePath || note.title;
            const parts = path.split('/');
            
            const rootName = note.rootFolder || parts[0];
            if (!rootDirs[rootName]) {
                rootDirs[rootName] = {
                    name: rootName,
                    isDirectory: true,
                    children: {},
                    meta: {
                        subject: note.subject,
                        semester: note.semester,
                        branch: note.branch,
                        visibility: note.visibility,
                        uploadedAt: note.uploadedAt
                    }
                };
            }

            let current = rootDirs[rootName];
            // Traverse down tree building directory nodes
            for (let j = 1; j < parts.length; j++) {
                const part = parts[j];
                const isLast = j === parts.length - 1;

                if (!current.children[part]) {
                    if (isLast) {
                        current.children[part] = {
                            ...note,
                            name: part,
                            isDirectory: false
                        };
                    } else {
                        current.children[part] = {
                            name: part,
                            isDirectory: true,
                            children: {}
                        };
                    }
                }
                current = current.children[part];
            }
        });

        return rootDirs;
    };

    const directoryTree = buildDirectoryTree(notes);

    // Filtered list of Root Folders
    const filteredRoots = Object.values(directoryTree).filter(folder => {
        const matchesQuery = searchQuery === '' || 
            folder.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (folder.meta.subject && folder.meta.subject.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSemester = semesterFilter === '' || 
            (folder.meta.semester && folder.meta.semester.toString() === semesterFilter);

        const matchesBranch = branchFilter === '' || 
            (folder.meta.branch && folder.meta.branch.trim().toLowerCase() === branchFilter.trim().toLowerCase());

        return matchesQuery && matchesSemester && matchesBranch;
    });



    // Helper: read ALL entries from a DirectoryReader (browser caps readEntries at 100 per call)
    const readAllEntries = async (dirReader) => {
        const allEntries = [];
        while (true) {
            const batch = await new Promise((resolve, reject) =>
                dirReader.readEntries(resolve, reject)
            );
            if (batch.length === 0) break; // Empty batch = all entries read
            allEntries.push(...batch);
        }
        return allEntries;
    };

    // Drag-and-drop directory parsing using HTML5 Directory FileSystem API
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const items = e.dataTransfer.items;
        const filesList = [];
        const pathsList = [];

        const traverseFileTree = async (item, path = "") => {
            if (item.isFile) {
                const file = await new Promise((resolve, reject) => item.file(resolve, reject));
                // Only support PDF notes
                if (file.name.toLowerCase().endsWith('.pdf')) {
                    filesList.push(file);
                    pathsList.push(path + file.name);
                }
            } else if (item.isDirectory) {
                const dirReader = item.createReader();
                // Use repeated readEntries calls — browser only returns ≤100 entries per call
                const entries = await readAllEntries(dirReader);
                for (const entry of entries) {
                    await traverseFileTree(entry, path + item.name + "/");
                }
            }
        };

        // Process all dropped items sequentially to preserve structure
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) {
                await traverseFileTree(entry);
            }
        }

        if (filesList.length > 0) {
            setUploadFiles(filesList);
            setUploadPaths(pathsList);
            // Autofill Title with the root directory name
            const firstPath = pathsList[0];
            if (firstPath && firstPath.includes("/")) {
                setUploadTitle(firstPath.substring(0, firstPath.indexOf("/")));
            }
            showToast({ message: `Loaded ${filesList.length} PDFs from folder tree!`, type: 'success' });
        } else {
            showToast({ message: 'No PDF notes found inside dropped directory.', type: 'warning' });
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) {
            showToast({ message: 'Please select a directory or drop folders to upload', type: 'warning' });
            return;
        }

        setUploading(true);
        setUploadProgress({ current: 0, total: uploadFiles.length, currentFileName: '' });
        let failed = 0;

        try {
            // Upload each file individually to avoid Render nginx 413 proxy limit
            for (let i = 0; i < uploadFiles.length; i++) {
                const file = uploadFiles[i];
                const path = uploadPaths[i];
                
                setUploadProgress({ current: i, total: uploadFiles.length, currentFileName: file.name });

                const formData = new FormData();
                formData.append('title', uploadTitle);
                formData.append('subject', uploadSubject);
                if (uploadSemester) formData.append('semester', uploadSemester);
                if (uploadBranch) formData.append('branch', uploadBranch);
                formData.append('visibility', uploadVisibility);
                formData.append('files', file);
                formData.append('paths', path);

                try {
                    const res = await fetch(`${API_BASE_URL}/notes/upload-folder`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${getToken()}` },
                        body: formData
                    });
                    if (!res.ok) failed++;
                } catch (_) {
                    failed++;
                }

                setUploadProgress({ current: i + 1, total: uploadFiles.length, currentFileName: file.name });
            }

            if (failed === 0) {
                showToast({ message: `All ${uploadFiles.length} notes uploaded successfully!`, type: 'success' });
            } else {
                showToast({ message: `Upload complete with ${failed} failure(s). Check the folder.`, type: 'warning' });
            }

            setShowUploadModal(false);
            setUploadTitle('');
            setUploadSubject('');
            setUploadSemester('');
            setUploadBranch('');
            setUploadVisibility('ALL');
            setUploadFiles([]);
            setUploadPaths([]);
            setUploadProgress({ current: 0, total: 0, currentFileName: '' });
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchNotes();
        } catch (e) {
            showToast({ message: 'Network error occurred during folder upload', type: 'error' });
        } finally {
            setUploading(false);
            setUploadProgress({ current: 0, total: 0, currentFileName: '' });
        }
    };

    const handleDeleteRootFolder = async (rootFolder, e) => {
        e.stopPropagation();
        showAlert({
            title: 'Delete Notes Folder',
            message: `Are you sure you want to permanently delete the entire '${rootFolder}' directory and all nested subfolders?`,
            type: 'danger',
            actions: [
                { label: 'Cancel', primary: false },
                {
                    label: 'Delete All',
                    primary: true,
                    onClick: async () => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/notes/root/${rootFolder}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${getToken()}` }
                            });
                            if (res.ok) {
                                showToast({ message: 'Notes directory deleted successfully', type: 'success' });
                                fetchNotes();
                            } else {
                                showToast({ message: 'Failed to delete directory', type: 'error' });
                            }
                        } catch (e) {
                            showToast({ message: 'Connection error during deletion', type: 'error' });
                        }
                    }
                }
            ]
        });
    };

    const handleViewFile = (note) => {
        const token = getToken();
        const vis = note.visibility || 'ALL';

        if (vis?.toUpperCase() === 'ALL') {
            window.open(`${API_BASE_URL}/notes/download/${note.id}`, '_blank');
        } else if (!token) {
            setShowAuthModal(true);
        } else {
            window.open(`${API_BASE_URL}/notes/download/${note.id}?token=${token}`, '_blank');
        }
    };

    const getVisibilityLabel = (vis) => {
        if (vis?.toUpperCase() === 'ALL') return 'All Students';
        if (vis?.toUpperCase() === 'BRANCH') return 'Branch Only';
        return 'Admin Private';
    };

    const getVisibilityBadgeClass = (vis) => {
        if (vis?.toUpperCase() === 'ALL') return 'visibility-badge public';
        if (vis?.toUpperCase() === 'BRANCH') return 'visibility-badge branch';
        return 'visibility-badge admin';
    };

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN'].includes(userRole);

    return (
        <div className="papers-container" style={{ minHeight: '90vh', paddingTop: '6.5rem' }}>
            <Helmet>
                <title>Study Notes Explorer - Hack-2-Hired</title>
            </Helmet>

            {/* Header section */}
            <div className="papers-header">
                <motion.h1
                    initial={{ opacity: 0, y: -25 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="papers-title"
                >
                    Study Notes <span>Explorer</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="papers-subtitle"
                >
                    Browse full course syllabus folders, unit notes, and lecture resources mapped exactly in their original hierarchy.
                </motion.p>
            </div>

            <div className="papers-content-wrapper">
                {/* Search, Filter, and breadcrumbs section */}
                <div className="papers-search-section">
                    <div className="search-bar-container">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search folders by subject code, title or syllabus topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="papers-search-input"
                        />
                    </div>

                    <div className="filters-grid" style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
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

                        <div className="filter-select-wrapper" style={{ flex: 1, minWidth: '180px' }}>
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="papers-search-input"
                                style={{ padding: '0.8rem 1rem' }}
                                disabled={userRole === 'STUDENT'}
                            >
                                <option value="">All Branches</option>
                                {deptList.map(dept => (
                                    <option key={dept.id} value={dept.code}>{dept.name} ({dept.code})</option>
                                ))}
                                {!deptList.some(d => d.code === 'IMCA') && <option value="IMCA">IMCA</option>}
                            </select>
                        </div>

                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn btn-primary"
                                onClick={() => setShowUploadModal(true)}
                                style={{ borderRadius: '12px', padding: '0.8rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
                            >
                                <i className="fas fa-folder-plus"></i> Upload Folder
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Explorer Display Viewport */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4rem 0' }}>
                        <div className="premium-loader-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                        <p style={{ marginTop: '1.2rem', color: 'var(--text-secondary)' }}>Analyzing directory hierarchy...</p>
                    </div>
                ) : filteredRoots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', margin: '2rem 0' }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '3.2rem', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }}></i>
                        <h3>No Directories Available</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Check your filters or upload a folder structure to begin.</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredRoots.map(folder => (
                            <div
                                key={folder.name}
                                style={{
                                    background: 'rgba(22, 22, 34, 0.75)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '20px',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Root Folder Header */}
                                <div style={{ 
                                    padding: '1.6rem', 
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                        <i className="fas fa-archive" style={{ fontSize: '2.5rem', color: '#00d4ff', filter: 'drop-shadow(0 2px 8px rgba(0, 212, 255, 0.3))' }}></i>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                                                <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>{folder.name}</h3>
                                                <span className={getVisibilityBadgeClass(folder.meta.visibility)}>
                                                    {getVisibilityLabel(folder.meta.visibility)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {folder.meta.subject && <span><i className="fas fa-book"></i> {folder.meta.subject.toUpperCase()}</span>}
                                                {folder.meta.semester ? <span><i className="fas fa-university"></i> Semester {folder.meta.semester}</span> : null}
                                                {folder.meta.branch ? <span><i className="fas fa-graduation-cap"></i> {folder.meta.branch}</span> : null}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => handleDeleteRootFolder(folder.name, e)}
                                            className="action-btn delete-btn"
                                            style={{
                                                borderRadius: '8px',
                                                padding: '0.6rem 1rem',
                                                border: 'none',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#EF4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <i className="fas fa-trash-alt"></i> Delete Subject
                                        </button>
                                    )}
                                </div>
                                
                                {/* Root Folder Tree Contents */}
                                <div style={{ padding: '0.5rem 0' }}>
                                    {Object.values(folder.children).length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>This subject folder is empty.</p>
                                    ) : (
                                        Object.values(folder.children).map(child => (
                                            <TreeNode 
                                                key={child.name} 
                                                node={child} 
                                                level={0} 
                                                handleViewFile={handleViewFile} 
                                                getToken={getToken} 
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Modal: UPLOAD NOTES DIRECTORY FOLDER */}
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
                                maxWidth: '550px',
                                width: '100%',
                                padding: '2.5rem',
                                background: 'rgba(22, 22, 34, 0.85)',
                                border: '1px solid rgba(0, 212, 255, 0.15)',
                                borderRadius: '24px',
                                position: 'relative'
                            }}
                        >
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
                                Upload Study <span>Directory</span>
                            </h2>

                            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div className="input-group">
                                    <label>Root Folder Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Soft Computing Unit notes"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Subject / Course Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Soft Computing, MCA-302"
                                        value={uploadSubject}
                                        onChange={(e) => setUploadSubject(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label>Semester Target</label>
                                        <select
                                            value={uploadSemester}
                                            onChange={(e) => setUploadSemester(e.target.value)}
                                            className="papers-search-input"
                                            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.9rem', color: '#fff' }}
                                        >
                                            <option value="" style={{ color: '#000' }}>All Semesters</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                <option key={sem} value={sem} style={{ color: '#000' }}>Sem {sem}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group" style={{ flex: 1 }}>
                                        <label>Branch Target</label>
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
                                    <label>Access Visibility Permission</label>
                                    <select
                                        value={uploadVisibility}
                                        onChange={(e) => setUploadVisibility(e.target.value)}
                                        className="papers-search-input"
                                        style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.9rem', color: '#fff' }}
                                    >
                                        <option value="ALL" style={{ color: '#000' }}>Show to All Students (Visible to everyone)</option>
                                        <option value="BRANCH" style={{ color: '#000' }}>Branch/Semester Specific (Access controlled)</option>
                                    </select>
                                </div>

                                {/* Drag-and-drop Directory Area */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    style={{
                                        border: `2px dashed ${dragActive ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
                                        background: dragActive ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255,255,255,0.01)',
                                        borderRadius: '16px',
                                        padding: '2rem 1rem',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', color: dragActive ? 'var(--primary)' : 'var(--text-secondary)' }}></i>
                                    {uploadFiles.length > 0 ? (
                                        <div style={{ width: '100%', textAlign: 'left' }}>
                                            <span style={{ color: '#10B981', fontWeight: 'bold', display: 'block', marginBottom: '0.6rem', textAlign: 'center' }}>
                                                ✓ {uploadFiles.length} PDFs detected — folder tree:
                                            </span>
                                            {/* Folder Tree Preview */}
                                            <div style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '10px',
                                                padding: '0.8rem 1rem',
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                maxHeight: '160px',
                                                overflowY: 'auto',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {(() => {
                                                    // Build folder tree from paths for preview
                                                    const folderMap = {};
                                                    uploadPaths.forEach(p => {
                                                        const parts = p.split('/');
                                                        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
                                                        if (!folderMap[folder]) folderMap[folder] = [];
                                                        folderMap[folder].push(parts[parts.length - 1]);
                                                    });
                                                    return Object.entries(folderMap).map(([folder, files]) => (
                                                        <div key={folder} style={{ marginBottom: '0.4rem' }}>
                                                            <div style={{ color: '#ffd700', fontWeight: 'bold' }}>
                                                                <i className="fas fa-folder" style={{ marginRight: '0.4rem', fontSize: '0.7rem' }}></i>
                                                                {folder}
                                                            </div>
                                                            {files.map(f => (
                                                                <div key={f} style={{ paddingLeft: '1.4rem', color: '#EF4444' }}>
                                                                    <i className="fas fa-file-pdf" style={{ marginRight: '0.35rem', fontSize: '0.65rem' }}></i>
                                                                    {f}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Drag & Drop Complete Study Folders Here</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Or click to browse (supports nested folders)</span>
                                        </>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    webkitdirectory="true"
                                    directory="true"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        // Only select PDF notes
                                        const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
                                        if (pdfFiles.length > 0) {
                                            setUploadFiles(pdfFiles);
                                            setUploadPaths(pdfFiles.map(f => f.webkitRelativePath || f.name));
                                            // Preload directory title
                                            const firstPath = pdfFiles[0].webkitRelativePath || pdfFiles[0].name;
                                            if (firstPath && firstPath.includes("/")) {
                                                setUploadTitle(firstPath.substring(0, firstPath.indexOf("/")));
                                            }
                                        } else {
                                            showToast({ message: 'No PDF notes found in selected directory.', type: 'warning' });
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />

                                {uploading && uploadProgress.total > 0 && (
                                    <div style={{ margin: '0.5rem 0', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.8rem 1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            <span>
                                                <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--primary)', marginRight: '0.4rem' }}></i>
                                                Uploading: <span style={{ color: '#fff', fontWeight: '500' }}>{uploadProgress.currentFileName || '...'}</span>
                                            </span>
                                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{uploadProgress.current} / {uploadProgress.total}</span>
                                        </div>
                                        <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                borderRadius: '99px',
                                                background: 'linear-gradient(90deg, var(--primary), #7c3aed)',
                                                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                    </div>
                                )}

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
                                            <span>Uploading {uploadProgress.current}/{uploadProgress.total} files...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            <span>Upload Complete Folder Structure</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default Notes;
