import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPromptModal from '../components/AuthPromptModal';
import API_BASE_URL from '../config';
import '../styles/papers.css'; // Reuses the unified glassmorphic layout

const Notes = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    // Data States
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [deptList, setDeptList] = useState([]);

    // File Explorer Navigation States
    const [activeRoot, setActiveRoot] = useState(null); // String: the active root folder being browsed
    const [currentPath, setCurrentPath] = useState([]); // Array of strings: active nested directories path

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

    // File Explorer Navigation Logic
    const handleFolderClick = (folderName) => {
        setActiveRoot(folderName);
        setCurrentPath([]);
    };

    const navigateToSubfolder = (subfolderName) => {
        setCurrentPath(prev => [...prev, subfolderName]);
    };

    const handleBreadcrumbClick = (index) => {
        if (index === 0) {
            // "Study Notes" root clicked -> exit explorer
            setActiveRoot(null);
            setCurrentPath([]);
        } else if (index === 1) {
            // Root folder clicked
            setCurrentPath([]);
        } else {
            // Subfolder in breadcrumbs clicked -> slice path up to that segment
            setCurrentPath(currentPath.slice(0, index - 1));
        }
    };

    // Get current directory contents
    let currentDir = activeRoot ? directoryTree[activeRoot] : null;
    if (currentDir) {
        currentPath.forEach(segment => {
            if (currentDir && currentDir.children[segment]) {
                currentDir = currentDir.children[segment];
            }
        });
    }

    const currentDirContents = currentDir ? Object.values(currentDir.children) : [];

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
        setUploadProgress({ current: 0, total: uploadFiles.length });
        let failed = 0;

        try {
            // Upload each file individually to avoid Render nginx 413 proxy limit
            for (let i = 0; i < uploadFiles.length; i++) {
                const file = uploadFiles[i];
                const path = uploadPaths[i];

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

                setUploadProgress({ current: i + 1, total: uploadFiles.length });
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
            setUploadProgress({ current: 0, total: 0 });
            fetchNotes();
        } catch (e) {
            showToast({ message: 'Network error occurred during folder upload', type: 'error' });
        } finally {
            setUploading(false);
            setUploadProgress({ current: 0, total: 0 });
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
                                if (activeRoot === rootFolder) {
                                    setActiveRoot(null);
                                    setCurrentPath([]);
                                }
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
                    {!activeRoot ? (
                        <>
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
                        </>
                    ) : (
                        /* Native Desktop File Explorer Breadcrumb navigation header */
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <span onClick={() => handleBreadcrumbClick(0)} style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}>
                                <i className="fas fa-hdd"></i> Notes Hub
                            </span>
                            <i className="fas fa-chevron-right" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}></i>

                            <span onClick={() => handleBreadcrumbClick(1)} style={{ cursor: 'pointer', color: '#fff', fontWeight: '600' }}>
                                {activeRoot}
                            </span>

                            {currentPath.map((folder, index) => (
                                <React.Fragment key={index}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}></i>
                                    <span
                                        onClick={() => handleBreadcrumbClick(index + 2)}
                                        style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                                    >
                                        {folder}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                {/* Explorer Display Viewport */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4rem 0' }}>
                        <div className="premium-loader-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
                        <p style={{ marginTop: '1.2rem', color: 'var(--text-secondary)' }}>Analyzing directory hierarchy...</p>
                    </div>
                ) : !activeRoot ? (
                    /* 1. Root Directories Catalog List */
                    filteredRoots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', margin: '2rem 0' }}>
                            <i className="fas fa-folder-open" style={{ fontSize: '3.2rem', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }}></i>
                            <h3>No Directories Available</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Check your filters or upload a folder structure to begin.</p>
                        </div>
                    ) : (
                        <div className="papers-grid" style={{ marginTop: '2rem' }}>
                            {filteredRoots.map(folder => (
                                <motion.div
                                    key={folder.name}
                                    layout
                                    className="paper-card"
                                    whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0, 212, 255, 0.15)' }}
                                    style={{
                                        background: 'rgba(22, 22, 34, 0.75)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '20px',
                                        padding: '1.6rem',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                    onClick={() => handleFolderClick(folder.name)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                                        <i className="fas fa-folder" style={{ fontSize: '2.5rem', color: '#ffd700', filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))' }}></i>
                                        <span className={getVisibilityBadgeClass(folder.meta.visibility)}>
                                            {getVisibilityLabel(folder.meta.visibility)}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700', marginBottom: '0.8rem' }}>
                                        {folder.name}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                        {folder.meta.subject && <div><i className="fas fa-book"></i> Subject: {folder.meta.subject.toUpperCase()}</div>}
                                        {folder.meta.semester ? <div><i className="fas fa-university"></i> Semester {folder.meta.semester}</div> : null}
                                        {folder.meta.branch ? <div><i className="fas fa-graduation-cap"></i> Target: {folder.meta.branch}</div> : null}
                                    </div>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                            Open Directory <i className="fas fa-chevron-right" style={{ fontSize: '0.75rem', marginLeft: '0.2rem' }}></i>
                                        </span>

                                        {isAdmin && (
                                            <button
                                                onClick={(e) => handleDeleteRootFolder(folder.name, e)}
                                                className="action-btn delete-btn"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '0.5rem',
                                                    border: 'none',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#EF4444',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    /* 2. Hierarchical File Explorer Viewport */
                    <div style={{
                        background: 'rgba(22, 22, 34, 0.65)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '24px',
                        padding: '2rem',
                        marginTop: '2rem',
                        minHeight: '400px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                            <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <i className="fas fa-folder-open" style={{ color: '#ffd700' }}></i>
                                {currentPath.length > 0 ? currentPath[currentPath.length - 1] : activeRoot}
                            </h3>
                            <button
                                onClick={() => handleBreadcrumbClick(currentPath.length)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <i className="fas fa-level-up-alt"></i> Back Up
                            </button>
                        </div>

                        {currentDirContents.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>This folder is empty.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.2rem' }}>
                                {currentDirContents.map(item => {
                                    const isDirectory = item.isDirectory;
                                    const isPublic = !isDirectory && item.visibility?.toUpperCase() === 'ALL';
                                    const token = getToken();
                                    const isLocked = !isDirectory && !isPublic && !token;

                                    return (
                                        <motion.div
                                            key={item.name}
                                            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.04)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => isDirectory ? navigateToSubfolder(item.name) : handleViewFile(item)}
                                            style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                                borderRadius: '16px',
                                                padding: '1.2rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                        >
                                            {isDirectory ? (
                                                <>
                                                    <i className="fas fa-folder" style={{ fontSize: '3rem', color: '#ffd700', marginBottom: '0.8rem', filter: 'drop-shadow(0 2px 6px rgba(255, 215, 0, 0.2))' }}></i>
                                                    <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600', wordBreak: 'break-word' }}>
                                                        {item.name}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-file-pdf" style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '0.8rem', filter: 'drop-shadow(0 2px 6px rgba(239, 68, 68, 0.2))' }}></i>
                                                    <span style={{ fontSize: '0.9rem', color: '#ECEFF1', fontWeight: '500', wordBreak: 'break-word', marginBottom: '0.4rem' }}>
                                                        {item.name}
                                                    </span>
                                                    {isLocked ? (
                                                        <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                            <i className="fas fa-lock"></i> Locked
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                            <i className="fas fa-eye"></i> View PDF
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
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
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Supports nested folders — entire hierarchy preserved</span>
                                        </>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Directory Selection Input</label>
                                    <input
                                        type="file"
                                        webkitdirectory="true"
                                        directory="true"
                                        multiple
                                        required={uploadFiles.length === 0}
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
                                        style={{ border: 'none', padding: '0.2rem 0' }}
                                    />
                                </div>

                                {uploading && uploadProgress.total > 0 && (
                                    <div style={{ margin: '0.5rem 0', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.8rem 1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            <span><i className="fas fa-cloud-upload-alt" style={{ color: 'var(--primary)', marginRight: '0.4rem' }}></i>Uploading files...</span>
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
