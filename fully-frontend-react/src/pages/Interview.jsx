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
    const [isSearchFocused, setIsSearchFocused] = useState(false);
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
            <div key={interview.id} className="job-card improved-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="job-header">
                    <div className="job-header-main">
                        <div className="company-logo-square">
                            {interview.company.charAt(0)}
                        </div>
                        <div className="title-area">
                            <h3 className="job-title">{interview.role || 'SDE'}</h3>
                            <div className="job-company-info">
                                <span className="company-text">{interview.company}</span>
                                <span className="location-text">
                                    <i className="fas fa-map-marker-alt"></i> {interview.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="job-content">
                    <div className="eligibility-tag">
                        <strong>Eligibility:</strong> {interview.eligibility}
                    </div>
                    
                    {/* Grouped Date/Time into a grid to save vertical space */}
                    <div className="meta-grid-info">
                        <div className="meta-cell">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{new Date(interview.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        <div className="meta-cell">
                            <i className="fas fa-clock"></i>
                            <span>{interview.time.split('-')[0]}</span>
                        </div>
                        <div className="meta-cell full-span" style={{ color: slotsLeft < 5 ? '#ff477b' : '#00d4ff' }}>
                            <i className="fas fa-users"></i>
                            <span>{slotsLeft} slots available</span>
                        </div>
                    </div>

                    <div className="job-actions">
                        {hasApplied(interview.id) ? (
                            <button className="btn btn-applied w-100" disabled>
                                <i className="fas fa-check"></i> Applied
                            </button>
                        ) : (
                            <button 
                                className="btn apply-btn w-100" 
                                disabled={slotsLeft === 0} 
                                onClick={() => handleApplyClick(interview)}
                            >
                                <i className="fas fa-paper-plane"></i> {slotsLeft === 0 ? 'Drive Full' : 'Apply Now'}
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
            <div className="container" style={{ minHeight: '100vh', padding: '112px 2rem 50px', position: 'relative', zIndex: 2 }}>

<div className="papers-header-container layout-centered">
    <div className="papers-header-left">
        <h2 className="main-page-heading">Available Job Drives</h2>
    </div>
    <div className="papers-header-right filter-row" style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search - Icon removed per feedback */}
          <div className="search-box-clean" style={{ flex: 1.5, minWidth: '140px' }}>
              <input
                  id="interviewMobileSearchInput"
                  type="text"
                  placeholder="Search company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input"
              />
          </div>

          <div className="location-box-clean" style={{ flex: 1, minWidth: '140px', position: 'relative', zIndex: 1000 }}>
            <div className="dropdown-trigger-box" onClick={() => setShowLocationMenu(!showLocationMenu)}>
                <span>{filterLocation === 'all' ? 'All Locations' : filterLocation}</span>
                <i className={`fas fa-chevron-down ${showLocationMenu ? 'open' : ''}`}></i>
            </div>

                <AnimatePresence>
                    {showLocationMenu && (
                        <motion.div
                            className="dropdown-menu surface-glow"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            style={{ right: 0, left: 'auto', minWidth: '100%', top: 'calc(100% + 5px)' }}
                        >
                            {locations.map(loc => (
                                <div
                                    key={loc}
                                    className={`dropdown-item ${filterLocation === loc ? 'active' : ''}`}
                                    onClick={() => { setFilterLocation(loc); setShowLocationMenu(false); }}
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

{/* Compact Stats Bar - Labels updated to be shorter for mobile */}
<div className="compact-stats-bar">
    <div className="stat-item">
        <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3730a3 100%)' }}>
            <i className="fas fa-calendar-check"></i>
        </div>
        <div className="stat-info">
            <span className="stat-value-small">{stats.total}</span>
            <span className="stat-label-small">Drives</span>
        </div>
    </div>
    <div className="stat-item">
        <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #06ffa5 0%, #00d9ff 100%)' }}>
            <i className="fas fa-door-open"></i>
        </div>
        <div className="stat-info">
            <span className="stat-value-small">{stats.available}</span>
            <span className="stat-label-small">Slots</span>
        </div>
    </div>
    <div className="stat-item">
        <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)' }}>
            <i className="fas fa-paper-plane"></i>
        </div>
        <div className="stat-info">
            <span className="stat-value-small">{stats.applied}</span>
            <span className="stat-label-small">Applied</span>
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
