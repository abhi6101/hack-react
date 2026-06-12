import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/interview-details.css';

const InterviewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for the interview details based on ID
    // In a real app, this would be fetched from an API
    const [interview, setInterview] = useState(null);

    useEffect(() => {
        // Simulate fetching data
        const mockData = {
            id: id || '1',
            company: 'Microsoft',
            role: 'SDE - Full Stack',
            location: 'Microsoft India',
            status: id === '2' ? 'completed' : id === '3' ? 'pending' : 'upcoming',
            date: '25 Dec',
            time: '10:00 AM',
            platform: 'Microsoft Teams',
            interviewer: 'Senior Eng. Manager',
            roadmap: [
                { id: 1, title: 'Technical Round', status: 'completed', desc: 'DSA and Core CS concepts.' },
                { id: 2, title: 'System Design', status: id === '1' ? 'current' : 'completed', desc: 'HLD and LLD of a scalable system.' },
                { id: 3, title: 'HR Round', status: id === '1' ? 'locked' : (id === '2' ? 'completed' : 'current'), desc: 'Behavioral and cultural fitment.' }
            ],
            feedback: 'Candidate showed strong problem-solving skills but needs improvement in system design considerations. Recommended for next round.',
            resources: [
                { title: 'Microsoft SDE Interview Preparation Guide', link: '#' },
                { title: 'Top 50 System Design Questions', link: '#' },
                { title: 'Company Culture & Values', link: '#' }
            ]
        };
        setInterview(mockData);
    }, [id]);

    if (!interview) {
        return <div className="interview-details-page"><div className="id-content">Loading...</div></div>;
    }

    const getStatusGlowClass = (status) => {
        switch (status) {
            case 'completed': return 'id-status-completed';
            case 'pending': return 'id-status-pending';
            case 'upcoming': default: return 'id-status-upcoming';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'pending': return 'Feedback Pending';
            case 'upcoming': default: return 'Upcoming';
        }
    };

    return (
        <div className="interview-details-page">
            {/* A. Navigation Bar */}
            <header className="id-navbar">
                <button className="id-back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 className="id-title">Interview Details</h1>
                <button className="id-help-btn">
                    <i className="fas fa-question-circle"></i>
                </button>
            </header>

            <main className="id-content">
                {/* B. Interview Header Card */}
                <section className="id-glass-card id-header-card id-animate-slide-up">
                    <div className="id-header-content">
                        <div className={`id-status-badge ${getStatusGlowClass(interview.status)}`}>
                            {getStatusText(interview.status)}
                        </div>
                        <div className="id-company-row">
                            <div className="id-company-logo">
                                <i className="fab fa-microsoft"></i>
                            </div>
                            <div className="id-role-info">
                                <h2 className="id-role-title">{interview.role}</h2>
                                <p className="id-company-name">{interview.company} • {interview.location}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* C. Appointment Details */}
                <section className="id-appointment-grid id-animate-slide-up id-animate-delay-1">
                    <div className="id-detail-item">
                        <div className="id-detail-icon"><i className="far fa-calendar-alt"></i></div>
                        <div className="id-detail-text">
                            <span className="id-detail-label">Date & Time</span>
                            <span className="id-detail-value">{interview.date} | {interview.time}</span>
                        </div>
                    </div>
                    <div className="id-detail-item">
                        <div className="id-detail-icon"><i className="fas fa-globe"></i></div>
                        <div className="id-detail-text">
                            <span className="id-detail-label">Platform</span>
                            <span className="id-detail-value">{interview.platform}</span>
                        </div>
                    </div>
                    <div className="id-detail-item">
                        <div className="id-detail-icon"><i className="far fa-user"></i></div>
                        <div className="id-detail-text">
                            <span className="id-detail-label">Interviewer</span>
                            <span className="id-detail-value">{interview.interviewer}</span>
                        </div>
                    </div>
                </section>

                {/* D. Interview Roadmap */}
                <section className="id-glass-card id-animate-slide-up id-animate-delay-2">
                    <h3 className="id-section-title"><i className="fas fa-map-signs"></i> Interview Roadmap</h3>
                    <div className="id-roadmap">
                        {interview.roadmap.map((step) => (
                            <div key={step.id} className={`id-roadmap-step ${step.status}`}>
                                <div className="id-step-indicator">
                                    <div className="id-step-dot">
                                        {step.status === 'completed' ? <i className="fas fa-check"></i> : step.id}
                                    </div>
                                    <div className="id-step-line"></div>
                                </div>
                                <div className="id-step-content">
                                    <h4 className="id-step-title">{step.title}</h4>
                                    <p className="id-step-desc">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* E. Preparation / Feedback Area */}
                <section className="id-glass-card id-animate-slide-up id-animate-delay-3">
                    {interview.status === 'completed' || interview.status === 'pending' ? (
                        <>
                            <h3 className="id-section-title"><i className="fas fa-comment-dots"></i> Interviewer Comments</h3>
                            <p className="id-feedback-content">
                                "{interview.feedback}"
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="id-section-title"><i className="fas fa-book-open"></i> Helpful Resources</h3>
                            <div className="id-resources-list">
                                {interview.resources.map((res, index) => (
                                    <a key={index} href={res.link} className="id-resource-link">
                                        <i className="fas fa-file-alt"></i> {res.title}
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </main>

            {/* F. Floating Action Buttons */}
            <div className="id-fab-container id-animate-slide-up id-animate-delay-4">
                <button className="id-btn id-btn-secondary">
                    {interview.status === 'upcoming' ? 'Reschedule' : 'Download Info'}
                </button>
                <button className="id-btn id-btn-primary">
                    {interview.status === 'upcoming' ? (
                        <><i className="fas fa-video"></i> Join Interview</>
                    ) : (
                        <><i className="fas fa-star"></i> View Full Feedback</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InterviewDetails;
