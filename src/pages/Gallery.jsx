import React, { useState } from 'react';
import '../styles/gallery.css';

const galleryData = [
    { id: 1, src: "/images/4E9A7129-copy.jpg", alt: "Students in a modern computer lab", title: "Lab Session", categories: ["lab", "campus"] },
    { id: 2, src: "/images/20240123_145917-copy.jpg", alt: "IPS Academy School of Computers entrance", title: "Campus Entrance", categories: ["campus"] },
    { id: 3, src: "/images/DSCF2122-copy.jpg", alt: "Students working on projects in lab", title: "Hands-on Learning", categories: ["lab"] },
    { id: 4, src: "/images/Group-photo-1-copy-4.jpg", alt: "Campus group photo with faculty", title: "Campus Group Photo", categories: ["campus", "function"] },
    { id: 5, src: "/images/STUDENT5-1.jpg", alt: "Unique circular computer lab", title: "Circular Lab", categories: ["lab", "campus"] },
    { id: 6, src: "/images/student-group-photo.jpg", alt: "Large group of students at an annual event", title: "Annual Event", categories: ["function"] },
    { id: 7, src: "/images/bgcoll.jpg", alt: "Campus fountain lit up at night", title: "Evening Campus", categories: ["campus", "function"] },
    { id: 8, src: "/images/lab1.jpg", alt: "Teacher assisting student in lab", title: "Focused Lab Session", categories: ["lab"] },
    { id: 9, src: "/images/wteach.jpg", alt: "Group of female faculty members", title: "Faculty Members", categories: ["function"] },
    { id: 10, src: "/images/fair.jpg", alt: "Students posing in front of college building", title: "Student Group Photo", categories: ["campus"] },
    { id: 11, src: "/images/audi.jpg", alt: "Group photo on stage in auditorium", title: "Auditorium Event", categories: ["function", "farewell"] },
    { id: 12, src: "/images/udit1.jpg", alt: "Four friends smiling on campus", title: "Friends on Campus", categories: ["campus"] },
    { id: 13, src: "/images/class1.jpg", alt: "Students paying attention in a classroom", title: "Classroom Learning", categories: ["class"] },
    { id: 14, src: "/images/class2.jpg", alt: "Interactive classroom session with teacher", title: "Interactive Session", categories: ["class"] }
];

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedImage, setSelectedImage] = useState(null);

    const filteredImages = activeCategory === "all"
        ? galleryData
        : galleryData.filter(img => img.categories.includes(activeCategory));

    return (
        <main>
            <section className="gallery-page">
                <h1>Moments & Memories</h1>
                <p className="subtitle">A collection of moments from our campus life, events, and sessions.</p>

                <div className="gallery-categories">
                    {['all', 'function', 'lab', 'farewell', 'campus'].map(cat => (
                        <button
                            key={cat}
                            className={`btn btn-outline ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'all' ? 'All Photos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="photo-grid">
                    {filteredImages.map(img => (
                        <div key={img.id} className="photo-item surface-glow" onClick={() => setSelectedImage(img)}>
                            <img src={img.src} alt={img.alt} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200' }} />
                            <div className="photo-info"><h4>{img.title}</h4></div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="gallery-contribution-section">
                <div className="gallery-contribution surface-glow">
                    <h3>Share Your Moments</h3>
                    <p>Have photos from college you'd like to share? Send them our way!</p>
                    <div className="contact-links">
                        <a href="https://wa.me/916266017070?text=Hello!%20I%20want%20to%20share%20photos%20for%20the%20college%20gallery." target="_blank" rel="noopener noreferrer" className="btn-contact whatsapp-btn"><i className="fab fa-whatsapp"></i> WhatsApp Us</a>
                        <a href="mailto:abhijain6101@gmail.com?subject=College%20Gallery%20Photo%20Submission" className="btn-contact email-btn"><i className="fas fa-envelope"></i> Email Photos</a>
                    </div>
                </div>
            </section>

            {selectedImage && (
                <div id="imageModal" className="modal" style={{ display: 'flex' }} onClick={() => setSelectedImage(null)}>
                    <span className="close-modal" onClick={() => setSelectedImage(null)}>×</span>
                    <img className="modal-content" id="modalImage" src={selectedImage.src} alt={selectedImage.alt} onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </main>
    );
};

export default Gallery;
