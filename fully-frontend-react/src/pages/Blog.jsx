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
        <>
            <Helmet>
                <title>Career Insight Blog | Hack-2-Hired</title>
                <meta name="description" content="Get expert advice, industry trends, and placement preparation tips from our career specialists. Read our latest blog posts to boost your career." />
                <meta name="keywords" content="career blog, placement tips, interview advice, tech industry trends, resume building tips" />
            </Helmet>
            <header className="hero" style={{ paddingTop: '120px', paddingBottom: '0', minHeight: 'auto' }}>
                <div className="hero-content papers-header-container blog-header-container" style={{ width: '100%', marginBottom: '24px', alignItems: 'center' }}>
                    <div className="papers-header-left blog-header-left">
                        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', whiteSpace: 'nowrap', fontWeight: '700', lineHeight: '1', background: 'none', WebkitTextFillColor: 'initial', color: '#fff' }}>Career Insight Blog</h1>
                        <p className="sr-only">Get expert advice, industry trends, and placement preparation tips from our career specialists. Read our latest blog posts to boost your career.</p>
                    </div>
                    
                    <div className="papers-header-right blog-header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <div className="category-dropdown" style={{ position: 'relative', minWidth: '200px' }}>
                            <select
                                value={activeCategory}
                                onChange={(e) => handleFilter(e.target.value)}
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
                                {['all', 'tech-skills', 'career-growth', 'interview-tips', 'resume-advice'].map(cat => (
                                    <option key={cat} value={cat} style={{ background: '#0F172A', color: '#fff' }}>
                                        {cat === 'all' ? 'All Posts' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }}></i>
                        </div>
                    </div>
                </div>
            </header>

            <main className="blog-container" style={{ paddingBottom: '100px' }}>
                <section id="blog-posts-section" className="blog-posts" style={{ justifyContent: 'center' }}>
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


            </main>
        </>
    );
};

export default Blog;
