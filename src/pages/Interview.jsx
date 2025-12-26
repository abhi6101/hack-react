import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import { useToast } from '../components/CustomToast';
import ApplicationModal from '../components/ApplicationModal';
import API_BASE_URL from '../config';
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

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            showAlert({
                title: 'Login Required',
                message: 'You must be logged in to view interview schedules.',
                type: 'login',
                actions: [
                    { label: 'Login Now', primary: true, onClick: () => navigate('/login') },
                    { label: 'Go Home', primary: false, onClick: () => navigate('/') }
                ]
            });
        }
    }, [navigate, showAlert]);

    const [interviews, setInterviews] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [future, setFuture] = useState([]);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [myApplications, setMyApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');
    const [stats, setStats] = useState({ total: 0, available: 0, applied: 0 });
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const response = await fetch('/interview-drives');
                if (response.ok) {
                    const data = await response.json();
                    setInterviews(data);
                } else {
                    console.error("Failed to fetch interviews from backend");
                    setInterviews([]); // Show empty if backend fails
                }
            } catch (err) {
                console.error("API Fetch Error", err);
                setInterviews([]); // Show empty if API fails
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

            const res = await fetch('/interview-applications/apply', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
                body: formData
            });

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
        if (!token) return;

        try {
            const res = await fetch('/interview-applications/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const apps = await res.json();
                setMyApplications(apps);
            }
        } catch (err) {
            console.error('Failed to fetch applications', err);
        }
    };

    useEffect(() => {
        fetchMyApplications();
    }, [token]);

    const hasApplied = (interviewId) => {
        // Check if any application matches the interview drive ID
        return myApplications.some(app => app.interviewDriveId === interviewId);
    };

    const renderCard = (interview) => {
        const total = interview.totalSlots || 20;
        const booked = interview.bookedSlots || 0;
        const slotsLeft = total - booked;
        const progress = (booked / total) * 100;

        return (
            <div key={interview.id} className="interview-card surface-glow">
                <div className="card-header">
                    <div className="company-info">
                        <div className="company-logo-placeholder">{interview.company.charAt(0)}</div>
                        <div>
                            <h3>{interview.company}</h3>
                            <span className="location"><i className="fas fa-map-marker-alt"></i> {interview.location}</span>
                        </div>
                    </div>
                    <div className="date-badge">
                        <span className="month">{new Date(interview.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="day">{new Date(interview.date).getDate()}</span>
                    </div>
                </div>

                <div className="card-body">
                    <div className="detail-row">
                        <i className="fas fa-clock"></i> <span>{interview.time}</span>
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-building"></i> <span>{interview.venue}</span>
                    </div>
                    <div className="positions-list">
                        {interview.positions && interview.positions.split(',').map((pos, idx) => (
                            <span key={idx} className="position-tag">{pos.trim()}</span>
                        ))}
                    </div>

                    <div className="slots-container">
                        <div className="slots-info">
                            <span>Slots Filled</span>
                            <span>{booked} / {total}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: slotsLeft < 5 ? '#ff477b' : 'var(--primary)' }}></div>
                        </div>
                        <div className="eligibility-note">Only {slotsLeft} seats left!</div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="criteria">
                        <i className="fas fa-graduation-cap"></i> {interview.eligibility}
                    </div>
                    {hasApplied(interview.id) ? (
                        <button className="btn btn-success" disabled>
                            <i className="fas fa-check"></i> Applied
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            disabled={slotsLeft === 0}
                            onClick={() => handleApplyClick(interview)}
                        >
                            {slotsLeft === 0 ? 'Full' : 'Apply Now'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="interview-page">
            {/* Search and Filter - Top */}
            <section className="top-filter-section">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by company or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-bar">
                    <label><i className="fas fa-filter"></i> Location:</label>
                    <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>
                                {loc === 'all' ? 'All Locations' : loc}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Main Content with Sidebar */}
            <div className="interview-main-layout">
                {/* Left Sidebar - Statistics */}
                <aside className="stats-sidebar">
                    <h3>Overview</h3>
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
                </aside>

                {/* Right Content - Interview Grid */}
                <main className="interview-content">
                    <div className="section-header">
                        <h2><i className="fas fa-calendar-alt"></i> Upcoming Drives</h2>
                        <span className="result-count">{filteredInterviews.length} drives found</span>
                    </div>
                    <div className="interview-grid">
                        {filteredInterviews.length > 0 ? (
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
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content surface-glow" data-lenis-prevent onClick={e => e.stopPropagation()}>
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
            )}

            {showApplicationModal && selectedInterview && (
                <ApplicationModal
                    interview={selectedInterview}
                    onClose={() => setShowApplicationModal(false)}
                    onSubmit={handleApplicationSubmit}
                />
            )}
        </div>
    );
};

export default Interview;
