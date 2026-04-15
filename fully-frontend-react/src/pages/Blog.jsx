import React, { useState } from 'react';
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
            <header className="hero">
                <div className="hero-content">
                    <h1>Career Insights Blog</h1>
                    <p>Get expert advice, industry trends, and placement preparation tips from our career specialists.</p>
                    <a href="#blog-posts-section" className="btn btn-primary">Explore Posts <i className="fas fa-arrow-down"></i></a>
                </div>
            </header>

            <main className="blog-container">
                <section className="categories">
                    <h2>Explore by Category</h2>
                    <div className="category-tags" id="categoryTags">
                        {['all', 'tech-skills', 'career-growth', 'interview-tips', 'resume-advice'].map(cat => (
                            <button
                                key={cat}
                                className={`btn btn-outline ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => handleFilter(cat)}
                            >
                                {cat === 'all' ? 'All Posts' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </section>

                <section id="blog-posts-section" className="blog-posts">
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

                <section className="newsletter-section surface-glow">
                    <h2>Stay Updated</h2>
                    <p>Get the latest career insights and tips delivered straight to your inbox.</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Your email address" required />
                        <button type="submit" className="btn btn-primary">Subscribe <i className="fas fa-paper-plane"></i></button>
                    </form>
                </section>
            </main>
        </>
    );
};

export default Blog;
