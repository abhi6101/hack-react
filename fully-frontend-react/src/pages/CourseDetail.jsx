import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import courses from '../data/courseData';
import '../styles/course-detail.css';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        const foundCourse = courses.find(c => c.slug === slug);
        if (foundCourse) {
            setCourse(foundCourse);
        } else {
            // navigate('/courses'); // Optionally redirect or show 404
        }
    }, [slug, navigate]);

    if (!course) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h2>Loading course details...</h2>
                <Link to="/courses" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Courses</Link>
            </div>
        );
    }

    return (
        <>
            <header className="course-hero">
                <div className="course-hero-container">
                    <div className="hero-content" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%', color: '#fff', marginBottom: '1rem', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = '#fff'; }}>
                            <i className="fas fa-arrow-left"></i>
                        </Link>
                        <h1 style={{ background: 'none', WebkitTextFillColor: 'initial', color: '#fff' }}>{course.title}</h1>
                        <p className="subtitle sr-only">{course.subtitle}</p>
                    </div>
                    <div className="hero-actions">
                        <button className="btn hero-enroll-btn">Enroll Now</button>
                    </div>
                </div>
            </header>

            <main className="course-detail-container">
                <div className="course-main-content">
                    <section className="course-image-section">
                        <img src={course.image} alt={course.title} />
                    </section>

                    <section className="course-section surface-glow">
                        <h2 className="section-title"><i className="fas fa-info-circle"></i> Course Overview</h2>
                        <p>{course.overview}</p>
                    </section>

                    <section className="course-section surface-glow">
                        <h2 className="section-title"><i className="fas fa-graduation-cap"></i> What You'll Master</h2>
                        <ul className="checklist">
                            {course.whatYouWillLearn && course.whatYouWillLearn.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="course-section surface-glow">
                        <h2 className="section-title"><i className="fas fa-sitemap"></i> {course.duration} Curriculum</h2>
                        <div className="module-grid">
                            {course.curriculum && course.curriculum.map((mod, index) => (
                                <div className="module" key={index}>
                                    <h4>{mod.title}</h4>
                                    <p>{mod.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="course-sidebar">
                    <div className="sidebar-card surface-glow">
                        <div className="course-meta-grid">
                            <div className="meta-item"><i className="fas fa-clock"></i><div><span>Duration</span><strong>{course.duration}</strong></div></div>
                            <div className="meta-item"><i className="fas fa-layer-group"></i><div><span>Level</span><strong>{course.level}</strong></div></div>
                            <div className="meta-item"><i className="fas fa-users"></i><div><span>Enrolled</span><strong>{course.students}+ Students</strong></div></div>
                        </div>
                        <h3 className="sidebar-title">Key Features</h3>
                        <ul className="feature-list">
                            <li><i className="fas fa-certificate"></i> Verified Certificate</li>
                            <li><i className="fas fa-life-ring"></i> Lifetime Access</li>
                            <li><i className="fas fa-file-code"></i> Project-Based</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </>
    );
};

export default CourseDetail;
