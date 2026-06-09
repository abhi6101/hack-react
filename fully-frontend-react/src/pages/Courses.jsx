import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import coursesData from '../data/courseData';
import '../styles/courses.css';

const Courses = () => {
    const [courses, setCourses] = useState(coursesData);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        filterAndSortCourses();
    }, [searchTerm, activeCategory, sortBy]);

    const filterAndSortCourses = () => {
        let filtered = coursesData.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        setCourses(filtered);
    };

    return (
        <>
            <Helmet>
                <title>Career-Boosting Courses | Hack-2-Hired</title>
                <meta name="description" content="Master in-demand skills with our industry-relevant courses and get placement-ready. Explore programming, web dev, and data science courses." />
                <meta name="keywords" content="online courses, career boosting, placement ready, web development course, programming course" />
            </Helmet>
            <header className="courses-hero" style={{ paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>
                <video autoPlay loop muted playsInline className="hero-video-bg">
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4" type="video/mp4" />
                </video>
                <div className="hero-overlay"></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1>Career-Boosting Courses</h1>
                    <p className="subtitle">Master in-demand skills with our industry-relevant courses and get placement-ready.</p>
                </div>
            </header>

            <main className="courses-container">
                <div className="course-controls">
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            id="courseSearch"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="category-filters" style={{ flexWrap: 'wrap', display: 'flex', gap: '0.8rem', flex: 2, minWidth: '300px', justifyContent: 'center' }}>
                        {['all', 'programming', 'web-dev', 'mobile-dev', 'data-science'].map(cat => (
                            <button
                                key={cat}
                                className={`btn btn-outline ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50px',
                                    padding: '0.6rem 1.2rem',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    background: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                    color: activeCategory === cat ? '#000' : 'var(--text-secondary)'
                                }}
                            >
                                {cat === 'all' ? 'All Courses' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="course-list" id="courseList">
                    {courses.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No courses found matching your criteria.</p>
                    ) : (
                        courses.map((course, index) => (
                            <div key={course.id} className="course-card surface-glow" style={{ animationDelay: `${index * 0.05}s` }}>
                                <img src={course.image} alt={course.title} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200' }} />
                                <span className="course-badge">{course.level}</span>
                                <div className="course-content">
                                    <h2>{course.title}</h2>
                                    <p>{course.description}</p>
                                    <div className="course-meta">
                                        <span><i className="fas fa-clock"></i> {course.duration}</span>
                                        <span><i className="fas fa-users"></i> {course.students.toLocaleString()} Students</span>
                                    </div>
                                    <Link to={`/courses/${course.slug}`} className="btn btn-primary">View Course <i className="fas fa-arrow-right"></i></Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </>
    );
};

export default Courses;
