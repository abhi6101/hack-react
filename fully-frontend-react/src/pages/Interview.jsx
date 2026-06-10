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
import '../styles/papers.css';

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
        <div className="papers-page-wrapper">
            <div className="decorative-blob blob-1"></div>
            <div className="decorative-blob blob-2"></div>
            <div className="container" style={{ minHeight: '100vh', padding: '100px 5% 50px', position: 'relative', zIndex: 2 }}>

<div className="papers-header-container" style={{ marginBottom: '1.5rem', padding: '1.2rem 2rem' }}>
    <div className="papers-header-left">
        <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', whiteSpace: 'nowrap', fontWeight: '700' }}>Available Job Drives</h2>
    </div>
    
    <div className="papers-header-right">
    {/* Search & Location */}
    <section className="filter-section" style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'nowrap', alignItems: 'center' }}>
        <div className="search-wrapper" style={{ flex: '1.5', minWidth: '150px' }}>
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
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        padding: '10px 1rem 10px 2.5rem',
                        borderRadius: '50px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </div>
        <div className="location-wrapper" style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
            <select
                className="form-input template-select"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    padding: '10px 2.5rem 10px 1rem',
                    borderRadius: '50px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none'
                }}
            >
                {locations.map(loc => (
                    <option key={loc} value={loc} style={{ background: '#0F172A', color: '#fff' }}>
                        {loc === 'all' ? 'All Locations' : loc}
                    </option>
                ))}
            </select>
            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }}></i>
        </div>
    </section>
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
        </div>
    );
};

export default Interview;
