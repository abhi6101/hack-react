import React, { useState, useEffect } from 'react';

const ProfileUpdateModal = ({ isOpen, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        branch: '',
        semester: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Fetch current user data when modal opens
            const fetchUserData = async () => {
                const token = localStorage.getItem('authToken');
                try {
                    const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setFormData({
                            name: userData.name || '',
                            phone: userData.phone || '',
                            branch: userData.branch || '',
                            semester: userData.semester || ''
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch user data');
                }
            };
            fetchUserData();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Reset semester when branch changes
        if (name === 'branch') {
            setFormData(prev => ({ ...prev, branch: value, semester: '' }));
        }
    };

    const getSemesterOptions = () => {
        if (formData.branch === 'IMCA') {
            return Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }));
        } else if (formData.branch === 'MCA') {
            return Array.from({ length: 4 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }));
        } else if (formData.branch === 'BCA') {
            return [
                { value: 2, label: 'Year 1 (Semester 2)' },
                { value: 4, label: 'Year 2 (Semester 4)' },
                { value: 6, label: 'Year 3 (Semester 6)' }
            ];
        }
        return [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    branch: formData.branch,
                    semester: parseInt(formData.semester)
                })
            });

            const result = await response.json();

            if (response.ok) {
                onUpdate();
                onClose();
            } else {
                setError(result.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '2rem',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <h2 style={{ marginBottom: '1rem', color: '#fff' }}>
                    📚 Complete Your Profile
                </h2>
                <p style={{ marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Please fill in your details to access all features and see relevant job opportunities.
                </p>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#fca5a5',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Phone Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            pattern="[0-9]{10}"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                        <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>10 digits only</small>
                    </div>

                    {/* Branch Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
                            Branch *
                        </label>
                        <select
                            name="branch"
                            required
                            value={formData.branch}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                            className="dark-select"
                        >
                            <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Your Branch --</option>
                            <option value="IMCA" style={{ background: '#1e293b', color: '#fff' }}>IMCA (Integrated MCA)</option>
                            <option value="MCA" style={{ background: '#1e293b', color: '#fff' }}>MCA (Master's)</option>
                            <option value="BCA" style={{ background: '#1e293b', color: '#fff' }}>BCA (Bachelor's)</option>
                        </select>
                    </div>

                    {/* Semester Field */}
                    {formData.branch && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
                                Semester/Year *
                            </label>
                            <select
                                name="semester"
                                required
                                value={formData.semester}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                                className="dark-select"
                            >
                                <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Semester/Year --</option>
                                {getSemesterOptions().map(opt => (
                                    <option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#fca5a5'
                    }}>
                        <strong>⚠️ Important:</strong> This information will be used to match you with eligible job opportunities. Fill carefully!
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                            type="submit"
                            disabled={loading || !formData.name || !formData.phone || !formData.branch || !formData.semester}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileUpdateModal;
