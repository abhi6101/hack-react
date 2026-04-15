import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import API_BASE_URL from '../config';

const MyApplications = () => {
    const [jobApplications, setJobApplications] = useState([]);
    const [interviewApplications, setInterviewApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            // Fetch job applications
            const jobRes = await fetch('/student/my-applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (jobRes.ok) {
                const jobData = await jobRes.json();
                setJobApplications(jobData);
            }

            // Fetch interview applications
            const interviewRes = await fetch('/student/my-interview-applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (interviewRes.ok) {
                const interviewData = await interviewRes.json();
                setInterviewApplications(interviewData);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#fbbf24';
            case 'SHORTLISTED': return '#22c55e';
            case 'REJECTED': return '#ef4444';
            case 'SELECTED': return '#06ffa5';
            default: return '#6366f1';
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your applications...</div>;
    }

    const totalApplications = jobApplications.length + interviewApplications.length;

    if (totalApplications === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', margin: '2rem 0' }}>
                <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}></i>
                <h3>No Applications Yet</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Start applying to jobs and interviews to see them here!</p>
            </div>
        );
    }

    return (
        <div style={{ margin: '2rem 0' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
                <i className="fas fa-clipboard-list"></i> My Applications ({totalApplications})
            </h2>

            {/* Job Applications */}
            {jobApplications.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Job Applications ({jobApplications.length})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {jobApplications.map(app => (
                            <div key={app.id} className="surface-glow" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>{app.jobTitle}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <i className="fas fa-building"></i> {app.companyName}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                </p>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: `${getStatusColor(app.status)}20`,
                                    color: getStatusColor(app.status)
                                }}>
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interview Applications */}
            {interviewApplications.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Interview Applications ({interviewApplications.length})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {interviewApplications.map(app => (
                            <div key={app.id} className="surface-glow" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>{app.company}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <i className="fas fa-calendar"></i> {new Date(app.date).toLocaleDateString()}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                </p>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: `${getStatusColor(app.status)}20`,
                                    color: getStatusColor(app.status)
                                }}>
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyApplications;
