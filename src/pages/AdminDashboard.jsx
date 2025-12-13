import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const jobPayload = {
            title: formData.jobTitle,
            description: formData.jobDescription,
            company_name: formData.companyName,
            apply_link: formData.applyLink,
            last_date: formData.lastDate,
            salary: parseInt(formData.salary)
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
            loadJobs();
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
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
                        <li><a href="#" className="active"><i className="fas fa-tachometer-alt"></i> Dashboard</a></li>
                        <li><a href="#jobs-section"><i className="fas fa-briefcase"></i> Manage Jobs</a></li>
                        <li><a href="#users-section"><i className="fas fa-users"></i> Manage Users</a></li>
                        <li><a href="/"><i className="fas fa-sign-out-alt"></i> Back to Portal</a></li>
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1>Dashboard</h1>
                    <p className="subtitle">Welcome, Admin! Manage your portal content from here.</p>
                </header>

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
                        <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Post Job</button>
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
                                        <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr>
                                    </thead>
                                    <tbody id="userList">
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
