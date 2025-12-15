import React, { useState } from 'react';
import '../styles/modal.css';

const ApplicationModal = ({ interview, onClose, onSubmit }) => {
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Apply for {interview.company}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
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
