import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalApplications: 0,
        scheduledInterviews: 0,
        profileCompletion: 0,
        successRate: 0
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to access dashboard');
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        const token = localStorage.getItem('authToken');

        // Fetch user info
        try {
            const userRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
            }
        } catch (err) {
            console.error('Failed to load user data');
        }

        // Fetch profile
        try {
            const profileRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/student-profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
            }
        } catch (err) {
            console.error('Failed to load profile');
        }

        // Fetch interviews
        try {
            const interviewRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-drives');
            if (interviewRes.ok) {
                const interviewData = await interviewRes.json();
                setInterviews(interviewData);
            }
        } catch (err) {
            console.error('Failed to load interviews');
        }

        // Fetch my applications (Interview)
        try {
            const appsRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-applications/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (appsRes.ok) {
                const appsData = await appsRes.json();
                setApplications(appsData);
            }
        } catch (err) {
            console.error('Failed to load applications');
        }

        // Fetch job applications
        try {
            const jobAppsRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/job-applications/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (jobAppsRes.ok) {
                const jobAppsData = await jobAppsRes.json();
                setJobApplications(jobAppsData);
            }
        } catch (err) {
            console.error('Failed to load job applications');
        }

        setLoading(false);
    };

    // Calculate statistics
    useEffect(() => {
        if (!loading) {
            calculateStats();
        }
    }, [applications, interviews, profile, loading]);

    const calculateStats = () => {
        const totalApps = applications.length;
        const scheduled = interviews.filter(i => new Date(i.date) > new Date()).length;
        const completion = calculateProfileCompletion(profile);
        const success = calculateSuccessRate(applications);

        setStats({
            totalApplications: totalApps,
            scheduledInterviews: scheduled,
            profileCompletion: completion,
            successRate: success
        });
    };

    const calculateProfileCompletion = (profile) => {
        if (!profile) return 0;
        const fields = ['fullName', 'enrollmentNumber', 'branch', 'cgpa', 'skills', 'email', 'phone'];
        const filled = fields.filter(field => profile[field] && profile[field].toString().trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
    };

    const calculateSuccessRate = (apps) => {
        if (apps.length === 0) return 0;
        const successful = apps.filter(app =>
            app.status === 'ACCEPTED' || app.status === 'SHORTLISTED'
        ).length;
        return Math.round((successful / apps.length) * 100);
    };

    // Mock recent activity (in real app, fetch from backend)
    const [recentActivity, setRecentActivity] = useState([
        { title: 'Application Sent', description: 'Applied to Google SDE role', time: '2 hours ago', icon: 'fas fa-paper-plane' },
        { title: 'Profile Updated', description: 'Added React.js skill', time: '1 day ago', icon: 'fas fa-user-edit' },
        { title: 'New Job Posted', description: 'Microsoft is hiring Interns', time: '3 days ago', icon: 'fas fa-bell' }
    ]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning,';
        if (hour < 18) return 'Good Afternoon,';
        return 'Good Evening,';
    };

    if (loading) return <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

    return (
        <div className="dashboard-layout">


            <main className="dashboard-main-content">
                <header className="dashboard-topbar">
                    <div className="dashboard-header">
                        <div className="welcome-section">
                            <h1 className="welcome-title">
                                Welcome back, {user?.username || 'Student'}! 👋
                            </h1>
                            <p className="welcome-subtitle">Here's your placement journey overview</p>
                            {user && (
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                    <div><strong>Email:</strong> {user.email}</div>
                                    {user.branch && <div><strong>Branch:</strong> {user.branch}</div>}
                                    {user.semester && <div><strong>Semester:</strong> {user.semester}</div>}
                                </div>
                            )}
                        </div>
                        <div className="profile-section">
                            <div className="profile-avatar custom-glow">
                                {user?.username ? user.username.charAt(1).toUpperCase() : 'S'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Statistics Cards */}
                <section className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-card card-primary">
                            <div className="stat-icon custom-glow">
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-value">{stats.totalApplications}</h3>
                                <p className="stat-label">Total Applications</p>
                            </div>
                        </div>

                        <div className="stat-card card-pink">
                            <div className="stat-icon custom-glow">
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-value">{stats.scheduledInterviews}</h3>
                                <p className="stat-label">Scheduled Interviews</p>
                            </div>
                        </div>

                        <div className="stat-card card-blue">
                            <div className="stat-icon custom-glow">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-value">{stats.profileCompletion}%</h3>
                                <p className="stat-label">Profile Complete</p>
                            </div>
                        </div>

                        <div className="stat-card card-green">
                            <div className="stat-icon custom-glow">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-value">{stats.successRate}%</h3>
                                <p className="stat-label">Success Rate</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="dashboard-container">
                    {/* Progress Tracker and Quick Actions Grid */}
                    <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                        {/* Quick Actions */}
                        <section className="quick-actions-section glass-panel">
                            <h2><i className="fas fa-bolt"></i> Quick Actions</h2>
                            <div className="actions-grid">
                                <Link to="/interview" className="action-btn">
                                    <i className="fas fa-calendar-plus"></i>
                                    <span>Apply</span>
                                </Link>
                                <Link to="/resume" className="action-btn">
                                    <i className="fas fa-file-pdf"></i>
                                    <span>Resume</span>
                                </Link>
                                <Link to="/jobs" className="action-btn">
                                    <i className="fas fa-briefcase"></i>
                                    <span>Jobs</span>
                                </Link>
                                <Link to="/quiz" className="action-btn">
                                    <i className="fas fa-brain"></i>
                                    <span>Quiz</span>
                                </Link>
                            </div>
                        </section>

                        {/* Progress Section */}
                        <section className="progress-section glass-panel">
                            <h2><i className="fas fa-tasks"></i> Your Progress</h2>
                            <div className="progress-grid">
                                <div className="progress-item">
                                    <div className="progress-circle">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="45" fill="none"
                                                stroke={stats.profileCompletion >= 70 ? '#06ffa5' : stats.profileCompletion >= 40 ? '#ffd60a' : '#f72585'}
                                                strokeWidth="8"
                                                strokeDasharray={`${stats.profileCompletion * 2.83} 283`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 50 50)"
                                                style={{ transition: 'stroke-dasharray 1s ease' }} />
                                        </svg>
                                        <div className="progress-text">
                                            <span className="progress-value">{stats.profileCompletion}%</span>
                                            <span className="progress-label">Profile</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="progress-item">
                                    <div className="progress-circle">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="45" fill="none"
                                                stroke={stats.successRate >= 70 ? '#06ffa5' : stats.successRate >= 40 ? '#ffd60a' : '#f72585'}
                                                strokeWidth="8"
                                                strokeDasharray={`${stats.successRate * 2.83} 283`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 50 50)"
                                                style={{ transition: 'stroke-dasharray 1s ease' }} />
                                        </svg>
                                        <div className="progress-text">
                                            <span className="progress-value">{stats.successRate}%</span>
                                            <span className="progress-label">Success</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Two Column Layout */}
                    <div className="dashboard-grid">
                        {/* Profile Status */}
                        <section className="dashboard-card glass-panel">
                            <div className="card-header">
                                <h2><i className="fas fa-user"></i> Profile Status</h2>
                                <Link to="/profile" className="btn btn-primary">Edit Profile</Link>
                            </div>
                            {profile ? (
                                <div className="profile-summary">
                                    <div className="profile-item">
                                        <strong>Enrollment:</strong> {profile.enrollmentNumber}
                                    </div>
                                    <div className="profile-item">
                                        <strong>Branch:</strong> {profile.branch}
                                    </div>
                                    <div className="profile-item">
                                        <strong>CGPA:</strong> {profile.cgpa}
                                    </div>
                                    <div className="profile-item">
                                        <strong>Skills:</strong>
                                        <div className="skills-wrapper">
                                            {profile.skills ? profile.skills.split(/[\s,]+/).filter(s => s).map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            )) : <span className="text-muted">Not specified</span>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle"></i> Please complete your profile to access placement opportunities.
                                    <Link to="/profile" className="btn btn-secondary">Complete Profile</Link>
                                </div>
                            )}
                        </section>

                        {/* Recent Activity */}
                        <section className="dashboard-card glass-panel">
                            <div className="card-header">
                                <h2><i className="fas fa-history"></i> Recent Activity</h2>
                            </div>
                            <div className="activity-timeline">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-icon">
                                            <i className={activity.icon}></i>
                                        </div>
                                        <div className="timeline-content">
                                            <h4>{activity.title}</h4>
                                            <p>{activity.description}</p>
                                            <span className="timeline-time">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Upcoming Interviews */}
                    <section className="dashboard-card glass-panel">
                        <div className="card-header">
                            <h2><i className="fas fa-calendar-alt"></i> Upcoming Interviews</h2>
                        </div>
                        {interviews.length > 0 ? (
                            <div className="interviews-list">
                                {interviews.slice(0, 5).map(interview => (
                                    <div key={interview.id} className="interview-item">
                                        <div className="interview-icon-box">
                                            <i className="fas fa-calendar-day"></i>
                                        </div>
                                        <div className="interview-info">
                                            <h4>{interview.company}</h4>
                                            <p>{new Date(interview.date).toLocaleDateString()} • {interview.venue}</p>
                                        </div>
                                        <Link to="/interview" className="btn-icon-small"><i className="fas fa-chevron-right"></i></Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No upcoming interviews</p>
                        )}
                        <Link to="/interview" className="btn btn-outline">View All Interviews</Link>
                    </section>

                    {/* Job Applications */}
                    <section className="dashboard-card glass-panel">
                        <div className="card-header">
                            <h2><i className="fas fa-briefcase"></i> My Job Applications</h2>
                        </div>

                        {/* Shortlist Notification */}
                        {jobApplications.some(app => app.status === 'SHORTLISTED') && (
                            <div className="notification-banner success">
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>Congratulations!</strong> You have been shortlisted for {jobApplications.filter(app => app.status === 'SHORTLISTED').length} job(s).
                                    Check your Interview section for details.
                                </div>
                            </div>
                        )}

                        {jobApplications.length > 0 ? (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Company</th>
                                            <th>Applied On</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobApplications.map(app => (
                                            <tr key={app.id}>
                                                <td>{app.jobTitle || app.job?.title || 'N/A'}</td>
                                                <td>{app.companyName || app.job?.company_name || 'N/A'}</td>
                                                <td>{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                                        {app.status === 'SHORTLISTED' && '✓ '}
                                                        {app.status === 'REJECTED' && '✗ '}
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No job applications yet. <Link to="/jobs">Browse jobs</Link></p>
                        )}
                    </section>

                    {/* My Applications */}
                    <section className="dashboard-card surface-glow">
                        <div className="card-header">
                            <h2><i className="fas fa-file-alt"></i> My Applications</h2>
                        </div>
                        {applications.length > 0 ? (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Company</th>
                                            <th>Applied On</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td>{app.companyName || (app.interviewDrive && app.interviewDrive.company) || 'N/A'}</td>
                                                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No applications yet. <Link to="/interview">Apply to interviews</Link></p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
