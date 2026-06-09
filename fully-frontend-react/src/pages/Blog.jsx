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
            <header className="hero" style={{ paddingTop: '120px' }}>
                <div className="hero-content" style={{ marginTop: '20px' }}>
                    <h1>Career Insight Blog</h1>
                    <p>Get expert advice, industry trends, and placement preparation tips from our career specialists.</p>

                </div>
            </header>

            <main className="blog-container" style={{ paddingBottom: '100px' }}>
                <section className="categories" style={{ marginBottom: '2rem' }}>
                    <label htmlFor="categoryDropdown" style={{ color: 'var(--text-primary)', marginRight: '0.8rem', fontSize: '1.2rem', fontWeight: '600' }}>Explore by Category:</label>
                    <select id="categoryDropdown" value={activeCategory} onChange={(e) => handleFilter(e.target.value)} style={{
                        padding: '0.6rem 2.5rem 0.6rem 1.2rem',
                        borderRadius: '12px',
                        background: 'var(--surface-bg)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1em'
                    }}>
                        {['all', 'tech-skills', 'career-growth', 'interview-tips', 'resume-advice'].map(cat => (
                            <option key={cat} value={cat} style={{ background: '#0f111a', color: '#fff' }}>
                                {cat === 'all' ? 'All Posts' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </section>

                <section id="blog-posts-section" className="blog-posts" style={{ justifyContent: 'center' }}>
                    {posts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>No posts found in this category.</p>
                    ) : (
                        posts.map((post, index) => (
                            <article key={post.id} className="post surface-glow" style={{ animationDelay: `${index * 0.07}s` }}>
                                <img src={post.image} alt={post.title} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200' }} />
                                <div className="post-content">
                                    <div className="post-meta">
                                        <span><i className="fas fa-calendar-alt"></i> {post.date}</span>
                                        <span><i className="fas fa-eye"></i> {post.views}</span>
                                    </div>
                                    <h2>{post.title}</h2>
                                    <p className="post-description">{post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...</p>
                                    <Link to={`/blog/${post.slug}`} className="btn btn-primary">Read More <i className="fas fa-arrow-right"></i></Link>
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
