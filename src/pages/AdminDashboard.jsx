import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewRoundsForm from '../components/InterviewRoundsForm';
import PaperWizard from '../components/PaperWizard';
import PaperList from '../components/PaperList';
import API_BASE_URL from '../config';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import '../styles/admin.css';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

// Enhanced Toggle Switch Component for Premium UI
const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <label className="premium-toggle" style={{ opacity: disabled ? 0.5 : 1 }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />
        <span className="premium-slider">
            <span className="premium-knob"></span>
        </span>
    </label>
);



const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();

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

    // Helper function to handle 401 errors
    const handleUnauthorized = () => {
        console.error('🚫 Authentication failed - Token invalid or expired');
        showAlert({
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again.',
            type: 'warning',
            actions: [
                { label: 'Login', primary: true, onClick: () => { localStorage.clear(); navigate('/login'); } }
            ]
        });
        localStorage.clear();
        // Navigation handled by alert action to prevent immediate unmount/remount issues
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
    const [interviewSearch, setInterviewSearch] = useState('');
    const [appSearch, setAppSearch] = useState('');
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
    const [editingJob, setEditingJob] = useState(null);
    const [editingInterview, setEditingInterview] = useState(null);
    const [selectedProfileForVerification, setSelectedProfileForVerification] = useState(null);
    const [verificationTab, setVerificationTab] = useState('idCard'); // idCard, aadhar, admit // For ID Card Modal
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



    const fetchCompanyStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch(`${ADMIN_API_URL}/stats/companies`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCompanyStats(data);
            }
        } catch (err) {
            console.error("Failed to load stats", err);
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
            if (res.ok) {
                const data = await res.json();
                setStudentActivity(data);
            }
        } catch (err) {
            console.error("Failed to load student activity", err);
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
            if (res.ok) {
                const data = await res.json();
                setAllProfiles(data);
            }
        } catch (err) {
            console.error("Failed to load profiles", err);
        } finally {
            setLoadingProfiles(false);
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
            if (!response.ok) throw new Error('Failed to fetch applications');
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error('Error loading applications:', error);
            setMessage({ text: 'Failed to load applications.', type: 'error' });
        } finally {
            setLoadingApplications(false);
        }
    };

    const [interviewApplications, setInterviewApplications] = useState([]);
    const [loadingInterviewApps, setLoadingInterviewApps] = useState(false);

    // Gallery State
    const [galleryItems, setGalleryItems] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);

    // Email Notification Toggle
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
        accountEmailEnabled: false
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
            if (res.ok) setDepartments(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingDepts(false); }
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
            setInterviewApplications(data);
        } catch (error) {
            console.error('Error loading interview apps:', error);
            setMessage({ text: 'Failed to load interview applications.', type: 'error' });
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
            setGalleryItems(data);
        } catch (error) {
            console.error('Error loading gallery:', error);
            setMessage({ text: 'Failed to load gallery items.', type: 'error' });
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
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Error loading jobs:', error);
            setMessage({ text: 'Failed to load jobs.', type: 'error' });
        } finally {
            setLoadingJobs(false);
        }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            setMessage({ text: 'Failed to load users.', type: 'error' });
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
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

            if (res.ok) {
                console.log('✅ User update successful');
                setMessage({ text: editingUser ? 'User updated!' : 'User created!', type: 'success' });
                loadUsers();
                clearUserForm();
                setEditingUser(null);
            } else {
                const error = await res.text();
                console.error('❌ Backend error:', error);
                console.error('Status code:', res.status);
                setMessage({ text: error, type: 'error' });
            }
        } catch (err) {
            console.error('❌ Network error:', err);
            setMessage({ text: 'Failed to save user', type: 'error' });
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
        <div className="surface-glow" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>All Student Profiles</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => downloadCSV(allProfiles, 'student_profiles.csv')}>
                        <i className="fas fa-file-csv"></i> Export CSV
                    </button>
                    <button className="btn-secondary" onClick={fetchAllProfiles}>
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            {loadingProfiles ? <div className="loading-indicator">Loading profiles...</div> : (
                <div className="table-container">
                    <table className="data-table">
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
                            {allProfiles.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No detailed profiles found.</td></tr>
                            ) : (
                                allProfiles.map(profile => (
                                    <tr key={profile.id}>
                                        <td style={{ fontWeight: '500' }}>{profile.fullName}</td>
                                        <td>{profile.enrollmentNumber}</td>
                                        <td>{profile.branch} - Sem {profile.semester}</td>
                                        <td>{profile.batch || 'N/A'}</td>
                                        <td>
                                            {profile.approvalStatus === 'APPROVED' ? (
                                                <span className="badge badge-success" style={{ background: '#22c55e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Verified</span>
                                            ) : (
                                                <span className="badge badge-warning" style={{ background: '#eab308', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#000' }}>Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn-small btn-primary" onClick={() => setSelectedProfileForVerification(profile)}>
                                                <i className="fas fa-id-card"></i> Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
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

                <div className="surface-glow" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-tasks" style={{ color: 'var(--accent)' }}></i> Application Pulse
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={appData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {appData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentMonitor = () => (
        <div className="surface-glow" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Student Monitor</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => downloadCSV(studentActivity, 'student_activity.csv')}>
                        <i className="fas fa-file-csv"></i> Export CSV
                    </button>
                    <button className="btn-secondary" onClick={fetchStudentActivity}>
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            {loadingActivity ? <div className="loading-indicator">Loading activity...</div> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Branch</th>
                                <th>Profile Status</th>
                                <th>Resume Status</th>
                                <th>Last Active</th>
                                {isSuperAdmin && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {studentActivity.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No students found.</td></tr>
                            ) : (
                                studentActivity.map(student => (
                                    <tr key={student.id}>
                                        <td style={{ fontWeight: '500' }}>{student.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                                        <td>{student.branch}</td>
                                        <td>
                                            {student.profileComplete ?
                                                <span className="badge badge-success"><i className="fas fa-check-circle"></i> Complete</span> :
                                                <span className="badge badge-warning"><i className="fas fa-exclamation-circle"></i> Pending</span>
                                            }
                                        </td>
                                        <td>
                                            {student.hasResume ?
                                                <span className="badge badge-success"><i className="fas fa-file-pdf"></i> Uploaded</span> :
                                                <span className="badge badge-danger"><i className="fas fa-times"></i> Missing</span>
                                            }
                                        </td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {student.lastLoginDate ? new Date(student.lastLoginDate).toLocaleString() : 'Never'}
                                        </td>
                                        {isSuperAdmin && (
                                            <td>
                                                {student.hasResume && (
                                                    <button
                                                        className="action-btn view-btn"
                                                        onClick={() => viewStudentResume(student.id, student.name)}
                                                        title="Download Resume"
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'students':
                return renderStudentMonitor();
            case 'dashboard': {
                const pendingVerifications = allProfiles.filter(p => p.approvalStatus === 'PENDING').length;
                const totalStudents = users.filter(u => u.role === 'USER').length;
                const recentActivities = [
                    ...applications.slice(0, 3).map(a => ({ type: 'app', text: `${a.applicantName} applied for ${a.jobTitle}`, time: a.appliedAt })),
                    ...jobs.slice(0, 2).map(j => ({ type: 'job', text: `New job posted at ${j.company_name}`, time: j.last_date })),
                ].sort((a, b) => new Date(b.time) - new Date(a.time));

                return (
                    <>
                        <div className="dashboard-overview animate-in" id="dashboard-root">
                        <section className="stats-grid">
                            <div className="stat-card-modern primary">
                                <div className="stat-icon"><i className="fas fa-briefcase"></i></div>
                                <div className="stat-details">
                                    <h3>Total Vacancies</h3>
                                    <div className="stat-value">{loadingJobs ? '...' : jobs.length}</div>
                                </div>
                            </div>
                            <div className="stat-card-modern accent">
                                <div className="stat-icon"><i className="fas fa-user-graduate"></i></div>
                                <div className="stat-details">
                                    <h3>Students Enrolled</h3>
                                    <div className="stat-value">{loadingUsers ? '...' : totalStudents}</div>
                                </div>
                            </div>
                            <div className="stat-card-modern warning">
                                <div className="stat-icon"><i className="fas fa-user-check"></i></div>
                                <div className="stat-details">
                                    <h3>Pending Verification</h3>
                                    <div className="stat-value">{loadingProfiles ? '...' : pendingVerifications}</div>
                                </div>
                            </div>
                            <div className="stat-card-modern success">
                                <div className="stat-icon"><i className="fas fa-file-invoice"></i></div>
                                <div className="stat-details">
                                    <h3>Job Applications</h3>
                                    <div className="stat-value">{loadingApplications ? '...' : applications.length}</div>
                                </div>
                            </div>
                        </section>

                        <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div className="analytics-col">
                                {renderAnalytics()}
                            </div>
                            <div className="activity-col">
                                <div className="card surface-glow-premium" style={{ height: '100%' }}>
                                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                        <h3><i className="fas fa-bolt" style={{ color: '#fbbf24' }}></i> Quick Actions</h3>
                                    </div>
                                    <div className="quick-actions-list" style={{ display: 'grid', gap: '1rem' }}>
                                        <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveTab('jobs')}>
                                            <i className="fas fa-plus"></i> Post New Job
                                        </button>
                                        <button className="btn-premium" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', justifyContent: 'center' }} onClick={() => setActiveTab('users')}>
                                            <i className="fas fa-user-plus"></i> Onboard Student
                                        </button>
                                        <button className="btn-premium" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', justifyContent: 'center' }} onClick={() => setActiveTab('profile-details')}>
                                            <i className="fas fa-check-double"></i> Verify Profiles
                                        </button>
                                    </div>

                                    <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                                        <i className="fas fa-history" style={{ color: 'var(--primary)' }}></i> Recent Feed
                                    </h3>
                                    <div className="activity-feed">
                                        {recentActivities.map((act, i) => (
                                            <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                                <div style={{ padding: '0.6rem', borderRadius: '12px', background: act.type === 'app' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 71, 123, 0.1)', color: act.type === 'app' ? 'var(--primary)' : 'var(--accent)' }}>
                                                    <i className={`fas ${act.type === 'app' ? 'fa-file-alt' : 'fa-briefcase'}`}></i>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>{act.text}</p>
                                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(act.time).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                        ))}
                                        {recentActivities.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No recent activity</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isSuperAdmin && (
                            <div className="company-stats-section" style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Company Performance</h2>
                                {loadingStats ? (
                                    <div className="loading-indicator">Retrieving company metrics...</div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {companyStats.length === 0 ? <p>No company data available.</p> : companyStats.map((stat, index) => (
                                            <div key={index} className="card" style={{ padding: '1.5rem' }}>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <i className="fas fa-building"></i>
                                                    {stat.companyName}
                                                </h4>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Jobs Posted</span>
                                                    <span style={{ fontWeight: '700' }}>{stat.jobCount}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Interviews Scheduled</span>
                                                    <span style={{ fontWeight: '700' }}>{stat.interviewCount}</span>
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

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                                    {/* Master Switch */}
                                    <div className="surface-glow" style={{ padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${emailSettings.masterEmailEnabled ? '#22c55e' : '#ef4444'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: 0 }}>🚨 Master Switch</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
                                                    {emailSettings.masterEmailEnabled ? 'System emails are ACTIVE' : 'ALL emails are BLOCKED'}
                                                </p>
                                            </div>
                                            <ToggleSwitch
                                                checked={emailSettings.masterEmailEnabled}
                                                onChange={() => toggleEmailSetting('masterEmailEnabled', emailSettings.masterEmailEnabled)}
                                            />
                                        </div>
                                    </div>

                                    {/* New Job Alerts */}
                                    <div className="surface-glow" style={{ padding: '1.2rem', borderRadius: '8px', opacity: emailSettings.masterEmailEnabled ? 1 : 0.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: 0 }}>📢 New Job Alerts</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '5px 0 0' }}>Emails to students when jobs are posted</p>
                                            </div>
                                            <ToggleSwitch
                                                checked={emailSettings.newJobEmailEnabled}
                                                onChange={() => toggleEmailSetting('newJobEmailEnabled', emailSettings.newJobEmailEnabled)}
                                                disabled={!emailSettings.masterEmailEnabled}
                                            />
                                        </div>
                                    </div>

                                    {/* Status Updates */}
                                    <div className="surface-glow" style={{ padding: '1.2rem', borderRadius: '8px', opacity: emailSettings.masterEmailEnabled ? 1 : 0.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: 0 }}>📝 Status Updates</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '5px 0 0' }}>Shortlisted, Selected, Rejected emails</p>
                                            </div>
                                            <ToggleSwitch
                                                checked={emailSettings.statusUpdateEmailEnabled}
                                                onChange={() => toggleEmailSetting('statusUpdateEmailEnabled', emailSettings.statusUpdateEmailEnabled)}
                                                disabled={!emailSettings.masterEmailEnabled}
                                            />
                                        </div>
                                    </div>

                                    {/* Account Emails */}
                                    <div className="surface-glow" style={{ padding: '1.2rem', borderRadius: '8px', opacity: emailSettings.masterEmailEnabled ? 1 : 0.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: 0 }}>👤 Account Emails</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '5px 0 0' }}>Welcome, Password Reset, Verification</p>
                                            </div>
                                            <ToggleSwitch
                                                checked={emailSettings.accountEmailEnabled}
                                                onChange={() => toggleEmailSetting('accountEmailEnabled', emailSettings.accountEmailEnabled)}
                                                disabled={!emailSettings.masterEmailEnabled}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        <div className="recent-activity">
                            <div className="card" style={{ marginTop: '1rem' }}>
                            <div className="card-header">
                                <h3><i className="fas fa-list-ul"></i> Recent Job Postings</h3>
                                <div className="header-search" style={{ border: 'none', background: 'none' }}>
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
                            </div>
                            <div className="table-container animate-slide-up">
                                <table className="modern-table">
                                    <thead>
                                        <tr><th>Job Title</th><th>Company Name</th><th>Current Status</th><th>Filing Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {jobs.filter(j =>
                                            j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
                                            j.company_name?.toLowerCase().includes(jobSearch.toLowerCase())
                                        ).slice(0, 6).map(job => (
                                            <tr key={job.id} className="row-hover">
                                                <td><span style={{ fontWeight: '700', color: 'var(--primary)' }}>{job.title}</span></td>
                                                <td>{job.company_name}</td>
                                                <td>
                                                    <span className="badge-role role-user">Active</span>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)' }}>{new Date(job.last_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {jobs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent postings found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </>
                );
            }
            case 'jobs': {
                return (
                    <>
                        <div className="animate-in" id="jobs-root">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <h3><i className={editingJob ? "fas fa-edit" : "fas fa-plus-circle"}></i> {editingJob ? 'Edit Job Posting' : 'Post New Vacancy'}</h3>
                                {editingJob && (
                                    <button className="btn btn-outline" onClick={() => { setEditingJob(null); clearForm(); }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                            
                            {message.text && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '2rem' }}>
                                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
                                    {message.text}
                                </div>
                            )}

                            <form id="jobForm" onSubmit={handleSubmit}>
                                <div className="form-grid-modern">
                                    <div className="form-group-modern">
                                        <label htmlFor="jobTitle"><i className="fas fa-tag"></i> Job Title</label>
                                        <input type="text" id="jobTitle" className="form-control-modern" placeholder="e.g. Senior Software Engineer" required value={formData.jobTitle} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label htmlFor="companyName"><i className="fas fa-building"></i> Company Name</label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            className="form-control-modern"
                                            required
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            readOnly={isCompanyAdmin}
                                            style={isCompanyAdmin ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                        />
                                    </div>
                                    <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
                                        <label htmlFor="jobDescription"><i className="fas fa-align-left"></i> Job Description & Requirements</label>
                                        <textarea id="jobDescription" className="form-control-modern" rows="5" placeholder="Outline the role, responsibilities, and necessary skillsets..." required value={formData.jobDescription} onChange={handleInputChange}></textarea>
                                    </div>
                                    <div className="form-group-modern">
                                        <label htmlFor="applyLink"><i className="fas fa-link"></i> External Application Link</label>
                                        <input type="url" id="applyLink" className="form-control-modern" placeholder="https://company.com/careers/..." required value={formData.applyLink} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label htmlFor="lastDate"><i className="fas fa-calendar-alt"></i> Application Deadline</label>
                                        <input type="date" id="lastDate" className="form-control-modern" required value={formData.lastDate} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label htmlFor="salary"><i className="fas fa-money-bill-wave"></i> Annual CTC (₹)</label>
                                        <input type="number" id="salary" className="form-control-modern" placeholder="12,00,000" min="0" required value={formData.salary} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label><i className="fas fa-envelope-open-text"></i> System Notifications</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                            <ToggleSwitch 
                                                checked={sendEmailNotifications} 
                                                onChange={(e) => setSendEmailNotifications(e.target.checked)} 
                                            />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Notify all students via email</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ margin: '2.5rem 0' }}>
                                    <InterviewRoundsForm
                                        interviewDetails={interviewDetails}
                                        setInterviewDetails={setInterviewDetails}
                                    />
                                </div>

                                <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <h4 style={{ color: 'var(--warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                        <i className="fas fa-filter"></i> Tailor Eligibility Criteria
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                        Restricts job visibility to specific departments and semesters.
                                    </p>

                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {departments.length > 0 ? departments.map(dept => (
                                            <div key={dept.code} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>
                                                    <input type="checkbox"
                                                        checked={formData.eligibleBranches?.includes(dept.code)}
                                                        onChange={(e) => {
                                                            const branches = formData.eligibleBranches || [];
                                                            if (e.target.checked) setFormData({ ...formData, eligibleBranches: [...branches, dept.code] });
                                                            else setFormData({ ...formData, eligibleBranches: branches.filter(b => b !== dept.code) });
                                                        }}
                                                    />
                                                    {dept.name} ({dept.code})
                                                </label>
                                                {formData.eligibleBranches?.includes(dept.code) && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', marginLeft: '1.75rem' }}>
                                                        {Array.from({ length: dept.maxSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                                            <label key={`${dept.code}-${sem}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                                                                <input type="checkbox"
                                                                    checked={formData.eligibleSemesters?.includes(sem)}
                                                                    onChange={(e) => {
                                                                        const sems = formData.eligibleSemesters || [];
                                                                        if (e.target.checked) setFormData({ ...formData, eligibleSemesters: [...sems, sem] });
                                                                        else setFormData({ ...formData, eligibleSemesters: sems.filter(s => s !== sem) });
                                                                    }}
                                                                />
                                                                Sem {sem}
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p style={{ color: 'var(--text-muted)' }}>Awaiting department data...</p>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                                    <button type="button" className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', boxShadow: 'none' }} onClick={fillSampleData}>
                                        <i className="fas fa-magic"></i> Magic Fill
                                    </button>
                                    <button type="button" className="btn-premium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', boxShadow: 'none' }} onClick={() => { clearForm(); setEditingJob(null); }}>
                                        <i className="fas fa-eraser"></i> Reset Form
                                    </button>
                                    <button type="submit" className="btn-premium">
                                        <i className="fas fa-save"></i> {editingJob ? 'Update Deployment' : 'Launch Job Posting'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="card animate-slide-up">
                            <div className="card-header">
                                <h3><i className="fas fa-briefcase"></i> Active Vacancies Registry</h3>
                                {isSuperAdmin && jobs.length > 0 && (
                                    <button
                                        onClick={handleDeleteAllJobs}
                                        className="btn-premium"
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
                                    >
                                        <i className="fas fa-trash-alt"></i> Purge All
                                    </button>
                                )}
                            </div>
                            {loadingJobs && <div className="loader-container"><div className="pulse-loader"></div><p>Syncing job database...</p></div>}
                            {!loadingJobs && (
                                <div className="table-container">
                                    {jobs.length === 0 ? <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Registry is currently empty.</p> : (
                                        <table className="modern-table">
                                            <thead>
                                                <tr><th>Position</th><th>Organization</th><th>Deadline</th><th>Package</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                                            </thead>
                                            <tbody>
                                                {jobs.map(job => (
                                                    <tr key={job.id} className="row-hover">
                                                        <td><div style={{ fontWeight: '700', color: 'var(--primary)' }}>{job.title}</div></td>
                                                        <td>{job.company_name}</td>
                                                        <td>{new Date(job.last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td>₹{job.salary.toLocaleString()}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                                {(!isCompanyAdmin || job.company_name === myCompanyName) ? (
                                                                    <>
                                                                        <button className="action-btn-modern edit-btn" title="Edit Position" onClick={() => startEditJob(job)}>
                                                                            <i className="fas fa-pencil-alt"></i>
                                                                        </button>
                                                                        <button className="action-btn-modern delete-btn" title="Remove Position" onClick={() => deleteJob(job.id)}>
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="badge-role" style={{ opacity: 0.5, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Proprietary</span>
                                                                )}
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
                                </section>
                                </div>
                            </>
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
                    <>
                        <div className="users-management-page animate-in">
                        {!isCompanyAdmin && (
                            <section className="card surface-glow-premium">
                                <div className="card-header">
                                    <h3>
                                        <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'}`} style={{ color: 'var(--primary)' }}></i>
                                        {editingUser ? 'Update Professional Credentials' : 'Onboard New Identity'}
                                    </h3>
                                    {editingUser && (
                                        <button className="btn btn-outline" onClick={() => { setEditingUser(null); clearUserForm(); }}>
                                            <i className="fas fa-times"></i> Cancel Edit
                                        </button>
                                    )}
                                </div>
                                <div className="card-body" style={{ padding: '0.5rem 0 0' }}>
                                    {message.text && (
                                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '2rem' }}>
                                            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                            {message.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleUserSubmit}>
                                        <div className="form-grid-modern">
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-at"></i> Identity Handle (Username)</label>
                                                <input
                                                    type="text"
                                                    className="form-control-modern"
                                                    placeholder="@username"
                                                    required
                                                    value={userForm.username}
                                                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-envelope"></i> Secure Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control-modern"
                                                    placeholder="identity@institution.edu"
                                                    required
                                                    value={userForm.email}
                                                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group-modern">
                                                <label><i className="fas fa-key"></i> Access Key {editingUser && '(Leave blank to retain)'}</label>
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
                                                <label><i className="fas fa-user-tag"></i> System Permissions</label>
                                                <select
                                                    className="form-control-modern"
                                                    value={userForm.role}
                                                    disabled={role === 'DEPT_ADMIN'}
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
                                                    <option value="USER">STUDENT / REGULAR USER</option>
                                                    <option value="ADMIN">INSTITUTIONAL ADMIN</option>
                                                    <option value="SUPER_ADMIN">ROOT / SYSTEM OWNER</option>
                                                    <option value="COMPANY_ADMIN">CORPORATE PARTNER</option>
                                                    <option value="DEPT_ADMIN">DEPARTMENTAL HEAD</option>
                                                </select>
                                            </div>

                                            {userForm.role === 'USER' && (
                                                <>
                                                    <div className="form-group-modern animate-slide-up">
                                                        <label><i className="fas fa-barcode"></i> Academic Enrollment ID</label>
                                                        <input
                                                            type="text"
                                                            className="form-control-modern"
                                                            value={userForm.computerCode}
                                                            onChange={e => setUserForm({ ...userForm, computerCode: e.target.value })}
                                                            placeholder="University Code (e.g. 59500)"
                                                        />
                                                    </div>
                                                    <div className="form-group-modern animate-slide-up">
                                                        <label><i className="fas fa-graduation-cap"></i> Departmental Specialization</label>
                                                        <select
                                                            className="form-control-modern"
                                                            value={userForm.branch}
                                                            onChange={e => setUserForm({ ...userForm, branch: e.target.value })}
                                                        >
                                                            <option value="">Select Domain</option>
                                                            {departments.map(d => (
                                                                <option key={d.id} value={d.code}>{d.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group-modern animate-slide-up">
                                                        <label><i className="fas fa-users"></i> Graduation Cohort</label>
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
                                                <div className="form-group-modern full-width animate-slide-up" style={{ background: 'rgba(0, 212, 255, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--primary-glow)' }}>
                                                    <label style={{ color: 'var(--primary)', fontWeight: '800' }}>AUTHORIZED DEPARTMENTAL DOMAIN *</label>
                                                    <select
                                                        className="form-control-modern"
                                                        required
                                                        value={userForm.adminBranch || ''}
                                                        onChange={e => setUserForm({ ...userForm, adminBranch: e.target.value })}
                                                        style={{ marginTop: '0.75rem' }}
                                                    >
                                                        <option value="">Select Branch to Oversee</option>
                                                        {departments.map(d => (
                                                            <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                                                        ))}
                                                    </select>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                                        <i className="fas fa-shield-alt"></i> Access restricted to data within the selected departmental scope.
                                                    </p>
                                                </div>
                                            )}

                                            {userForm.role === 'COMPANY_ADMIN' && (
                                                <div className="form-group-modern full-width animate-slide-up" style={{ background: 'rgba(255, 71, 123, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 71, 123, 0.2)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
                                                        <div>
                                                            <label style={{ color: 'var(--accent)', fontWeight: '800' }}>PARTNER ORGANIZATION *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control-modern"
                                                                required
                                                                value={userForm.companyName || ''}
                                                                onChange={e => setUserForm({ ...userForm, companyName: e.target.value })}
                                                                placeholder="e.g. Google India"
                                                                style={{ marginTop: '0.75rem' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ color: 'var(--accent)', fontWeight: '800' }}>AUTHORIZED TALENT CHANNELS *</label>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                                                                {departments.map(dept => (
                                                                    <label key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
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
                                                                        {dept.code}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn-premium">
                                                <span>{editingUser ? 'Commit Registry Updates' : 'Authorize Identity Onboarding'}</span>
                                                <i className="fas fa-fingerprint"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        )}

                        <section className="card animate-slide-up">
                            <div className="card-header">
                                <div>
                                    <h3><i className="fas fa-users-cog"></i> Workforce Intelligence Registry</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                                        {role === 'DEPT_ADMIN' ? `Scoped visibility: ${localStorage.getItem('adminBranch')}` : 'Global system-wide registry access'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="search-box-modern">
                                        <i className="fas fa-search"></i>
                                        <input
                                            type="text"
                                            placeholder="Query secure registry..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn-icon" title="Synchronize Records" onClick={loadUsers}>
                                        <i className="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>

                            {loadingUsers ? (
                                <div className="loader-container">
                                    <div className="pulse-loader"></div>
                                    <p>Syncing secure metadata...</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    {filteredUsers.filter(u =>
                                        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.companyName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.role?.toLowerCase().includes(userSearch.toLowerCase())
                                    ).length === 0 ? (
                                        <div className="empty-state">
                                            <i className="fas fa-user-secret" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1rem' }}></i>
                                            <p>No identities matched your encryption query.</p>
                                        </div>
                                    ) : (
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Account Identity</th>
                                                    <th>Assigned Role</th>
                                                    <th>Scope / Domain</th>
                                                    <th style={{ textAlign: 'right' }}>Management</th>
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
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <div className="user-avatar-small">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.username}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge-role role-${user.role.toLowerCase().replace('_', '-')}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: '0.85rem' }}>
                                                                {user.companyName ? (
                                                                    <span style={{ color: 'var(--accent)' }}><i className="fas fa-building"></i> {user.companyName}</span>
                                                                ) : user.adminBranch ? (
                                                                    <span style={{ color: 'var(--primary)' }}><i className="fas fa-shield"></i> {user.adminBranch} Admin</span>
                                                                ) : user.branch ? (
                                                                    <span>{user.branch} <span style={{ opacity: 0.5 }}>{user.batch ? `Class of '${user.batch.toString().slice(-2)}` : ''}</span></span>
                                                                ) : (
                                                                    <span style={{ opacity: 0.4 }}>Omni-Access</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    className="action-btn-modern edit-btn"
                                                                    title="Modify Identity"
                                                                    onClick={() => startEditUser(user)}
                                                                    disabled={isCompanyAdmin}
                                                                >
                                                                    <i className="fas fa-user-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="action-btn-modern delete-btn"
                                                                    title="Revoke Access"
                                                                    onClick={() => deleteUser(user.id)}
                                                                    disabled={isCompanyAdmin || user.role === 'SUPER_ADMIN'}
                                                                >
                                                                    <i className="fas fa-user-minus"></i>
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
                    </>
                );
            }
            case 'profile-details':
                return renderProfileDetails();
            case 'applications':
                return (
                    <div className="animate-in">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <h3><i className="fas fa-file-invoice"></i> Talent Pipeline Registry</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="search-box-modern">
                                        <i className="fas fa-search"></i>
                                        <input
                                            type="text"
                                            placeholder="Quick scan applicants..."
                                            value={appSearch}
                                            onChange={(e) => setAppSearch(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn-premium" style={{ padding: '0.6rem 1.2rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)' }} onClick={() => downloadCSV(applications, 'talent_pipeline.csv')}>
                                        <i className="fas fa-file-csv"></i> Export Data
                                    </button>
                                </div>
                            </div>
                            {loadingApplications ? (
                                <div className="loader-container"><div className="pulse-loader"></div><p>Syncing application records...</p></div>
                            ) : applications.length > 0 ? (
                                <div className="table-container">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant Identity</th>
                                                <th>Contact Info</th>
                                                <th>Target Position</th>
                                                <th>Applied At</th>
                                                <th>Resume</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Update Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.filter(app =>
                                                app.applicantName?.toLowerCase().includes(appSearch.toLowerCase()) ||
                                                app.companyName?.toLowerCase().includes(appSearch.toLowerCase()) ||
                                                app.jobTitle?.toLowerCase().includes(appSearch.toLowerCase()) ||
                                                app.applicantEmail?.toLowerCase().includes(appSearch.toLowerCase())
                                            ).map(app => (
                                                <tr key={app.id} className="row-hover">
                                                    <td><div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{app.applicantName}</div></td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.applicantEmail}</td>
                                                    <td>
                                                        <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{app.jobTitle}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', opacity: 0.8 }}>{app.companyName}</div>
                                                    </td>
                                                    <td><span style={{ fontSize: '0.85rem' }}>{new Date(app.appliedAt).toLocaleDateString('en-IN')}</span></td>
                                                    <td>
                                                        {app.resumePath ? (
                                                            <button
                                                                className="action-btn-modern edit-btn"
                                                                onClick={() => {
                                                                    const filename = app.resumePath.split('/').pop();
                                                                    window.open(`${API_BASE_URL}/resume/download/${filename}`, '_blank');
                                                                }}
                                                                title="Review Resume"
                                                            >
                                                                <i className="fas fa-file-pdf"></i>
                                                            </button>
                                                        ) : <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>Not Provided</span>}
                                                    </td>
                                                    <td>
                                                        <span className={`badge-role role-${app.status === 'SELECTED' ? 'user' : app.status === 'REJECTED' ? 'super-admin' : 'admin'}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                                            className="form-control-modern"
                                                            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="PENDING">Pending Review</option>
                                                            <option value="SHORTLISTED">Shortlist</option>
                                                            <option value="REJECTED">Reject</option>
                                                            <option value="SELECTED">Hire/Select</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '4rem' }}>
                                    <i className="fas fa-folder-open" style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1.5rem' }}></i>
                                    <p>No applications have been submitted for review yet.</p>
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'interviews':
                return (
                    <div className="animate-in">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <h3><i className={editingInterview ? "fas fa-edit" : "fas fa-calendar-plus"}></i> {editingInterview ? 'Update Session Parameters' : 'Orchestrate New Interview Drive'}</h3>
                                {editingInterview && (
                                    <button className="btn btn-outline" onClick={() => { setEditingInterview(null); clearInterviewForm(); }}>
                                        Cancel Orchestration
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleInterviewSubmit}>
                                <div className="form-grid-modern">
                                    <div className="form-group-modern">
                                        <label><i className="fas fa-building"></i> Host Organization</label>
                                        <input type="text" className="form-control-modern" placeholder="e.g. Microsoft India" required value={interviewForm.company} onChange={e => setInterviewForm({ ...interviewForm, company: e.target.value })} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label><i className="fas fa-calendar-day"></i> Session Date</label>
                                        <input type="date" className="form-control-modern" required value={interviewForm.date} onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label><i className="fas fa-clock"></i> Temporal Window</label>
                                        <input type="text" className="form-control-modern" placeholder="09:00 AM - 05:00 PM" required value={interviewForm.time} onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })} />
                                    </div>
                                    <div className="form-group-modern">
                                        <label><i className="fas fa-map-marker-alt"></i> Physical/Virtual Gateway</label>
                                        <input type="text" className="form-control-modern" placeholder="e.g. Virtual via Zoom / Seminar Hall 2" required value={interviewForm.venue} onChange={e => setInterviewForm({ ...interviewForm, venue: e.target.value })} />
                                    </div>
                                    <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
                                        <label><i className="fas fa-list-ol"></i> Target Designations</label>
                                        <input type="text" className="form-control-modern" placeholder="Software Engineer II, Product Manager, Analyst..." required value={interviewForm.positions} onChange={e => setInterviewForm({ ...interviewForm, positions: e.target.value })} />
                                    </div>
                                    <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
                                        <label><i className="fas fa-shield-alt"></i> Baseline Eligibility</label>
                                        <input type="text" className="form-control-modern" placeholder="CGPA > 8.0, 0 active backlogs, Tech Stack residency..." required value={interviewForm.eligibility} onChange={e => setInterviewForm({ ...interviewForm, eligibility: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', boxShadow: 'none' }} onClick={fillInterviewSampleData}>
                                        <i className="fas fa-magic"></i> Auto-Fill
                                    </button>
                                    <button type="button" className="btn-premium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', boxShadow: 'none' }} onClick={() => { clearInterviewForm(); setEditingInterview(null); }}>
                                        <i className="fas fa-eraser"></i> Purge Form
                                    </button>
                                    <button type="submit" className="btn-premium">
                                        <i className="fas fa-rocket"></i> {editingInterview ? 'Commit Updates' : 'Launch Interview Drive'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="card animate-slide-up">
                            <div className="card-header">
                                <h3><i className="fas fa-calendar-check"></i> Scheduled Engagement Registry</h3>
                            </div>
                            <div className="table-container">
                                <table className="modern-table">
                                    <thead>
                                        <tr><th>Organization</th><th>Engagement Date</th><th>Deployment Venue</th><th style={{ textAlign: 'right' }}>Administrative Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {interviews.map(interview => (
                                            <tr key={interview.id} className="row-hover">
                                                <td><div style={{ fontWeight: '700', color: 'var(--primary)' }}>{interview.company}</div></td>
                                                <td><span style={{ fontSize: '0.9rem' }}>{new Date(interview.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span></td>
                                                <td><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{interview.venue}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                        {(!isCompanyAdmin || interview.company === myCompanyName) ? (
                                                            <>
                                                                <button className="action-btn-modern edit-btn" title="Modify Session" onClick={() => startEditInterview(interview)}>
                                                                    <i className="fas fa-pencil-alt"></i>
                                                                </button>
                                                                <button className="action-btn-modern delete-btn" title="Cancel Session" onClick={() => deleteInterview(interview.id)}>
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="badge-role" style={{ opacity: 0.5, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Locked</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {interviews.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No interviews currently scheduled in the pipeline.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                );
            }
            case 'interview-applications': {
                return (
                    <div className="animate-in">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <h3><i className="fas fa-id-badge"></i> Interview Drive Logistics</h3>
                                <div className="search-box-modern">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Filtered identity search..."
                                        value={interviewSearch}
                                        onChange={(e) => setInterviewSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            {loadingInterviewApps ? (
                                <div className="loader-container">
                                    <div className="pulse-loader"></div>
                                    <p>Decrypting logistics layer...</p>
                                </div>
                            ) : interviewApplications.length > 0 ? (
                                <div className="table-container">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant Identity</th>
                                                <th>Organization</th>
                                                <th>Session Date</th>
                                                <th>Resume</th>
                                                <th>Current Status</th>
                                                <th style={{ textAlign: 'right' }}>Update Registry</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {interviewApplications.filter(app =>
                                                app.applicantName?.toLowerCase().includes(interviewSearch.toLowerCase()) ||
                                                app.companyName?.toLowerCase().includes(interviewSearch.toLowerCase()) ||
                                                app.applicantEmail?.toLowerCase().includes(interviewSearch.toLowerCase())
                                            ).map(app => (
                                                <tr key={app.id} className="row-hover">
                                                    <td>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{app.applicantName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.applicantEmail}</div>
                                                    </td>
                                                    <td><div style={{ color: 'var(--primary)', fontWeight: '600' }}>{app.companyName}</div></td>
                                                    <td><span style={{ fontSize: '0.85rem' }}>{new Date(app.interviewDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
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
                                                    <td style={{ textAlign: 'right' }}>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => updateInterviewAppStatus(app.id, e.target.value)}
                                                            className="form-control-modern"
                                                            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="SHORTLISTED">Shortlist</option>
                                                            <option value="REJECTED">Reject</option>
                                                            <option value="SELECTED">Hire/Select</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '4rem' }}>
                                    <i className="fas fa-user-clock" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem' }}></i>
                                    <p>Logistics queue is currently empty.</p>
                                </div>
                            )}
                        </section>
                    </div>
                );
            }
            case 'gallery': {
                return (
                    <div className="animate-in">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <h3><i className="fas fa-cloud-upload-alt"></i> Visual Assets Registry</h3>
                            </div>
                            {loadingGallery ? (
                                <div className="loader-container">
                                    <div className="pulse-loader"></div>
                                    <p>Fetching visual metadata...</p>
                                </div>
                            ) : galleryItems.length > 0 ? (
                                <div className="table-container">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Asset Identity</th>
                                                <th>Format</th>
                                                <th>Origin Entity</th>
                                                <th>Persistence State</th>
                                                <th style={{ textAlign: 'right' }}>Administrative Orchestration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {galleryItems.map(item => (
                                                <tr key={item.id} className="row-hover">
                                                    <td>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</div>
                                                        {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description.substring(0, 45)}...</div>}
                                                    </td>
                                                    <td><span className="badge-role" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)' }}>{item.type}</span></td>
                                                    <td><div style={{ fontSize: '0.85rem' }}><i className="fas fa-user-circle"></i> {item.uploadedBy}</div></td>
                                                    <td>
                                                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                            <select
                                                                value={item.status}
                                                                onChange={(e) => updateGalleryStatus(item.id, e.target.value)}
                                                                className="form-control-modern"
                                                                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="PENDING">Pending</option>
                                                                <option value="ACCEPTED">Authorize</option>
                                                                <option value="REJECTED">Purge Access</option>
                                                            </select>
                                                            <button className="action-btn-modern delete-btn" onClick={() => deleteGalleryItem(item.id)} title="Delete Permanently">
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                            <button
                                                                className="action-btn-modern edit-btn"
                                                                onClick={() => window.open(item.url, '_blank')}
                                                                title="Visualize Asset"
                                                            >
                                                                <i className="fas fa-external-link-alt"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '5rem' }}>
                                    <i className="fas fa-images" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem' }}></i>
                                    <p>No visual assets discovered in system repository.</p>
                                </div>
                            )}
                        </section>
                    </div>
                );
            }
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
                            loadUsers();
                            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                        } else {
                            setMessage({ text: 'Access revocation failed', type: 'error' });
                        }
                    } catch (error) {
                        setMessage({ text: 'Error modifiying corporate state', type: 'error' });
                    }
                };

                return (
                    <div className="animate-in">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <div>
                                    <h3><i className="fas fa-city"></i> Specialized Partner Entities</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Manage corporate clearance. Revoked partners are prohibited from active recruitment workflows.
                                    </p>
                                </div>
                            </div>
                            {loadingUsers ? (
                                <div className="loader-container"><div className="pulse-loader"></div><p>Syncing partner registry...</p></div>
                            ) : companyAdmins.length > 0 ? (
                                <div className="table-container">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Corporate Identity</th>
                                                <th>Liaison Handle</th>
                                                <th>Communication Core</th>
                                                <th>Operational State</th>
                                                <th style={{ textAlign: 'right' }}>Clearance Protocols</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companyAdmins.map(company => (
                                                <tr key={company.id} className="row-hover">
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--glass-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                                <i className="fas fa-building"></i>
                                                            </div>
                                                            <strong style={{ color: 'var(--text-primary)' }}>{company.companyName || 'Unknown Entity'}</strong>
                                                        </div>
                                                    </td>
                                                    <td><code style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>@{company.username}</code></td>
                                                    <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{company.email}</span></td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.3rem 0.8rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.5px',
                                                            textTransform: 'uppercase',
                                                            background: company.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: company.enabled ? '#34d399' : '#f87171',
                                                            border: `1px solid ${company.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                        }}>
                                                            {company.enabled ? 'Operational' : 'Restricted'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => toggleCompanyStatus(company.id)}
                                                            className="btn-premium"
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                fontSize: '0.8rem',
                                                                background: company.enabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                                border: `1px solid ${company.enabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                                                                color: company.enabled ? '#f87171' : '#34d399',
                                                                boxShadow: 'none'
                                                            }}
                                                        >
                                                            <i className={`fas fa-${company.enabled ? 'user-slash' : 'user-check'}`}></i>
                                                            {company.enabled ? ' Restrict Access' : ' Grant Access'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '5rem' }}>
                                    <i className="fas fa-building" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem' }}></i>
                                    <p>No corporate partner entities detected in registry.</p>
                                </div>
                            )}
                        </section>
                    </div>
                );
            }
            case 'departments': {
                return (
                    <div className="animate-in">
                        <section className="card surface-glow-premium">
                            <div className="card-header">
                                <h3><i className="fas fa-sitemap"></i> Institutional Architecture</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '14px', width: 'fit-content' }}>
                                    <button type="button" onClick={() => setDeptMode('single')} className={`btn-premium ${deptMode === 'single' ? '' : 'inactive-tab'}`} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', boxShadow: deptMode === 'single' ? 'var(--primary-glow)' : 'none' }}>
                                        <i className="fas fa-building"></i> Atomic Department
                                    </button>
                                    <button type="button" onClick={() => setDeptMode('bulk')} className={`btn-premium ${deptMode === 'bulk' ? '' : 'inactive-tab'}`} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', boxShadow: deptMode === 'bulk' ? 'var(--primary-glow)' : 'none' }}>
                                        <i className="fas fa-cubes"></i> Bulk Program Stream
                                    </button>
                                </div>

                                {deptMode === 'single' ? (
                                    <form onSubmit={handleDeptSubmit} className="animate-in">
                                        <div className="form-grid-modern">
                                            <div className="form-group-modern">
                                                <label>Department Name</label>
                                                <input type="text" className="form-control-modern" placeholder="e.g. Master of Computer Applications" required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
                                            </div>
                                            <div className="form-group-modern">
                                                <label>Department Code</label>
                                                <input type="text" className="form-control-modern" placeholder="e.g. MCA" required value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} />
                                            </div>
                                            <div className="form-group-modern">
                                                <label>Director/HOD Identity</label>
                                                <input type="text" className="form-control-modern" placeholder="Identity Name" value={deptForm.hodName} onChange={e => setDeptForm({ ...deptForm, hodName: e.target.value })} />
                                            </div>
                                            <div className="form-group-modern">
                                                <label>Total Semester Span</label>
                                                <input type="number" className="form-control-modern" placeholder="8" min="1" max="14" required value={deptForm.maxSemesters || 8} onChange={e => setDeptForm({ ...deptForm, maxSemesters: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                            {editingDept && (
                                                <button type="button" className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }} onClick={() => { setEditingDept(null); setDeptForm({ name: '', code: '', hodName: '', contactEmail: '', maxSemesters: 8 }); }}>
                                                    <i className="fas fa-times"></i> Cancel
                                                </button>
                                            )}
                                            <button type="submit" className="btn-premium">
                                                <i className={`fas fa-${editingDept ? 'fingerprint' : 'plus-circle'}`}></i> {editingDept ? 'Commit Architecture Update' : 'Initialize Department'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleBulkSubmit} className="animate-in">
                                        <div className="form-grid-modern">
                                            <div className="form-group-modern">
                                                <label>Institutional Category</label>
                                                <input type="text" className="form-control-modern" placeholder="e.g. Engineering and Technology" required value={bulkForm.category} onChange={e => setBulkForm({ ...bulkForm, category: e.target.value })} />
                                            </div>
                                            <div className="form-group-modern">
                                                <label>Degree Classification</label>
                                                <input type="text" className="form-control-modern" placeholder="e.g. B.Tech" required value={bulkForm.degree} onChange={e => setBulkForm({ ...bulkForm, degree: e.target.value })} />
                                            </div>
                                            <div className="form-group-modern">
                                                <label>Standard Stream Duration (Semesters)</label>
                                                <input type="number" className="form-control-modern" placeholder="8" min="1" max="14" required value={bulkForm.maxSemesters} onChange={e => setBulkForm({ ...bulkForm, maxSemesters: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="form-group-modern full-width" style={{ gridColumn: '1 / -1' }}>
                                                <label>Parallel Branches (CSV)</label>
                                                <textarea className="form-control-modern" rows="3" placeholder="CSE, AI, Robotics, Civil, Thermal Mechanical, Cloud Computing..." required value={bulkForm.branches} onChange={e => setBulkForm({ ...bulkForm, branches: e.target.value })}></textarea>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Auto-generates nested department IDs: {bulkForm.degree.toUpperCase()}_NAME</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn-premium">
                                                <i className="fas fa-layer-group"></i> Deploy Collective Stream
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </section>

                        <section className="card animate-slide-up">
                            <div className="card-header">
                                <h3><i className="fas fa-microchip"></i> Domain Registry</h3>
                            </div>
                            <div className="table-container">
                                {loadingDepts ? <div className="loader-container"><div className="pulse-loader"></div></div> : (
                                    <table className="modern-table">
                                        <thead><tr><th>Unique Code</th><th>Formal Identity</th><th>Executive Head</th><th style={{ textAlign: 'right' }}>Management</th></tr></thead>
                                        <tbody>
                                            {departments.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No departmental nodes identified.</td></tr> : departments.map(d => (
                                                <tr key={d.id} className="row-hover">
                                                    <td><span className="badge-role" style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)', color: 'white' }}>{d.code}</span></td>
                                                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{d.name}</td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.hodName || 'Pending Assignment'}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                            <button className="action-btn-modern edit-btn" onClick={() => startEditDept(d)} title="Modify Node"><i className="fas fa-pencil-alt"></i></button>
                                                            <button className="action-btn-modern delete-btn" onClick={() => deleteDept(d.id)} title="Decommission Node"><i className="fas fa-trash-alt"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    </div>
                );
            }
            case 'question-papers':
                return (
                    <>
                        <PaperWizard onUploadSuccess={() => setRefreshKey(prev => prev + 1)} />
                        <PaperList key={refreshKey} />
                    </>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'jobs', label: 'Manage Jobs', icon: 'fa-briefcase', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'users', label: 'Manage Users', icon: 'fa-users', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'students', label: 'Student Monitor', icon: 'fa-user-graduate', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { id: 'profile-details', label: 'Student Details', icon: 'fa-id-card', roles: ['ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN'] },
        { id: 'interviews', label: 'Manage Interviews', icon: 'fa-calendar-alt', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'applications', label: 'Job Applications', icon: 'fa-file-alt', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'interview-applications', label: 'Interview Apps', icon: 'fa-user-check', roles: ['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'DEPT_ADMIN'] },
        { id: 'gallery', label: 'Gallery Management', icon: 'fa-images', roles: ['ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN'] },
        { id: 'question-papers', label: 'Question Papers', icon: 'fa-file-pdf', roles: ['ADMIN', 'SUPER_ADMIN', 'DEPT_ADMIN'] },
        { id: 'departments', label: 'Departments', icon: 'fa-university', roles: ['SUPER_ADMIN'] },
        { id: 'companies', label: 'Companies', icon: 'fa-city', roles: ['SUPER_ADMIN'] }
    ];

    return (
        <div className="admin-container animate-in">
            <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <i className="fas fa-shield-alt" style={{ color: 'white' }}></i>
                    </div>
                    <h2>AntiHired</h2>
                </div>

                <nav className="sidebar-menu">
                    <ul>
                        {menuItems.filter(item => item.roles.includes(role)).map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if (item.id === 'applications') loadApplications();
                                        if (item.id === 'interview-applications') loadInterviewApplications();
                                        if (item.id === 'gallery') loadGalleryItems();
                                    }}
                                    className={`nav-btn-modern ${activeTab === item.id ? 'active' : ''}`}
                                >
                                    {activeTab === item.id && <div className="active-indicator"></div>}
                                    <div className="nav-icon-wrapper">
                                        <i className={`fas ${item.icon}`}></i>
                                    </div>
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer" style={{ padding: '1rem' }}>
                    <div className="user-info-mini" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center' }}>
                        <div className="mini-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                            {role.charAt(0)}
                        </div>
                        <div className="mini-details" style={{ marginLeft: '1rem', overflow: 'hidden' }}>
                            <div className="mini-name" style={{ fontWeight: '600', fontSize: '0.9rem', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{localStorage.getItem('username') || 'Admin'}</div>
                            <div className="mini-role" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{role.replace('_', ' ')}</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1>{menuItems.find(i => i.id === activeTab)?.label}</h1>
                    </div>
                    <div className="header-right">
                        <div className="header-search">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Refine your view..."
                                value={globalSearch}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setGlobalSearch(val);
                                    if (val.length > 2) {
                                        if (val.toLowerCase().includes('job')) setActiveTab('jobs');
                                        if (val.toLowerCase().includes('user') || val.toLowerCase().includes('student')) setActiveTab('users');
                                        setUserSearch(val);
                                        setJobSearch(val);
                                        setAppSearch(val);
                                    }
                                }}
                            />
                        </div>
                        <button className="header-icon-btn">
                            <i className="fas fa-bell"></i>
                            <span className="notification-dot"></span>
                        </button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn-modern">
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
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
                                    <button className={verificationTab === 'aadhar' ? 'active' : ''} onClick={() => setVerificationTab('aadhar')}>Aadhar</button>
                                    <button className={verificationTab === 'admit' ? 'active' : ''} onClick={() => setVerificationTab('admit')}>Admit Card</button>
                                </div>
                                <div className="image-frame">
                                    <img
                                        src={`${API_BASE_URL}/student-profile/${verificationTab === 'idCard' ? 'id-card' : verificationTab === 'aadhar' ? 'aadhar' : 'admit-card'}/${selectedProfileForVerification.id}`}
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
    );
};

export default AdminDashboard;
