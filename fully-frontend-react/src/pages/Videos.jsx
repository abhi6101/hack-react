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
            
            {/* Header Card Area */}
            <div className="videos-header-container" style={{ 
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '20px', 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                marginBottom: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)'
            }}>
                <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}>
                    Curated Study Videos
                </h2>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="global-search-container" style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '600px',
                        background: 'rgba(0, 212, 255, 0.05)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '50px',
                        padding: '0 1.5rem 0 3rem',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backdropFilter: 'blur(15px)',
                        transition: 'all 0.3s ease',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.1rem' }}></i>
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '1.05rem',
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
                                style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.target.style.color = '#fff'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                            ></i>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="category-filters-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {['All', 'Frontend', 'Backend', 'Database'].map(cat => (
                    <button 
                        key={cat} 
                        className="filter-btn"
                        style={{ 
                            background: cat === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.03)', 
                            color: cat === 'All' ? '#000' : 'var(--text-secondary)', 
                            border: `1px solid ${cat === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, 
                            padding: '0.5rem 1.2rem', 
                            borderRadius: '50px', 
                            fontSize: '0.9rem', 
                            fontWeight: '600', 
                            cursor: 'pointer', 
                            transition: 'all 0.3s ease',
                            boxShadow: cat === 'All' ? '0 4px 15px rgba(0, 212, 255, 0.3)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (cat !== 'All') {
                                e.target.style.background = 'rgba(255,255,255,0.08)';
                                e.target.style.color = '#fff';
                                e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (cat !== 'All') {
                                e.target.style.background = 'rgba(255,255,255,0.03)';
                                e.target.style.color = 'var(--text-secondary)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            }
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <section className="video-list-section" style={{ padding: 0 }}>
                <div className="video-list" id="videoList" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {filteredVideos.length === 0 ? (
                        <p className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <i className="fas fa-video-slash" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i><br/>
                            No videos found. Try a different search.
                        </p>
                    ) : (
                        filteredVideos.map((video, index) => (
                            <div key={video.id} className="video-card surface-glow" style={{ 
                                animationDelay: `${index * 0.05}s`, 
                                background: 'rgba(15, 23, 42, 0.6)', 
                                border: '1px solid rgba(0, 212, 255, 0.15)', 
                                borderRadius: '24px', 
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 212, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.15)';
                            }}
                            >
                                <div className="video-thumbnail" style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(https://img.youtube.com/vi/${getYouTubeId(video.src)}/hqdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8, transition: 'opacity 0.3s' }}></div>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0) 50%)' }}></div>
                                    
                                    <a href={`https://www.youtube.com/watch?v=${getYouTubeId(video.src)}`} target="_blank" rel="noopener noreferrer" style={{
                                        position: 'absolute',
                                        bottom: '1rem',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.3)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                    >
                                        <i className="fab fa-youtube" style={{ color: '#ff0000', fontSize: '1.2rem' }}></i> Watch on YouTube
                                    </a>
                                </div>
                                <div className="video-content" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</h2>
                                    
                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                                            <i className="fas fa-clock" style={{ color: '#10B981' }}></i> {video.duration}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                                            <i className="fas fa-signal" style={{ color: '#F59E0B' }}></i> {video.level}
                                        </span>
                                    </div>
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
