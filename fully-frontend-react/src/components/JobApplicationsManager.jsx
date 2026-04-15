import React from 'react';
import '../styles/job-applications.css';

const JobApplicationsManager = ({ jobs, applications, onStatusUpdate, onLoadApplications }) => {
    const [selectedJobId, setSelectedJobId] = React.useState('');
    const [filteredApps, setFilteredApps] = React.useState([]);

    React.useEffect(() => {
        if (selectedJobId) {
            const filtered = applications.filter(app => app.jobId === parseInt(selectedJobId));
            setFilteredApps(filtered);
        } else {
            setFilteredApps(applications);
        }
    }, [selectedJobId, applications]);

    const handleStatusChange = async (appId, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this application?`)) {
            await onStatusUpdate(appId, newStatus);
        }
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            PENDING: { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' },
            SHORTLISTED: { background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
            REJECTED: { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
        };
        return styles[status] || styles.PENDING;
    };

    return (
        <div className="job-applications-manager">
            <div className="applications-header">
                <h3><i className="fas fa-briefcase"></i> Job Applications Management</h3>
                <div className="job-filter">
                    <label><i className="fas fa-filter"></i> Filter by Job:</label>
                    <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="job-selector"
                    >
                        <option value="">All Jobs ({applications.length})</option>
                        {jobs.map(job => {
                            const count = applications.filter(app => app.jobId === job.id).length;
                            return (
                                <option key={job.id} value={job.id}>
                                    {job.title} - {job.company_name} ({count})
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {filteredApps.length === 0 ? (
                <div className="no-applications">
                    <i className="fas fa-inbox"></i>
                    <h4>No applications yet</h4>
                    <p>Applications will appear here when students apply for jobs</p>
                </div>
            ) : (
                <div className="applications-table-container">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Job Applied</th>
                                <th>Resume</th>
                                <th>Applied On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApps.map(app => (
                                <tr key={app.id} className="application-row">
                                    <td className="student-name">
                                        <i className="fas fa-user-circle"></i>
                                        {app.studentName || app.student?.username || 'N/A'}
                                    </td>
                                    <td className="student-email">
                                        {app.studentEmail || app.student?.email || 'N/A'}
                                    </td>
                                    <td className="job-title">
                                        <strong>{app.jobTitle || app.job?.title || 'N/A'}</strong>
                                        <br />
                                        <small>{app.companyName || app.job?.company_name || ''}</small>
                                    </td>
                                    <td className="resume-link">
                                        {app.resumeUrl ? (
                                            <a
                                                href={app.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="resume-btn"
                                            >
                                                <i className="fas fa-file-pdf"></i> View Resume
                                            </a>
                                        ) : (
                                            <span className="no-resume">No resume</span>
                                        )}
                                    </td>
                                    <td className="applied-date">
                                        {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="status-cell">
                                        <span
                                            className="status-badge"
                                            style={getStatusBadgeStyle(app.status)}
                                        >
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {app.status === 'PENDING' ? (
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-accept"
                                                    onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                                                    title="Accept and send interview details"
                                                >
                                                    <i className="fas fa-check"></i> Accept
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                                    title="Reject application"
                                                >
                                                    <i className="fas fa-times"></i> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="status-text">
                                                {app.status === 'SHORTLISTED' && '✓ Shortlisted'}
                                                {app.status === 'REJECTED' && '✗ Rejected'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="applications-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Applications:</span>
                    <span className="summary-value">{filteredApps.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Pending:</span>
                    <span className="summary-value pending">{filteredApps.filter(a => a.status === 'PENDING').length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Shortlisted:</span>
                    <span className="summary-value shortlisted">{filteredApps.filter(a => a.status === 'SHORTLISTED').length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Rejected:</span>
                    <span className="summary-value rejected">{filteredApps.filter(a => a.status === 'REJECTED').length}</span>
                </div>
            </div>
        </div>
    );
};

export default JobApplicationsManager;
