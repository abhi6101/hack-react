import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/jobs.css';

const Jobs = () => {
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
    const [applicationData, setApplicationData] = useState({
        applicantName: '',
        applicantEmail: '',
        applicantPhone: '',
        applicantRollNo: '',
        coverLetter: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const API_URL = "https://placement-portal-backend-nwaj.onrender.com/jobs";
    const APPLY_JOB_API_URL = "https://placement-portal-backend-nwaj.onrender.com/api/apply-job";

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You must be logged in to view job opportunities.");
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        filterAndSortJobs();
    }, [allJobs, filters]);

    const fetchJobs = async () => {
        try {
            const response = await fetch(API_URL);
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
        const token = localStorage.getItem("authToken"); // Dummy check for now, logic copied
        // In a real App we might want to use Context for auth
        // if (!token) { alert("Please login first"); return; } 

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

            alert(`Application for "${selectedJob.title}" submitted successfully! You will receive a confirmation email shortly.`);
            setShowModal(false);
            setSubmitting(false);

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
            alert('Failed to submit application. Please try again later.');
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
                        <label htmlFor="sortSelect">Sort by:</label>
                        <select
                            id="sortSelect"
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="salary-high">Salary (High to Low)</option>
                            <option value="salary-low">Salary (Low to High)</option>
                            <option value="deadline">Application Deadline</option>
                        </select>
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
                                        <button className="btn btn-outline" onClick={() => alert("Details page implementation pending")}>
                                            <i className="fas fa-eye"></i> View Details
                                        </button>
                                        <button className="btn apply-btn" onClick={() => openApplyModal(job)}>
                                            <i className="fas fa-paper-plane"></i> Apply Now
                                        </button>
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

                            <button type="submit" className="btn" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
