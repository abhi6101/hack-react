import React, { useState } from 'react';
import '../styles/videos.css';

const allVideos = [
    { id: 1, title: "Learn MERN Stack (MongoDB, Express, React, Node.js)", src: "https://www.youtube.com/embed/mrHNSanmqQ4", duration: "8h 00m", level: "Intermediate", category: "programming", links: [{ text: "FreeCodeCamp", url: "https://www.freecodecamp.org" }] },
    { id: 2, title: "Spring Boot & Spring Data JPA - Full Course", src: "https://www.youtube.com/embed/9ptB5bN_bS0", duration: "13h 00m", level: "Advanced", category: "programming", links: [{ text: "AmigosCode", url: "https://amigoscode.com" }] },
    { id: 3, title: "Spring Boot Tutorial for Beginners (2024)", src: "https://www.youtube.com/embed/k_l2F3Y138E", duration: "2h 30m", level: "Beginner", category: "programming", links: [{ text: "Programming with Mosh", url: "https://codewithmosh.com" }] },
    { id: 4, title: "Build a MERN Stack App (Project Based)", src: "https://www.youtube.com/embed/p0aJ2V2x_u4", duration: "1h 30m", level: "Intermediate", category: "programming", links: [{ text: "Source Code", url: "#" }] },
    { id: 5, title: "Full Stack Pinterest App (MERN)", src: "https://www.youtube.com/embed/7M7Fq8pUo1k", duration: "3h 45m", level: "Advanced", category: "programming", links: [{ text: "Source Code", url: "#" }] },
    { id: 6, title: "MERN Stack Tutorial - Beginner to Master", src: "https://www.youtube.com/embed/D0sR6Wq2tPM", duration: "6h 00m", level: "Beginner", category: "programming", links: [{ text: "Edureka", url: "#" }] }
];

const Videos = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = allVideos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <main className="videos-page">
            <header className="videos-header">
                <h1>Curated Study Videos</h1>
                <p className="subtitle">Enhance your skills with our collection of educational videos from top instructors.</p>

                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        id="videoSearch"
                        placeholder="Search for videos by title, e.g., 'JavaScript'"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <section className="video-list-section">
                <div className="video-list" id="videoList">
                    {filteredVideos.length === 0 ? (
                        <p className="no-results">No videos found. Try a different search or filter.</p>
                    ) : (
                        filteredVideos.map((video, index) => (
                            <div key={video.id} className="video-card surface-glow" style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="video-thumbnail">
                                    <iframe
                                        src={video.src}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
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
        </main>
    );
};

export default Videos;
