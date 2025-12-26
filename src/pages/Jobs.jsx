import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import '../styles/jobs.css';
import '../styles/skeleton.css';

const Jobs = () => {
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        category: 'all',
        sort: 'newest'
    });

    // Modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [applicationData, setApplicationData] = useState({
        applicantName: '',
        applicantEmail: '',
        applicantPhone: '',
        applicantRollNo: '',
        coverLetter: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set()); // Track applied job IDs
    const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Custom login modal
    const navigate = useNavigate();

    const API_URL = `${API_BASE_URL.replace('/api', '')}/jobs`;
    const APPLY_JOB_API_URL = `${API_BASE_URL}/apply-job`;
    const APPLIED_JOBS_API_URL = `${API_BASE_URL}/job-applications/my`;

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setShowLoginPrompt(true);
        } else {
            fetchAppliedJobs(token);
        }
    }, [navigate]);

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        filterAndSortJobs();
    }, [allJobs, filters]);

    const fetchAppliedJobs = async (token) => {
        try {
            const cleanToken = token ? token.replace('Bearer ', '') : '';
            const response = await fetch(APPLIED_JOBS_API_URL, {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Extract job IDs from the applications
                const ids = new Set(data.map(app => app.jobId));
                setAppliedJobIds(ids);
            }
        } catch (err) {
            console.error("Error fetching applied jobs:", err);
        }
    };

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const cleanToken = token ? token.replace('Bearer ', '') : '';
            if (!cleanToken) throw new Error("No token found");

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                }
            });
            if (response.status === 401) {
                console.warn("Unauthorized access (401). Token might be invalid or expired.");
                showAlert({
                    title: 'Session Expired',
                    message: 'Your session has expired or is invalid. Please log in again.',
                    type: 'warning',
                    actions: [
                        { label: 'Login', primary: true, onClick: () => { localStorage.clear(); navigate('/login'); } }
                    ]
                });
                localStorage.clear();
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            if (Array.isArray(data)) {
                setAllJobs(data);
            } else {
                console.error("API did not return an array", data);
                setAllJobs([]); // Fallback
                setError('Invalid data format received from server.');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs. Please try again later.');
            setLoading(false);
        }
    };

    const filterAndSortJobs = () => {
        // ... (existing filter code) ...
        let result = allJobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                job.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                job.description.toLowerCase().includes(filters.search.toLowerCase());

            // Location filter placeholder logic as in original
            const matchesLocation = true;

            let matchesCategory = true;
            if (filters.category !== 'all') {
                switch (filters.category) {
                    case 'it':
                        matchesCategory = job.title.toLowerCase().includes('software') || job.description.toLowerCase().includes('developer');
                        break;
                    case 'engineering':
                        matchesCategory = job.title.toLowerCase().includes('engineer');
                        break;
                    case 'finance':
                        matchesCategory = job.title.toLowerCase().includes('finance') || job.description.toLowerCase().includes('accountant');
                        break;
                    case 'internship':
                        matchesCategory = job.title.toLowerCase().includes('intern') || job.description.toLowerCase().includes('internship');
                        break;
                    default:
                        matchesCategory = true;
                }
            }

            return matchesSearch && matchesLocation && matchesCategory;
        });

        // Sorting
        result.sort((a, b) => {
            switch (filters.sort) {
                case 'salary-high': return b.salary - a.salary;
                case 'salary-low': return a.salary - b.salary;
                case 'deadline': return new Date(a.last_date) - new Date(b.last_date);
                default: return new Date(b.created_at || b.last_date) - new Date(a.created_at || a.last_date);
            }
        });

        setFilteredJobs(result);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const openApplyModal = (job) => {
        if (appliedJobIds.has(job.id)) {
            showToast({
                message: 'You have already applied for this job.',
                type: 'info'
            });
            return;
        }

        const token = localStorage.getItem("authToken");
        // ... rest of modal logic ...
        // Pre-fill logic (mocked here as we don't have user object easily accessible without context)
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};

        setSelectedJob(job);
        setApplicationData({
            applicantName: user.username || '',
            applicantEmail: user.email || '',
            applicantPhone: user.phone || '',
            applicantRollNo: user.rollNo || '',
            coverLetter: ''
        });
        setShowModal(true);
    };

    const handleApplicationSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('jobId', selectedJob.id);
        formData.append('applicantName', applicationData.applicantName);
        formData.append('applicantEmail', applicationData.applicantEmail);
        formData.append('applicantPhone', applicationData.applicantPhone);
        formData.append('applicantRollNo', applicationData.applicantRollNo);
        formData.append('coverLetter', applicationData.coverLetter);
        formData.append('resume', resumeFile);
        formData.append('jobTitle', selectedJob.title);
        formData.append('companyName', selectedJob.company_name);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(APPLY_JOB_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to submit application');
            }

            showToast({
                message: `Application for "${selectedJob.title}" submitted successfully! You will receive a confirmation email shortly.`,
                type: 'success'
            });
            setShowModal(false);
            setSubmitting(false);
            fetchAppliedJobs(token); // Refresh applied jobs list

            // Reset form
            setApplicationData({
                applicantName: '',
                applicantEmail: '',
                applicantPhone: '',
                applicantRollNo: '',
                coverLetter: ''
            });
            setResumeFile(null);

        } catch (error) {
            console.error('Error submitting application:', error);
            showToast({
                message: 'Failed to submit application. Please try again later.',
                type: 'error'
            });
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Wrapper to ensure footer stays down if content short */}

            <div className="container">
                <div className="page-header">
                    <h1>Job Opportunities</h1>
                    <p>Browse through our latest job openings from top companies and kickstart your career</p>
                </div>


                <div className="filter-section">
                    <div className="filter-buttons">
                        {['all', 'it', 'engineering', 'finance', 'internship'].map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filters.category === cat ? 'active' : ''}`}
                                onClick={() => handleFilterChange('category', cat)}
                            >
                                {cat === 'all' ? 'All Jobs' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="sort-options">
                        <div className="sort-wrapper" style={{ position: 'relative', minWidth: '200px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginRight: '0.5rem' }}>Sort by:</span>
                            <div
                                className="custom-dropdown"
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    minWidth: '180px',
                                    justifyContent: 'space-between',
                                    color: '#fff'
                                }}
                            >
                                <span>
                                    {filters.sort === 'newest' && 'Newest First'}
                                    {filters.sort === 'salary-high' && 'Salary (High to Low)'}
                                    {filters.sort === 'salary-low' && 'Salary (Low to High)'}
                                    {filters.sort === 'deadline' && 'Application Deadline'}
                                </span>
                                <i className={`fas fa-chevron-down ${showSortMenu ? 'fa-rotate-180' : ''}`} style={{ transition: '0.3s' }}></i>
                            </div>

                            <AnimatePresence>
                                {showSortMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            position: 'absolute',
                                            top: '120%',
                                            right: 0,
                                            width: '100%',
                                            background: 'rgba(22, 22, 34, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '0.5rem',
                                            zIndex: 100,
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {[
                                            { value: 'newest', label: 'Newest First' },
                                            { value: 'salary-high', label: 'Salary (High to Low)' },
                                            { value: 'salary-low', label: 'Salary (Low to High)' },
                                            { value: 'deadline', label: 'Application Deadline' }
                                        ].map(option => (
                                            <div
                                                key={option.value}
                                                onClick={() => {
                                                    handleFilterChange('sort', option.value);
                                                    setShowSortMenu(false);
                                                }}
                                                style={{
                                                    padding: '0.8rem 1rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    background: filters.sort === option.value ? 'var(--primary)' : 'transparent',
                                                    color: filters.sort === option.value ? '#fff' : 'var(--text-secondary)',
                                                    transition: '0.2s',
                                                    marginBottom: '0.2rem',
                                                    fontSize: '0.9rem'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (filters.sort !== option.value) {
                                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                                        e.target.style.color = '#fff';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (filters.sort !== option.value) {
                                                        e.target.style.background = 'transparent';
                                                        e.target.style.color = 'var(--text-secondary)';
                                                    }
                                                }}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="job-list" id="jobList">
                    {/* Skeleton Loading */}
                    {loading && Array(6).fill(0).map((_, i) => (
                        <div className="job-card skeleton-card" key={i}>
                            <div className="skeleton-line title"></div>
                            <div className="skeleton-line subtitle"></div>
                            <div className="skeleton-content"></div>
                        </div>
                    ))}

                    {error && <div className="error-message">{error}</div>}

                    {/* Zero State */}
                    {!loading && !error && filteredJobs.length === 0 && (
                        <div className="no-results">
                            <i className="fas fa-search" style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}></i>
                            <h3>No jobs found</h3>
                            <p>Try adjusting your search filters to find what you're looking for.</p>
                        </div>
                    )}

                    {!loading && filteredJobs.map((job, index) => {
                        let jobTypeClass = 'full-time';
                        let jobTypeText = 'Full Time';

                        if (job.title.toLowerCase().includes('intern') || job.description.toLowerCase().includes('intern')) {
                            jobTypeClass = 'internship';
                            jobTypeText = 'Internship';
                        } else if (job.title.toLowerCase().includes('remote') || job.description.toLowerCase().includes('remote')) {
                            jobTypeClass = 'remote';
                            jobTypeText = 'Remote';
                        }

                        return (
                            <div className="job-card" key={job.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="job-header">
                                    <h3 className="job-title">{job.title}</h3>
                                    <div className="job-company">
                                        <i className="fas fa-building"></i> {job.company_name}
                                    </div>
                                    <span className={`job-type ${jobTypeClass}`}>{jobTypeText}</span>
                                </div>
                                <div className="job-content">
                                    <p className="job-description">{job.description}</p>
                                    <div className="job-meta">
                                        <span className="job-meta-item">
                                            <i className="fas fa-rupee-sign"></i> ₹{job.salary.toLocaleString('en-IN')} per annum
                                        </span>
                                        <span className="job-meta-item">
                                            <i className="fas fa-calendar-alt"></i> Apply before {formatDate(job.last_date)}
                                        </span>
                                    </div>
                                    <div className="job-actions">
                                        <button className="btn btn-outline" onClick={() => showToast({ message: 'Details page coming soon!', type: 'info' })}>
                                            <i className="fas fa-eye"></i> View Details
                                        </button>
                                        {appliedJobIds.has(job.id) ? (
                                            <button className="btn btn-applied" disabled>
                                                <i className="fas fa-check"></i> Applied
                                            </button>
                                        ) : (
                                            <button className="btn apply-btn" onClick={() => openApplyModal(job)}>
                                                <i className="fas fa-paper-plane"></i> Apply Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pagination">
                    <button className="page-btn"><i className="fas fa-chevron-left"></i></button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn"><i className="fas fa-chevron-right"></i></button>
                </div>
            </div>

            {/* Application Modal */}
            {showModal && selectedJob && (
                <div id="applicationFormModal" className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content" data-lenis-prevent>
                        <span className="close-button" onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Apply for <span id="jobTitleForApplication">{selectedJob.title}</span></h2>
                        <form id="jobApplicationForm" onSubmit={handleApplicationSubmit}>
                            <div className="form-group">
                                <label htmlFor="applicantName">Full Name:</label>
                                <input
                                    type="text"
                                    id="applicantName"
                                    required
                                    value={applicationData.applicantName}
                                    onChange={(e) => setApplicationData({ ...applicationData, applicantName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="applicantEmail">Email:</label>
                                <input
                                    type="email"
                                    id="applicantEmail"
                                    required
                                    value={applicationData.applicantEmail}
                                    onChange={(e) => setApplicationData({ ...applicationData, applicantEmail: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="applicantPhone">Phone Number:</label>
                                <input
                                    type="tel"
                                    id="applicantPhone"
                                    required
                                    value={applicationData.applicantPhone}
                                    onChange={(e) => setApplicationData({ ...applicationData, applicantPhone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="applicantRollNo">Roll Number (if applicable):</label>
                                <input
                                    type="text"
                                    id="applicantRollNo"
                                    value={applicationData.applicantRollNo}
                                    onChange={(e) => setApplicationData({ ...applicationData, applicantRollNo: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="resume">Upload Resume (PDF only):</label>
                                <input
                                    type="file"
                                    id="resume"
                                    accept=".pdf"
                                    required
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="coverLetter">Cover Letter (Optional):</label>
                                <textarea
                                    id="coverLetter"
                                    rows="5"
                                    value={applicationData.coverLetter}
                                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setApplicationData({
                                        applicantName: 'Demo Student',
                                        applicantEmail: 'demo.student@example.com',
                                        applicantPhone: '9876543210',
                                        applicantRollNo: 'CS-2025-001',
                                        coverLetter: 'I am excited to apply for this position. I have the required skills and passion for this role.'
                                    })}
                                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                                >
                                    <i className="fas fa-magic"></i> Demo Data
                                </button>
                                <button type="submit" className="btn" disabled={submitting} style={{ flex: 2 }}>
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Login Prompt Modal */}
            <AnimatePresence>
                {showLoginPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000
                        }}
                        onClick={() => {
                            setShowLoginPrompt(false);
                            navigate('/');
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(10, 10, 20, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(14, 165, 233, 0.3)',
                                borderRadius: '24px',
                                padding: '3rem',
                                maxWidth: '500px',
                                width: '90%',
                                textAlign: 'center',
                                boxShadow: '0 20px 60px rgba(14, 165, 233, 0.2)'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 1.5rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem'
                                }}
                            >
                                🔒
                            </motion.div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>
                                Login Required
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                You must be logged in to view job opportunities and apply for positions.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Link
                                    to="/login"
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px)';
                                        e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                                    }}
                                >
                                    Login Now
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowLoginPrompt(false);
                                        navigate('/');
                                    }}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'transparent',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    Go Home
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Jobs;
