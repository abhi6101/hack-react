import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import blogPosts from '../data/blogData';
import '../styles/post-detail.css';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const foundPost = blogPosts.find(p => p.slug === slug);
        if (foundPost) {
            setPost(foundPost);
        } else {
            // navigate('/blog'); 
        }
    }, [slug, navigate]);

    if (!post) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h2>Loading article...</h2>
                <Link to="/blog" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Blog</Link>
            </div>
        );
    }

    return (
        <main className="post-detail-container">
            <article className="post-main-content">
                <header className="post-header">
                    <div className="post-meta-tags">
                        {post.tags.map((tag, i) => <span key={i} className="category-tag">{tag}</span>)}
                    </div>
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span><i className="fas fa-calendar-alt"></i> {post.date}</span>
                        <span><i className="fas fa-user-edit"></i> by {post.author}</span>
                        <span><i className="fas fa-eye"></i> {post.views} Views</span>
                    </div>
                </header>
                <img src={post.image} alt={post.title} className="post-featured-image" />
                <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </article>
            <aside className="post-sidebar">
                <div className="sidebar-card surface-glow">
                    <h3 className="sidebar-title">Need Career Guidance?</h3>
                    <p>Our team offers personalized career guidance and portfolio reviews.</p>
                    <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                </div>
            </aside>
        </main>
    );
};

export default BlogPost;
