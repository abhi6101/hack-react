import React, { useState, useRef } from 'react';
import '../styles/modal.css';

const ApplicationModal = ({ interview, onClose, onSubmit }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        applicantName: '',
        applicantEmail: '',
        applicantPhone: '',
        resume: null,
        coverLetter: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit({
                interviewDriveId: interview.id,
                ...formData
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const fillSampleData = () => {
        setFormData({
            ...formData,
            applicantName: 'John Doe',
            applicantEmail: 'john.doe@example.com',
            applicantPhone: '9876543210',
            coverLetter: 'I am highly interested in this opportunity and believe my skills align well with the requirements.'
        });
    };

    const clearForm = () => {
        setFormData({
            applicantName: '',
            applicantEmail: '',
            applicantPhone: '',
            resume: null,
            coverLetter: ''
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Apply for {interview.company}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" className="btn btn-sm btn-outline-info" onClick={fillSampleData} title="Fill Sample Data">
                            <i className="fas fa-magic"></i> Fill Sample
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearForm} title="Clear Form">
                            <i className="fas fa-eraser"></i> Clear
                        </button>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="application-form">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.applicantName}
                            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            className="form-control"
                            required
                            value={formData.applicantEmail}
                            onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                            type="tel"
                            className="form-control"
                            required
                            value={formData.applicantPhone}
                            onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Resume (PDF) *</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            ref={fileInputRef}
                            onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
                            required
                        />
                        <small>Upload your resume in PDF format (Max 5MB)</small>
                    </div>

                    <div className="form-group">
                        <label>Cover Letter *</label>
                        <textarea
                            required
                            rows="6"
                            placeholder="Why are you interested in this position? What makes you a good fit?"
                            value={formData.coverLetter}
                            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        ></textarea>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;
