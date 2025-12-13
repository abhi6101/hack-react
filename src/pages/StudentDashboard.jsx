import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setProfile(await profileRes.json());
            }
        } catch (err) {
            console.error('Failed to load profile');
        }

        // Fetch interviews
        try {
            const interviewRes = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-drives');
            if (interviewRes.ok) {
                setInterviews(await interviewRes.json());
            }
        } catch (err) {
            console.error('Failed to load interviews');
        }

        setLoading(false);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <main className="dashboard-page">
            <section className="dashboard-hero">
                <h1>Welcome, {profile?.fullName || 'Student'}!</h1>
                <p>Your Placement Dashboard</p>
            </section>

            <div className="dashboard-container">
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
            </div>
        </main>
    );
};

export default StudentDashboard;
