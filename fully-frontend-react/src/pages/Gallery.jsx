import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import '../styles/gallery.css';
import API_BASE_URL from '../config';

const Gallery = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [galleryItems, setGalleryItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        title: '',
        type: 'campus', // Default category
        description: '',
        image: null
    });

    // Static images from public folder
    const STATIC_GALLERY_ITEMS = [
        { id: 's1', url: '/images/lab1.jpg', title: 'Computer Lab Session', type: 'lab', description: 'Students working on projects.', uploadedBy: 'Admin' },
        { id: 's2', url: '/images/lab2.jpg', title: 'Advanced Coding Lab', type: 'lab', description: 'Focus and dedication.', uploadedBy: 'Admin' },
        { id: 's3', url: '/images/class1.jpg', title: 'Classroom Lecture', type: 'class', description: 'Engaging session with faculty.', uploadedBy: 'Admin' },
        { id: 's4', url: '/images/class2.jpg', title: 'Interactive Learning', type: 'class', description: 'Group discussion in class.', uploadedBy: 'Admin' },
        { id: 's5', url: '/images/fair.jpg', title: 'Tech Fair Celebration', type: 'farewell', description: 'Celebrating achievements and milestones.', uploadedBy: 'Admin' },
        { id: 's6', url: '/images/student-group-photo.jpg', title: 'Batch Group Photo', type: 'campus', description: 'Memories to cherish forever.', uploadedBy: 'Admin' },
        { id: 's7', url: '/images/4E9A7129-copy.jpg', title: 'Campus Event Highlights', type: 'function', description: 'Cultural fest and fun times.', uploadedBy: 'Admin' },
        { id: 's8', url: '/images/Group-photo-1-copy-4.jpg', title: 'Team Spirit', type: 'campus', description: 'Our brilliant students together.', uploadedBy: 'Admin' },
        { id: 's9', url: '/images/teach.jpg', title: 'Faculty Guidance', type: 'class', description: 'Mentorship in action.', uploadedBy: 'Admin' },
        { id: 's10', url: '/images/wteach.jpg', title: 'Workshop Session', type: 'lab', description: 'Hands-on workshop learning skills.', uploadedBy: 'Admin' },
        { id: 's11', url: '/images/DSCF2122-copy.jpg', title: 'Award Ceremony', type: 'function', description: 'Recognizing talent and success.', uploadedBy: 'Admin' },
        { id: 's12', url: '/images/20240123_145917-copy.jpg', title: 'Campus Life', type: 'campus', description: ' Everyday moments.', uploadedBy: 'Admin' },
        { id: 's13', url: '/images/STUDENT5-1.jpg', title: 'Student Portrait', type: 'campus', description: 'Future leaders.', uploadedBy: 'Admin' },
    ];

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            // Start with static items
            let startItems = [...STATIC_GALLERY_ITEMS];

            // Try to fetch dynamic items from backend
            try {
                const res = await fetch('/gallery');
                if (res.ok) {
                    const data = await res.json();
                    // Combine static + dynamic (dynamic first or last? Let's assume dynamic is newer, so first)
                    // The user wanted to "use photos from public folder", so ensuring they are present is key.
                    // We'll merge them.
                    setGalleryItems([...data.reverse(), ...startItems]);
                } else {
                    setGalleryItems(startItems);
                }
            } catch (apiErr) {
                console.warn("API fetch failed, using static only", apiErr);
                setGalleryItems(startItems);
            }
        } catch (err) {
            console.error("Failed to load gallery", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setUploadLoading(true);
        setMessage({ text: '', type: '' });

        const token = localStorage.getItem('authToken');
        if (!token) {
            showAlert({
                title: 'Login Required',
                message: 'Please login to upload photos.',
                type: 'login',
                actions: [
                    { label: 'Login Now', primary: true, onClick: () => navigate('/login') },
                    { label: 'Cancel', primary: false }
                ]
            });
            setUploadLoading(false);
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('type', formData.type);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const res = await fetch('/gallery', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                setMessage({ text: 'Photo submitted for moderation! It will appear once approved.', type: 'success' });
                setFormData({ title: '', type: 'campus', description: '', image: null });
                setTimeout(() => {
                    setShowUploadModal(false);
                    setMessage({ text: '', type: '' });
                }, 3000);
            } else {
                setMessage({ text: 'Failed to upload photo.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error uploading photo.', type: 'error' });
        } finally {
            setUploadLoading(false);
        }
    };

    const filteredImages = activeCategory === "all"
        ? galleryItems
        : galleryItems.filter(img => img.type.toLowerCase() === activeCategory.toLowerCase());

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        setSelectedIndex(prev => prev === filteredImages.length - 1 ? 0 : prev + 1);
    };

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        setSelectedIndex(prev => prev === 0 ? filteredImages.length - 1 : prev - 1);
    };

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) handleNext();
        if (distance < -minSwipeDistance) handlePrev();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedIndex === null) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, filteredImages.length]);

    return (
        <div className="container" style={{ minHeight: '100vh', padding: '104px 2rem 50px', position: 'relative', zIndex: 2 }}>
            <Helmet>
                <title>Campus Life & Event Gallery | Hack-2-Hired</title>
                <meta name="description" content="Explore moments and memories from our college campus. View photos of lab sessions, classroom lectures, cultural events, and farewell celebrations." />
                <meta name="keywords" content="college gallery, campus life, student photos, events, tech fest, farewell" />
            </Helmet>
            <div className="papers-header-container gallery-header-container" style={{ padding: '1rem 2rem', marginBottom: '24px' }}>
                <div className="papers-header-left">
                        <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '800', lineHeight: '1' }}>Moments & Memories</h2>
                        <p className="sr-only">A collection of moments from our campus life, events, and sessions.</p>
                    </div>
                    <div className="papers-header-right">
                        <button
                            className="btn"
                            onClick={() => setShowUploadModal(true)}
                            style={{
                                width: '180px',
                                padding: '0.8rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                borderRadius: '50px',
                                background: 'linear-gradient(135deg, #00d4ff 0%, #007aff 100%)',
                                color: '#fff',
                                border: 'none',
                                boxShadow: '0 10px 25px rgba(0, 212, 255, 0.4)',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <i className="fas fa-camera"></i> <span>Share Photo</span>
                        </button>
                    </div>
                </div>

                <div className="gallery-categories-container" style={{ marginBottom: '24px' }}>
                    <div className="gallery-categories">
                        {['all', 'function', 'lab', 'farewell', 'campus', 'class'].map(cat => (
                            <button
                                key={cat}
                                className={`btn btn-outline ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === 'all' ? 'All Photos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Loading gallery...</p>
                ) : (
                    <div className="gallery-carousel-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                        <button className="btn btn-outline desktop-only-arrow sleek-arrow sleek-arrow-left" onClick={() => { document.getElementById('photoGrid').scrollBy({ left: -300, behavior: 'smooth' }); }}><i className="fas fa-chevron-left"></i></button>
                        <div className="photo-grid" id="photoGrid" style={{ padding: '0 2rem' }}>
                            {filteredImages.length > 0 ? filteredImages.map((img, index) => (
                                <div key={img.id} className="photo-item surface-glow" onClick={() => setSelectedIndex(index)}>
                                    <img src={img.url} alt={img.title} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200' }} />
                                    <div className="photo-info">
                                        <h4>{img.title}</h4>
                                        {img.uploadedBy && <span style={{ fontSize: '0.8rem', color: '#ccc' }}>by {img.uploadedBy}</span>}
                                    </div>
                                </div>
                            )) : (
                                <p style={{ width: '100%', textAlign: 'center', padding: '2rem' }}>No photos in this category yet.</p>
                            )}
                        </div>
                        <button className="btn btn-primary desktop-only-arrow sleek-arrow sleek-arrow-right" onClick={() => { document.getElementById('photoGrid').scrollBy({ left: 300, behavior: 'smooth' }); }}><i className="fas fa-chevron-right"></i></button>
                    </div>
                )}


            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal" style={{ display: 'flex', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                    <div className="modal-content" style={{
                        maxWidth: '500px',
                        width: '90%',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        background: 'rgba(22, 22, 34, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <span className="close-modal" onClick={() => setShowUploadModal(false)} style={{ position: 'absolute', right: '25px', top: '25px', fontSize: '1.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}>&times;</span>
                        <h2 style={{
                            marginBottom: '2rem',
                            fontSize: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #fff 0%, var(--primary) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Share Your Photo</h2>

                        {message.text && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`, color: message.type === 'success' ? '#fff' : '#fff' }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: '#fff',
                                        width: '100%'
                                    }}
                                    placeholder="e.g., Annual Tech Fest 2024"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Category</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="form-control"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            color: '#fff',
                                            width: '100%',
                                            cursor: 'pointer',
                                            appearance: 'none'
                                        }}
                                    >
                                        <option value="campus" style={{ background: '#1a1a1a' }}>Campus</option>
                                        <option value="lab" style={{ background: '#1a1a1a' }}>Lab</option>
                                        <option value="function" style={{ background: '#1a1a1a' }}>Function</option>
                                        <option value="farewell" style={{ background: '#1a1a1a' }}>Farewell</option>
                                        <option value="class" style={{ background: '#1a1a1a' }}>Class</option>
                                        <option value="other" style={{ background: '#1a1a1a' }}>Other</option>
                                    </select>
                                    <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)' }}></i>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: '#fff',
                                        width: '100%',
                                        resize: 'none'
                                    }}
                                    placeholder="Tell us about this moment..."
                                ></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Photo</label>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.background = 'rgba(67, 97, 238, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                    }}
                                >
                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                                    <span style={{ color: formData.image ? 'var(--primary)' : 'rgba(255,255,255,0.6)' }}>
                                        {formData.image ? formData.image.name : 'Click to Upload Photo'}
                                    </span>
                                    <input
                                        type="file"
                                        style={{ display: 'none' }}
                                        required
                                        accept="image/*"
                                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                    />
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={uploadLoading} style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                boxShadow: '0 10px 30px -10px var(--primary)'
                            }}>
                                {uploadLoading ? 'Uploading...' : 'Submit Photo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selectedIndex !== null && filteredImages[selectedIndex] && (
                <div id="imageModal" className="modal lightbox-modal" onClick={() => setSelectedIndex(null)}>
                    <span className="close-modal lightbox-close" onClick={() => setSelectedIndex(null)}>&times;</span>
                    
                    <button className="lightbox-nav lightbox-prev" onClick={handlePrev}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    <div 
                        className="lightbox-slider-container"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEndHandler}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className="lightbox-track" 
                            style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
                        >
                            {filteredImages.map((img) => (
                                <div className="lightbox-slide" key={img.id}>
                                    <div className="lightbox-content">
                                        <img src={img.url} alt={img.title} className="lightbox-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600' }} />
                                        <div className="lightbox-caption">
                                            <h3 className="lightbox-title">{img.title}</h3>
                                            <p className="lightbox-desc">{img.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="lightbox-nav lightbox-next" onClick={handleNext}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gallery;
