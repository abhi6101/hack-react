import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
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

        // Fetch my applications
        try {
            const appsRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/applications/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (appsRes.ok) {
                const appsData = await appsRes.json();
                setApplications(appsData);
            }
        } catch (err) {
            console.error('Failed to load applications');
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
    const recentActivity = [
        { icon: 'fas fa-paper-plane', title: 'Applied to Interview', description: 'Google Campus Drive', time: '2 hours ago' },
        { icon: 'fas fa-user-edit', title: 'Updated Profile', description: 'Added new skills', time: '1 day ago' },
        { icon: 'fas fa-file-download', title: 'Downloaded Resume', description: 'Professional template', time: '2 days ago' },
        { icon: 'fas fa-brain', title: 'Completed Quiz', description: 'JavaScript Advanced - Score: 85%', time: '3 days ago' }
    ];

    if (loading) return <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

    return (
        <main className="dashboard-page">
            {/* Hero Section */}
            <section className="dashboard-hero">
                <h1>Welcome back, {profile?.fullName || 'Student'}!</h1>
                <p>Your Placement Dashboard</p>
            </section>

            {/* Statistics Cards */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card" style={{ borderTop: '4px solid #4361ee' }}>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3730a3 100%)' }}>
                            <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stats.totalApplications}</h3>
                            <p className="stat-label">Total Applications</p>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderTop: '4px solid #f72585' }}>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)' }}>
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stats.scheduledInterviews}</h3>
                            <p className="stat-label">Scheduled Interviews</p>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderTop: '4px solid #4cc9f0' }}>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4cc9f0 0%, #0096c7 100%)' }}>
                            <i className="fas fa-user-check"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stats.profileCompletion}%</h3>
                            <p className="stat-label">Profile Complete</p>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderTop: '4px solid #06ffa5' }}>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06ffa5 0%, #00d9ff 100%)' }}>
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
                {/* Quick Actions */}
                <section className="quick-actions-section">
                    <h2><i className="fas fa-bolt"></i> Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/interview" className="action-btn">
                            <i className="fas fa-calendar-plus"></i>
                            <span>Apply to Interview</span>
                        </Link>
                        <Link to="/resume" className="action-btn">
                            <i className="fas fa-file-pdf"></i>
                            <span>Update Resume</span>
                        </Link>
                        <Link to="/profile" className="action-btn">
                            <i className="fas fa-user-edit"></i>
                            <span>Edit Profile</span>
                        </Link>
                        <Link to="/jobs" className="action-btn">
                            <i className="fas fa-briefcase"></i>
                            <span>Browse Jobs</span>
                        </Link>
                        <Link to="/quiz" className="action-btn">
                            <i className="fas fa-brain"></i>
                            <span>Take Quiz</span>
                        </Link>
                        <Link to="/papers" className="action-btn">
                            <i className="fas fa-copy"></i>
                            <span>Practice Papers</span>
                        </Link>
                    </div>
                </section>

                {/* Progress Tracker */}
                <section className="progress-section">
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

                {/* Two Column Layout */}
                <div className="dashboard-grid">
                    {/* Profile Status */}
                    <section className="dashboard-card surface-glow">
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
                                    <strong>Skills:</strong> {profile.skills || 'Not specified'}
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
                    <section className="dashboard-card surface-glow">
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
                <section className="dashboard-card surface-glow">
                    <div className="card-header">
                        <h2><i className="fas fa-calendar-alt"></i> Upcoming Interviews</h2>
                    </div>
                    {interviews.length > 0 ? (
                        <div className="interviews-list">
                            {interviews.slice(0, 5).map(interview => (
                                <div key={interview.id} className="interview-item">
                                    <div className="interview-company">{interview.company}</div>
                                    <div className="interview-date">{new Date(interview.date).toLocaleDateString()}</div>
                                    <div className="interview-venue">{interview.venue}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No upcoming interviews</p>
                    )}
                    <Link to="/interview" className="btn btn-outline">View All Interviews</Link>
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
                                            <td>{app.interviewDrive.company}</td>
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
    );
};

export default StudentDashboard;
