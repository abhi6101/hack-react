import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import ApplicationModal from '../components/ApplicationModal';
import AuthPromptModal from '../components/AuthPromptModal';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import '../styles/jobs.css';
import '../styles/interview.css';

const mockInterviewData = [
    {
        id: 1, company: "TCS", location: "Mumbai", date: "2025-11-15",
        time: "10:00 AM - 4:00 PM", venue: "Campus Placement Cell",
        positions: ["Software Engineer", "Data Analyst", "Cloud Specialist"],
        eligibility: "CGPA ≥ 7.5",
        slots: { total: 20, booked: 18 },
    },
    {
        id: 2, company: "Infosys", location: "Bengaluru", date: "2025-11-28",
        time: "9:00 AM - 3:00 PM", venue: "Virtual (Zoom)",
        positions: ["System Engineer", "Business Analyst"], eligibility: "CGPA ≥ 7.0",
        slots: { total: 25, booked: 10 },
    },
    {
        id: 3, company: "Wipro", location: "Hyderabad", date: "2025-12-10",
        time: "11:00 AM - 5:00 PM", venue: "Department of CSE",
        positions: ["Project Engineer", "Cloud Specialist"], eligibility: "CSE/IT, CGPA ≥ 7.0",
        slots: { total: 15, booked: 5 },
    },
    {
        id: 5, company: "Accenture", location: "Gurugram", date: "2025-11-05",
        time: "9:30 AM - 5:30 PM", venue: "Virtual (Teams)",
        positions: ["Associate Software Engineer"], eligibility: "No backlogs",
        slots: { total: 30, booked: 10 },
    },
    {
        id: 6, company: "Capgemini", location: "Pune", date: "2025-12-18",
        time: "10:00 AM - 4:00 PM", venue: "Virtual (Google Meet)",
        positions: ["Software Consultant", "Cybersecurity Analyst"], eligibility: "All branches, CGPA ≥ 6.5",
        slots: { total: 22, booked: 4 },
    },
    {
        id: 7, company: "Persistent Systems", location: "Nagpur", date: "2026-01-08",
        time: "9:00 AM - 2:00 PM", venue: "Campus Auditorium",
        positions: ["Software Developer", "QA Engineer"], eligibility: "CSE/IT/ECE, CGPA ≥ 7.0",
        slots: { total: 18, booked: 0 },
    },
];

