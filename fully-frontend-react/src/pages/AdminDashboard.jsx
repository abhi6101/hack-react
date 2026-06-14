import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewRoundsForm from '../components/InterviewRoundsForm';
import PaperWizard from '../components/PaperWizard';
import PaperList from '../components/PaperList';
import PendingPapersAdmin from '../components/PendingPapersAdmin';
import LeaderboardAdmin from '../components/LeaderboardAdmin';
import Notes from './Notes';
import API_BASE_URL from '../config';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import AdminBottomNav from '../components/AdminBottomNav';
import AdminMobileMenu from '../components/AdminMobileMenu';
import '../styles/admin.css';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

// Simple Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span className="slider round" style={{
            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: checked ? '#22c55e' : '#ccc', transition: '.4s', borderRadius: '34px'
        }}>
            <span style={{
                position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '4px',
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                transform: checked ? 'translateX(24px)' : 'translateX(0)'
            }}></span>
        </span>
    </label>
);
const TableSkeleton = ({ cols = 4, rows = 2 }) => (
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


const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    const handleLogout = () => {
        if (window.innerWidth <= 768) {
            const confirmLogout = window.confirm("Are you sure you want to log out?");
            if (!confirmLogout) return;
        }
        localStorage.clear();
        navigate('/login');
    };

    // CSV Export Helper
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            showToast({ message: 'No data to export', type: 'info' });
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                let value = row[fieldName];
                if (value === null || value === undefined) value = '';
                value = value.toString().replace(/"/g, '""');
                return `"${value}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [expandedMenu, setExpandedMenu] = useState('Overview');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({
        jobTitle: '',
        companyName: '',
        jobDescription: '',
        applyLink: '',
        lastDate: '',
        salary: '',
        eligibleBranches: [],
        eligibleSemesters: []
    });

    const ADMIN_API_URL = `${API_BASE_URL}/admin`;
    const getToken = () => localStorage.getItem('authToken');
    const normalizedRole = localStorage.getItem('userRole'); // ADMIN, SUPER_ADMIN, COMPANY_ADMIN
    // Treat legacy ADMIN as SUPER_ADMIN for now, or just ADMIN
    const role = normalizedRole || 'USER';
    const myCompanyName = localStorage.getItem('companyName');

    const getRank = (user) => {
        if (!user) return -1;
        if (user.id === 1) return 100;
        if (user.role === 'SUPER_ADMIN') return 80;
        if (user.role === 'ADMIN') return 60;
        if (user.role === 'DEPT_ADMIN') return 40;
        if (user.role === 'COMPANY_ADMIN') return 20;
        return 0; // USER
    };
    
    // Attempt to find current user in the users array
    const currentUsername = localStorage.getItem('username');
    const currentUser = users.find(u => u.username === currentUsername);
    const currentUserRank = currentUser ? getRank(currentUser) : getRank({role});

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Helper function to handle 401 errors
    const handleUnauthorized = () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        console.error('🚫 Authentication failed - Token invalid or expired');
        showAlert({
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again.',
            type: 'warning',
            actions: [
                {
                    label: 'Login', primary: true, onClick: () => {
                        localStorage.clear();
                        navigate('/login');
                    }
                }
            ]
        });
        localStorage.clear();
    };

    // Derived states
    const isCompanyAdmin = role === 'COMPANY_ADMIN';
    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

    // Auto-fill company name if Company Admin
    useEffect(() => {
        if (isCompanyAdmin && myCompanyName) {
            setFormData(prev => ({ ...prev, companyName: myCompanyName }));
            setInterviewForm(prev => ({ ...prev, company: myCompanyName }));
        }
    }, [isCompanyAdmin, myCompanyName]);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when tab changes (good for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
        window.scrollTo(0, 0);
    }, [activeTab]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const [interviews, setInterviews] = useState([]);
    const [interviewForm, setInterviewForm] = useState({
        company: '',
        date: '',
        time: '',
        venue: '',
        positions: '',
        eligibility: '',
        eligibleBranches: [],      // For branch filtering
        eligibleSemesters: [],     // For semester filtering
        eligibleBatches: []        // For batch/passout year filtering
    });
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER',
        adminBranch: '',           // For DEPT_ADMIN
        allowedDepartments: [],    // For COMPANY_ADMIN
        companyName: '',           // For COMPANY_ADMIN
        computerCode: '',          // Unique student ID (e.g., 59500)
        batch: ''                  // Passout year (e.g., 2027)
    });
    const [userSearch, setUserSearch] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [showJobSearchInput, setShowJobSearchInput] = useState(false);
    const [interviewSearch, setInterviewSearch] = useState('');
    const [showInterviewSearchInput, setShowInterviewSearchInput] = useState(false);
    const [appSearch, setAppSearch] = useState('');
    const [showAppSearchInput, setShowAppSearchInput] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    const clearUserForm = () => {
        setUserForm({
            username: '',
            email: '',
            password: '',
            role: 'USER',
            adminBranch: '',
            allowedDepartments: [],
            companyName: '',
            computerCode: '',
            batch: '',
            branch: ''
        });
    };
    const [editingUser, setEditingUser] = useState(null);
    const [isUserCreating, setIsUserCreating] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [isJobFormOpen, setIsJobFormOpen] = useState(false);
    const [isDeptFormOpen, setIsDeptFormOpen] = useState(false);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
    const [isInterviewFormOpen, setIsInterviewFormOpen] = useState(false);
    const [isPaperFormOpen, setIsPaperFormOpen] = useState(false);
    const [editingInterview, setEditingInterview] = useState(null);

    const [selectedProfileForVerification, setSelectedProfileForVerification] = useState(null);
    const [verificationTab, setVerificationTab] = useState('idCard'); // idCard, admit // For ID Card Modal
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState({
        codingRound: { enabled: false, date: '', time: '', venue: '', instructions: '' },
        technicalInterview: { enabled: false, date: '', time: '', venue: '', topics: '' },
        hrRound: { enabled: false, date: '', time: '', venue: '', questions: '' },
        projectTask: { enabled: false, description: '', deadline: '24', requirements: '' }
    });

    // Super Admin Stats
    const [companyStats, setCompanyStats] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);

    // Student Monitor State
    const [studentActivity, setStudentActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    // Profile Details State
    const [allProfiles, setAllProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);

    // Paper View Logs State
    const [paperViewLogs, setPaperViewLogs] = useState([]);
    const [loadingPaperLogs, setLoadingPaperLogs] = useState(false);
    const [paperLogSearch, setPaperLogSearch] = useState('');

    const [isUploadingNotes, setIsUploadingNotes] = useState(false);

    const fetchCompanyStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch(`${ADMIN_API_URL}/stats/companies`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401) return handleUnauthorized();
            if (res.ok) {
                const data = await res.json();
                setCompanyStats(Array.isArray(data) ? data : []);
            } else {
                setCompanyStats([]);
            }
        } catch (err) {
            console.error("Failed to load stats", err);
            setCompanyStats([]);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchStudentActivity = async () => {
        setLoadingActivity(true);
        try {
            const res = await fetch(`${ADMIN_API_URL}/stats/students`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401) return handleUnauthorized();
            if (res.ok) {
                const data = await res.json();
                setStudentActivity(Array.isArray(data) ? data : []);
            } else {
                setStudentActivity([]);
            }
        } catch (err) {
            console.error("Failed to load student activity", err);
            setStudentActivity([]);
        } finally {
            setLoadingActivity(false);
        }
    };

    const fetchAllProfiles = async () => {
        setLoadingProfiles(true);
        try {
            const res = await fetch(`${API_BASE_URL}/student-profile/admin/all`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401) return handleUnauthorized();
            if (res.ok) {
                const data = await res.json();
                setAllProfiles(Array.isArray(data) ? data : []);
            } else {
                setAllProfiles([]);
            }
        } catch (err) {
            console.error("Failed to load profiles", err);
            setAllProfiles([]);
        } finally {
            setLoadingProfiles(false);
        }
    };

    const loadPaperViewLogs = async () => {
        setLoadingPaperLogs(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/papers/view-logs`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.status === 401) return handleUnauthorized();
            if (!response.ok) throw new Error('Failed to fetch paper view logs');
            const data = await response.json();
            setPaperViewLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading paper logs:', error);
            showToast({ message: 'Failed to load paper view logs.', type: 'error' });
            setPaperViewLogs([]);
        } finally {
            setLoadingPaperLogs(false);
        }
    };

    // View Resume (Super Admin Only)
    const viewStudentResume = async (userId, studentName) => {
        try {
            const res = await fetch(`${API_BASE_URL}/resume/admin/view/${userId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error("Resume not found or access denied");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${studentName}_Resume.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            showToast({
                message: err.message || 'Failed to view resume',
                type: 'error'
            });
        }
    };
    const fetchInterviews = () => {
        fetch(`${API_BASE_URL}/interview-drives`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => setInterviews(Array.isArray(data) ? data : []))
            .catch(() => {
                // Fallback
                const stored = localStorage.getItem('interviews');
                if (stored) setInterviews(JSON.parse(stored));
            });
    };

    const loadApplications = async () => {
        setLoadingApplications(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/job-applications`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.status === 401) return handleUnauthorized();
            if (!response.ok) throw new Error('Failed to fetch applications');
            const data = await response.json();
            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading applications:', error);
            setApplications([]);
        } finally {
            setLoadingApplications(false);
        }
    };

    const [interviewApplications, setInterviewApplications] = useState([]);
    const [loadingInterviewApps, setLoadingInterviewApps] = useState(false);

    // Gallery State
    const [galleryItems, setGalleryItems] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [galleryForm, setGalleryForm] = useState({ title: '', type: 'campus', description: '', image: null });
    const [galleryUploadLoading, setGalleryUploadLoading] = useState(false);

    const [sendEmailNotifications, setSendEmailNotifications] = useState(() => {
        const saved = localStorage.getItem('sendEmailNotifications');
        return saved !== null ? JSON.parse(saved) : true; // Default: enabled
    });

    // Save email toggle preference to localStorage
    useEffect(() => {
        localStorage.setItem('sendEmailNotifications', JSON.stringify(sendEmailNotifications));
    }, [sendEmailNotifications]);

    // Global Email Settings State (Backend Synced)
    const [emailSettings, setEmailSettings] = useState({
        masterEmailEnabled: false,
        newJobEmailEnabled: false,
        statusUpdateEmailEnabled: false,
        accountEmailEnabled: false,
        paperDownloadEnabled: false,
        notesDownloadEnabled: false,
        screenshotRestrictionEnabled: true
    });
    const [loadingSettings, setLoadingSettings] = useState(false);

    // Fetch Email Settings from Backend
    const fetchEmailSettings = async () => {
        if (!isSuperAdmin) return;
        setLoadingSettings(true);
        try {
            const res = await fetch(`${ADMIN_API_URL}/settings`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmailSettings(data);
            }
        } catch (err) {
            console.error("Failed to load email settings", err);
        } finally {
            setLoadingSettings(false);
        }
    };

    // Department Management State
    const [departments, setDepartments] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(false);
    const [deptForm, setDeptForm] = useState({ name: '', code: '', hodName: '', contactEmail: '', maxSemesters: 8 });
    const [deptMode, setDeptMode] = useState('single');
    const [refreshKey, setRefreshKey] = useState(0);

    const [editingDept, setEditingDept] = useState(null); // For editing departments
    const [bulkForm, setBulkForm] = useState({ category: '', degree: '', maxSemesters: 8, branches: '' });

    const loadDepartments = async () => {
        setLoadingDepts(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401) return handleUnauthorized();
            if (res.ok) {
                const data = await res.json();
                setDepartments(Array.isArray(data) ? data : []);
            } else {
                setDepartments([]);
            }
        } catch (e) {
            console.error(e);
            setDepartments([]);
        } finally {
            setLoadingDepts(false);
        }
    };

    const startEditDept = (dept) => {
        setEditingDept(dept);
        setDeptForm({
            name: dept.name,
            code: dept.code,
            hodName: dept.hodName || '',
            contactEmail: dept.contactEmail || '',
            maxSemesters: dept.maxSemesters || 8
        });
        setDeptMode('single');
    };

    const handleDeptSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingDept
                ? `${API_BASE_URL}/admin/departments/${editingDept.id}`
                : `${API_BASE_URL}/admin/departments`;
            const method = editingDept ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(deptForm)
            });
            if (res.ok) {
                setMessage({ text: editingDept ? 'Department Updated!' : 'Department Added!', type: 'success' });
                loadDepartments();
                setDeptForm({ name: '', code: '', hodName: '', contactEmail: '', maxSemesters: 8 });
                setEditingDept(null);
            } else {
                const err = await res.text();
                setMessage({ text: err, type: 'error' });
            }
        } catch (e) { setMessage({ text: editingDept ? 'Failed to update dept' : 'Failed to add dept', type: 'error' }); }
    };


    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        const branches = bulkForm.branches.split(',').map(b => b.trim()).filter(b => b);
        if (branches.length === 0) {
            setMessage({ text: 'Please enter at least one branch', type: 'error' });
            return;
        }

        const deptsToCreate = branches.map(b => ({
            name: `${bulkForm.degree} in ${b}`,
            code: `${bulkForm.degree.toUpperCase().replace(/[^A-Z0-9]/g, '')}_${b.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
            category: bulkForm.category,
            degree: bulkForm.degree,
            maxSemesters: bulkForm.maxSemesters,
            hodName: 'TBD',
            contactEmail: 'admin@college.edu'
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(deptsToCreate)
            });
            if (res.ok) {
                const msg = await res.text();
                setMessage({ text: msg, type: 'success' });
                loadDepartments();
                setBulkForm({ category: '', degree: '', maxSemesters: 8, branches: '' });
                setDeptMode('single');
            } else {
                setMessage({ text: 'Creation failed', type: 'error' });
            }
        } catch (e) { console.error(e); setMessage({ text: 'Bulk creation error', type: 'error' }); }
    };



    const approveStudent = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE_URL}/student-profile/${id}/status?status=${status}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setMessage({ text: `Student ${status}`, type: 'success' });
                fetchAllProfiles(); // Refresh list
                setSelectedProfileForVerification(null);
            } else {
                setMessage({ text: 'Action failed', type: 'error' });
            }
        } catch (e) { console.error(e); }
    };

    const deleteDept = async (id) => {
        if (!window.confirm('Delete Dept?')) return;
        await fetch(`${API_BASE_URL}/admin/departments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
        loadDepartments();
    };

    // Update Email Setting
    const toggleEmailSetting = async (key, currentValue) => {
        const newSettings = { ...emailSettings, [key]: !currentValue };
        // Optimistic update
        setEmailSettings(newSettings);

        try {
            const res = await fetch(`${ADMIN_API_URL}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(newSettings)
            });
            if (!res.ok) {
                // Revert on failure
                setEmailSettings(emailSettings);
                setMessage({ text: 'Failed to update setting', type: 'error' });
            } else {
                // Update with actual response to be safe
                const saved = await res.json();
                setEmailSettings(saved);
            }
        } catch (err) {
            setEmailSettings(emailSettings);
            setMessage({ text: 'Error updating setting', type: 'error' });
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchEmailSettings();
        }
    }, [isSuperAdmin]);

    const loadInterviewApplications = async () => {
        setLoadingInterviewApps(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/interview-applications`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Failed to fetch interview applications');
            const data = await response.json();
            setInterviewApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading interview apps:', error);
            setMessage({ text: 'Failed to load interview applications.', type: 'error' });
            setInterviewApplications([]);
        } finally {
            setLoadingInterviewApps(false);
        }
    };

    const updateInterviewAppStatus = async (appId, newStatus) => {
        try {
            const res = await fetch(`${ADMIN_API_URL}/interview-applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                loadInterviewApplications();
                setMessage({ text: 'Application status updated!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to update status', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // Gallery Functions
    const loadGalleryItems = async () => {
        setLoadingGallery(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/gallery`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Failed to fetch gallery items');
            const data = await response.json();
            setGalleryItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading gallery:', error);
            setMessage({ text: 'Failed to load gallery items.', type: 'error' });
            setGalleryItems([]);
        } finally {
            setLoadingGallery(false);
        }
    };

    const updateGalleryStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${ADMIN_API_URL}/gallery/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                loadGalleryItems();
                setMessage({ text: 'Gallery item updated!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to update gallery status', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const deleteGalleryItem = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            const res = await fetch(`${ADMIN_API_URL}/gallery/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setGalleryItems(galleryItems.filter(i => i.id !== id));
                setMessage({ text: 'Item deleted!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to delete item', type: 'error' });
        }
    };

    const handleGalleryUpload = async (e) => {
        e.preventDefault();
        setGalleryUploadLoading(true);
        setMessage({ text: '', type: '' });

        const data = new FormData();
        data.append('title', galleryForm.title);
        data.append('type', galleryForm.type);
        data.append('description', galleryForm.description);
        if (galleryForm.image) {
            data.append('image', galleryForm.image);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/gallery`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: data
            });

            if (res.ok) {
                setMessage({ text: 'Photo uploaded successfully!', type: 'success' });
                setGalleryForm({ title: '', type: 'campus', description: '', image: null });
                setIsGalleryFormOpen(false);
                loadGalleryItems();
            } else {
                setMessage({ text: 'Failed to upload photo.', type: 'error' });
            }
        } catch (err) {
            console.error('Error uploading photo:', err);
            setMessage({ text: 'Error uploading photo.', type: 'error' });
        } finally {
            setGalleryUploadLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    const updateApplicationStatus = async (appId, newStatus) => {
        try {
            const res = await fetch(`${ADMIN_API_URL}/job-applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                loadApplications();
                setMessage({ text: 'Application status updated!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to update status', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const deleteApplication = async (appId) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;

        try {
            const res = await fetch(`${ADMIN_API_URL}/job-applications/${appId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setApplications(applications.filter(app => app.id !== appId));
                setMessage({ text: 'Application deleted!', type: 'success' });
            } else {
                setMessage({ text: 'Failed to delete application', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error deleting application', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleInterviewSubmit = async (e) => {
        e.preventDefault();
        const newInterview = {
            company: interviewForm.company,
            date: interviewForm.date,
            time: interviewForm.time,
            venue: interviewForm.venue,
            positions: interviewForm.positions,
            eligibility: interviewForm.eligibility,
            totalSlots: 20, bookedSlots: 0
        };

        const endpoint = editingInterview
            ? `${API_BASE_URL}/interview-drives/admin/${editingInterview.id}`
            : `${API_BASE_URL}/interview-drives/admin`;
        const method = editingInterview ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(newInterview)
            });

            if (res.status === 401) return handleUnauthorized();

            if (res.ok) {
                const saved = await res.json();
                if (editingInterview) {
                    setInterviews(interviews.map(i => i.id === saved.id ? saved : i));
                    setMessage({ text: 'Interview updated!', type: 'success' });
                } else {
                    setInterviews([...interviews, saved]);
                    setMessage({ text: 'Interview posted!', type: 'success' });
                }
                setEditingInterview(null);
            } else {
                throw new Error('Backend save failed');
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to save interview', type: 'error' });
        }
        setInterviewForm({
            company: isCompanyAdmin ? myCompanyName : '',
            date: '', time: '', venue: '', positions: '', eligibility: ''
        });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const deleteInterview = async (id) => {
        if (!window.confirm('Delete this interview?')) return;

        try {
            await fetch(`${API_BASE_URL}/interview-drives/admin/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setInterviews(interviews.filter(i => i.id !== id));
        } catch (err) {
            // Fallback
            const updated = interviews.filter(i => i.id !== id);
            setInterviews(updated);
            localStorage.setItem('interviews', JSON.stringify(updated));
        }
    };

    useEffect(() => {
        const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'];
        const currentToken = getToken();
        if (!currentToken || !allowedRoles.includes(role)) {
            showAlert({
                title: 'Access Denied',
                message: 'Access Denied. Admins only.',
                type: 'error',
                actions: [
                    { label: 'Go to Login', primary: true, onClick: () => navigate('/login') },
                    { label: 'Go Home', primary: false, onClick: () => navigate('/') }
                ]
            });
            return;
        }
        loadJobs();
        fetchInterviews();
        if (isSuperAdmin || role === 'DEPT_ADMIN' || role === 'ADMIN') {
            loadUsers();
            if (isSuperAdmin) fetchCompanyStats();
        }
        if (isSuperAdmin || activeTab === 'jobs' || activeTab === 'departments') {
            loadDepartments();
        }
        if (activeTab === 'students') {
            fetchStudentActivity();
        }
        if (activeTab === 'profile-details' && (isSuperAdmin || role === 'DEPT_ADMIN' || role === 'ADMIN')) {
            fetchAllProfiles();
        }
        if (activeTab === 'paper-logs') {
            loadPaperViewLogs();
        }
        if (activeTab === 'applications') {
            loadApplications();
        }
        if (activeTab === 'interview-applications') {
            loadInterviewApplications();
        }
    }, [navigate, role, isSuperAdmin, activeTab]);

    // Pre-fill Branch for DEPT_ADMIN
    useEffect(() => {
        if (role === 'DEPT_ADMIN' && activeTab === 'jobs' && (!formData.eligibleBranches || formData.eligibleBranches.length === 0)) {
            const myBranch = localStorage.getItem('adminBranch');
            if (myBranch) {
                setFormData(prev => ({ ...prev, eligibleBranches: [myBranch] }));
            }
        }
    }, [role, activeTab]); // Removed formData dependency to avoid potential loops/stale closures, run once when tab opens

    const loadJobs = async () => {
        setLoadingJobs(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/jobs`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            if (response.status === 401) return handleUnauthorized();
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading jobs:', error);
            setJobs([]);
        } finally {
            setLoadingJobs(false);
        }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            if (response.status === 401) return handleUnauthorized();
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setIsUserCreating(true);
        const endpoint = editingUser
            ? `${ADMIN_API_URL}/users/${editingUser.id}`
            : `${ADMIN_API_URL}/users`;
        const method = editingUser ? 'PUT' : 'POST';

        // Prepare payload
        const payload = {
            username: userForm.username,
            email: userForm.email,
            role: userForm.role
        };

        if (userForm.computerCode) payload.computerCode = userForm.computerCode;
        if (userForm.batch) payload.batch = userForm.batch;
        if (userForm.branch) payload.branch = userForm.branch;

        // Only include password if:
        // 1. Creating new user (editingUser is null), OR
        // 2. Editing user AND password field is not empty
        if (!editingUser || (editingUser && userForm.password && userForm.password.trim() !== '')) {
            payload.password = userForm.password;
        }

        // Add role-specific fields
        if (userForm.role === 'DEPT_ADMIN') {
            payload.adminBranch = userForm.adminBranch;
        }

        if (userForm.role === 'COMPANY_ADMIN') {
            payload.companyName = userForm.companyName;
            // Convert array to comma-separated string
            payload.allowedDepartments = Array.isArray(userForm.allowedDepartments)
                ? userForm.allowedDepartments.join(',')
                : userForm.allowedDepartments;
        }

        // Debug logging
        console.log('User Action:', editingUser ? `Updating ID: ${editingUser.id}` : 'Creating NEW');
        console.log('Payload being sent:', payload);

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) return handleUnauthorized();

            if (res.ok) {
                console.log('✅ User update successful');
                setMessage({ text: editingUser ? 'User updated!' : 'User created!', type: 'success' });
                loadUsers();
                clearUserForm();
                setEditingUser(null);
            } else {
                const error = await res.text();
                console.error('❌ Backend error:', error);
                setMessage({ text: error, type: 'error' });
            }
        } catch (err) {
            console.error('❌ Network error:', err);
            setMessage({ text: 'Failed to save user', type: 'error' });
        } finally {
            setIsUserCreating(false);
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            const res = await fetch(`${ADMIN_API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401) return handleUnauthorized();
            if (res.ok) {
                setMessage({ text: 'User deleted successfully', type: 'success' });
                loadUsers();
            } else {
                const errText = await res.text();
                setMessage({ text: `Failed: ${errText || 'Dependency error'}`, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error deleting user', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const startEditUser = (user) => {
        setUserForm({
            username: user.username || '',
            email: user.email || '',
            password: '',
            role: user.role || 'USER',
            adminBranch: user.adminBranch || '',
            allowedDepartments: user.allowedDepartments ? user.allowedDepartments.split(',') : [],
            companyName: user.companyName || '',
            computerCode: user.computerCode || '',
            batch: user.batch || '',
            branch: user.branch || ''
        });
        setEditingUser(user);
        setIsUserFormOpen(true);
        // Scroll to the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            const response = await fetch(`${ADMIN_API_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.status === 401) return handleUnauthorized();
            if (!response.ok) throw new Error('Failed to delete job. Please try again.');

            loadJobs();
        } catch (error) {
            showToast({
                message: error.message || 'Failed to delete job',
                type: 'error'
            });
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const fillSampleData = () => {
        // Fill job form with sample data
        setFormData({
            jobTitle: 'Senior Software Engineer',
            companyName: isCompanyAdmin ? myCompanyName : 'Google India',
            jobDescription: 'We are looking for an experienced software engineer to join our team. You will work on cutting-edge technologies and solve complex problems at scale.',
            applyLink: 'https://careers.google.com/apply/senior-swe',
            lastDate: '2025-12-31',
            salary: '1500000'
        });

        // Fill interview rounds with sample data
        setInterviewDetails({
            codingRound: {
                enabled: true,
                date: '2025-12-20',
                time: '10:00 AM',
                venue: 'Computer Lab 101, Main Building',
                instructions: 'Solve 3 DSA problems in 90 minutes. Topics: Arrays, Trees, Dynamic Programming'
            },
            technicalInterview: {
                enabled: true,
                date: '2025-12-22',
                time: '2:00 PM',
                venue: 'Virtual - Zoom Link will be shared',
                topics: 'System Design, React.js, Node.js, Database Design, Microservices'
            },
            hrRound: {
                enabled: true,
                date: '2025-12-24',
                time: '11:00 AM',
                venue: 'HR Office - Room 305',
                questions: ''
            },
            projectTask: {
                enabled: false,
                description: '',
                deadline: '24',
                requirements: ''
            }
        });

        setMessage({ text: 'Sample data filled! Ready to post.', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    };

    const clearForm = () => {
        setFormData({
            jobTitle: '',
            companyName: isCompanyAdmin ? myCompanyName : '',
            jobDescription: '',
            applyLink: '',
            lastDate: '',
            salary: ''
        });
        setInterviewDetails({
            codingRound: { enabled: false, date: '', time: '', venue: '', instructions: '' },
            technicalInterview: { enabled: false, date: '', time: '', venue: '', topics: '' },
            hrRound: { enabled: false, date: '', time: '', venue: '', questions: '' },
            projectTask: { enabled: false, description: '', deadline: '24', requirements: '' }
        });
        setMessage({ text: 'Form cleared!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    };

    const fillInterviewSampleData = () => {
        setInterviewForm({
            company: isCompanyAdmin ? myCompanyName : 'Microsoft India',
            date: '2025-12-25',
            time: '10:00 AM',
            venue: 'Auditorium, Main Campus',
            positions: 'Software Engineer, Data Analyst, Product Manager',
            eligibility: 'B.Tech/M.Tech CSE/IT, CGPA > 7.5'
        });
        setMessage({ text: 'Sample interview data filled!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    };

    const clearInterviewForm = () => {
        setInterviewForm({
            company: isCompanyAdmin ? myCompanyName : '', date: '', time: '', venue: '', positions: '', eligibility: ''
        });
        setMessage({ text: 'Interview form cleared!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    };

    const handleDeleteAllJobs = async () => {
        if (!isSuperAdmin) return;
        if (!window.confirm('Are you sure you want to delete all the jobs?')) return;

        try {
            const res = await fetch(`${ADMIN_API_URL}/jobs/all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (res.status === 401) return handleUnauthorized();

            if (res.ok) {
                const msg = await res.text();
                showToast({ message: msg || 'All jobs deleted successfully', type: 'success' });
                setJobs([]);
            } else {
                const err = await res.text();
                showToast({ message: err || 'Mass deletion failed', type: 'error' });
            }
        } catch (err) {
            console.error('Mass deletion error:', err);
            showToast({ message: 'Error performing mass deletion', type: 'error' });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        console.log('🚀 Job Posting Started...');
        console.log('📝 Form Data:', formData);

        // Validation
        if (!formData.jobTitle || !formData.companyName || !formData.jobDescription || !formData.applyLink || !formData.lastDate || !formData.salary) {
            const missingFields = [];
            if (!formData.jobTitle) missingFields.push('Job Title');
            if (!formData.companyName) missingFields.push('Company Name');
            if (!formData.jobDescription) missingFields.push('Job Description');
            if (!formData.applyLink) missingFields.push('Apply Link');
            if (!formData.lastDate) missingFields.push('Last Date');
            if (!formData.salary) missingFields.push('Salary');

            const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
            console.error('❌ Validation Error:', errorMsg);
            setMessage({ text: errorMsg, type: 'error' });
            return;
        }

        const jobPayload = {
            title: formData.jobTitle,
            description: formData.jobDescription,
            company_name: formData.companyName,
            apply_link: formData.applyLink,
            last_date: formData.lastDate,
            salary: parseInt(formData.salary),
            interview_details: JSON.stringify(interviewDetails),
            eligibleBranches: formData.eligibleBranches || [],
            eligibleSemesters: formData.eligibleSemesters || []
        };

        console.log('📦 Job Payload:', jobPayload);

        const endpoint = editingJob
            ? `${ADMIN_API_URL}/jobs/${editingJob.id}`
            : `${ADMIN_API_URL}/jobs?sendEmails=${emailSettings.masterEmailEnabled && emailSettings.newJobEmailEnabled && sendEmailNotifications}`;
        const method = editingJob ? 'PUT' : 'POST';

        console.log('🌐 API Endpoint:', endpoint);
        console.log('📨 HTTP Method:', method);
        console.log('🔑 Token:', getToken() ? 'Present' : 'Missing');

        try {
            console.log('⏳ Sending request to backend...');
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(jobPayload)
            });

            console.log('📡 Response Status:', response.status, response.statusText);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                let errorMessage = 'Failed to save job';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
                    console.error('❌ Backend Error Response:', errorData);
                } catch (parseError) {
                    const errorText = await response.text();
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                    console.error('❌ Backend Error Text:', errorText);
                }
                throw new Error(errorMessage);
            }

            const savedJob = await response.json();
            console.log('✅ Job saved successfully:', savedJob);

            setMessage({ text: editingJob ? 'Job updated successfully!' : 'Job posted successfully!', type: 'success' });
            setFormData({
                jobTitle: '', companyName: isCompanyAdmin ? myCompanyName : '', jobDescription: '', applyLink: '', lastDate: '', salary: '',
                eligibleBranches: [], eligibleSemesters: []
            });
            setInterviewDetails({
                codingRound: { enabled: false, date: '', time: '', venue: '', instructions: '' },
                technicalInterview: { enabled: false, date: '', time: '', venue: '', topics: '' },
                hrRound: { enabled: false, date: '', time: '', venue: '', questions: '' },
                projectTask: { enabled: false, description: '', deadline: '24', requirements: '' }
            });
            setEditingJob(null);
            loadJobs();
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('❌ Job Posting Error:', error);
            setMessage({ text: error.message, type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    const startEditJob = (job) => {
        setFormData({
            jobTitle: job.title,
            companyName: job.company_name,
            jobDescription: job.description,
            applyLink: job.apply_link,
            lastDate: job.last_date, // format YYYY-MM-DD
            salary: job.salary,
            eligibleBranches: job.eligibleBranches || [],
            eligibleSemesters: job.eligibleSemesters || []
        });
        // Parse interview details if they exist
        if (job.interview_details) {
            try {
                setInterviewDetails(JSON.parse(job.interview_details));
            } catch (e) {
                console.error("Error parsing interview details", e);
            }
        }
        setEditingJob(job);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    };

    const startEditInterview = (interview) => {
        setInterviewForm({
            company: interview.company,
            date: interview.date,
            time: interview.time,
            venue: interview.venue,
            positions: interview.positions,
            eligibility: interview.eligibility
        });
        setEditingInterview(interview);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const renderProfileDetails = () => (
        <div className="users-management-page animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
            {loadingProfiles ? (
                <TableSkeleton cols={6} rows={2} />
            ) : allProfiles.length > 0 ? (
                <section className="card surface-glow-premium" style={{ border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: 0 }}>
                    <div className="table-responsive" style={{ padding: '1rem' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Enrollment</th>
                                    <th>Branch/Sem</th>
                                    <th>Batch</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProfiles.map(profile => (
                                    <tr key={profile.id}>
                                        <td style={{ fontWeight: '500' }}>{profile.fullName}</td>
                                        <td>{profile.enrollmentNumber}</td>
                                        <td>{profile.branch} - Sem {profile.semester}</td>
                                        <td>{profile.batch || 'N/A'}</td>
                                        <td>
                                            {profile.approvalStatus === 'APPROVED' ? (
                                                <span className="badge-role role-user"><i className="fas fa-check-circle"></i> Verified</span>
                                            ) : (
                                                <span className="badge-role role-super-admin"><i className="fas fa-exclamation-circle"></i> Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="action-btn-modern view-btn" onClick={() => setSelectedProfileForVerification(profile)} title="Verify Profile">
                                                <i className="fas fa-id-card"></i> Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '4rem 2rem', minHeight: '50vh' }}>
                    <i className="fas fa-id-badge" style={{ fontSize: '5.5rem', color: 'rgba(0, 212, 255, 0.2)', marginBottom: '1.5rem' }}></i>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '500', margin: 0 }}>No detailed profiles found.</p>
                </div>
            )}
        </div>
    );

    const renderPaperViewLogs = () => (
        <div className="users-management-page animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
            <style>{`
                .logs-top-actions {
                    display: flex;
                    width: 100%;
                    gap: 10px;
                    margin-bottom: 1rem;
                    justify-content: flex-end;
                }
                .log-action-btn {
                    width: calc(50% - 5px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .log-action-btn:hover {
                    background: rgba(255,255,255,0.1);
                }
                .search-bar-full {
                    width: 100%;
                    margin-bottom: 1.5rem;
                }
                .log-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.25rem;
                }
                .log-card-premium {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    transition: transform 0.2s;
                }
                .log-card-premium:hover {
                    transform: translateY(-2px);
                    border-color: rgba(0, 212, 255, 0.2);
                }
                .log-identity-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .log-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
                .log-student-info {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: baseline;
                    gap: 0.5rem;
                }
                .log-student-name {
                    font-weight: 600;
                    color: #fff;
                    font-size: 1rem;
                }
                .log-username {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .log-paper-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .log-paper-title {
                    font-weight: 700;
                    color: var(--primary);
                    font-size: 1.05rem;
                }
                .log-subline {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                }
                .log-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: auto;
                }
                .log-timestamp {
                    color: rgba(255,255,255,0.4);
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .badge-pill {
                    padding: 4px 10px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .badge-pill.viewed {
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                }
                .badge-pill.downloaded {
                    background: rgba(34, 197, 94, 0.15);
                    color: #4ade80;
                }
                @media (min-width: 741px) {
                    .log-action-btn {
                        width: 140px;
                    }
                }
            `}</style>
            
            {/* Logs controls moved to global header */}
            {loadingPaperLogs ? (
                <TableSkeleton cols={5} rows={2} />
            ) : paperViewLogs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '4rem 2rem' }}>
                    <i className="fas fa-history" style={{ fontSize: '4.5rem', color: 'rgba(0,212,255,0.15)', marginBottom: '1.5rem' }}></i>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '500', margin: 0 }}>No view logs recorded yet.</p>
                </div>
            ) : (
                <div className="log-cards-grid">
                    {paperViewLogs.filter(log => {
                        const searchLower = paperLogSearch.toLowerCase();
                        return (
                            (log.studentName && log.studentName.toLowerCase().includes(searchLower)) ||
                            (log.username && log.username.toLowerCase().includes(searchLower)) ||
                            (log.computerCode && log.computerCode.toLowerCase().includes(searchLower)) ||
                            (log.paperTitle && log.paperTitle.toLowerCase().includes(searchLower)) ||
                            (log.subject && log.subject.toLowerCase().includes(searchLower))
                        );
                    }).map(log => (
                        <div key={log.id} className="log-card-premium">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="log-identity-row">
                                    <div className="log-avatar">
                                        {(log.studentName || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="log-student-info">
                                        <span className="log-student-name">
                                            {log.studentName || 'Unknown Student'} {log.computerCode ? `(${log.computerCode})` : ''}
                                        </span>
                                    </div>
                                </div>
                                <span className={`badge-pill ${log.action === 'DOWNLOAD' ? 'downloaded' : 'viewed'}`}>
                                    <i className={log.action === 'DOWNLOAD' ? 'fas fa-download' : 'far fa-eye'}></i>
                                    {log.action === 'DOWNLOAD' ? 'Downloaded' : 'Viewed'}
                                </span>
                            </div>
                            
                            <div className="log-paper-details">
                                <div className="log-paper-title">{log.paperTitle}</div>
                                <div className="log-subline">
                                    <span style={{ textTransform: 'capitalize' }}>{log.subject}</span> • {log.branch} • Sem {log.semester}
                                </div>
                            </div>
                            
                            <div className="log-card-footer">
                                <div className="log-timestamp">
                                    <i className="far fa-clock"></i> {log.viewedAt ? new Date(log.viewedAt).toLocaleString() : 'N/A'}
                                </div>
                                {log.computerCode && (
                                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
                                        #{log.computerCode}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAnalytics = () => {
        const userData = [
            { name: 'Students', value: users.filter(u => !u.role || u.role === 'USER' || u.role === 'STUDENT').length, color: '#3b82f6' },
            { name: 'Admins', value: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length, color: '#ef4444' },
            { name: 'Companies', value: users.filter(u => u.role === 'COMPANY_ADMIN').length, color: '#10b981' }
        ].filter(d => d.value > 0);

        const appData = [
            { name: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: '#eab308' },
            { name: 'Selected', value: applications.filter(a => a.status === 'SELECTED' || a.status === 'SHORTLISTED').length, color: '#22c55e' },
            { name: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: '#ef4444' }
        ].filter(d => d.value > 0);

        return (
            <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="surface-glow" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-chart-pie" style={{ color: 'var(--primary)' }}></i> User Demographics
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={userData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {userData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const [expandedStudentCards, setExpandedStudentCards] = React.useState({});
    const toggleStudentCard = (id) => setExpandedStudentCards(prev => ({ ...prev, [id]: !prev[id] }));

    const renderStudentMonitor = () => (
        <div className="users-management-page animate-in" style={{ paddingBottom: '80px' }}>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <span style={{color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem'}}>Showing registered students</span>
            </div>            {/* Student Cards */}
            {loadingActivity ? (
                <TableSkeleton cols={2} rows={4} />
            ) : studentActivity.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.95rem' }}>No students found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {studentActivity.map((student, idx) => {
                        const isOpen = !!expandedStudentCards[student.id ?? idx];
                        const cardKey = student.id ?? idx;
                        const emailUser = student.email ? student.email.split('@')[0] : '—';
                        const displayId = student.id ? String(student.id).replace(/[^0-9]/g, '').slice(-6) || student.id : '—';
                        return (
                            <div
                                key={cardKey}
                                style={{
                                    background: '#0f1318',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    padding: '0.85rem 1rem',
                                    transition: 'border-color 0.2s ease'
                                }}
                            >
                                {/* Card Top Row: ID + Email + Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.2rem' }}>
                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>
                                                {student.username || student.name || 'Unknown'}
                                            </span>
                                            <span style={{ fontWeight: '700', fontSize: '0.75rem', color: '#00ccff', letterSpacing: '0.03em' }}>
                                                #{displayId}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {emailUser}
                                        </div>
                                    </div>
                                    {/* Edit + Delete + Expand */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                                        <button
                                            onClick={() => startEditUser && startEditUser(student)}
                                            title="Edit"
                                            style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteUser && deleteUser(student.id)}
                                            title="Delete"
                                            style={{ width: '30px', height: '30px', background: 'rgba(255,71,71,0.07)', border: '1px solid rgba(255,71,71,0.15)', borderRadius: '7px', color: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                <path d="M10 11v6"/>
                                                <path d="M14 11v6"/>
                                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => toggleStudentCard(cardKey)}
                                            title={isOpen ? 'Collapse' : 'Expand'}
                                            style={{ width: '30px', height: '30px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.25s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Expandable Details */}
                                {isOpen && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Branch</div>
                                            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>{student.branch || '—'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Last Active</div>
                                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                                                {student.lastLoginDate ? new Date(student.lastLoginDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                                            </div>
                                        </div>
                                        {student.course && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Course</div>
                                                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>{student.course}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'students':
                return renderStudentMonitor();
            case 'dashboard':
                const pendingVerifications = allProfiles.filter(p => p.approvalStatus === 'PENDING').length;
                const totalStudents = users.filter(u => u.role === 'USER').length;
                const recentActivities = [
                    ...applications.slice(0, 3).map(a => ({ type: 'app', text: `${a.applicantName} applied for ${a.jobTitle}`, time: a.appliedAt })),
                    ...jobs.slice(0, 2).map(j => ({ type: 'job', text: `New job posted at ${j.company_name}`, time: j.last_date })),
                ].sort((a, b) => new Date(b.time) - new Date(a.time));

                return (
                    <div className="dashboard-overview animate-in">

                        {/* 2. Unified Hero Stats Row */}
                        <div className="stats-grid" style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div className="stat-card-modern primary" style={{ padding: '1.25rem' }}>
                                <div className="stat-icon" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}><i className="fas fa-briefcase"></i></div>
                                <div className="stat-details">
                                    <h3 style={{ fontSize: '0.85rem' }}>Open Vacancies</h3>
                                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{loadingJobs ? '...' : jobs.length}</div>
                                </div>
                            </div>
                            <div className="stat-card-modern accent" style={{ padding: '1.25rem' }}>
                                <div className="stat-icon" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}><i className="fas fa-user-graduate"></i></div>
                                <div className="stat-details">
                                    <h3 style={{ fontSize: '0.85rem' }}>Students Registry</h3>
                                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{loadingUsers ? '...' : totalStudents}</div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Balanced 50/50 Body Grid */}
                        <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                            {/* Left Col: Analytics Perspective */}
                            <div className="analytics-col">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {renderAnalytics()}
                                </div>
                            </div>

                            {/* Right Col: Operations & Activity */}
                            <div className="operations-col">
                                <div className="surface-glow" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', height: '100%' }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <i className="fas fa-terminal"></i> Strategic Actions
                                    </h3>
                                    
                                    <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                        <button className="btn-premium" onClick={() => setActiveTab('jobs')}>
                                            <i className="fas fa-plus-circle"></i> New Job
                                        </button>
                                        <button className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid var(--border-color)' }} onClick={() => setActiveTab('users')}>
                                            <i className="fas fa-user-plus"></i> Onboard
                                        </button>
                                        <button className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid var(--border-color)' }} onClick={() => setActiveTab('profile-details')}>
                                            <i className="fas fa-shield-alt"></i> Verify
                                        </button>
                                        <button className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid var(--border-color)' }} onClick={() => setActiveTab('interviews')}>
                                            <i className="fas fa-calendar-alt"></i> Drives
                                        </button>
                                    </div>

                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <i className="fas fa-stream"></i> Operational Feed
                                    </h3>
                                    <div className="activity-feed">
                                        {recentActivities.length === 0 ? (
                                            <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>All quiet for now...</p>
                                        ) : (
                                            recentActivities.map((act, i) => (
                                                <div key={i} className="feed-item" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid transparent' }}>
                                                    <div className="act-type" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: act.type === 'app' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 71, 123, 0.1)', color: act.type === 'app' ? 'var(--primary)' : 'var(--accent)' }}>
                                                        <i className={`fas ${act.type === 'app' ? 'fa-file-alt' : 'fa-briefcase'}`}></i>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>{act.text}</p>
                                                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{new Date(act.time).toLocaleDateString()}</small>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isSuperAdmin && (
                            <div className="company-stats-section desktop-only" style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ marginBottom: '1.5rem' }}>Company Performance</h2>
                                {loadingStats ? (
                                    <div className="loading-indicator">Loading company statistics...</div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {companyStats.length === 0 ? <p>No company data available.</p> : companyStats.map((stat, index) => (
                                            <div key={index} className="surface-glow" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                                                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                                    <i className="fas fa-building" style={{ marginRight: '8px' }}></i>
                                                    {stat.companyName}
                                                </h4>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Jobs Posted:</span>
                                                    <span style={{ fontWeight: 'bold' }}>{stat.jobCount}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Interviews:</span>
                                                    <span style={{ fontWeight: 'bold' }}>{stat.interviewCount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Global Email Control - Super Admin Only */}
                        {/* Global Email Control - Super Admin Only */}
                        {isSuperAdmin && (
                            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-mail-bulk"></i>
                                        Email Notification Center
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                                        Manage all system-generated emails. Changes are saved to the server immediately.
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                                    {[
                                        { key: 'masterEmailEnabled', title: 'Master Switch', descOn: 'System emails are ACTIVE', descOff: 'ALL emails are BLOCKED', icon: 'fas fa-power-off', activeHex: '#22c55e', activeRgb: '34, 197, 94', disabled: false },
                                        { key: 'newJobEmailEnabled', title: 'New Job Alerts', descOn: 'Emails to students when jobs are posted', descOff: 'Emails to students when jobs are posted', icon: 'fas fa-bullhorn', activeHex: '#f472b6', activeRgb: '244, 114, 182', disabled: !emailSettings.masterEmailEnabled },
                                        { key: 'statusUpdateEmailEnabled', title: 'Status Updates', descOn: 'Shortlisted, Selected, Rejected emails', descOff: 'Shortlisted, Selected, Rejected emails', icon: 'fas fa-envelope-open-text', activeHex: '#fbbf24', activeRgb: '251, 191, 36', disabled: !emailSettings.masterEmailEnabled },
                                        { key: 'accountEmailEnabled', title: 'Account Emails', descOn: 'Welcome, Password Reset, Verification', descOff: 'Welcome, Password Reset, Verification', icon: 'fas fa-user-shield', activeHex: '#a855f7', activeRgb: '168, 85, 247', disabled: !emailSettings.masterEmailEnabled },
                                        { key: 'paperDownloadEnabled', title: 'Paper Download Feature', descOn: 'Students CAN download previous year papers', descOff: 'Students CANNOT download papers (View only)', icon: 'fas fa-file-pdf', activeHex: '#00d4ff', activeRgb: '0, 212, 255', disabled: false },
                                        { key: 'notesDownloadEnabled', title: 'Study Notes Download Feature', descOn: 'Students CAN download PDF notes', descOff: 'Students CANNOT download notes (View only)', icon: 'fas fa-book', activeHex: '#00d4ff', activeRgb: '0, 212, 255', disabled: false },
                                        { key: 'screenshotRestrictionEnabled', title: 'Screenshot & Key Restriction', descOn: 'Screenshot & Print/Save keyboard blocks are ACTIVE', descOff: 'Screenshots and all keyboard shortcuts are ALLOWED', icon: 'fas fa-camera-retro', activeHex: '#22c55e', activeRgb: '34, 197, 94', disabled: false }
                                    ].map(item => {
                                        const isActive = emailSettings[item.key];
                                        const isMaster = item.key === 'masterEmailEnabled';
                                        const effectiveDisabled = !isMaster && item.disabled;
                                        const effectiveOpacity = effectiveDisabled ? 0.4 : 1;
                                        const bgRgba = isActive ? `rgba(${item.activeRgb}, 0.15)` : 'rgba(239, 68, 68, 0.15)';
                                        const borderColor = isActive ? `rgba(${item.activeRgb}, 0.3)` : 'rgba(239, 68, 68, 0.3)';
                                        const iconColor = isActive ? item.activeHex : '#f87171';
                                        const borderLeftColor = isActive ? item.activeHex : '#ef4444';

                                        return (
                                            <div className="card surface-glow-premium hover-scale" key={item.key} style={{ padding: '1.25rem', borderRadius: '16px', borderLeft: `4px solid ${borderLeftColor}`, display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: effectiveOpacity, transition: 'all 0.3s ease' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, background: bgRgba, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, fontSize: '1.3rem', border: `1px solid ${borderColor}` }}>
                                                    <i className={item.icon}></i>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '600', wordBreak: 'break-word' }}>{item.title}</h4>
                                                    <p className="desktop-only" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{isActive ? item.descOn : item.descOff}</p>
                                                </div>
                                                <div>
                                                    <ToggleSwitch checked={isActive} onChange={() => toggleEmailSetting(item.key, isActive)} disabled={effectiveDisabled} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="recent-activity desktop-only">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Recent Job Postings</h2>
                                <div className="search-box-modern">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Quick search jobs..."
                                        value={jobSearch}
                                        onChange={(e) => setJobSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="table-responsive surface-glow animate-slide-up" style={{ marginTop: '1rem', borderRadius: '16px' }}>
                                <table className="modern-table">
                                    <thead>
                                        <tr><th>Title</th><th>Company</th><th>Status</th><th>Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {jobs.filter(j =>
                                            j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
                                            j.company_name?.toLowerCase().includes(jobSearch.toLowerCase())
                                        ).slice(0, 6).map(job => (
                                            <tr key={job.id} className="row-hover">
                                                <td><span style={{ fontWeight: '600' }}>{job.title}</span></td>
                                                <td>{job.company_name}</td>
                                                <td>
                                                    <span className="badge-role role-user" style={{ fontSize: '0.7rem' }}>Active</span>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{new Date(job.last_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'jobs': {
                const filteredJobs = jobs.filter(j => 
                    j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || 
                    j.company_name?.toLowerCase().includes(jobSearch.toLowerCase())
                );

                return (
                    <div className="jobs-management-page animate-in">

                        {/* Job Form Drawer/Modal */}
                        <section id="jobs-section" className={`card surface-glow job-form-drawer ${isJobFormOpen || editingJob ? 'open' : ''}`}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3><i className={editingJob ? "fas fa-edit" : "fas fa-plus-circle"}></i> {editingJob ? 'Edit Job' : 'Post New Job'}</h3>
                                <button className="btn btn-outline-sm mobile-only" onClick={() => { setIsJobFormOpen(false); setEditingJob(null); }}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            {message.text && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ display: 'flex' }}>
                                    {message.text}
                                </div>
                            )}
                            <form id="jobForm" onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="jobTitle">Job Title</label>
                                        <input type="text" id="jobTitle" className="form-control" required value={formData.jobTitle} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="companyName">Company Name</label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            className="form-control"
                                            required
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            readOnly={isCompanyAdmin}
                                            style={isCompanyAdmin ? { backgroundColor: 'rgba(255,255,255,0.1)', cursor: 'not-allowed' } : {}}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label htmlFor="jobDescription">Job Description</label>
                                        <textarea id="jobDescription" className="form-control" rows="4" required value={formData.jobDescription} onChange={handleInputChange}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="applyLink">Apply Link</label>
                                        <input type="url" id="applyLink" className="form-control" required value={formData.applyLink} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastDate">Last Date to Apply</label>
                                        <input type="date" id="lastDate" className="form-control" required value={formData.lastDate} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="salary">Salary (₹ per annum)</label>
                                        <input type="number" id="salary" className="form-control" min="0" required value={formData.salary} onChange={handleInputChange} />
                                    </div>
                                </div>

                                {/* Interview Rounds Section */}
                                <InterviewRoundsForm
                                    interviewDetails={interviewDetails}
                                    setInterviewDetails={setInterviewDetails}
                                />

                                {/* Eligibility Criteria Section */}
                                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                    <h4 style={{ color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-filter"></i> Eligibility Criteria
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                                        Enable specific branches and their corresponding semesters/years.
                                    </p>

                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                        {departments.length > 0 ? departments.map(dept => (
                                            <div key={dept.code} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{dept.name} ({dept.code})</span>
                                                    <ToggleSwitch
                                                        checked={formData.eligibleBranches?.includes(dept.code)}
                                                        onChange={(e) => {
                                                            const branches = formData.eligibleBranches || [];
                                                            if (e.target.checked) setFormData({ ...formData, eligibleBranches: [...branches, dept.code] });
                                                            else setFormData({ ...formData, eligibleBranches: branches.filter(b => b !== dept.code) });
                                                        }}
                                                    />
                                                </div>
                                                {formData.eligibleBranches?.includes(dept.code) && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                                        {Array.from({ length: dept.maxSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                                            <div key={`${dept.code}-${sem}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', minWidth: '100px', flex: '1 1 auto' }}>
                                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>Sem {sem}</span>
                                                                <ToggleSwitch
                                                                    checked={formData.eligibleSemesters?.includes(sem)}
                                                                    onChange={(e) => {
                                                                        const sems = formData.eligibleSemesters || [];
                                                                        if (e.target.checked) setFormData({ ...formData, eligibleSemesters: [...sems, sem] });
                                                                        else setFormData({ ...formData, eligibleSemesters: sems.filter(s => s !== sem) });
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p>Loading Departments or None Found...</p>}
                                    </div>
                                </div>

                                {/* Email Notification Toggle */}
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontWeight: '600', color: 'white', marginBottom: '0.25rem', display: 'block' }}>
                                                <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                                                Email Notifications
                                            </label>
                                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                                                Send email alerts to all students when a new job is posted
                                             </p>
                                        </div>
                                        <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '30px', flexShrink: 0 }}>
                                            <input
                                                type="checkbox"
                                                checked={sendEmailNotifications}
                                                onChange={(e) => setSendEmailNotifications(e.target.checked)}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                cursor: 'pointer',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: sendEmailNotifications ? '#22c55e' : '#64748b',
                                                transition: '0.4s',
                                                borderRadius: '30px'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    content: '""',
                                                    height: '22px',
                                                    width: '22px',
                                                    left: sendEmailNotifications ? '34px' : '4px',
                                                    bottom: '4px',
                                                    backgroundColor: 'white',
                                                    transition: '0.4s',
                                                    borderRadius: '50%'
                                                }}></span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={fillSampleData}>
                                        <i className="fas fa-magic"></i> Fill Sample
                                    </button>
                                    <button type="button" className="btn btn-warning" onClick={() => { clearForm(); setEditingJob(null); }}>
                                        <i className="fas fa-eraser"></i> Clear
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save"></i> {editingJob ? 'Update Job' : 'Post Job'}
                                    </button>
                                    {editingJob && (
                                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingJob(null); clearForm(); }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                        <section className="card surface-glow">
                            {loadingJobs && <TableSkeleton cols={5} rows={2} />}
                            {!loadingJobs && (
                                <>
                                <div className="table-responsive desktop-only-table">
                                    {filteredJobs.length === 0 ? <p style={{ padding: '1rem' }}>No jobs posted yet.</p> : (
                                        <table id="jobsTable">
                                            <thead>
                                                <tr><th>Title</th><th>Company</th><th>Last Date</th><th>Salary</th><th>Actions</th></tr>
                                            </thead>
                                            <tbody id="jobsList">
                                                {filteredJobs.map(job => (
                                                    <tr key={job.id}>
                                                        <td>{job.title}</td>
                                                        <td>{job.company_name}</td>
                                                        <td>{new Date(job.last_date).toLocaleDateString('en-IN')}</td>
                                                        <td>₹{job.salary.toLocaleString()}</td>
                                                        <td className="action-btns">
                                                            {(!isCompanyAdmin || job.company_name === myCompanyName) ? (
                                                                <>
                                                                    <button className="btn btn-secondary" onClick={() => { setIsJobFormOpen(true); startEditJob(job); }} style={{ marginRight: '0.5rem' }}>
                                                                        <i className="fas fa-edit"></i>
                                                                    </button>
                                                                    <button className="btn btn-danger" onClick={() => deleteJob(job.id)}>
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="badge badge-secondary" style={{ opacity: 0.7 }}>View Only</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                
                                {/* Mobile Job Cards */}
                                <div className="mobile-job-cards mobile-only">
                                    {filteredJobs.length === 0 ? <p style={{ padding: '1rem' }}>No jobs posted yet.</p> : (
                                        filteredJobs.map(job => (
                                            <div key={job.id} className="mobile-job-card">
                                                <div className="job-card-top">
                                                    <h4 className="job-title">{job.title}</h4>
                                                    <span className="badge-role role-user" style={{ backgroundColor: '#064e3b', color: '#4ade80', border: 'none', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                                                        JOB
                                                    </span>
                                                </div>
                                                <div className="job-card-account">
                                                    <span className="account-id">{job.company_name || `JOB-${job.id}`}</span>
                                                </div>
                                                
                                                <div className="mobile-expandable-cell">
                                                    <input type="checkbox" id={`expand-job-${job.id}`} className="expand-checkbox" />
                                                    <label htmlFor={`expand-job-${job.id}`} className="expand-label mobile-only" style={{ marginTop: '0.5rem' }}>
                                                        <span>Details</span>
                                                        <i className="fas fa-chevron-down" style={{ transition: 'transform 0.3s' }}></i>
                                                    </label>
                                                    <div className="expandable-content" style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span style={{ color: '#888888' }}>Last Date:</span>
                                                            <span style={{ color: 'white' }}>{new Date(job.last_date).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                            <span style={{ color: '#888888' }}>Salary:</span>
                                                            <span style={{ color: '#4ade80' }}>₹{job.salary.toLocaleString()}</span>
                                                        </div>
                                                        
                                                        <div className="job-card-actions">
                                                            {(!isCompanyAdmin || job.company_name === myCompanyName) ? (
                                                                <>
                                                                    <button className="btn btn-secondary thumb-btn" onClick={() => { setIsJobFormOpen(true); startEditJob(job); }}>
                                                                        <i className="fas fa-edit"></i> Edit
                                                                    </button>
                                                                    <button className="btn btn-danger thumb-btn" onClick={() => deleteJob(job.id)}>
                                                                        <i className="fas fa-trash"></i> Delete
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="badge badge-secondary" style={{ opacity: 0.7, width: '100%', textAlign: 'center' }}>View Only</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {isSuperAdmin && jobs.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', padding: '0 1.5rem 1.5rem' }}>
                                        <button
                                            onClick={handleDeleteAllJobs}
                                            className="btn btn-danger"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600' }}
                                        >
                                            <i className="fas fa-trash-alt"></i> Delete All Jobs
                                        </button>
                                    </div>
                                )}
                                </>
                            )}
                        </section>
                    </div>
                );
            }
            case 'users': {
                const filteredUsers = users.filter(user => {
                    if (role === 'DEPT_ADMIN') {
                        const myBranch = localStorage.getItem('adminBranch');
                        return user.role === 'USER' && user.branch === myBranch;
                    }
                    return true;
                });

                return (
                    <div className="users-management-page animate-in">
                        {!isCompanyAdmin && (isUserFormOpen || editingUser) && (
                            <section className="card surface-glow-premium" style={{ marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                <div className="card-header" style={{ background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.1), transparent)', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'}`} style={{ color: 'var(--primary)' }}></i>
                                        {editingUser ? 'Update Professional Account' : 'Onboard New User'}
                                    </h3>
                                    {editingUser && (
                                        <button className="btn btn-outline-sm" onClick={() => { setEditingUser(null); clearUserForm(); setIsUserFormOpen(false); }}>
                                            <i className="fas fa-times"></i> Cancel Edit
                                        </button>
                                    )}
                                </div>
                                <div className="card-body" style={{ padding: '2rem' }}>
                                    {message.text && (
                                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} animate-pulse-subtle`} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
                                            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                            {message.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleUserSubmit}>
                                        <div className="form-grid-modern">
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-at"></i> Username</label>
                                                <input
                                                    type="text"
                                                    className="form-control-modern"
                                                    placeholder="@hack-2-hired"
                                                    required
                                                    value={userForm.username}
                                                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-envelope"></i> Email Address</label>
                                                <input
                                                    type="email"
                                                    className="form-control-modern"
                                                    placeholder="depabhijain@gmail.com"
                                                    required
                                                    value={userForm.email}
                                                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-key"></i> Password {editingUser && '(Leave blank to retain)'}</label>
                                                <input
                                                    type="password"
                                                    className="form-control-modern"
                                                    placeholder="••••••••••••"
                                                    required={!editingUser}
                                                    value={userForm.password}
                                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-user-tag"></i> Role</label>
                                                <select
                                                    className="form-control-modern"
                                                    value={userForm.role}
                                                    disabled={currentUserRank <= 40} // Only ADMIN and above can create other admins
                                                    onChange={e => {
                                                        const newRole = e.target.value;
                                                        setUserForm(prev => ({
                                                            ...prev,
                                                            role: newRole,
                                                            companyName: newRole === 'COMPANY_ADMIN' ? prev.companyName : '',
                                                            adminBranch: newRole === 'DEPT_ADMIN' ? (departments.length > 0 ? departments[0].code : prev.adminBranch) : ''
                                                        }));
                                                    }}
                                                >
                                                    <option value="USER">STUDENT / USER</option>
                                                    {currentUserRank > 20 && <option value="COMPANY_ADMIN">COMPANY ADMIN</option>}
                                                    {currentUserRank > 40 && <option value="DEPT_ADMIN">DEPT ADMIN</option>}
                                                    {currentUserRank > 60 && <option value="ADMIN">ADMIN</option>}
                                                    {currentUserRank >= 80 && <option value="SUPER_ADMIN">SUB-SUPER ADMIN</option>}
                                                </select>
                                            </div>

                                            {userForm.role === 'USER' && (
                                                <>
                                                    <div className="form-group-modern animate-slide-up">
                                                        <label><i className="fas fa-barcode"></i> Computer Code</label>
                                                        <input
                                                            type="text"
                                                            className="form-control-modern"
                                                            value={userForm.computerCode}
                                                            onChange={e => setUserForm({ ...userForm, computerCode: e.target.value })}
                                                            placeholder="Unique ID (e.g. 59500)"
                                                        />
                                                    </div>
                                                    <div className="form-group-modern animate-slide-up">
                                                        <label><i className="fas fa-graduation-cap"></i> Branch</label>
                                                        <select
                                                            className="form-control-modern"
                                                            value={userForm.branch}
                                                            onChange={e => setUserForm({ ...userForm, branch: e.target.value })}
                                                        >
                                                            <option value="">Select Department</option>
                                                            {departments.map(d => (
                                                                <option key={d.id} value={d.code}>{d.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group-modern animate-slide-up">
                                                        <label><i className="fas fa-users"></i> Batch (Passout)</label>
                                                        <select
                                                            className="form-control-modern"
                                                            value={userForm.batch}
                                                            onChange={e => setUserForm({ ...userForm, batch: e.target.value })}
                                                        >
                                                            <option value="">Select Year</option>
                                                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                                                                <option key={yr} value={yr}>{yr}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>
                                            )}

                                            {userForm.role === 'DEPT_ADMIN' && (
                                                <div className="form-group-modern full-width animate-slide-up" style={{ background: 'rgba(0, 212, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                                                    <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Branch (Department to Manage) *</label>
                                                    <select
                                                        className="form-control-modern"
                                                        required
                                                        value={userForm.adminBranch || ''}
                                                        onChange={e => setUserForm({ ...userForm, adminBranch: e.target.value })}
                                                        style={{ marginTop: '0.5rem' }}
                                                    >
                                                        <option value="">Select Branch to Manage</option>
                                                        {departments.map(d => (
                                                            <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                                                        ))}
                                                    </select>
                                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', margin: '0.5rem 0 0' }}>
                                                        <i className="fas fa-info-circle"></i> This admin will have restricted access to manage only the selected department's data.
                                                    </p>
                                                </div>
                                            )}

                                            {userForm.role === 'COMPANY_ADMIN' && (
                                                <div className="form-group-modern full-width animate-slide-up" style={{ background: 'rgba(255, 71, 123, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 71, 123, 0.2)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                                        <div>
                                                            <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Company Name *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control-modern"
                                                                required
                                                                value={userForm.companyName || ''}
                                                                onChange={e => setUserForm({ ...userForm, companyName: e.target.value })}
                                                                placeholder="e.g. Google, Amazon"
                                                                style={{ marginTop: '0.5rem' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Allowed Hiring Channels *</label>
                                                            <div className="dept-checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                {departments.map(dept => (
                                                                    <label key={dept.id} className="custom-checkbox-container">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={userForm.allowedDepartments.includes(dept.code)}
                                                                            onChange={e => {
                                                                                const depts = e.target.checked
                                                                                    ? [...userForm.allowedDepartments, dept.code]
                                                                                    : userForm.allowedDepartments.filter(d => d !== dept.code);
                                                                                setUserForm({ ...userForm, allowedDepartments: depts });
                                                                            }}
                                                                        />
                                                                        <span className="checkmark"></span>
                                                                        {dept.code}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn-premium" disabled={isUserCreating}>
                                                <span>{isUserCreating ? 'Your account is creating in 3 to 5 seconds...' : (editingUser ? 'Update Professional Account' : 'Initialize Account')}</span>
                                                {isUserCreating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        )}

                        <section className="card surface-glow" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'stretch', padding: '1.5rem 2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'nowrap' }}>
                                    <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>Registered Workforce</h3>
                                    {role === 'DEPT_ADMIN' && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap' }}>
                                            Displaying students from {localStorage.getItem('adminBranch')}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center', flexWrap: 'nowrap' }}>
                                    <div style={{ flex: 1, display: 'flex' }}>
                                        <div className="search-box-modern" style={{ width: '100%' }}>
                                            <i className="fas fa-search" style={{ position: 'absolute', left: '12px' }}></i>
                                            <input
                                                type="text"
                                                placeholder="Search accounts..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                style={{ width: '100%', minWidth: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex' }}>
                                        <button className="btn-icon" title="Refresh List" onClick={loadUsers} style={{ width: '100%', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <i className="fas fa-sync-alt"></i>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Refresh</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loadingUsers ? (
                                <TableSkeleton cols={5} rows={2} />
                            ) : (
                                <div className="table-container">
                                    {filteredUsers.filter(u =>
                                        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.companyName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.role?.toLowerCase().includes(userSearch.toLowerCase())
                                    ).length === 0 ? (
                                        <div className="empty-state">
                                            <i className="fas fa-user-slash"></i>
                                            <p>No matching users found in registry.</p>
                                        </div>
                                    ) : (
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Account</th>
                                                    <th>Role</th>
                                                    <th>Assignment</th>
                                                    <th style={{ textAlign: 'right' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.filter(u =>
                                                    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                    u.companyName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                    u.role?.toLowerCase().includes(userSearch.toLowerCase())
                                                ).map(user => (
                                                    <tr key={user.id} className="row-hover">

                                                        <td data-label="Account">
                                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                                                {user.email ? user.email.split('@')[0] : user.username}
                                                            </div>
                                                        </td>
                                                        <td data-label="Role">
                                                            <span className={user.id === 1 ? 'badge-role role-system-owner' : `badge-role role-${user.role.toLowerCase().replace('_', '-')}`} style={user.role === 'USER' ? { backgroundColor: '#064e3b', color: '#4ade80', border: 'none' } : {}}>
                                                                {user.id === 1 ? 'SYSTEM OWNER' : (user.role === 'SUPER_ADMIN' ? 'SUB-SUPER ADMIN' : user.role)}
                                                            </span>
                                                        </td>
                                                        <td data-label="" className="mobile-expandable-cell">
                                                            <input type="checkbox" id={`expand-assignment-${user.id}`} className="expand-checkbox" />
                                                            <label htmlFor={`expand-assignment-${user.id}`} className="expand-label mobile-only">
                                                                <span>Assignment</span>
                                                                <i className="fas fa-chevron-down" style={{ transition: 'transform 0.3s' }}></i>
                                                            </label>
                                                            <div className="expandable-content" style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                                                                {user.companyName ? (
                                                                    <span style={{ color: 'var(--accent)' }}><i className="fas fa-building"></i> {user.companyName}</span>
                                                                ) : user.adminBranch ? (
                                                                    <span style={{ color: 'var(--primary)' }}><i className="fas fa-university"></i> {user.adminBranch}</span>
                                                                ) : user.branch ? (
                                                                    <span>{user.branch} {user.batch ? `'${user.batch.toString().slice(-2)}` : ''}</span>
                                                                ) : (
                                                                    <span style={{ opacity: 0.5 }}>System Wide</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td data-label="">
                                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                                {user.id !== 1 && (
                                                                    <button
                                                                        className="action-btn-modern edit-btn"
                                                                        onClick={() => startEditUser(user)}
                                                                        disabled={isCompanyAdmin || currentUserRank <= getRank(user)}
                                                                        title={isCompanyAdmin || currentUserRank <= getRank(user) ? "Insufficient Hierarchy Authority" : "Edit User"}
                                                                        style={isCompanyAdmin || currentUserRank <= getRank(user) ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                                                                    >
                                                                        <i className="fas fa-pencil-alt"></i>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="action-btn-modern delete-btn"
                                                                    onClick={() => deleteUser(user.id)}
                                                                    disabled={isCompanyAdmin || currentUserRank <= getRank(user) || user.id === 1}
                                                                    title={isCompanyAdmin || currentUserRank <= getRank(user) || user.id === 1 ? "Insufficient Hierarchy Authority" : "Delete User"}
                                                                    style={isCompanyAdmin || currentUserRank <= getRank(user) || user.id === 1 ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                );
            }
            case 'profile-details':
                return renderProfileDetails();
            case 'applications': {
                const filteredApplications = applications.filter(app =>
                    app.applicantName?.toLowerCase().includes(appSearch.toLowerCase()) ||
                    app.companyName?.toLowerCase().includes(appSearch.toLowerCase()) ||
                    app.jobTitle?.toLowerCase().includes(appSearch.toLowerCase()) ||
                    app.applicantEmail?.toLowerCase().includes(appSearch.toLowerCase())
                );

                return (
                    <div className="users-management-page animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
                        {/* Buttons moved to global page header — see header-right activeTab === 'applications' block */}

                        {loadingApplications ? (
                            <TableSkeleton cols={7} rows={2} />
                        ) : filteredApplications.length > 0 ? (
                            <section className="card surface-glow-premium" style={{ border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: 0 }}>
                                <div className="table-responsive" style={{ padding: '1rem' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Contact</th>
                                                <th>Job/Company</th>
                                                <th>Applied</th>
                                                <th>Resume</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredApplications.map(app => (
                                                <tr key={app.id}>
                                                    <td><strong>{app.applicantName}</strong></td>
                                                    <td style={{ fontSize: '0.8rem' }}>{app.applicantEmail}</td>
                                                    <td>
                                                        <div style={{ fontWeight: '500' }}>{app.jobTitle}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{app.companyName}</div>
                                                    </td>
                                                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                    <td>
                                                        {app.resumePath ? (
                                                            <button
                                                                className="action-btn-modern edit-btn"
                                                                onClick={() => {
                                                                    const filename = app.resumePath.split('/').pop();
                                                                    window.open(`${API_BASE_URL}/resume/download/${filename}`, '_blank');
                                                                }}
                                                            >
                                                                <i className="fas fa-file-pdf"></i>
                                                            </button>
                                                        ) : <span style={{ opacity: 0.5 }}>None</span>}
                                                    </td>
                                                    <td>
                                                        <span className={`badge-role role-${app.status === 'SELECTED' ? 'user' : app.status === 'REJECTED' ? 'super-admin' : 'admin'}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                                            className="form-control"
                                                            style={{ width: 'auto', padding: '0.4rem' }}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="SHORTLISTED">Shortlist</option>
                                                            <option value="REJECTED">Reject</option>
                                                            <option value="SELECTED">Select</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                <i className="fas fa-inbox" style={{ fontSize: '4.5rem', color: 'rgba(0,212,255,0.15)', marginBottom: '1.5rem' }}></i>
                                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '500', margin: 0 }}>No applications yet.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'interviews':
                return (
                    <div className="users-management-page animate-in">
                        {(isInterviewFormOpen || editingInterview) && (
                        <section className="card surface-glow" style={{ marginBottom: '2.5rem' }}>
                            <div className="card-header">
                                <h3><i className={editingInterview ? "fas fa-edit" : "fas fa-calendar-plus"}></i> {editingInterview ? 'Edit Interview' : 'Post New Interview'}</h3>
                            </div>
                            <form onSubmit={handleInterviewSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Company Name</label>
                                        <input type="text" className="form-control" required value={interviewForm.company} onChange={e => setInterviewForm({ ...interviewForm, company: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="date" className="form-control" required value={interviewForm.date} onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Time (e.g., 10:00 AM - 2:00 PM)</label>
                                        <input type="text" className="form-control" required value={interviewForm.time} onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Venue / Mode</label>
                                        <input type="text" className="form-control" required value={interviewForm.venue} onChange={e => setInterviewForm({ ...interviewForm, venue: e.target.value })} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Positions (comma separated)</label>
                                        <input type="text" className="form-control" required value={interviewForm.positions} onChange={e => setInterviewForm({ ...interviewForm, positions: e.target.value })} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Eligibility (e.g., CGPA &gt; 7.0)</label>
                                        <input type="text" className="form-control" required value={interviewForm.eligibility} onChange={e => setInterviewForm({ ...interviewForm, eligibility: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={fillInterviewSampleData}>
                                        <i className="fas fa-magic"></i> Fill Sample
                                    </button>
                                    <button type="button" className="btn btn-warning" onClick={() => { clearInterviewForm(); setEditingInterview(null); }}>
                                        <i className="fas fa-eraser"></i> Clear
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save"></i> {editingInterview ? 'Update Interview' : 'Post Interview'}
                                    </button>
                                    {editingInterview && (
                                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingInterview(null); clearInterviewForm(); setIsInterviewFormOpen(false); }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>
                        )}

                        <section className="card surface-glow">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr><th>Company</th><th>Date</th><th>Venue</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {interviews.map(interview => (
                                            <tr key={interview.id}>
                                                <td>{interview.company}</td>
                                                <td>{new Date(interview.date).toLocaleDateString()}</td>
                                                <td>{interview.venue}</td>
                                                <td className="action-btns">
                                                    {(!isCompanyAdmin || interview.company === myCompanyName) ? (
                                                        <>
                                                            <button className="btn btn-secondary" onClick={() => startEditInterview(interview)} style={{ marginRight: '0.5rem' }}>
                                                                 <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-danger" onClick={() => deleteInterview(interview.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="badge badge-secondary" style={{ opacity: 0.7 }}>View Only</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                );
            case 'interview-applications': {
                const filteredInterviewApps = interviewApplications.filter(app =>
                    app.applicantName?.toLowerCase().includes(interviewSearch.toLowerCase()) ||
                    app.companyName?.toLowerCase().includes(interviewSearch.toLowerCase()) ||
                    app.applicantEmail?.toLowerCase().includes(interviewSearch.toLowerCase())
                );

                return (
                    <div className="users-management-page animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
                        {/* Search moved to global page header — see header-right activeTab === 'interview-applications' block */}

                        {loadingInterviewApps ? (
                            <TableSkeleton cols={6} rows={2} />
                        ) : filteredInterviewApps.length > 0 ? (
                            <section className="card surface-glow-premium" style={{ border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: 0 }}>
                                <div className="table-responsive" style={{ padding: '1rem' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Applicant Name</th>
                                                <th>Company</th>
                                                <th>Date</th>
                                                <th>Resume</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInterviewApps.map(app => (
                                                <tr key={app.id}>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>{app.applicantName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{app.applicantEmail}</div>
                                                    </td>
                                                    <td>{app.companyName}</td>
                                                    <td>{new Date(app.interviewDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            className="action-btn-modern edit-btn"
                                                            onClick={() => {
                                                                const filename = app.resumePath.split('/').pop();
                                                                window.open(`${API_BASE_URL}/resume/download/${filename}`, '_blank');
                                                            }}
                                                            title="Download Resume"
                                                        >
                                                            <i className="fas fa-file-pdf"></i>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-role role-${app.status === 'SELECTED' ? 'user' : app.status === 'SHORTLISTED' ? 'admin' : app.status === 'REJECTED' ? 'super-admin' : 'dept-admin'}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => updateInterviewAppStatus(app.id, e.target.value)}
                                                            className="form-control"
                                                            style={{ width: 'auto', padding: '0.5rem' }}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="SHORTLISTED">Shortlist</option>
                                                            <option value="REJECTED">Reject</option>
                                                            <option value="SELECTED">Select</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '4rem 2rem' }}>
                                <i className="fas fa-inbox" style={{ fontSize: '4.5rem', color: 'rgba(0,212,255,0.15)', marginBottom: '1.5rem' }}></i>
                                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '500', margin: 0 }}>No interview applications received yet.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'gallery':
                return (
                    <div className="users-management-page animate-in">
                        {isGalleryFormOpen && (
                            <section className="card surface-glow animate-slide-up" style={{ marginBottom: '2.5rem' }}>
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3><i className="fas fa-camera"></i> Share New Photo</h3>
                                    <button 
                                        className="btn btn-outline-sm mobile-only" 
                                        onClick={() => setIsGalleryFormOpen(false)}
                                    >
                                        <i className="fas fa-times"></i> Close
                                    </button>
                                </div>
                            <div style={{ padding: '2rem' }}>
                                {message.text && (
                                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1.5rem' }}>
                                        {message.text}
                                    </div>
                                )}
                                <form onSubmit={handleGalleryUpload}>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={galleryForm.title}
                                            onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                                            placeholder="e.g., Annual Tech Fest 2024"
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                        <select
                                            className="form-control"
                                            value={galleryForm.type}
                                            onChange={e => setGalleryForm({ ...galleryForm, type: e.target.value })}
                                        >
                                            <option value="campus">Campus</option>
                                            <option value="lab">Lab</option>
                                            <option value="function">Function</option>
                                            <option value="farewell">Farewell</option>
                                            <option value="class">Class</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={galleryForm.description}
                                            onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                                            placeholder="Tell us about this photo..."
                                        ></textarea>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Photo</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            required
                                            accept="image/*"
                                            onChange={e => setGalleryForm({ ...galleryForm, image: e.target.files[0] })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="submit" className="btn btn-primary" disabled={galleryUploadLoading}>
                                            {galleryUploadLoading ? 'Uploading...' : 'Submit Photo'}
                                        </button>
                                        <button type="button" className="btn btn-outline" onClick={() => {
                                            setGalleryForm({ title: '', type: 'campus', description: '', image: null });
                                        }}>
                                            Clear Form
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>
                        )}

                        <section className="card surface-glow">
                            <div className="table-responsive surface-glow-premium" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                            {loadingGallery ? (
                                <TableSkeleton cols={5} rows={2} />
                            ) : galleryItems.length > 0 ? (
                                <div className="table-responsive" style={{ padding: '1rem' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Type</th>
                                                <th>Uploaded By</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {galleryItems.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        {item.title}
                                                        {item.description && <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.description.substring(0, 50)}...</div>}
                                                    </td>
                                                    <td>{item.type}</td>
                                                    <td>{item.uploadedBy}</td>
                                                    <td>
                                                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                            <select
                                                                value={item.status}
                                                                onChange={(e) => updateGalleryStatus(item.id, e.target.value)}
                                                                className="form-control"
                                                                style={{ width: 'auto', padding: '0.4rem', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="PENDING">Pending</option>
                                                                <option value="ACCEPTED">Accept</option>
                                                                <option value="REJECTED">Reject</option>
                                                            </select>
                                                            <button className="action-btn-modern delete-btn" onClick={() => deleteGalleryItem(item.id)} title="Delete Item">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                            <button
                                                                className="action-btn-modern edit-btn"
                                                                onClick={() => window.open(item.url, '_blank')}
                                                                title="View Image"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ padding: '2rem', textAlign: 'center' }}>No gallery items found.</p>
                            )}
                            </div>
                        </section>
                    </div>
                );
            case 'companies': {
                const companyAdmins = users.filter(u => u.role === 'COMPANY_ADMIN');

                const toggleCompanyStatus = async (userId) => {
                    try {
                        const response = await fetch(`${ADMIN_API_URL}/users/${userId}/toggle-status`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${getToken()}` }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            setMessage({ text: data.message, type: 'success' });
                            loadUsers(); // Reload users to get updated status
                            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                        } else {
                            setMessage({ text: 'Failed to toggle company status', type: 'error' });
                        }
                    } catch (error) {
                        setMessage({ text: 'Error toggling company status', type: 'error' });
                    }
                };

                return (
                    <section className="card surface-glow">
                        {loadingUsers ? (
                            <TableSkeleton cols={4} rows={2} />
                        ) : companyAdmins.length > 0 ? (
                            <div className="table-responsive" style={{ padding: '1rem' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Company Name</th>
                                            <th>Admin Username</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyAdmins.map(company => (
                                            <tr key={company.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <i className="fas fa-building" style={{ color: 'var(--primary)' }}></i>
                                                        <strong>{company.companyName || 'N/A'}</strong>
                                                    </div>
                                                </td>
                                                <td>{company.username}</td>
                                                <td>{company.email}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        background: company.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                        color: company.enabled ? '#22c55e' : '#ef4444'
                                                    }}>
                                                        {company.enabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleCompanyStatus(company.id)}
                                                        className="btn"
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: company.enabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                            border: `1px solid ${company.enabled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                                                            color: company.enabled ? '#ef4444' : '#22c55e'
                                                        }}
                                                    >
                                                        <i className={`fas fa-${company.enabled ? 'ban' : 'check-circle'}`}></i>
                                                        {company.enabled ? ' Disable' : ' Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>No company admins found.</p>
                        )}
                    </section>
                );
            }
            case 'menu':
                return <AdminMobileMenu menuGroups={menuGroups} menuItems={menuItems} role={role} setActiveTab={setActiveTab} />;
            case 'departments':
                return (
                    <section className="card surface-glow">
                        {isDeptFormOpen && (
                            <div className="form-grid" style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                                <form onSubmit={handleDeptSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end', width: '100%' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Dept Name</label>
                                        <input type="text" className="form-control" placeholder="e.g. Master of Computer Applications" required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} style={{ padding: '0.4rem', fontSize: '0.85rem', height: '34px' }} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Dept Code (Unique)</label>
                                        <input type="text" className="form-control" placeholder="e.g. MCA" required value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} style={{ padding: '0.4rem', fontSize: '0.85rem', height: '34px' }} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>HOD Name</label>
                                        <input type="text" className="form-control" placeholder="HOD Name" value={deptForm.hodName} onChange={e => setDeptForm({ ...deptForm, hodName: e.target.value })} style={{ padding: '0.4rem', fontSize: '0.85rem', height: '34px' }} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Semesters</label>
                                        <input type="number" className="form-control" placeholder="8" min="1" max="14" required value={deptForm.maxSemesters || 8} onChange={e => setDeptForm({ ...deptForm, maxSemesters: parseInt(e.target.value) })} style={{ padding: '0.4rem', fontSize: '0.85rem', height: '34px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '38px', borderRadius: '10px' }}>
                                            {editingDept ? 'Update Dept' : 'Add Dept'}
                                        </button>
                                        {editingDept && (
                                            <button type="button" className="btn btn-secondary" style={{ flex: 1, height: '38px', borderRadius: '10px' }} onClick={() => { setEditingDept(null); setDeptForm({ name: '', code: '', hodName: '', contactEmail: '', maxSemesters: 8 }); }}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}


                        {loadingDepts ? <TableSkeleton cols={4} rows={2} /> : (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead><tr><th>Code</th><th>Name</th><th>HOD</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {departments.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>No departments found.</td></tr> : departments.map(d => (
                                            <tr key={d.id}>
                                                <td><span className="badge badge-primary">{d.code}</span></td>
                                                <td>{d.name}</td>
                                                <td>{d.hodName || '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="btn btn-primary btn-sm" onClick={() => startEditDept(d)}><i className="fas fa-edit"></i> Edit</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => deleteDept(d.id)}><i className="fas fa-trash"></i> Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                );
            case 'paper-logs':
                return renderPaperViewLogs();
            case 'study-notes':
                return <Notes isAdminView={true} isUploadingNotes={isUploadingNotes} setIsUploadingNotes={setIsUploadingNotes} />;
            case 'question-papers':
                return (
                    <div className="users-management-page animate-in">
                        {isPaperFormOpen && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <PaperWizard onUploadSuccess={() => setRefreshKey(prev => prev + 1)} />
                            </div>
                        )}
                        <PaperList key={refreshKey} />
                    </div>
                );
            case 'pending-papers':
                return <PendingPapersAdmin />;
            case 'leaderboard':
                return <LeaderboardAdmin />;
            default:
                return <div>Select a tab</div>;
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'jobs', label: 'Manage Jobs', icon: 'fa-briefcase', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'users', label: 'Manage Users', icon: 'fa-users', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'students', label: 'Student Monitor', icon: 'fa-user-graduate', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'profile-details', label: 'Student Details', icon: 'fa-id-card', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'leaderboard', label: 'Leaderboard', icon: 'fa-trophy', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'interviews', label: 'Manage Interviews', icon: 'fa-calendar-alt', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'applications', label: 'Job Applications', icon: 'fa-file-alt', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'interview-applications', label: 'Interview Apps', icon: 'fa-user-check', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'gallery', label: 'Gallery Management', icon: 'fa-images', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'question-papers', label: 'Question Papers', icon: 'fa-file-pdf', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'pending-papers', label: 'Pending Papers', icon: 'fa-file-signature', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'study-notes', label: 'Study Notes', icon: 'fa-folder-open', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'paper-logs', label: 'Paper View Logs', icon: 'fa-history', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'departments', label: 'Departments', icon: 'fa-university', roles: ['SUPER_ADMIN'] },
        { id: 'companies', label: 'Companies', icon: 'fa-city', roles: ['SUPER_ADMIN'] }
    ];

    const menuGroups = [
        { title: 'Overview', icon: 'fa-home', items: ['dashboard', 'users'] },
        { title: 'Recruitment', icon: 'fa-bullhorn', items: ['jobs', 'applications', 'interviews', 'interview-applications'] },
        { title: 'Students', icon: 'fa-user-graduate', items: ['students', 'profile-details', 'leaderboard'] },
        { title: 'Resources', icon: 'fa-layer-group', items: ['gallery', 'question-papers', 'pending-papers', 'study-notes', 'paper-logs'] },
        { title: 'System', icon: 'fa-cog', items: ['departments', 'companies'] }
    ];

    return (
        <>
        <div className="admin-container animate-in">
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <i className="fas fa-bolt"></i>
                    </div>
                    <div className="brand-text">
                        <span>Hack2Hired</span>
                        <span className="brand-badge">PRO</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    <ul className="accordion-menu">
                        {menuGroups.map(group => {
                            const groupItems = menuItems.filter(item => group.items.includes(item.id) && item.roles.some(r => r.toUpperCase() === String(role).toUpperCase()));
                            if (groupItems.length === 0) return null;
                            const isExpanded = expandedMenu === group.title;
                            
                            return (
                                <li 
                                    key={group.title} 
                                    className="menu-group-container"
                                >
                                    <button 
                                        className={`accordion-trigger ${isExpanded ? 'expanded' : ''}`}
                                        onClick={() => setExpandedMenu(isExpanded ? null : group.title)}
                                    >
                                        <div className="accordion-title">
                                            <i className={`fas ${group.icon}`}></i>
                                            <span className="category-title">{group.title}</span>
                                        </div>
                                        <i className={`fas fa-chevron-down accordion-arrow`}></i>
                                    </button>
                                    
                                    {isExpanded && (
                                        <ul className="accordion-children">
                                            {groupItems.map(item => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => {
                                                            setActiveTab(item.id);
                                                            if (item.id === 'applications') loadApplications();
                                                            if (item.id === 'interview-applications') loadInterviewApplications();
                                                            if (item.id === 'gallery') loadGalleryItems();
                                                            if (item.id === 'paper-logs') loadPaperViewLogs();
                                                        }}
                                                        className={`sidebar-child-btn ${activeTab === item.id ? 'active' : ''}`}
                                                    >
                                                        <i className={`fas ${item.icon}`}></i>
                                                        <span>{item.label}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button className="footer-btn portal-btn" onClick={() => navigate('/')}>
                        <i className="fas fa-external-link-alt"></i> Portal
                    </button>
                    <button className="footer-btn logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="main-header" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'var(--dark-bg)', flexWrap: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="header-left" style={{ minWidth: 0, paddingRight: '10px' }}>
                        <h1 style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', margin: 0, background: 'linear-gradient(90deg, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{menuItems.find(i => i.id === activeTab)?.label}</h1>
                    </div>
                    <div className="admin-header-right" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {activeTab === 'students' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div className="search-box-modern desktop-only" style={{ maxWidth: '300px', position: 'relative' }}>
                                    <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}></i>
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        style={{ width: '100%', height: '36px', paddingLeft: '2.4rem', borderRadius: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                                    />
                                </div>
                                <button
                                    onClick={() => downloadCSV(studentActivity, 'student_activity.csv')}
                                    title="Export CSV"
                                    style={{ background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s' }}
                                >
                                    <i className="fas fa-file-csv"></i> Export CSV
                                </button>
                                <button
                                    onClick={fetchStudentActivity}
                                    title="Refresh Data"
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}
                                >
                                    <i className="fas fa-sync-alt" style={{ fontSize: '0.9rem' }}></i>
                                </button>
                            </div>
                        )}
                        {activeTab === 'profile-details' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button 
                                    className="btn" 
                                    onClick={() => downloadCSV(allProfiles, 'student_profiles.csv')} 
                                    style={{ background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s' }}
                                >
                                    <i className="fas fa-file-csv"></i> Export CSV
                                </button>
                                <button 
                                    onClick={fetchAllProfiles} 
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}
                                    title="Refresh"
                                >
                                    <i className="fas fa-sync-alt" style={{ fontSize: '0.9rem' }}></i>
                                </button>
                            </div>
                        )}
                        {activeTab === 'question-papers' && (
                            <button
                                onClick={() => setIsPaperFormOpen(prev => !prev)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    border: isPaperFormOpen
                                        ? '1px solid rgba(239, 68, 68, 0.4)'
                                        : '1px solid rgba(0, 204, 255, 0.35)',
                                    background: isPaperFormOpen
                                        ? 'rgba(239, 68, 68, 0.1)'
                                        : 'rgba(0, 204, 255, 0.1)',
                                    color: isPaperFormOpen ? '#f87171' : '#00ccff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                className="btn-premium"
                            >
                                {isPaperFormOpen
                                    ? <><i className="fas fa-times" style={{ fontSize: '0.75rem', marginRight: '5px' }}></i> Close Form</>
                                    : <><i className="fas fa-plus" style={{ fontSize: '0.7rem', marginRight: '5px' }}></i> Upload Papers</>
                                }
                            </button>
                        )}
                        {activeTab === 'interviews' && (
                                <button
                                    onClick={() => {
                                        if (isInterviewFormOpen || editingInterview) {
                                            setIsInterviewFormOpen(false);
                                            setEditingInterview(null);
                                            clearInterviewForm();
                                        } else {
                                            setIsInterviewFormOpen(true);
                                        }
                                    }}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: (isInterviewFormOpen || editingInterview)
                                            ? '1px solid rgba(239,68,68,0.4)'
                                            : '1px solid rgba(0, 204, 255, 0.35)',
                                        background: (isInterviewFormOpen || editingInterview)
                                            ? 'rgba(239,68,68,0.1)'
                                            : 'rgba(0, 204, 255, 0.1)',
                                        color: (isInterviewFormOpen || editingInterview) ? '#f87171' : '#00ccff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {(isInterviewFormOpen || editingInterview)
                                        ? <><i className="fas fa-times" style={{ fontSize: '0.75rem' }}></i> Close</>
                                        : <><i className="fas fa-plus" style={{ fontSize: '0.7rem' }}></i> Post Interview</>
                                    }
                                </button>
                        )}
                        {activeTab === 'jobs' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={loadJobs}
                                    title="Refresh"
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}
                                >
                                    <i className="fas fa-sync-alt" style={{ fontSize: '0.9rem' }}></i>
                                </button>
                                <button
                                    onClick={() => { 
                                        if (isJobFormOpen || editingJob) {
                                            setIsJobFormOpen(false);
                                            setEditingJob(null);
                                        } else {
                                            setIsJobFormOpen(true);
                                        }
                                    }}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: (isJobFormOpen || editingJob)
                                            ? '1px solid rgba(239,68,68,0.4)'
                                            : '1px solid rgba(0, 204, 255, 0.35)',
                                        background: (isJobFormOpen || editingJob)
                                            ? 'rgba(239,68,68,0.1)'
                                            : 'rgba(0, 204, 255, 0.1)',
                                        color: (isJobFormOpen || editingJob) ? '#f87171' : '#00ccff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {(isJobFormOpen || editingJob)
                                        ? <><i className="fas fa-times" style={{ fontSize: '0.75rem' }}></i> Close</>
                                        : <><i className="fas fa-plus" style={{ fontSize: '0.7rem' }}></i> Post Job</>
                                    }
                                </button>
                            </div>
                        )}
                        {activeTab === 'users' && !isCompanyAdmin && (
                            <button
                                onClick={() => {
                                    if (isUserFormOpen || editingUser) {
                                        setIsUserFormOpen(false);
                                        setEditingUser(null);
                                    } else {
                                        setIsUserFormOpen(true);
                                    }
                                }}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: isUserFormOpen
                                        ? '1px solid rgba(239,68,68,0.4)'
                                        : '1px solid rgba(0,204,255,0.35)',
                                    background: isUserFormOpen
                                        ? 'rgba(239,68,68,0.1)'
                                        : 'rgba(0,204,255,0.1)',
                                    color: isUserFormOpen ? '#f87171' : '#00ccff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.25s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <i className={`fas ${isUserFormOpen ? 'fa-times' : 'fa-user-plus'}`} style={{ fontSize: '0.75rem' }}></i>
                                {isUserFormOpen ? 'Close' : 'Add User'}
                            </button>
                        )}
                        {activeTab === 'gallery' && (
                            <button
                                onClick={() => setIsGalleryFormOpen(prev => !prev)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: isGalleryFormOpen
                                        ? '1px solid rgba(239,68,68,0.4)'
                                        : '1px solid rgba(0,204,255,0.35)',
                                    background: isGalleryFormOpen
                                        ? 'rgba(239,68,68,0.1)'
                                        : 'rgba(0,204,255,0.1)',
                                    color: isGalleryFormOpen ? '#f87171' : '#00ccff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.25s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <i className={`fas ${isGalleryFormOpen ? 'fa-times' : 'fa-camera'}`} style={{ fontSize: '0.75rem' }}></i>
                                {isGalleryFormOpen ? 'Close' : 'Share Photo'}
                            </button>
                        )}
                        {activeTab === 'study-notes' && (
                            <button
                                onClick={() => setIsUploadingNotes(!isUploadingNotes)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${isUploadingNotes ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0,204,255,0.35)'}`,
                                    background: isUploadingNotes ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,204,255,0.1)',
                                    color: isUploadingNotes ? '#ef4444' : '#00ccff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.25s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <i className={`fas ${isUploadingNotes ? 'fa-times' : 'fa-plus'}`} style={{ fontSize: '0.75rem' }}></i>
                                {isUploadingNotes ? 'Close Form' : 'Upload Notes'}
                            </button>
                        )}
                        {activeTab === 'interview-applications' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                <div className="search-box-modern" style={{ width: '200px' }}>
                                    <i className="fas fa-search" style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}></i>
                                    <input
                                        type="text"
                                        placeholder="Search interview apps..."
                                        value={interviewSearch}
                                        onChange={(e) => setInterviewSearch(e.target.value)}
                                        style={{ width: '100%', height: '36px', paddingLeft: '2.4rem', borderRadius: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'applications' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                <div className="search-box-modern desktop-only" style={{ width: '250px' }}>
                                    <i className="fas fa-search" style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}></i>
                                    <input
                                        type="text"
                                        placeholder="Search applications..."
                                        value={appSearch}
                                        onChange={(e) => setAppSearch(e.target.value)}
                                        style={{ width: '100%', height: '36px', paddingLeft: '2.4rem', borderRadius: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'paper-view-logs' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                <div className="search-box-modern desktop-only" style={{ width: '250px' }}>
                                    <i className="fas fa-search" style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}></i>
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        value={paperLogSearch}
                                        onChange={(e) => setPaperLogSearch(e.target.value)}
                                        style={{ width: '100%', height: '36px', paddingLeft: '2.4rem', borderRadius: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                                    />
                                </div>
                                <button
                                    onClick={() => downloadCSV(paperViewLogs, 'paper_view_logs.csv')}
                                    title="Export CSV"
                                    style={{ background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s', height: '36px' }}
                                >
                                    <i className="fas fa-file-csv"></i> Export
                                </button>
                                <button
                                    onClick={loadPaperViewLogs}
                                    title="Refresh Data"
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}
                                >
                                    <i className="fas fa-sync-alt" style={{ fontSize: '0.9rem' }}></i>
                                </button>
                            </div>
                        )}
                        {activeTab === 'menu' && (
                            <>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.3s ease',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <i className="fas fa-home"></i> <span className="desktop-only">Portal</span>
                                </button>
                                <button
                                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.3s ease',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <i className="fas fa-sign-out-alt"></i> <span className="desktop-only">Logout</span>
                                </button>
                            </>
                        )}
                        {activeTab === 'departments' && (
                            <button
                                onClick={() => { setIsDeptFormOpen(!isDeptFormOpen); if (isDeptFormOpen) setEditingDept(null); }}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: isDeptFormOpen ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(0, 204, 255, 0.35)',
                                    background: isDeptFormOpen ? 'rgba(239,68,68,0.1)' : 'rgba(0, 204, 255, 0.1)',
                                    color: isDeptFormOpen ? '#f87171' : '#00ccff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isDeptFormOpen ? 'Close Form' : 'Add Department'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="content-container">
                    {renderContent()}
                </div>
            </main>

            

            {/* Verification Modal */}
            {selectedProfileForVerification && (
                <div className="modal-overlay">
                    <div className="modal-content verification-modal pulse-in">
                        <div className="modal-header">
                            <div>
                                <h2>Verify Student Identity</h2>
                                <p className="subtitle">ID: {selectedProfileForVerification.id}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedProfileForVerification(null)}>&times;</button>
                        </div>

                        <div className="modal-body-split">
                            <div className="profile-details-col">
                                <section>
                                    <h3>Basic Information</h3>
                                    <div className="info-grid-modern">
                                        <div className="info-item">
                                            <label>Full Name</label>
                                            <p>{selectedProfileForVerification.fullName}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Enrollment</label>
                                            <p className="highlight">{selectedProfileForVerification.enrollmentNumber}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Branch</label>
                                            <p>{selectedProfileForVerification.branch}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Semester</label>
                                            <p>{selectedProfileForVerification.semester}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Batch</label>
                                            <p>{selectedProfileForVerification.batch}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone</label>
                                            <p>{selectedProfileForVerification.phoneNumber}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="document-preview-col">
                                <div className="doc-tabs">
                                    <button className={verificationTab === 'idCard' ? 'active' : ''} onClick={() => setVerificationTab('idCard')}>ID Card</button>
                                    <button className={verificationTab === 'admit' ? 'active' : ''} onClick={() => setVerificationTab('admit')}>Admit Card</button>
                                </div>
                                <div className="image-frame">
                                    <img
                                        src={`${API_BASE_URL}/student-profile/${verificationTab === 'idCard' ? 'id-card' : 'admit-card'}/${selectedProfileForVerification.id}`}
                                        alt="Student Document"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                    <div className="empty-state" style={{ display: 'none' }}>
                                        <i className="fas fa-file-image"></i>
                                        <p>No document uploaded</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modern btn-danger-outline" onClick={() => approveStudent(selectedProfileForVerification.id, 'REJECTED')}>
                                <i className="fas fa-times"></i> Reject
                            </button>
                            <button className="btn-modern btn-success" onClick={() => approveStudent(selectedProfileForVerification.id, 'APPROVED')}>
                                <i className="fas fa-check"></i> Approve Student
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <AdminBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
};

export default AdminDashboard;
