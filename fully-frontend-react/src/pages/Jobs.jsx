import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import AuthPromptModal from '../components/AuthPromptModal';
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
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
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

    const getToken = () => localStorage.getItem('authToken');

    useEffect(() => {
        const token = getToken();
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        if (!token) {
            setShowLoginPrompt(true);
        } else if (user.role === 'STUDENT' || !user.role) {
            fetchAppliedJobs(token);
        }
    }, [navigate]);

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        filterAndSortJobs();
    }, [allJobs, filters]);

    const fetchAppliedJobs = async () => {
        try {
            const token = getToken();
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
            } else if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (err) {
            console.error("Error fetching applied jobs:", err);
        }
    };

    const fetchJobs = async () => {
        try {
            const token = getToken();
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

        const token = getToken();
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
            const token = getToken();
            const cleanToken = token ? token.replace('Bearer ', '') : '';
            const response = await fetch(APPLY_JOB_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
                body: formData
            });

            if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
                return;
            }

            if (!response.ok) {
                let errorMsg = 'Failed to submit application';
                try {
                    const text = await response.text();
                    if (text) {
                        try {
                            const errData = JSON.parse(text);
                            if (errData && errData.message) {
                                errorMsg = errData.message;
                            } else if (errData && errData.error) {
                                errorMsg = errData.error;
                            }
                        } catch (jsonErr) {
                            errorMsg = text;
                        }
                    }
                } catch (e) {
                    console.error("Could not parse error response:", e);
                }
                throw new Error(errorMsg);
            }

            showToast({
                message: `Application for "${selectedJob.title}" submitted successfully! You will receive a confirmation email shortly.`,
                type: 'success'
            });
            setShowModal(false);
            setSubmitting(false);
            fetchAppliedJobs(); // Refresh applied jobs list

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
                message: error.message || 'Failed to submit application. Please try again later.',
                type: 'error'
            });
            setSubmitting(false);
        }
    };

    return (
        <div className="mobile-jobs-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '104px' }}>
            {/* Wrapper to ensure footer stays down if content short */}

            <div className="container mobile-jobs-container">
                <div className="papers-header-container">
                    <div className="papers-header-left">
                        <h2>Job Opportunities</h2>
                    </div>
                </div>
                <div className={`mobile-filters-wrapper ${isSearchFocused ? 'active-search' : (showCategoryMenu ? 'active-category' : (showSortMenu ? 'active-sort' : ''))}`} style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                    {/* Search */}
                        <div className={`global-search-container mobile-filter-search ${isSearchFocused ? 'is-focused' : ''}`} 
                            onClick={() => {
                                setIsSearchFocused(true);
                                setTimeout(() => document.getElementById('mobileSearchInput')?.focus(), 100);
                            }}
                            style={{
                            position: 'relative',
                            flex: 1.5,
                            minWidth: '140px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '50px',
                            padding: '0 1rem 0 2.5rem',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(15px)',
                            transition: 'all 0.3s ease'
                        }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
                            <input
                                id="mobileSearchInput"
                                type="text"
                                placeholder="Search jobs..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    width: '100%',
                                    height: '100%',
                                    outline: 'none',
                                    padding: '0'
                                }}
                            />
                            {filters.search && (
                                <i 
                                    className="fas fa-times" 
                                    onClick={() => handleFilterChange('search', '')}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                                ></i>
                            )}
                        </div>
                        <div className="category-options mobile-filter-category" style={{ position: 'relative', flex: '1 1 140px', minWidth: '140px' }}>
                            <div
                                className="custom-dropdown"
                                onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowSortMenu(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(0, 212, 255, 0.3)',
                                    padding: '0 1rem',
                                    height: '40px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '10px', textAlign: 'left' }}>
                                    {filters.category === 'all' && 'All Jobs'}
                                    {filters.category === 'it' && 'IT Engineering'}
                                    {filters.category === 'engineering' && 'Engineering'}
                                    {filters.category === 'finance' && 'Finance'}
                                    {filters.category === 'internship' && 'Internship'}
                                </span>
                                <i className={`fas fa-chevron-down ${showCategoryMenu ? 'fa-rotate-180' : ''}`} style={{ transition: '0.3s', flexShrink: 0 }}></i>
                            </div>

                            <AnimatePresence>
                                {showCategoryMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            position: 'absolute',
                                            top: '120%',
                                            left: 0,
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
                                            { value: 'all', label: 'All Jobs' },
                                            { value: 'it', label: 'IT Engineering' },
                                            { value: 'finance', label: 'Finance' },
                                            { value: 'internship', label: 'Internship' }
                                        ].map(option => (
                                            <div
                                                key={option.value}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFilterChange('category', option.value);
                                                    setShowCategoryMenu(false);
                                                }}
                                                style={{
                                                    padding: '0.8rem 1rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    background: filters.category === option.value ? 'var(--primary)' : 'transparent',
                                                    color: filters.category === option.value ? '#fff' : 'var(--text-secondary)',
                                                    transition: '0.2s',
                                                    marginBottom: '0.2rem',
                                                    fontSize: '0.9rem'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (filters.category !== option.value) {
                                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                                        e.target.style.color = '#fff';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (filters.category !== option.value) {
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

                    <div className="sort-wrapper mobile-filter-sort" style={{ position: 'relative', flex: '1 1 140px', minWidth: '140px' }}>
                            <div
                                className="custom-dropdown"
                                onClick={() => { setShowSortMenu(!showSortMenu); setShowCategoryMenu(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(0, 212, 255, 0.3)',
                                    padding: '0 1rem',
                                    height: '40px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    minWidth: 0,
                                    boxSizing: 'border-box',
                                    justifyContent: 'space-between',
                                    color: '#fff',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, paddingRight: '10px', textAlign: 'left' }}>
                                    {filters.sort === 'newest' && 'Newest First'}
                                    {filters.sort === 'salary-high' && 'Salary (High to Low)'}
                                    {filters.sort === 'salary-low' && 'Salary (Low to High)'}
                                    {filters.sort === 'deadline' && 'Application Deadline'}
                                </span>
                                <i className={`fas fa-chevron-down ${showSortMenu ? 'fa-rotate-180' : ''}`} style={{ transition: '0.3s', flexShrink: 0 }}></i>
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
                                            width: '220px',
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
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

                <div className="job-list" id="jobList" style={{ marginTop: '2rem' }}>
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
                                    <h3 className="job-title">{job.title.replace('Sggggoftware', 'Software')}</h3>
                                    <div className="job-company-badge-row mobile-flex-row">
                                        <div className="job-company">
                                            <i className="fas fa-building"></i> {job.company_name}
                                        </div>
                                        <span className={`job-type ${jobTypeClass}`}>{jobTypeText}</span>
                                    </div>
                                </div>
                                <div className="job-content">
                                    <p className="job-description">{job.description}</p>
                                    <div className="job-meta mobile-meta-row">
                                        <span className="job-meta-item">
                                            <i className="fas fa-rupee-sign"></i> {job.salary.toLocaleString('en-IN')}
                                        </span>
                                        <span className="job-meta-item">
                                            <i className="fas fa-calendar-alt"></i> {formatDate(job.last_date)}
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
            </div>

            {/* Application Modal */}
            {showModal && selectedJob && (
                <div id="applicationFormModal" className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content">
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
            <AuthPromptModal
                isOpen={showLoginPrompt}
                onClose={() => {
                    setShowLoginPrompt(false);
                    navigate('/');
                }}
                title="🔒 Login Required"
                subtitle="This service is available on our platform."
                description="Please login or create an account to view job opportunities and apply for positions."
            />
        </div>
    );
};

export default Jobs;