const Interview = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const getToken = () => localStorage.getItem('authToken');

    useEffect(() => {
        if (!getToken()) {
            setShowAuthModal(true);
        }
    }, []);

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upcoming, setUpcoming] = useState([]);
    const [future, setFuture] = useState([]);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [myApplications, setMyApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const [stats, setStats] = useState({ total: 0, available: 0, applied: 0 });

    useEffect(() => {
        const fetchInterviews = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/interview-drives`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setInterviews(data);
                } else if (response.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                } else {
                    console.error("Failed to fetch interviews from backend");
                    setInterviews([]); // Show empty if backend fails
                }
            } catch (err) {
                console.error("API Fetch Error", err);
                setInterviews([]); // Show empty if API fails
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    // Booking Form State
    const [bookingData, setBookingData] = useState({
        studentName: '',
        studentEmail: '',
        studentRoll: '',
        preferredSlot: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const currentDate = new Date();
        const upcomingList = interviews.filter(i => new Date(i.date) >= currentDate).sort((a, b) => new Date(a.date) - new Date(b.date));

        setUpcoming(upcomingList);
        setFuture(upcomingList.length > 3 ? upcomingList.slice(3) : []);

        // Calculate statistics
        const total = upcomingList.length;
        const available = upcomingList.filter(i => {
            const totalSlots = i.totalSlots || 20;
            const bookedSlots = i.bookedSlots || 0;
            return (totalSlots - bookedSlots) > 0;
        }).length;
        const applied = myApplications.length;
        setStats({ total, available, applied });
    }, [interviews, myApplications]);

    // Filter interviews based on search and location
    const filteredInterviews = upcoming.filter(interview => {
        const matchesSearch = interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.positions?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = filterLocation === 'all' || interview.location === filterLocation;
        return matchesSearch && matchesLocation;
    });

    // Get unique locations for filter
    const locations = ['all', ...new Set(upcoming.map(i => i.location))];


    const handleBookClick = (company) => {
        setSelectedCompany(company);
        setShowModal(true);
    };

    const handleBookingInput = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        showToast({
            message: `Booking confirmed for ${selectedCompany.company}! Confirmation sent to ${bookingData.studentEmail}`,
            type: 'success'
        });
        setShowModal(false);
        setBookingData({ studentName: '', studentEmail: '', studentRoll: '', preferredSlot: '' });

        // Update slots locally
        const updatedInterviews = interviews.map(i => {
            if (i.id === selectedCompany.id) {
                return { ...i, bookedSlots: (i.bookedSlots || 0) + 1 };
            }
            return i;
        });
        setInterviews(updatedInterviews);
    };

    // Application handlers
    const handleApplyClick = (interview) => {
        setSelectedInterview(interview);
        setShowApplicationModal(true);
    };

    const handleApplicationSubmit = async (applicationData) => {
        try {
            const formData = new FormData();
            formData.append('interviewDriveId', applicationData.interviewDriveId);
            formData.append('companyName', selectedInterview.company);
            formData.append('interviewDate', selectedInterview.date);
            formData.append('applicantName', applicationData.applicantName);
            formData.append('applicantEmail', applicationData.applicantEmail);
            formData.append('applicantPhone', applicationData.applicantPhone);
            formData.append('resume', applicationData.resume);

            const res = await fetch(`${API_BASE_URL}/interview-applications/apply`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` }, // No Content-Type for FormData
                body: formData
            });

            if (res.status === 401) {
                localStorage.clear();
                navigate('/login');
                return;
            }

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            // Refresh applications list
            fetchMyApplications();
            showToast({
                message: 'Application submitted successfully!',
                type: 'success'
            });
        } catch (err) {
            throw err;
        }
    };

    const fetchMyApplications = async () => {
        const currentToken = getToken();
        if (!currentToken) return;

        try {
            const res = await fetch(`${API_BASE_URL}/interview-applications/my`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (res.ok) {
                const apps = await res.json();
                setMyApplications(apps);
            } else if (res.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (err) {
            console.error('Failed to fetch applications', err);
        }
    };

    useEffect(() => {
        fetchMyApplications();
    }, []);

    const hasApplied = (interviewId) => {
        // Check if any application matches the interview drive ID
        return myApplications.some(app => app.interviewDriveId === interviewId);
    };

    const renderCard = (interview, index) => {
        const total = interview.totalSlots || 20;
        const booked = interview.bookedSlots || 0;
        const slotsLeft = total - booked;

        return (
            <div key={interview.id} className={index === 0 ? "job-card first-card" : "job-card"} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="job-header">
                    <h3 className="job-title">{interview.role || 'SDE'}</h3>
                    <div className="job-company">
                        <i className="fas fa-building"></i> {interview.company}
                    </div>
                    <span className="job-type full-time"><i className="fas fa-map-marker-alt"></i> {interview.location}</span>
                </div>
                <div className="job-content">
                    <p className="job-description">
                        <strong>Eligibility:</strong> {interview.eligibility}
                    </p>
                    <div className="job-meta">
                        <span className="job-meta-item">
                            <i className="fas fa-calendar-alt"></i> {new Date(interview.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="job-meta-item">
                            <i className="fas fa-clock"></i> {interview.time}
                        </span>
                        <span className="job-meta-item" style={{ color: slotsLeft < 5 ? '#ff477b' : 'inherit' }}>
                            <i className="fas fa-users"></i> {slotsLeft} slots left
                        </span>
                    </div>
                    <div className="job-actions">
                        {hasApplied(interview.id) ? (
                            <button className="btn btn-applied" disabled>
                                <i className="fas fa-check"></i> Applied
                            </button>
                        ) : (
                            <button className="btn apply-btn" disabled={slotsLeft === 0} onClick={() => handleApplyClick(interview)}>
                                <i className="fas fa-paper-plane"></i> {slotsLeft === 0 ? 'Full' : 'Apply Now'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="interview-page">
<div className="interview-header-container">
    <div className="interview-header-left">
        <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', whiteSpace: 'nowrap' }}>Available Job Drives</h2>
    </div>
    
    <div className="interview-header-right">
    {/* Search & Location */}
    <section className="filter-section" style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'nowrap', alignItems: 'center' }}>
        <div className="search-wrapper" style={{ flex: '2 1 0', minWidth: 0 }}>
            <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-70%)', color: 'var(--text-secondary)' }}></i>
                <input
                    type="text"
                    placeholder="Search by company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        minWidth: 0,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        padding: '0.8rem 1rem 0.8rem 2.5rem',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </div>
        <div className="location-wrapper" style={{ flex: '1 1 0', minWidth: 0 }}>
            <div
                className="custom-dropdown"
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    justifyContent: 'space-between',
                    color: '#fff',
                    fontSize: '0.9rem'
                }}
            >
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, paddingRight: '10px', textAlign: 'left' }}>
                    {filterLocation === 'all' ? 'All Locations' : filterLocation}
                </span>
                <i className={`fas fa-chevron-down ${showLocationMenu ? 'fa-rotate-180' : ''}`} style={{ transition: '0.3s', flexShrink: 0 }}></i>
            </div>
            <AnimatePresence>
                {showLocationMenu && (
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
                            maxHeight: '250px',
                            overflowY: 'auto'
                        }}
                    >
                        {locations.map(loc => (
                            <div
                                key={loc}
                                className="dropdown-option"
                                onClick={() => { setFilterLocation(loc); setShowLocationMenu(false); }}
                                style={{
                                    padding: '0.8rem 1rem',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    color: filterLocation === loc ? '#fff' : 'var(--text-secondary)',
                                    background: filterLocation === loc ? 'var(--primary)' : 'transparent',
                                    transition: '0.2s',
                                    marginBottom: '0.2rem',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {loc === 'all' ? 'All Locations' : loc}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
</div>

{/* Compact Stats Bar */}
<div className="compact-stats-bar">
    <div className="stat-item">
        <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3730a3 100%)' }}>
            <i className="fas fa-calendar-check"></i>
        </div>
        <div className="stat-info">
            <span className="stat-value-small">{stats.total}</span>
            <span className="stat-label-small">Total Drives</span>
        </div>
    </div>
    <div className="stat-item">
        <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #06ffa5 0%, #00d9ff 100%)' }}>
            <i className="fas fa-door-open"></i>
        </div>
        <div className="stat-info">
            <span className="stat-value-small">{stats.available}</span>
            <span className="stat-label-small">Slots Available</span>
        </div>
    </div>
    <div className="stat-item">
        <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)' }}>
            <i className="fas fa-paper-plane"></i>
        </div>
        <div className="stat-info">
            <span className="stat-value-small">{stats.applied}</span>
            <span className="stat-label-small">Applications Sent</span>
        </div>
    </div>
</div>
</div>
                {/* Right Content - Interview Grid */}
                <main className="interview-content">


                    <div className="interview-grid">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div className="job-card skeleton-card" key={`skel-${i}`}>
                                    <div className="skeleton-line title"></div>
                                    <div className="skeleton-line subtitle"></div>
                                    <div className="skeleton-content"></div>
                                </div>
                            ))
                        ) : filteredInterviews.length > 0 ? (
                            filteredInterviews.map(renderCard)
                        ) : (
                            <div className="no-results">
                                <i className="fas fa-search"></i>
                                <h3>No interviews found</h3>
                                <p>Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                </main>

            {showModal ? (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content surface-glow" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        <h2>Book Interview: {selectedCompany?.company}</h2>
                        <form onSubmit={handleBookingSubmit} className="booking-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={bookingData.studentName}
                                    onChange={handleBookingInput}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>College Email</label>
                                <input
                                    type="email"
                                    name="studentEmail"
                                    value={bookingData.studentEmail}
                                    onChange={handleBookingInput}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Roll Number</label>
                                <input
                                    type="text"
                                    name="studentRoll"
                                    value={bookingData.studentRoll}
                                    onChange={handleBookingInput}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            ) : null}

            {showApplicationModal && selectedInterview && (
                <ApplicationModal
                    interview={selectedInterview}
                    onClose={() => setShowApplicationModal(false)}
                    onSubmit={handleApplicationSubmit}
                />
            )}
            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    navigate('/');
                }}
                title="🔒 Login Required"
                subtitle="This service is available on our platform."
                description="Please login or create an account to view interview schedules."
            />
        </div>
    );
};

export default Interview;
