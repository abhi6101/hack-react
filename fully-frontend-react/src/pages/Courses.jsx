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
            <main className="courses-container" style={{ paddingTop: '160px', minHeight: '100vh', background: 'transparent' }}>
                <div className="course-controls" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '2rem',
                    padding: '0 2rem',
                    background: 'transparent'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}>Career boosting courses</h2>

                    <div className="search-bar" style={{ flex: 1, minWidth: '250px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <i className="fas fa-search" style={{ color: 'var(--text-secondary)' }}></i>
                        <input
                            type="text"
                            id="courseSearch"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', background: 'transparent', color: '#fff', width: '100%', padding: '0.8rem 1rem' }}
                        />
                    </div>

                    <div className="category-dropdown" style={{ position: 'relative', minWidth: '200px' }}>
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '50px',
                                fontSize: '0.95rem',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {['all', 'programming', 'web-dev', 'mobile-dev', 'data-science'].map(cat => (
                                <option key={cat} value={cat} style={{ background: '#0f111a', color: '#fff' }}>
                                    {cat === 'all' ? 'All Courses' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                        <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}></i>
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
