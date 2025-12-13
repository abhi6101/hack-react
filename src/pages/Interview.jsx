import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You must be logged in to view interview schedules.");
            navigate('/login');
        }
    }, [navigate]);

    const [interviews, setInterviews] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [future, setFuture] = useState([]);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/interview-drives');
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
        setFuture(upcomingList.length > 3 ? upcomingList.slice(3) : []); // Just an example logic for "future" vs "upcoming"
    }, [interviews]);


    const handleBookClick = (company) => {
        setSelectedCompany(company);
        setShowModal(true);
    };

    const handleBookingInput = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        alert(`Booking Confirmed for ${selectedCompany.company}!\n\nEmail: ${bookingData.studentEmail}`);
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
                        {interview.positions.map((pos, idx) => (
                            <span key={idx} className="position-tag">{pos}</span>
                        ))}
                    </div>

                    <div className="slots-container">
                        <div className="slots-info">
                            <span>Slots Filled</span>
                            <span>{interview.slots.booked} / {interview.slots.total}</span>
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
                    <button
                        className="btn btn-primary"
                        disabled={slotsLeft === 0}
                        onClick={() => handleBookClick(interview)}
                    >
                        {slotsLeft === 0 ? 'Full' : 'Book Slot'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="interview-page">
            <header className="page-hero">
                <div className="hero-content">
                    <span className="hero-badge">Placement Season 2025</span>
                    <h1>Interview Schedules</h1>
                    <p>Track upcoming campus drives, check eligibility, and book your interview slots instantly.</p>
                </div>
            </header>

            <main className="interview-container">
                <section className="upcoming-section">
                    <div className="section-header">
                        <h2><i className="fas fa-calendar-alt"></i> Upcoming Drives</h2>
                    </div>
                    <div className="interview-grid">
                        {upcoming.map(renderCard)}
                    </div>
                </section>
            </main>

            {showModal && (
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
            )}
        </div>
    );
};

export default Interview;
