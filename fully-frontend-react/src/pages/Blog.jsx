import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogData';
import '../styles/blog.css';

const Blog = () => {
    const [posts, setPosts] = useState(blogPosts);
    const [activeCategory, setActiveCategory] = useState("all");

    const handleFilter = (category) => {
        setActiveCategory(category);
        if (category === "all") {
            setPosts(blogPosts);
        } else {
            setPosts(blogPosts.filter(post => post.tags.map(t => t.toLowerCase().replace(' ', '-')).includes(category)));
        }
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
                
                <div className="papers-header-right blog-header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'flex-end', width: '100%', maxWidth: '300px' }}>
                    <div className="category-dropdown" style={{ position: 'relative', width: '100%' }}>
                        <select
                            value={activeCategory}
                            onChange={(e) => handleFilter(e.target.value)}
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
                <section id="blog-posts-section" className="blog-posts" style={{ justifyContent: 'center', padding: 0 }}>
                    {posts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No posts found in this category.</p>
                    ) : (
                        posts.map((post, index) => (
                            <article key={post.id} className="post surface-glow" style={{ animationDelay: `${index * 0.07}s` }}>
                                <img src={post.image} alt={post.title} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200' }} />
                                <div className="post-content">
                                    <h2 className="post-title">{post.title}</h2>
                                    <p className="post-description">{post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...</p>
                                    
                                    <div className="post-footer">
                                        <div className="post-meta">
                                            <span><i className="fas fa-calendar-alt"></i> {post.date}</span>
                                            <span><i className="fas fa-eye"></i> {post.views}</span>
                                        </div>
                                        <Link to={`/blog/${post.slug}`} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #007aff 100%)', color: '#fff', border: 'none', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>Read More <i className="fas fa-arrow-right"></i></Link>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </section>

                <nav className="pagination" aria-label="Blog post navigation">
                    {/* Pagination can be added here if needed */}
                </nav>


            </div>
        </div>
    );
};

export default Blog;
