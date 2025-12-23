import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewRoundsForm from '../components/InterviewRoundsForm';
import API_BASE_URL from '../config';
import '../styles/admin.css';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

// Simple Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', opacity: disabled ? 0.5 : 1 }}>
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



const AdminDashboard = () => {
    // CSV Export Helper
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert("No data to export");
            return;
        }

        // dynamic headers based on first object keys
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                let value = row[fieldName];
                if (value === null || value === undefined) value = '';
                value = value.toString().replace(/"/g, '""'); // Escape quotes
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

    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
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
    const token = localStorage.getItem('authToken');
    const normalizedRole = localStorage.getItem('userRole'); // ADMIN, SUPER_ADMIN, COMPANY_ADMIN
    // Treat legacy ADMIN as SUPER_ADMIN for now, or just ADMIN
    const role = normalizedRole || 'USER';
    const myCompanyName = localStorage.getItem('companyName');

    // Helper function to handle 401 errors
    const handleUnauthorized = () => {
        console.error('🚫 Authentication failed - Token invalid or expired');
        alert('Your session has expired. Please log in again.');
        localStorage.clear();
        navigate('/login');
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
            alert(err.message);
        }
    };
    const fetchInterviews = () => {
        fetch(`${API_BASE_URL}/interview-drives`, {
            headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
    const [deptMode, setDeptMode] = useState('single'); // 'single' | 'bulk'
    const [editingDept, setEditingDept] = useState(null); // For editing departments
    const [bulkForm, setBulkForm] = useState({ category: '', degree: '', maxSemesters: 8, branches: '' });

    const loadDepartments = async () => {
        setLoadingDepts(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
        await fetch(`${API_BASE_URL}/admin/departments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Authorization': `Bearer ${token}` }
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
        if (!token || !allowedRoles.includes(role)) {
            alert('Access Denied. Admins only.');
            navigate('/login');
            return;
        }
        loadJobs();
        fetchInterviews();
        if (isSuperAdmin) {
            loadUsers(); // Only Super Admins load users
            fetchCompanyStats();
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
    }, [navigate, token, role, isSuperAdmin, activeTab]);

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
            const response = await fetch(`${ADMIN_API_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
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
            const response = await fetch(`${ADMIN_API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } });
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

        // Only include password if:
        // 1. Creating new user (editingUser is null), OR
        // 2. Editing user AND password field is not empty
        if (!editingUser || (editingUser && userForm.password.trim() !== '')) {
            payload.password = userForm.password;
        }

        // Add role-specific fields
        if (userForm.role === 'DEPT_ADMIN' && userForm.adminBranch) {
            payload.adminBranch = userForm.adminBranch;
        }

        if (userForm.role === 'COMPANY_ADMIN') {
            payload.companyName = userForm.companyName;
            // Convert array to comma-separated string
            payload.allowedDepartments = userForm.allowedDepartments.join(',');
        }

        // Debug logging
        console.log('Updating user:', editingUser ? editingUser.id : 'NEW');
        console.log('Payload being sent:', payload);
        console.log('Password included?', 'password' in payload);

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log('✅ User update successful');
                setMessage({ text: editingUser ? 'User updated!' : 'User created!', type: 'success' });
                loadUsers();
                setUserForm({
                    username: '',
                    email: '',
                    password: '',
                    role: 'USER',
                    adminBranch: '',
                    allowedDepartments: [],
                    companyName: ''
                });
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
                headers: { 'Authorization': `Bearer ${token}` }
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
        // Must preserve verification status!
        setUserForm({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
            verified: user.verified, // Include this
            companyName: user.companyName
        });
        setEditingUser(user);
    };

    const deleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            const response = await fetch(`${ADMIN_API_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete job. Please try again.');

            loadJobs();
        } catch (error) {
            alert(error.message);
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
        console.log('🔑 Token:', token ? 'Present' : 'Missing');

        try {
            console.log('⏳ Sending request to backend...');
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        const data = [
            { name: 'Students', value: users.filter(u => !u.role || u.role === 'USER' || u.role === 'STUDENT').length, color: '#3b82f6' },
            { name: 'Admins', value: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length, color: '#ef4444' },
            { name: 'Companies', value: users.filter(u => u.role === 'COMPANY_ADMIN').length, color: '#10b981' }
        ].filter(d => d.value > 0);

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="surface-glow" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>User Distribution</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="surface-glow" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Recent Jobs (Salary in LPA)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={jobs.slice(0, 8).map(j => ({ name: j.company_name ? j.company_name.substring(0, 10) : 'Unknown', salary: j.salary ? (j.salary / 100000) : 0 }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="salary" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Salary (LPA)" />
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
            case 'dashboard':
                return (
                    <div className="dashboard-overview">
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="stat-card surface-glow" style={{ padding: '2rem', textAlign: 'center' }}>
                                <i className="fas fa-briefcase" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                                <h3>Total Jobs</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{jobs.length}</p>
                            </div>
                            <div className="stat-card surface-glow" style={{ padding: '2rem', textAlign: 'center' }}>
                                <i className="fas fa-users" style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1rem' }}></i>
                                <h3>Total Users</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length}</p>
                            </div>
                            <div className="stat-card surface-glow" style={{ padding: '2rem', textAlign: 'center' }}>
                                <i className="fas fa-user-shield" style={{ fontSize: '2.5rem', color: '#28a745', marginBottom: '1rem' }}></i>
                                <h3>Admin Status</h3>
                                <p style={{ fontSize: '1.2rem', color: '#28a745' }}>Active</p>
                            </div>
                        </div>

                        {/* New Visual Analytics Section */}
                        {renderAnalytics()}

                        {isSuperAdmin && (
                            <div className="company-stats-section" style={{ marginBottom: '2.5rem' }}>
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
                            <h2>Recent Jobs</h2>
                            <div className="table-responsive surface-glow" style={{ marginTop: '1rem' }}>
                                <table className="table">
                                    <thead>
                                        <tr><th>Title</th><th>Company</th><th>Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {jobs.slice(0, 5).map(job => (
                                            <tr key={job.id}>
                                                <td>{job.title}</td>
                                                <td>{job.company_name}</td>
                                                <td>{new Date(job.last_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'jobs':
                return (
                    <>
                        <section id="jobs-section" className="card surface-glow">
                            <div className="card-header">
                                <h3><i className={editingJob ? "fas fa-edit" : "fas fa-plus-circle"}></i> {editingJob ? 'Edit Job' : 'Post New Job'}</h3>
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
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 'bold', marginBottom: '0.5rem' }}>
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
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: '1.5rem' }}>
                                                        {Array.from({ length: dept.maxSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                                            <label key={`${dept.code}-${sem}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>
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
                                        )) : <p>Loading Departments or None Found...</p>}
                                    </div>
                                </div>

                                {/* Email Notification Toggle */}
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <label style={{ fontWeight: '600', color: 'white', marginBottom: '0.25rem', display: 'block' }}>
                                                <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                                                Email Notifications
                                            </label>
                                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                                                Send email alerts to all students when a new job is posted
                                            </p>
                                        </div>
                                        <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '30px' }}>
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
                            <div className="card-header">
                                <h3><i className="fas fa-briefcase"></i> Posted Jobs</h3>
                                {isSuperAdmin && jobs.length > 0 && (
                                    <button
                                        onClick={handleDeleteAllJobs}
                                        className="btn btn-danger"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                        <i className="fas fa-trash-alt"></i> Delete All
                                    </button>
                                )}
                            </div>
                            {loadingJobs && <div id="loadingJobsIndicator" className="loading-indicator">Loading jobs...</div>}
                            {!loadingJobs && (
                                <div className="table-responsive">
                                    {jobs.length === 0 ? <p style={{ padding: '1rem' }}>No jobs posted yet.</p> : (
                                        <table id="jobsTable">
                                            <thead>
                                                <tr><th>Title</th><th>Company</th><th>Last Date</th><th>Salary</th><th>Actions</th></tr>
                                            </thead>
                                            <tbody id="jobsList">
                                                {jobs.map(job => (
                                                    <tr key={job.id}>
                                                        <td>{job.title}</td>
                                                        <td>{job.company_name}</td>
                                                        <td>{new Date(job.last_date).toLocaleDateString('en-IN')}</td>
                                                        <td>₹{job.salary.toLocaleString()}</td>
                                                        <td className="action-btns">
                                                            {(!isCompanyAdmin || job.company_name === myCompanyName) ? (
                                                                <>
                                                                    <button className="btn btn-secondary" onClick={() => startEditJob(job)} style={{ marginRight: '0.5rem' }}>
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
                            )}
                        </section>
                    </>
                );
            case 'users':
                return (
                    <>
                        {!isCompanyAdmin && (
                            <section className="card surface-glow">
                                <div className="card-header">
                                    <h3><i className="fas fa-user-plus"></i> {editingUser ? 'Edit User' : 'Add New User'}</h3>
                                </div>
                                <form onSubmit={handleUserSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input type="text" className="form-control" required value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" className="form-control" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Password {editingUser && '(leave blank to keep current)'}</label>
                                            <input type="password" className="form-control" required={!editingUser} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                        </div>
                                        {userForm.role === 'USER' && (
                                            <>
                                                <div className="form-group">
                                                    <label>Computer Code (Student ID)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={userForm.computerCode}
                                                        onChange={e => setUserForm({ ...userForm, computerCode: e.target.value })}
                                                        placeholder="e.g., 59500"
                                                    />
                                                    <small className="form-text text-muted">
                                                        Unique student identifier from ID card
                                                    </small>
                                                </div>
                                                <div className="form-group">
                                                    <label>Batch (Passout Year)</label>
                                                    <select
                                                        className="form-control"
                                                        value={userForm.batch}
                                                        onChange={e => setUserForm({ ...userForm, batch: e.target.value })}
                                                    >
                                                        <option value="">Select Batch</option>
                                                        <option value="2025">2025</option>
                                                        <option value="2026">2026</option>
                                                        <option value="2027">2027</option>
                                                        <option value="2028">2028</option>
                                                        <option value="2029">2029</option>
                                                        <option value="2030">2030</option>
                                                    </select>
                                                    <small className="form-text text-muted">
                                                        Expected graduation/passout year
                                                    </small>
                                                </div>
                                            </>
                                        )}
                                        <div className="form-group">
                                            <label>Role</label>
                                            <select className="form-control" value={userForm.role} onChange={e => {
                                                const newRole = e.target.value;
                                                setUserForm(prev => ({
                                                    ...prev,
                                                    role: newRole,
                                                    companyName: newRole === 'COMPANY_ADMIN' ? prev.companyName : '',
                                                    branch: newRole === 'DEPT_ADMIN' ? (departments.length > 0 ? departments[0].code : '') : ''
                                                }));
                                            }}>
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                                <option value="COMPANY_ADMIN">COMPANY ADMIN</option>
                                                <option value="DEPT_ADMIN">DEPT ADMIN</option>
                                            </select>
                                        </div>
                                        {userForm.role === 'DEPT_ADMIN' && (
                                            <div className="form-group">
                                                <label>Admin Branch (Department to Manage) *</label>
                                                <select
                                                    className="form-control"
                                                    required
                                                    value={userForm.adminBranch || ''}
                                                    onChange={e => setUserForm({ ...userForm, adminBranch: e.target.value })}
                                                >
                                                    <option value="">Select Branch to Manage</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                                                    ))}
                                                </select>
                                                <small className="form-text text-muted">
                                                    This admin will manage only this branch
                                                </small>
                                            </div>
                                        )}
                                        {userForm.role === 'COMPANY_ADMIN' && (
                                            <>
                                                <div className="form-group">
                                                    <label>Company Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        required
                                                        value={userForm.companyName || ''}
                                                        onChange={e => setUserForm({ ...userForm, companyName: e.target.value })}
                                                        placeholder="e.g. Google, Microsoft"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Allowed Departments *</label>
                                                    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                                                        {departments.length > 0 ? departments.map(dept => (
                                                            <div key={dept.id} className="form-check">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`dept-${dept.code}`}
                                                                    checked={userForm.allowedDepartments.includes(dept.code)}
                                                                    onChange={e => {
                                                                        if (e.target.checked) {
                                                                            setUserForm({
                                                                                ...userForm,
                                                                                allowedDepartments: [...userForm.allowedDepartments, dept.code]
                                                                            });
                                                                        } else {
                                                                            setUserForm({
                                                                                ...userForm,
                                                                                allowedDepartments: userForm.allowedDepartments.filter(d => d !== dept.code)
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <label className="form-check-label" htmlFor={`dept-${dept.code}`}>
                                                                    {dept.name} ({dept.code})
                                                                </label>
                                                            </div>
                                                        )) : (
                                                            <p className="text-muted">No departments available. Please create departments first.</p>
                                                        )}
                                                    </div>
                                                    <small className="form-text text-muted">
                                                        Company can post jobs for selected departments only
                                                    </small>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> {editingUser ? 'Update' : 'Create'} User</button>
                                    {editingUser && <button type="button" className="btn btn-secondary" onClick={() => {
                                        setEditingUser(null);
                                        setUserForm({
                                            username: '',
                                            email: '',
                                            password: '',
                                            role: 'USER',
                                            adminBranch: '',
                                            allowedDepartments: [],
                                            companyName: '',
                                            computerCode: '',
                                            batch: ''
                                        });
                                    }}>Cancel</button>}
                                </form>
                            </section>
                        )}

                        <section id="users-section" className="card surface-glow">
                            <div className="card-header">
                                <h3><i className="fas fa-users"></i> Registered Users</h3>
                            </div>
                            {loadingUsers && <div id="loadingUsersIndicator" className="loading-indicator">Loading users...</div>}
                            {!loadingUsers && (
                                <div className="table-responsive">
                                    {users.length === 0 ? <p style={{ padding: '1rem' }}>No registered users found.</p> : (
                                        <table id="usersTable">
                                            <thead>
                                                <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Company</th><th>Actions</th></tr>
                                            </thead>
                                            <tbody id="userList">
                                                {users.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{user.id}</td>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.role}</td>
                                                        <td>{user.companyName || user.branch || '-'}</td>
                                                        <td className="action-btns">
                                                            {!isCompanyAdmin ? (
                                                                <>
                                                                    <button className="btn btn-secondary" onClick={() => startEditUser(user)}>
                                                                        <i className="fas fa-edit"></i>
                                                                    </button>
                                                                    <button className="btn btn-danger" onClick={() => deleteUser(user.id)}>
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
                            )}
                        </section>
                    </>
                );
            case 'students':
                return renderStudentMonitor();
            case 'profile-details':
                return renderProfileDetails();
            case 'applications':
                return (
                    <section className="card surface-glow">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3><i className="fas fa-file-alt"></i> Job Applications</h3>
                            <button className="btn-secondary" onClick={() => downloadCSV(applications, 'job_applications.csv')}>
                                <i className="fas fa-file-csv"></i> Export
                            </button>
                        </div>
                        {loadingApplications ? (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading applications...</p>
                        ) : applications.length > 0 ? (
                            <div className="table-responsive" style={{ padding: '1rem' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Email</th>
                                            <th>Company</th>
                                            <th>Job Title</th>
                                            <th>Applied On</th>
                                            <th>Resume</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td>{app.applicantName}</td>
                                                <td>{app.applicantEmail}</td>
                                                <td>{app.companyName}</td>
                                                <td>{app.jobTitle}</td>
                                                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                <td>
                                                    {app.resumePath ? (
                                                        <a href={`${API_BASE_URL.replace('/api', '')}/resumes/${app.resumePath.split('/').pop()}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                                            <i className="fas fa-file-pdf"></i> View
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#888' }}>No resume</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        background: app.status === 'PENDING' ? 'rgba(251, 191, 36, 0.2)' :
                                                            app.status === 'SHORTLISTED' ? 'rgba(34, 197, 94, 0.2)' :
                                                                app.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' :
                                                                    'rgba(99, 102, 241, 0.2)',
                                                        color: app.status === 'PENDING' ? '#fbbf24' :
                                                            app.status === 'SHORTLISTED' ? '#22c55e' :
                                                                app.status === 'REJECTED' ? '#ef4444' :
                                                                    'var(--primary)'
                                                    }}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                                            className="form-control"
                                                            style={{ width: 'auto', padding: '0.5rem' }}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="SHORTLISTED">Shortlist</option>
                                                            <option value="REJECTED">Reject</option>
                                                            <option value="SELECTED">Select</option>
                                                        </select>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => deleteApplication(app.id)}
                                                            title="Delete Application"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>No applications yet.</p>
                        )}
                    </section>
                );
            case 'interviews':
                return (
                    <>
                        <section className="card surface-glow">
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
                                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingInterview(null); clearInterviewForm(); }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                        <section className="card surface-glow">
                            <div className="card-header">
                                <h3><i className="fas fa-calendar-check"></i> Scheduled Interviews</h3>
                            </div>
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
                    </>
                );
            case 'interview-applications':
                return (
                    <section className="card surface-glow">
                        <div className="card-header">
                            <h3><i className="fas fa-user-check"></i> Interview Drive Applications</h3>
                        </div>
                        {loadingInterviewApps ? (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading applications...</p>
                        ) : interviewApplications.length > 0 ? (
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
                                        {interviewApplications.map(app => (
                                            <tr key={app.id}>
                                                <td>
                                                    {app.applicantName}
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{app.applicantEmail}</div>
                                                </td>
                                                <td>{app.companyName}</td>
                                                <td>{new Date(app.interviewDate).toLocaleDateString()}</td>
                                                <td>
                                                    <a href={`${API_BASE_URL.replace('/api', '')}/resumes/${app.resumePath.split('/').pop()}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                                        <i className="fas fa-file-pdf"></i> View Resume
                                                    </a>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        background: app.status === 'PENDING' ? 'rgba(251, 191, 36, 0.2)' :
                                                            app.status === 'SHORTLISTED' ? 'rgba(34, 197, 94, 0.2)' :
                                                                app.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' :
                                                                    'rgba(99, 102, 241, 0.2)',
                                                        color: app.status === 'PENDING' ? '#fbbf24' :
                                                            app.status === 'SHORTLISTED' ? '#22c55e' :
                                                                app.status === 'REJECTED' ? '#ef4444' :
                                                                    'var(--primary)'
                                                    }}>
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
                        ) : (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>No interview applications received yet.</p>
                        )}
                    </section>
                );
            case 'gallery':
                return (
                    <section className="card surface-glow">
                        <div className="card-header">
                            <h3><i className="fas fa-images"></i> Gallery Management</h3>
                        </div>
                        {loadingGallery ? (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading gallery items...</p>
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
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => updateGalleryStatus(item.id, e.target.value)}
                                                            className="form-control"
                                                            style={{ width: 'auto', padding: '0.25rem' }}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="ACCEPTED">Accept</option>
                                                            <option value="REJECTED">Reject</option>
                                                        </select>
                                                        <button className="btn btn-danger" onClick={() => deleteGalleryItem(item.id)} style={{ padding: '0.25rem 0.5rem' }}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                                                            <i className="fas fa-eye"></i>
                                                        </a>
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
                    </section>
                );
            case 'companies':
                const companyAdmins = users.filter(u => u.role === 'COMPANY_ADMIN');

                const toggleCompanyStatus = async (userId) => {
                    try {
                        const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` }
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
                        <div className="card-header">
                            <h3><i className="fas fa-building"></i> Company Management</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Enable or disable company accounts. Disabled companies cannot post jobs or interviews.
                            </p>
                        </div>
                        {loadingUsers ? (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading companies...</p>
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
            case 'departments':
                return (
                    <section className="card surface-glow">
                        <div className="card-header">
                            <h3><i className="fas fa-university"></i> Manage Departments</h3>
                        </div>
                        <div className="form-grid" style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', gap: '1rem', mb: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <button type="button" onClick={() => setDeptMode('single')} className={`btn ${deptMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}>Single Dept</button>
                                <button type="button" onClick={() => setDeptMode('bulk')} className={`btn ${deptMode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}>Bulk Program (e.g. B.Tech)</button>
                            </div>

                            {deptMode === 'single' ? (
                                <form onSubmit={handleDeptSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end', width: '100%', marginTop: '1rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Dept Name</label>
                                        <input type="text" className="form-control" placeholder="e.g. Master of Computer Applications" required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Dept Code (Unique)</label>
                                        <input type="text" className="form-control" placeholder="e.g. MCA" required value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>HOD Name</label>
                                        <input type="text" className="form-control" placeholder="HOD Name" value={deptForm.hodName} onChange={e => setDeptForm({ ...deptForm, hodName: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Semesters</label>
                                        <input type="number" className="form-control" placeholder="8" min="1" max="14" required value={deptForm.maxSemesters || 8} onChange={e => setDeptForm({ ...deptForm, maxSemesters: parseInt(e.target.value) })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                                        <i className={`fas fa-${editingDept ? 'save' : 'plus'}`}></i> {editingDept ? 'Update Dept' : 'Add Dept'}
                                    </button>
                                    {editingDept && (
                                        <button type="button" className="btn btn-secondary" style={{ height: '42px' }} onClick={() => { setEditingDept(null); setDeptForm({ name: '', code: '', hodName: '', contactEmail: '', maxSemesters: 8 }); }}>
                                            <i className="fas fa-times"></i> Cancel
                                        </button>
                                    )}
                                </form>
                            ) : (
                                <form onSubmit={handleBulkSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end', width: '100%', marginTop: '1rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Category</label>
                                        <input type="text" className="form-control" placeholder="e.g. Engineering" required value={bulkForm.category} onChange={e => setBulkForm({ ...bulkForm, category: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Degree</label>
                                        <input type="text" className="form-control" placeholder="e.g. B.Tech" required value={bulkForm.degree} onChange={e => setBulkForm({ ...bulkForm, degree: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label>Duration (Semesters)</label>
                                        <input type="number" className="form-control" placeholder="8" min="1" max="14" required value={bulkForm.maxSemesters} onChange={e => setBulkForm({ ...bulkForm, maxSemesters: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="form-group full-width" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                        <label>Branches (Comma Separated)</label>
                                        <textarea className="form-control" rows="2" placeholder="e.g. CSE Core, AIML, Civil, Electrical, Mechanical, Cyber Security" required value={bulkForm.branches} onChange={e => setBulkForm({ ...bulkForm, branches: e.target.value })}></textarea>
                                        <small style={{ color: 'rgba(255,255,255,0.5)' }}>Used to generate: "B.Tech in CSE Core" (Code: BTECH_CSE_CORE)</small>
                                    </div>
                                    <button type="submit" className="btn btn-success" style={{ height: '42px', gridColumn: '1 / -1' }}><i className="fas fa-layer-group"></i> Create Program & Branches</button>
                                </form>
                            )}
                        </div>

                        {loadingDepts ? <div className="loading-indicator">Loading Departments...</div> : (
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
                                                    <button className="btn btn-primary btn-sm" onClick={() => startEditDept(d)} style={{ marginRight: '0.5rem' }}><i className="fas fa-edit"></i> Edit</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteDept(d.id)}><i className="fas fa-trash"></i> Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="admin-container">
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
            <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <h2><i className="fas fa-user-shield"></i> Admin Panel</h2>
                </div>
                <nav className="sidebar-menu">
                    <ul>
                        <li>
                            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>
                                <i className="fas fa-tachometer-alt"></i> Dashboard
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setActiveTab('jobs')} className={activeTab === 'jobs' ? 'active' : ''} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>
                                <i className="fas fa-briefcase"></i> Manage Jobs
                            </button>
                        </li>
                        {(isSuperAdmin || isCompanyAdmin) && (
                            <li>
                                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>
                                    <i className="fas fa-users"></i> Manage Users
                                </button>
                            </li>
                        )}
                        {(isSuperAdmin || role === 'ADMIN') && (
                            <li>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={activeTab === 'students' ? 'active' : ''}
                                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                >
                                    <i className="fas fa-user-graduate"></i> Student Monitor
                                </button>
                            </li>
                        )}
                        {(isSuperAdmin || role === 'ADMIN' || role === 'DEPT_ADMIN') && (
                            <li>
                                <button
                                    onClick={() => setActiveTab('profile-details')}
                                    className={activeTab === 'profile-details' ? 'active' : ''}
                                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                >
                                    <i className="fas fa-id-card"></i> Student Details
                                </button>
                            </li>
                        )}
                        <li>
                            <button onClick={() => setActiveTab('interviews')} className={activeTab === 'interviews' ? 'active' : ''} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <i className="fas fa-calendar-alt"></i> Manage Interviews
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'applications' ? 'active' : ''}
                                onClick={() => { setActiveTab('applications'); loadApplications(); }}
                            >
                                <i className="fas fa-file-alt"></i> Job Applications
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'interview-applications' ? 'active' : ''}
                                onClick={() => { setActiveTab('interview-applications'); loadInterviewApplications(); }}
                                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                            >
                                <i className="fas fa-user-check"></i> Interview Applications
                            </button>
                        </li>
                        {!isCompanyAdmin && (
                            <li>
                                <button
                                    className={activeTab === 'gallery' ? 'active' : ''}
                                    onClick={() => { setActiveTab('gallery'); loadGalleryItems(); }}
                                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                >
                                    <i className="fas fa-images"></i> Gallery Management
                                </button>
                            </li>
                        )}
                        {isSuperAdmin && (
                            <>
                                <li>
                                    <button
                                        className={activeTab === 'departments' ? 'active' : ''}
                                        onClick={() => setActiveTab('departments')}
                                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                    >
                                        <i className="fas fa-university"></i> Departments
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={activeTab === 'companies' ? 'active' : ''}
                                        onClick={() => setActiveTab('companies')}
                                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                    >
                                        <i className="fas fa-building"></i> Company Management
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className="subtitle">Welcome, Admin! Manage your portal content from here.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => navigate('/')} className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                            <i className="fas fa-arrow-left"></i> Back to Portal
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login');
                            }}
                            className="btn btn-outline"
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </header>

                {renderContent()}

                {/* Verification Modal */}
                {selectedProfileForVerification && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div className="surface-glow" style={{
                            width: '1000px', maxWidth: '95%',
                            height: '80vh', overflow: 'hidden',
                            padding: '0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Verify Student Identity</h2>
                                <button onClick={() => setSelectedProfileForVerification(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                                {/* Left: Data */}
                                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#1e293b' }}>
                                    <h3 style={{ color: '#94a3b8', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Submitted Details</h3>

                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div><label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Full Name</label> <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedProfileForVerification.fullName}</div></div>
                                        <div><label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Enrollment Number</label> <div style={{ fontSize: '1.2rem', color: '#60a5fa', fontFamily: 'monospace' }}>{selectedProfileForVerification.enrollmentNumber}</div></div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div><label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Course/Branch</label> <div style={{ fontWeight: '500' }}>{selectedProfileForVerification.branch}</div></div>
                                            <div><label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Current Semester</label> <div style={{ fontWeight: '500' }}>{selectedProfileForVerification.semester}</div></div>
                                        </div>

                                        <div><label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Batch Session</label> <div style={{ fontWeight: '500', color: '#34d399' }}>{selectedProfileForVerification.batch}</div></div>
                                        <div><label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Phone</label> <div style={{ fontWeight: '500' }}>{selectedProfileForVerification.phoneNumber}</div></div>
                                    </div>
                                </div>

                                {/* Right: ID Card */}
                                <div style={{ flex: 1.2, padding: '2rem', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <h3 style={{ color: '#94a3b8', marginBottom: '1rem', width: '100%', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                                        Verification Document: {verificationTab === 'idCard' ? 'College ID' : verificationTab === 'aadhar' ? 'Aadhar Card' : 'Admit Card'}
                                    </h3>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
                                        <button onClick={() => setVerificationTab('idCard')} style={{ background: verificationTab === 'idCard' ? '#6366f1' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>ID Card</button>
                                        <button onClick={() => setVerificationTab('aadhar')} style={{ background: verificationTab === 'aadhar' ? '#34d399' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Aadhar</button>
                                        <button onClick={() => setVerificationTab('admit')} style={{ background: verificationTab === 'admit' ? '#fbbf24' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Admit Card</button>
                                    </div>

                                    <div style={{
                                        flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px dashed #334155', borderRadius: '12px', background: '#020617', padding: '1rem'
                                    }}>
                                        <img
                                            src={`${API_BASE_URL}/student-profile/${verificationTab === 'idCard' ? 'id-card' : verificationTab === 'aadhar' ? 'aadhar' : 'admit-card'}/${selectedProfileForVerification.id}`}
                                            alt="Document"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML += `<span style="color:#64748b; text-align:center">No ${verificationTab} Uploaded</span>`; }}
                                        />
                                    </div>
                                    {verificationTab === 'aadhar' && <div style={{ marginTop: '0.5rem', color: '#34d399', fontSize: '0.8rem' }}>Verify Name Matches Profile</div>}
                                    {verificationTab === 'admit' && <div style={{ marginTop: '0.5rem', color: '#fbbf24', fontSize: '0.8rem' }}>Verify Enrollment & College</div>}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button className="btn-secondary" onClick={() => approveStudent(selectedProfileForVerification.id, 'REJECTED')} style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef4444' }}>
                                    <i className="fas fa-times"></i> Reject
                                </button>
                                <button className="btn-primary" onClick={() => approveStudent(selectedProfileForVerification.id, 'APPROVED')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.75rem 2rem' }}>
                                    <i className="fas fa-check-circle"></i> Verify & Approve Student
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
