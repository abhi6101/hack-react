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
        <div className="container" style={{ minHeight: '100vh', padding: '104px 2rem 50px', position: 'relative', zIndex: 2 }}>
            <Helmet>
                <title>Career-Boosting Courses | Hack-2-Hired</title>
                <meta name="description" content="Master in-demand skills with our industry-relevant courses and get placement-ready. Explore programming, web dev, and data science courses." />
                <meta name="keywords" content="online courses, career boosting, placement ready, web development course, programming course" />
            </Helmet>
            
            <div className="course-controls course-header-container papers-header-container" style={{ marginBottom: '24px' }}>
                <div className="course-header-left papers-header-left" style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', whiteSpace: 'nowrap', fontWeight: '700', lineHeight: '1', color: 'var(--text-primary)' }}>Career boosting courses</h2>
                </div>

                    <div className="search-bar" style={{ flex: 1.5, minWidth: '250px', margin: '0 1rem' }}>
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            id="courseSearch"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="course-header-right" style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <div className="category-dropdown" style={{ position: 'relative', minWidth: '200px' }}>
                            <select
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem 1.5rem',
                                    background: 'rgba(22, 22, 34, 0.8)',
                                    color: '#fff',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                            >
                                {['all', 'programming', 'web-dev', 'mobile-dev', 'data-science'].map(cat => (
                                    <option key={cat} value={cat} style={{ background: '#0F172A', color: '#fff' }}>
                                        {cat === 'all' ? 'All Courses' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }}></i>
                        </div>
                    </div>
                </div>

                <div className="course-list" id="courseList">
                    {courses.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No courses found matching your criteria.</p>
                    ) : (
                        courses.map((course, index) => (
                            <div key={course.id} className="course-card surface-glow" style={{ animationDelay: `${index * 0.05}s` }}>
                                {course.image ? (
                                    <>
                                        <img src={course.image} alt={course.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        <div className="course-image-fallback" style={{ display: 'none' }}>
                                            <i className="fas fa-laptop-code"></i>
                                        </div>
                                    </>
                                ) : (
                                    <div className="course-image-fallback" style={{ display: 'flex' }}>
                                        <i className="fas fa-laptop-code"></i>
                                    </div>
                                )}
                                <span className="course-badge">{course.level}</span>
                                <div className="course-content">
                                    <h2>{course.title}</h2>
                                    <p className="course-desc-clamped">{course.description}</p>
                                    <div className="course-meta">
                                        <span><i className="fas fa-clock"></i> {course.duration}</span>
                                        <span><i className="fas fa-users"></i> {course.students.toLocaleString()} Students</span>
                                    </div>
                                    <Link to={`/courses/${course.slug}`} className="btn" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #007aff 100%)', color: '#fff', border: 'none', width: '100%', marginTop: '1.5rem', borderRadius: '12px', padding: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>View Course <i className="fas fa-arrow-right"></i></Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
        </div>
    );
};

export default Courses;
