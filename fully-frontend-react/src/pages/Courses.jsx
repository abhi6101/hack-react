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
            
            <div className="course-controls course-header-container" style={{ marginBottom: '2rem' }}>
                <div className="course-header-left" style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: '800', lineHeight: '1.2', color: '#fff', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}>Career boosting courses</h2>
                </div>
                <div className="course-header-right">
                    <div className="global-search-container" style={{
                        position: 'relative',
                        width: '100%',
                        background: 'rgba(0, 212, 255, 0.05)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '50px',
                        padding: '0 1rem 0 2.5rem',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backdropFilter: 'blur(15px)',
                        transition: 'all 0.3s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        {searchTerm && (
                            <i 
                                className="fas fa-times" 
                                onClick={() => setSearchTerm('')}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                            ></i>
                        )}
                    </div>

                    <div className="category-dropdown" style={{ position: 'relative', width: '100%' }}>
                        <div
                            className="custom-dropdown"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                padding: '0 1.2rem',
                                height: '45px',
                                borderRadius: '50px',
                                position: 'relative',
                                width: '100%'
                            }}
                        >
                            <select
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    color: '#fff',
                                    border: 'none',
                                    appearance: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    paddingRight: '1rem'
                                }}
                            >
                                {['all', 'programming', 'web-dev', 'mobile-dev', 'data-science'].map(cat => (
                                    <option key={cat} value={cat} style={{ background: '#0F172A', color: '#fff' }}>
                                        {cat === 'all' ? 'All Courses' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.2rem', pointerEvents: 'none', color: 'var(--primary)', fontSize: '0.8rem' }}></i>
                        </div>
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
