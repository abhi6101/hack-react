import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogData';
import '../styles/blog.css';

const Blog = () => {
    const [posts, setPosts] = useState(blogPosts);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const handleFilter = (category, search) => {
        setActiveCategory(category);
        setSearchQuery(search);
        
        let filtered = blogPosts;
        if (category !== "all") {
            filtered = filtered.filter(post => post.tags.map(t => t.toLowerCase().replace(' ', '-')).includes(category));
        }
        if (search) {
            filtered = filtered.filter(post => post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase()));
        }
        setPosts(filtered);
    };

    return (
        <div className="container" style={{ minHeight: '100vh', padding: '104px 2rem 50px', position: 'relative', zIndex: 2 }}>
            <Helmet>
                <title>Career Insight Blog | Hack-2-Hired</title>
                <meta name="description" content="Get expert advice, industry trends, and placement preparation tips from our career specialists. Read our latest blog posts to boost your career." />
                <meta name="keywords" content="career blog, placement tips, interview advice, tech industry trends, resume building tips" />
            </Helmet>
            
            <div className="papers-header-container blog-header-container" style={{ width: '100%', marginBottom: '24px', alignItems: 'center' }}>
                <div className="papers-header-left blog-header-left">
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', whiteSpace: 'nowrap', fontWeight: '700', lineHeight: '1', color: 'var(--text-primary)' }}>Career Insight Blog</h2>
                    <p className="sr-only">Get expert advice, industry trends, and placement preparation tips from our career specialists. Read our latest blog posts to boost your career.</p>
                </div>
                
                <div className="papers-header-right blog-header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%', maxWidth: '600px' }}>
                    <div className="search-bar" style={{ position: 'relative', flex: '1 1 200px' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }}></i>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => handleFilter(activeCategory, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.5rem 0.9rem 2.8rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '50px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>
                    <div className="category-dropdown" style={{ position: 'relative', flex: '1 1 150px' }}>
                        <select
                            value={activeCategory}
                            onChange={(e) => handleFilter(e.target.value, searchQuery)}
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '50px',
                                fontSize: '0.95rem',
                                appearance: 'none',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {['all', 'tech-skills', 'career-growth', 'interview-tips', 'resume-advice'].map(cat => (
                                <option key={cat} value={cat} style={{ background: '#1a1a1a', color: '#fff' }}>
                                    {cat === 'all' ? 'All Posts' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                        <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}></i>
                    </div>
                </div>
            </div>

            <div style={{ paddingBottom: '0' }}>
                <section id="blog-posts-section" className="premium-grid" style={{ padding: '2rem 0' }}>
                    {posts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No posts found.</p>
                    ) : (
                        posts.map((post, index) => (
                            <div key={post.id} className="premium-card" style={{ animationDelay: `${index * 0.07}s` }}>
                                <img src={post.image} className="premium-card-image" alt={post.title} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200' }} />
                                <div className="premium-card-body">
                                    <span className="premium-card-badge">{post.tags[0]}</span>
                                    <h3 className="premium-card-title">{post.title}</h3>
                                    <p className="premium-card-desc">{post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...</p>
                                    
                                    <div className="premium-card-footer">
                                        <span><i className="fas fa-calendar-alt" style={{marginRight: '4px'}}></i> {post.date}</span>
                                        <Link to={`/blog/${post.slug}`} className="premium-card-footer-action">
                                            Read More <i className="fas fa-arrow-right" style={{fontSize: '0.8rem'}}></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </div>
    );
};

export default Blog;
