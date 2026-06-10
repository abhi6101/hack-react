import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/videos.css';

const allVideos = [
    { id: 1, title: "Learn MERN Stack (MongoDB, Express, React, Node.js)", src: "https://www.youtube.com/embed/mrHNSanmqQ4", duration: "8h 00m", level: "Intermediate", category: "programming", links: [{ text: "FreeCodeCamp", url: "https://www.freecodecamp.org" }] },
    { id: 2, title: "Spring Boot & Spring Data JPA - Full Course", src: "https://www.youtube.com/embed/9ptB5bN_bS0", duration: "13h 00m", level: "Advanced", category: "programming", links: [{ text: "AmigosCode", url: "https://amigoscode.com" }] },
    { id: 3, title: "Spring Boot Tutorial for Beginners (2024)", src: "https://www.youtube.com/embed/k_l2F3Y138E", duration: "2h 30m", level: "Beginner", category: "programming", links: [{ text: "Programming with Mosh", url: "https://codewithmosh.com" }] },
    { id: 4, title: "Build a MERN Stack App (Project Based)", src: "https://www.youtube.com/embed/p0aJ2V2x_u4", duration: "1h 30m", level: "Intermediate", category: "programming", links: [{ text: "Source Code", url: "https://github.com" }] },
    { id: 5, title: "Full Stack Pinterest App (MERN)", src: "https://www.youtube.com/embed/7M7Fq8pUo1k", duration: "3h 45m", level: "Advanced", category: "programming", links: [{ text: "Source Code", url: "https://github.com" }] },
    { id: 6, title: "MERN Stack Tutorial - Beginner to Master", src: "https://www.youtube.com/embed/D0sR6Wq2tPM", duration: "6h 00m", level: "Beginner", category: "programming", links: [{ text: "Edureka", url: "https://www.edureka.co" }] }
];

const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const Videos = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = allVideos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="container" style={{ minHeight: '100vh', padding: '104px 2rem 50px', position: 'relative', zIndex: 2 }}>
            <Helmet>
                <title>Curated Study Videos | Hack-2-Hired</title>
                <meta name="description" content="Enhance your skills with our curated collection of educational videos from top instructors. Learn MERN Stack, Spring Boot, Java, and more." />
                <meta name="keywords" content="study videos, programming tutorials, MERN stack tutorial, Spring Boot course, online learning" />
            </Helmet>
            <div className="papers-header-container" style={{ marginBottom: '24px' }}>
                <div className="papers-header-left">
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Curated Study Videos</h2>
                </div>
                <div className="papers-header-right" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div className="global-search-container" style={{
                        position: 'relative',
                        flex: 1.5,
                        minWidth: '140px',
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
                            placeholder="Search videos..."
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
                </div>
            </div>
            
            <div className="category-filters-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {['All', 'Frontend', 'Backend', 'Database'].map(cat => (
                    <button key={cat} style={{ background: cat === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: cat === 'All' ? '#000' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                        {cat}
                    </button>
                ))}
            </div>

            <section className="video-list-section" style={{ padding: 0 }}>
                <div className="video-list" id="videoList">
                    {filteredVideos.length === 0 ? (
                        <p className="no-results">No videos found. Try a different search or filter.</p>
                    ) : (
                        filteredVideos.map((video, index) => (
                            <div key={video.id} className="video-card surface-glow" style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="video-thumbnail">
                                    <div className="tech-pattern-gradient"></div>
                                    <div className="video-thumbnail-placeholder" style={{ backgroundImage: `url(https://img.youtube.com/vi/${getYouTubeId(video.src)}/hqdefault.jpg)` }}>
                                        <div className="video-thumbnail-overlay"></div>
                                        <a href={`https://www.youtube.com/watch?v=${getYouTubeId(video.src)}`} target="_blank" rel="noopener noreferrer" className="btn btn-youtube">
                                            <i className="fab fa-youtube" style={{ color: '#ff0000', fontSize: '1.4rem' }}></i> Watch on YouTube
                                        </a>
                                    </div>
                                </div>
                                <div className="video-content">
                                    <h2>{video.title}</h2>
                                    <div className="video-meta">
                                        <span><i className="fas fa-clock"></i> {video.duration}</span>
                                        <span><i className="fas fa-user-graduate"></i> {video.level}</span>
                                    </div>
                                </div>
                                <div className="related-links">
                                    {video.links.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Videos;
