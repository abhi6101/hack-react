import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewRoundsForm from '../components/InterviewRoundsForm';
import '../styles/admin.css';

const AdminDashboard = () => {
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
        salary: ''
    });

    const API_BASE_URL = "https://placement-portal-backend-nwaj.onrender.com/admin";
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    const [activeTab, setActiveTab] = useState('dashboard');
    const [interviews, setInterviews] = useState([]);
    const [interviewForm, setInterviewForm] = useState({
        company: '', date: '', time: '', venue: '', positions: '', eligibility: ''
    });
    const [userForm, setUserForm] = useState({
        username: '', email: '', password: '', role: 'USER'
    });
    const [editingUser, setEditingUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState({
        codingRound: { enabled: false, date: '', time: '', venue: '', instructions: '' },
        technicalInterview: { enabled: false, date: '', time: '', venue: '', topics: '' },
        hrRound: { enabled: false, date: '', time: '', venue: '', questions: '' },
        projectTask: { enabled: false, description: '', deadline: '24', requirements: '' }
    });

    useEffect(() => {
        // Load interviews
        fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-drives')
            .then(res => res.json())
            .then(data => setInterviews(Array.isArray(data) ? data : []))
            .catch(() => {
                // Fallback
                const stored = localStorage.getItem('interviews');
                if (stored) setInterviews(JSON.parse(stored));
            });
    }, []);

    const loadApplications = async () => {
        setLoadingApplications(true);
        try {
            const response = await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/admin/job-applications`, {
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

    const loadInterviewApplications = async () => {
        setLoadingInterviewApps(true);
        try {
            const response = await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/admin/interview-applications`, {
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
            const res = await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/admin/interview-applications/${appId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
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

    const updateApplicationStatus = async (appId, newStatus) => {
        try {
            const res = await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/admin/job-applications/${appId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
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
            const res = await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/admin/job-applications/${appId}`, {
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
            positions: interviewForm.positions, // Backend expects string
            eligibility: interviewForm.eligibility,
            totalSlots: 20, bookedSlots: 0
        };

        try {
            const res = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-drives/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newInterview)
            });

            if (res.ok) {
                const saved = await res.json();
                setInterviews([...interviews, saved]);
                setMessage({ text: 'Interview posted to database!', type: 'success' });
            } else {
                throw new Error('Backend save failed');
            }
        } catch (err) {
            // Fallback for demo
            console.error(err);
            const localInterview = { ...newInterview, id: Date.now(), positions: newInterview.positions.split(',') };
            const updated = [...interviews, localInterview];
            setInterviews(updated);
            localStorage.setItem('interviews', JSON.stringify(updated));
            setMessage({ text: 'Backend unavailable. Saved locally!', type: 'success' });
        }
        setInterviewForm({ company: '', date: '', time: '', venue: '', positions: '', eligibility: '' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const deleteInterview = async (id) => {
        if (!window.confirm('Delete this interview?')) return;

        try {
            await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/interview-drives/admin/${id}`, {
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
        if (!token || role !== 'ADMIN') {
            alert('Access Denied. Admins only.');
            navigate('/login');
            return;
        }
        loadJobs();
        loadUsers();
    }, [navigate, token, role]);

    const loadJobs = async () => {
        setLoadingJobs(true);
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
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
            const response = await fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } });
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
            ? `${API_BASE_URL}/users/${editingUser.id}`
            : `${API_BASE_URL}/users`;
        const method = editingUser ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(userForm)
            });

            if (res.ok) {
                setMessage({ text: editingUser ? 'User updated!' : 'User created!', type: 'success' });
                loadUsers();
                setUserForm({ username: '', email: '', password: '', role: 'USER' });
                setEditingUser(null);
            } else {
                const error = await res.text();
                setMessage({ text: error, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to save user', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const startEditUser = (user) => {
        setUserForm({ username: user.username, email: user.email, password: '', role: user.role });
        setEditingUser(user);
    };

    const deleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
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
            companyName: 'Google India',
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
            companyName: '',
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
            company: 'Microsoft India',
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
            company: '', date: '', time: '', venue: '', positions: '', eligibility: ''
        });
        setMessage({ text: 'Interview form cleared!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    };

    const deleteApplication = async (appId) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;
        try {
            const response = await fetch(`https://placement-portal-backend-nwaj.onrender.com/api/admin/job-applications/${appId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                loadApplications();
                setMessage({ text: 'Application deleted successfully!', type: 'success' });
            } else {
                throw new Error('Failed to delete application');
            }
        } catch (error) {
            setMessage({ text: 'Failed to delete application', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const jobPayload = {
            title: formData.jobTitle,
            description: formData.jobDescription,
            company_name: formData.companyName,
            apply_link: formData.applyLink,
            last_date: formData.lastDate,
            salary: parseInt(formData.salary),
            interview_details: JSON.stringify(interviewDetails)
        };

        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(jobPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to post job');
            }

            setMessage({ text: 'Job posted successfully!', type: 'success' });
            setFormData({ jobTitle: '', companyName: '', jobDescription: '', applyLink: '', lastDate: '', salary: '' });
            setInterviewDetails({
                codingRound: { enabled: false, date: '', time: '', venue: '', instructions: '' },
                technicalInterview: { enabled: false, date: '', time: '', venue: '', topics: '' },
                hrRound: { enabled: false, date: '', time: '', venue: '', questions: '' },
                projectTask: { enabled: false, description: '', deadline: '24', requirements: '' }
            });
            loadJobs();
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
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
                                <h3><i className="fas fa-plus-circle"></i> Post New Job</h3>
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
                                        <input type="text" id="companyName" className="form-control" required value={formData.companyName} onChange={handleInputChange} />
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

                                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={fillSampleData}>
                                        <i className="fas fa-magic"></i> Fill Sample Data
                                    </button>
                                    <button type="button" className="btn btn-warning" onClick={clearForm}>
                                        <i className="fas fa-eraser"></i> Clear Form
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save"></i> Post Job
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="card surface-glow">
                            <div className="card-header">
                                <h3><i className="fas fa-briefcase"></i> Posted Jobs</h3>
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
                                                            <button className="btn btn-danger" onClick={() => deleteJob(job.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
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
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select className="form-control" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> {editingUser ? 'Update' : 'Create'} User</button>
                                {editingUser && <button type="button" className="btn btn-secondary" onClick={() => { setEditingUser(null); setUserForm({ username: '', email: '', password: '', role: 'USER' }); }}>Cancel</button>}
                            </form>
                        </section>

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
                                                <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                                            </thead>
                                            <tbody id="userList">
                                                {users.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{user.id}</td>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.role}</td>
                                                        <td className="action-btns">
                                                            <button className="btn btn-secondary" onClick={() => startEditUser(user)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-danger" onClick={() => deleteUser(user.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
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
            case 'applications':
                return (
                    <section className="card surface-glow">
                        <div className="card-header">
                            <h3><i className="fas fa-file-alt"></i> Job Applications</h3>
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
                                                        <a href={`https://placement-portal-backend-nwaj.onrender.com/resumes/${app.resumePath.split('/').pop()}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
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
                                <h3><i className="fas fa-calendar-plus"></i> Post New Interview</h3>
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
                                        <i className="fas fa-magic"></i> Fill Sample Data
                                    </button>
                                    <button type="button" className="btn btn-warning" onClick={clearInterviewForm}>
                                        <i className="fas fa-eraser"></i> Clear Form
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save"></i> Post Interview
                                    </button>
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
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => deleteInterview(interview.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
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
                                                    <a href={`https://placement-portal-backend-nwaj.onrender.com/resumes/${app.resumePath.split('/').pop()}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
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
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="admin-container">
            <aside className="sidebar">
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
                        <li>
                            <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>
                                <i className="fas fa-users"></i> Manage Users
                            </button>
                        </li>
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
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className="subtitle">Welcome, Admin! Manage your portal content from here.</p>
                    </div>
                    <button onClick={() => navigate('/')} className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        <i className="fas fa-arrow-left"></i> Back to Portal
                    </button>
                </header>

                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
