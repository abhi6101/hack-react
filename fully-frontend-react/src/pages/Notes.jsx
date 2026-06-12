import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPromptModal from '../components/AuthPromptModal';
import API_BASE_URL from '../config';
import '../styles/papers.css'; // Reuses the unified glassmorphic layout

const TreeNode = ({ node, level, handleViewFile, handleDownloadFile, handleDeleteFile, isAdmin, getToken, notesDownloadEnabled }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!node.isDirectory) {
        const token = getToken();
        const isLocked = !token; // All files require login to view now

        // Determine icon and color based on file extension
        let fileIcon = 'fa-file-alt';
        let iconColor = '#9CA3AF'; // Default gray
        const ext = node.name.substring(node.name.lastIndexOf('.')).toLowerCase();
        if (ext === '.pdf') { fileIcon = 'fa-file-pdf'; iconColor = '#EF4444'; }
        else if (ext === '.ppt' || ext === '.pptx') { fileIcon = 'fa-file-powerpoint'; iconColor = '#F97316'; }
        else if (ext === '.doc' || ext === '.docx') { fileIcon = 'fa-file-word'; iconColor = '#3B82F6'; }
        else if (ext === '.xls' || ext === '.xlsx' || ext === '.csv') { fileIcon = 'fa-file-excel'; iconColor = '#10B981'; }
        else if (ext === '.txt') { fileIcon = 'fa-file-lines'; iconColor = '#D1D5DB'; }
        
        return (
            <motion.div
                whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                onClick={() => handleViewFile(node)}
                style={{
                    padding: `0.7rem 1rem`,
                    paddingLeft: `${(level * 1.5) + 1.5}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                    borderBottom: '1px solid rgba(255,255,255,0.015)',
                    transition: 'all 0.2s',
                    position: 'relative'
                }}
            >
                {/* Vertical tree line */}
                {level > 0 && <div style={{ position: 'absolute', left: `${((level - 1) * 1.5) + 1.8}rem`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }}></div>}
                
                <i className={`fas ${fileIcon}`} style={{ color: iconColor, fontSize: '1.2rem', filter: `drop-shadow(0 2px 4px ${iconColor}40)`, zIndex: 1 }}></i>
                <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500', color: '#FFFFFF' }}>{node.name}</span>
                {isLocked ? (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#EF4444', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="fas fa-lock"></i> Locked
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div 
                            onClick={(e) => { e.stopPropagation(); handleViewFile(node); }}
                            style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#10B981', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <i className="fas fa-eye"></i> View
                        </div>
                        <div 
                            onClick={(e) => { e.stopPropagation(); handleDownloadFile(node); }}
                            style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <i className="fas fa-download"></i> Download
                        </div>
                        {isAdmin && handleDeleteFile && (
                            <div 
                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(node); }}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#EF4444', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <i className="fas fa-trash-alt"></i> Delete
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {level > 0 && <div style={{ position: 'absolute', left: `${((level - 1) * 1.5) + 1.8}rem`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }}></div>}
            <motion.div
                className={level === 0 ? "unit-card-header" : ""}
                whileHover={{ background: level === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)' }}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: level === 0 ? '1.5rem' : `0.7rem 1rem`,
                    paddingLeft: level === 0 ? '1.5rem' : `${(level * 1.5) + 1.5}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    background: isExpanded ? (level === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)') : (level === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'),
                    borderBottom: level === 0 ? 'none' : '1px solid rgba(255,255,255,0.015)',
                    border: level === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderRadius: level === 0 ? '16px' : '0',
                    zIndex: 1,
                    transition: 'all 0.3s ease'
                }}
            >
                {level !== 0 && (
                    <div style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>
                        <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}></i>
                    </div>
                )}
                <i className={`fas fa-folder${isExpanded ? '-open' : ''}`} style={{ color: '#ffd700', fontSize: level === 0 ? '2.5rem' : '1.2rem', filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.2))' }}></i>
                <span className={level === 0 ? "unit-card-title" : ""} style={{ color: '#fff', fontWeight: '600', fontSize: level === 0 ? '1.1rem' : '0.95rem' }}>{node.name}</span>
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
                                handleDownloadFile={handleDownloadFile}
                                handleDeleteFile={handleDeleteFile}
                                isAdmin={isAdmin}
                                getToken={getToken}
                                notesDownloadEnabled={notesDownloadEnabled}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Notes = ({ isAdminView }) => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const fileInputRef = useRef(null);

    // Data States
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [semesterFilter, setSemesterFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [deptList, setDeptList] = useState([]);
    const [showBranchMenu, setShowBranchMenu] = useState(false);

    // UI & Modal States
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [dragActive, setDragActive] = useState(false);

    // Form States
    const [uploadSemester, setUploadSemester] = useState('');
    const [uploadBranch, setUploadBranch] = useState('');
    const [uploadVisibility, setUploadVisibility] = useState('ALL'); // ALL (All students), BRANCH (Targeted branch/sem), ADMIN (Private)
    const [uploadFiles, setUploadFiles] = useState([]); // Array of files
    const [uploadPaths, setUploadPaths] = useState([]); // Array of relative paths matching files
    const [notesDownloadEnabled, setNotesDownloadEnabled] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Profile States
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const getToken = () => localStorage.getItem("authToken");

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/public/papers/settings`);
            if (res.ok) {
                const data = await res.json();
                setNotesDownloadEnabled(data.notesDownloadEnabled);
            }
        } catch (e) {
            console.error("Failed to fetch settings", e);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchNotes();
        fetchDepartments();
        fetchSettings();
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
        setDragActive(false);

        const items = e.dataTransfer.items;
        if (!items) return;

        const filesList = [];
        const pathsList = [];
        const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];

        const traverseFileTree = async (item, path = '') => {
            if (item.isFile) {
                const file = await new Promise((resolve, reject) => item.file(resolve, reject));
                const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (allowedExtensions.includes(ext)) {
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
            setUploadFiles(prev => [...prev, ...filesList]);
            setUploadPaths(prev => [...prev, ...pathsList]);
            showToast({ message: `Queued ${filesList.length} files from dropped folder(s)!`, type: 'success' });
        } else {
            showToast({ message: 'No supported study files (PDF, Word, PPT, Excel) found inside dropped directory.', type: 'warning' });
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

                const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                const currentTitle = path && path.includes("/") ? path.substring(0, path.indexOf("/")) : file.name.replace(ext, '');

                const formData = new FormData();
                formData.append('title', currentTitle);
                formData.append('subject', currentTitle);
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

    const handleDeleteFile = async (node) => {
        showAlert({
            title: 'Delete File',
            message: `Are you sure you want to permanently delete the file '${node.name}'?`,
            type: 'danger',
            actions: [
                { label: 'Cancel', primary: false },
                {
                    label: 'Delete',
                    primary: true,
                    onClick: async () => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/notes/${node.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${getToken()}` }
                            });
                            if (res.ok) {
                                showToast({ message: 'File deleted successfully', type: 'success' });
                                fetchNotes();
                            } else {
                                showToast({ message: 'Failed to delete file', type: 'error' });
                            }
                        } catch (e) {
                            showToast({ message: 'Connection error during deletion', type: 'error' });
                        }
                    }
                }
            ]
        });
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

        if (!token) {
            setShowAuthModal(true);
            return;
        }

        // Token exists, proceed to open PDF
        window.open(`${API_BASE_URL}/notes/download/${note.id}?token=${token}`, '_blank');
    };

    const handleDownloadFile = async (note) => {
        const token = getToken();

        if (!token) {
            setShowAuthModal(true);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/notes/download/${note.id}?token=${token}&action=DOWNLOAD`);
            if (!res.ok) throw new Error("Failed to download file");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', note.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            showToast({ message: 'File downloaded successfully!', type: 'success' });
        } catch (e) {
            console.error("Download error:", e);
            showToast({ message: 'Failed to download file.', type: 'error' });
        }
    };

    const getVisibilityLabel = (vis) => {
        if (vis?.toUpperCase() === 'ALL') return 'Public';
        if (vis?.toUpperCase() === 'BRANCH') return 'Branch';
        return 'Private';
    };

    const getVisibilityBadgeClass = (vis) => {
        if (vis?.toUpperCase() === 'ALL') return 'visibility-badge public';
        if (vis?.toUpperCase() === 'BRANCH') return 'visibility-badge branch';
        return 'visibility-badge admin';
    };

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN'].includes(userRole);

    return (
        <div className="container" style={{ 
            padding: isAdminView ? '0 0 2rem' : '104px 2rem 50px', 
            position: 'relative', 
            zIndex: 2, 
            minHeight: isAdminView ? 'auto' : '90vh' 
        }}>
            <Helmet>
                <title>RGPV IMCA Study Notes | Syllabus & Class Notes | Hack-2-Hired</title>
                <meta name="description" content="Download high-quality study notes, syllabuses, and subject guides for RGPV Integrated MCA (IMCA) and BCA. Perfect for your exam preparation." />
                <meta name="keywords" content="RGPV IMCA notes, Integrated MCA study material, IMCA syllabus, BCA notes, Hack2Hired notes, RGPV exam preparation" />
            </Helmet>

            {/* Unified Header section matching Papers.jsx */}
            <div className="papers-header-container">
                <div className="papers-header-left">
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', color: 'var(--text-primary)' }}>Study Notes <span style={{ color: 'var(--primary)' }}>Explorer</span></h2>
                    <p style={{ display: 'none' }} className="sr-only">
                        Browse full course syllabus folders, unit notes, and lecture resources mapped exactly in their original hierarchy.
                    </p>
                </div>

                <div className={`papers-header-right mobile-filters-wrapper ${isSearchFocused ? 'active-search' : ''}`} style={{ gap: '1rem', width: '100%', maxWidth: '500px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className={`global-search-container mobile-filter-search ${isSearchFocused ? 'is-focused' : ''}`} 
                        onClick={() => {
                            setIsSearchFocused(true);
                            setTimeout(() => document.getElementById('notesMobileSearchInput')?.focus(), 100);
                        }}
                        style={{
                        position: 'relative',
                        flex: 1.5,
                        minWidth: '140px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '50px',
                        padding: '0 1rem 0 2.5rem',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backdropFilter: 'blur(15px)',
                        transition: 'all 0.3s ease'
                    }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
                        <input
                            id="notesMobileSearchInput"
                            type="text"
                            placeholder="Search subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={(e) => { if (!e.target.value) setIsSearchFocused(false); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.95rem',
                                width: '100%',
                                height: '100%',
                                outline: 'none',
                                padding: '0'
                            }}
                        />
                        {searchQuery && (
                            <i 
                                className="fas fa-times" 
                                onClick={() => setSearchQuery('')}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                            ></i>
                        )}
                    </div>



                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn btn-primary"
                            onClick={() => setShowUploadModal(true)}
                            style={{ position: 'relative', zIndex: 10, borderRadius: '50px', padding: '0 1.2rem', height: '40px', display: 'flex', alignItems: 'center', gap: '0.6rem', width: 'fit-content', whiteSpace: 'nowrap', fontWeight: '600' }}
                        >
                            <i className="fas fa-plus"></i> Upload
                        </motion.button>
                    )}
                </div>
            </div>

                {/* Explorer Display Viewport */}
                {loading ? (
                    <div className="notes-grid" style={{ marginTop: '2rem' }}>
                        {Array(4).fill(0).map((_, i) => (
                            <div key={`skel-${i}`} className="subject-card" style={{ 
                                background: 'transparent', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                borderRadius: '16px', 
                                padding: '0.8rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%'
                            }}>
                                <div style={{ width: '100%', textAlign: 'center', animation: 'pulse 1.5s infinite', opacity: 0.7 }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', margin: '0 auto 0.5rem' }}></div>
                                    <div style={{ width: '80%', height: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', margin: '0 auto 0.5rem' }}></div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <div style={{ width: '40px', height: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}></div>
                                        <div style={{ width: '60px', height: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                                <div style={{ width: '60px', height: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', margin: '0.8rem auto 0', animation: 'pulse 1.5s infinite', opacity: 0.7 }}></div>
                            </div>
                        ))}
                    </div>
                ) : filteredRoots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', margin: '2rem 0' }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '3.2rem', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }}></i>
                        <h3>No Directories Available</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Check your filters or upload a folder structure to begin.</p>
                    </div>
                ) : selectedFolder ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <button
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => { setSelectedFolder(null); setSelectedUnit(null); }}
                                title="Back to Grid"
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'; e.currentTarget.style.color = '#00d4ff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                        </div>
                        <div
                            style={{
                                background: 'rgba(22, 22, 34, 0.75)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Root Folder Header */}
                            <div style={{ 
                                padding: '1rem 1.5rem', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                position: 'relative'
                            }}>
                                {/* Neon Accent Line */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                                        <i className="fas fa-folder-open" style={{ fontSize: '1.2rem', color: '#00d4ff', filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))' }}></i>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: '700', letterSpacing: '0.5px' }}>{selectedFolder.name}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', marginTop: '0.2rem' }}>
                                            {selectedFolder.meta.semester ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="fas fa-calendar-alt" style={{ color: '#10B981' }}></i> Sem {selectedFolder.meta.semester}</span> : null}
                                            {selectedFolder.meta.branch ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="fas fa-graduation-cap" style={{ color: '#F59E0B' }}></i> {selectedFolder.meta.branch}</span> : null}
                                        </div>
                                    </div>
                                </div>
                                
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            handleDeleteRootFolder(selectedFolder.name, e);
                                            setSelectedFolder(null);
                                        }}
                                        className="action-btn delete-btn"
                                        style={{
                                            borderRadius: '8px',
                                            padding: '0.5rem 0.8rem',
                                            border: 'none',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#EF4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <i className="fas fa-trash-alt"></i> Delete
                                    </button>
                                )}
                            </div>
                            
                            {/* Root Folder Tree Contents */}
                            <div className="units-grid-container" style={{ padding: '1.5rem' }}>
                                {Object.values(selectedFolder.children).length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>This subject folder is empty.</p>
                                ) : (
                                    <div className="notes-units-grid">
                                        {Object.values(selectedFolder.children).map(child => (
                                            <React.Fragment key={child.name}>
                                                <div 
                                                    className={`unit-folder-card ${selectedUnit && selectedUnit.name === child.name ? 'active' : ''}`}
                                                    onClick={() => setSelectedUnit(selectedUnit?.name === child.name ? null : child)}
                                                >
                                                    <i className="fas fa-folder" style={{ color: '#ffd700', fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.2))' }}></i>
                                                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>{child.name}</span>
                                                </div>
                                                
                                                {selectedUnit && selectedUnit.name === child.name && (
                                                    <div className="file-table-container grid-span-full">
                                                        <table className="file-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>File Name</th>
                                                                    <th style={{ width: '200px' }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Object.values(selectedUnit.children).map(fileNode => {
                                                                    if (fileNode.isDirectory) return null;
                                                                    const ext = fileNode.name.substring(fileNode.name.lastIndexOf('.')).toLowerCase();
                                                                    let fileIcon = 'fa-file-alt'; let iconColor = '#9CA3AF';
                                                                    if (ext === '.pdf') { fileIcon = 'fa-file-pdf'; iconColor = '#EF4444'; }
                                                                    else if (ext === '.ppt' || ext === '.pptx') { fileIcon = 'fa-file-powerpoint'; iconColor = '#F97316'; }
                                                                    else if (ext === '.doc' || ext === '.docx') { fileIcon = 'fa-file-word'; iconColor = '#3B82F6'; }
                                                                    else if (ext === '.xls' || ext === '.xlsx' || ext === '.csv') { fileIcon = 'fa-file-excel'; iconColor = '#10B981'; }
                                                                    else if (ext === '.txt') { fileIcon = 'fa-file-lines'; iconColor = '#D1D5DB'; }

                                                                    const isLocked = !getToken();

                                                                    return (
                                                                        <tr key={fileNode.name}>
                                                                            <td>
                                                                                <i className={`fas ${fileIcon} file-icon`} style={{ color: iconColor }}></i>
                                                                                {fileNode.name}
                                                                            </td>
                                                                            <td>
                                                                                {isLocked ? (
                                                                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', width: '100%' }}>
                                                                                        <i className="fas fa-lock"></i> Locked
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="btn-group">
                                                                                        <button 
                                                                                            onClick={(e) => { e.stopPropagation(); handleViewFile(fileNode); }}
                                                                                            style={{ background: 'transparent', border: '1px solid rgba(0, 212, 255, 0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: '#00d4ff', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                                        >
                                                                                            <i className="fas fa-eye"></i> View
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={(e) => { e.stopPropagation(); handleDownloadFile(fileNode); }}
                                                                                            style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #007aff 100%)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                                        >
                                                                                            <i className="fas fa-download"></i> Download
                                                                                        </button>
                                                                                        {isAdmin && handleDeleteFile && (
                                                                                            <button 
                                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(fileNode); }}
                                                                                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                                            >
                                                                                                <i className="fas fa-trash-alt"></i>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {filteredRoots.map(folder => (
                            <div 
                                key={folder.name} 
                                className="subject-card mobile-clickable-card"
                                onClick={() => setSelectedFolder(folder)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, background 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <div className="subject-icon-compact" style={{ marginBottom: '0.5rem' }}>
                                        <i className="fas fa-folder-open" style={{ fontSize: '1.5rem', color: '#00d4ff', filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.4))' }}></i>
                                    </div>
                                    <h3 className="subject-card-title" style={{ fontSize: '0.95rem', color: '#fff', margin: '0 0 0.5rem 0', fontWeight: '700', lineHeight: '1.3' }}>{folder.name}</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                        {folder.meta.semester ? <span><i className="fas fa-calendar-alt" style={{ color: '#10B981' }}></i> Sem {folder.meta.semester}</span> : null}
                                        {folder.meta.branch ? <span><i className="fas fa-graduation-cap" style={{ color: '#F59E0B' }}></i> {folder.meta.branch}</span> : null}
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', color: '#00d4ff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    Explore <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                                                    // Display only the Root Folders and their total file counts
                                                    const folderMap = {};
                                                    uploadPaths.forEach(p => {
                                                        const root = p.includes("/") ? p.substring(0, p.indexOf("/")) : p;
                                                        folderMap[root] = (folderMap[root] || 0) + 1;
                                                    });
                                                    return Object.entries(folderMap).map(([root, count]) => (
                                                        <div key={root} style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                                                            <div style={{ color: '#ffd700', fontWeight: 'bold' }}>
                                                                <i className="fas fa-folder" style={{ marginRight: '0.4rem', fontSize: '0.7rem' }}></i>
                                                                {root}
                                                            </div>
                                                            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{count} file(s)</div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click(); }}
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '8px' }}
                                                >
                                                    <i className="fas fa-plus"></i> Add Another Folder
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Drag & Drop Complete Study Folders Here</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Or click to browse (supports queuing multiple folders)</span>
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
                                        const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
                                        
                                        const validFiles = files.filter(f => {
                                            const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
                                            return allowedExtensions.includes(ext);
                                        });

                                        if (validFiles.length > 0) {
                                            setUploadFiles(prev => [...prev, ...validFiles]);
                                            setUploadPaths(prev => [...prev, ...validFiles.map(f => f.webkitRelativePath || f.name)]);
                                            showToast({ message: `Queued ${validFiles.length} files!`, type: 'success' });
                                        } else {
                                            showToast({ message: 'No supported study files found in selected directory.', type: 'warning' });
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
