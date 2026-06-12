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
            
            <div className="course-controls course-header-container papers-header-container blog-header-container" style={{ marginBottom: '24px' }}>
                <div className="course-header-left papers-header-left blog-header-left" style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', lineHeight: '1', color: 'var(--text-primary)' }}>Career boosting courses</h2>
                </div>
                    <div className="papers-header-right blog-header-right" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'flex-end', flex: 2, flexWrap: 'wrap' }}>
                        <div className="global-search-container" style={{
                            position: 'relative',
                            flex: 1.5,
                            minWidth: '200px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '50px',
                            padding: '0 1rem 0 2.5rem',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(15px)',
                            transition: 'all 0.3s ease'
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

                        <div className="category-dropdown" style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                            <div
                                className="custom-dropdown"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(0, 212, 255, 0.3)',
                                    padding: '0 1rem',
                                    height: '40px',
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
                                <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--primary)', fontSize: '0.8rem' }}></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-grid" id="courseList" style={{ paddingTop: '1.5rem' }}>
                    {courses.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No courses found matching your criteria.</p>
                    ) : (
                        courses.map((course, index) => (
                            <div key={course.id} className="premium-card" style={{ animationDelay: `${index * 0.05}s` }}>
                                {course.image ? (
                                    <>
                                        <img src={course.image} className="premium-card-image" alt={course.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        <div className="premium-card-image" style={{ display: 'none', background: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-laptop-code" style={{fontSize: '3rem', color: 'var(--primary)'}}></i>
                                        </div>
                                    </>
                                ) : (
                                    <div className="premium-card-image" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-laptop-code" style={{fontSize: '3rem', color: 'var(--primary)'}}></i>
                                    </div>
                                )}
                                <div className="premium-card-body">
                                    <span className="premium-card-badge">{course.level}</span>
                                    <h3 className="premium-card-title">{course.title}</h3>
                                    <p className="premium-card-desc">{course.description}</p>
                                    
                                    <div className="premium-card-footer">
                                        <span><i className="fas fa-clock" style={{marginRight: '4px'}}></i> {course.duration} &bull; <i className="fas fa-users" style={{marginLeft: '4px', marginRight: '4px'}}></i> {course.students.toLocaleString()}</span>
                                        <Link to={`/courses/${course.slug}`} className="premium-card-footer-action">
                                            View Course <i className="fas fa-arrow-right" style={{fontSize: '0.8rem'}}></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
        </div>
    );
};

export default Courses;
