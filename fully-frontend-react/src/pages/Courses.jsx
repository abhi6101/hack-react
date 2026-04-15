import React, { useState, useEffect } from 'react';
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

        switch (sortBy) {
            case 'title-asc': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'title-desc': filtered.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'students-desc': filtered.sort((a, b) => b.students - a.students); break;
            default: break;
        }

        setCourses(filtered);
    };

    return (
        <>
            <header className="courses-hero">
                <h1>Career-Boosting Courses</h1>
                <p className="subtitle">Master in-demand skills with our industry-relevant courses and get placement-ready.</p>
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
                    <div className="category-filters">
                        {['all', 'programming', 'web-dev', 'mobile-dev', 'data-science'].map(cat => (
                            <button
                                key={cat}
                                className={`btn btn-outline ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === 'all' ? 'All' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                    <div className="sort-control">
                        <select id="courseSort" className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="default">Sort by Default</option>
                            <option value="title-asc">Title (A-Z)</option>
                            <option value="title-desc">Title (Z-A)</option>
                            <option value="students-desc">Popularity</option>
                        </select>
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
