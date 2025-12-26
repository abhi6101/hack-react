import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/CustomAlert';
import '../styles/gallery.css';
import API_BASE_URL from '../config';

const Gallery = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [galleryItems, setGalleryItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedImage, setSelectedImage] = useState(null);
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

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await fetch('/gallery');
            if (res.ok) {
                const data = await res.json();
                // Reverse to show oldest images first, newest at bottom
                setGalleryItems(data.reverse());
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

    return (
        <main>
            <section className="gallery-page">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <h1>Moments & Memories</h1>
                        <p className="subtitle">A collection of moments from our campus life, events, and sessions.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                        <i className="fas fa-camera"></i> Share Photo
                    </button>
                </div>

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

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Loading gallery...</p>
                ) : (
                    <div className="photo-grid">
                        {filteredImages.length > 0 ? filteredImages.map(img => (
                            <div key={img.id} className="photo-item surface-glow" onClick={() => setSelectedImage(img)}>
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
                )}
            </section>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content surface-glow" style={{ maxWidth: '500px', width: '90%', padding: '2rem', borderRadius: '15px' }}>
                        <span className="close-modal" onClick={() => setShowUploadModal(false)} style={{ position: 'absolute', right: '20px', top: '10px', fontSize: '2rem', cursor: 'pointer' }}>&times;</span>
                        <h2 style={{ marginBottom: '1.5rem' }}>Share Your Photo</h2>

                        {message.text && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem', padding: '10px', borderRadius: '5px', background: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                <select
                                    className="form-control"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="campus">Campus</option>
                                    <option value="lab">Lab</option>
                                    <option value="function">Function</option>
                                    <option value="farewell">Farewell</option>
                                    <option value="class">Class</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Photo</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    required
                                    accept="image/*"
                                    onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={uploadLoading} style={{ width: '100%' }}>
                                {uploadLoading ? 'Uploading...' : 'Submit for Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selectedImage && (
                <div id="imageModal" className="modal" style={{ display: 'flex' }} onClick={() => setSelectedImage(null)}>
                    <span className="close-modal" onClick={() => setSelectedImage(null)}>&times;</span>
                    <div style={{ textAlign: 'center' }}>
                        <img className="modal-content" id="modalImage" src={selectedImage.url} alt={selectedImage.title} onClick={(e) => e.stopPropagation()} />
                        <h3 style={{ color: 'white', marginTop: '1rem' }}>{selectedImage.title}</h3>
                        <p style={{ color: '#ccc' }}>{selectedImage.description}</p>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Gallery;
