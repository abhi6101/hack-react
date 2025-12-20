import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { getProfilePicture } from '../utils/avatar';
import '../styles/profile.css';
import '../styles/profile-picture.css';

const StudentProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', profilePictureUrl: '' });
    const [profile, setProfile] = useState({
        fullName: '', phoneNumber: '', dateOfBirth: '', address: '',
        enrollmentNumber: '', branch: '', semester: '', cgpa: '', backlogs: '',
        skills: '', resumeUrl: '', linkedinProfile: '', githubProfile: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to access your profile');
            navigate('/login');
            return;
        }
        fetchUser();
        fetchProfile();
    }, [navigate]);

    const fetchUser = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${API_BASE_URL}/user/current`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (err) {
            console.error('Failed to load user', err);
        }
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${API_BASE_URL}/student-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (err) {
            console.error('Failed to load profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpdate = (newUrl) => {
        setUser({ ...user, profilePictureUrl: newUrl });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            const res = await fetch(`${API_BASE_URL}/student-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(profile)
            });

            if (res.ok) {
                setMessage({ text: 'Profile saved successfully!', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                setMessage({ text: 'Failed to save profile', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <main className="profile-page">
            <section className="profile-hero">
                <h1>My Profile</h1>
                <p>Complete your profile to access placement opportunities</p>
            </section>

            <section className="profile-form-container surface-glow">
                {message.text && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                    <ProfilePictureUpload
                        currentPicture={getProfilePicture(user)}
                        username={user.username}
                        onUploadSuccess={handleProfilePictureUpdate}
                    />

                    <h2>Personal Details</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" required value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input type="tel" required value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Address</label>
                            <textarea rows="2" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })}></textarea>
                        </div>
                    </div>

                    <h2>Academic Details</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Enrollment Number *</label>
                            <input type="text" required value={profile.enrollmentNumber} onChange={e => setProfile({ ...profile, enrollmentNumber: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Branch *</label>
                            <input type="text" required value={profile.branch} onChange={e => setProfile({ ...profile, branch: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <input type="text" value={profile.semester} onChange={e => setProfile({ ...profile, semester: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>CGPA *</label>
                            <input type="number" step="0.01" required value={profile.cgpa} onChange={e => setProfile({ ...profile, cgpa: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Backlogs</label>
                            <input type="number" value={profile.backlogs} onChange={e => setProfile({ ...profile, backlogs: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Skills (comma separated)</label>
                            <input type="text" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} />
                        </div>
                    </div>

                    <h2>Additional Links</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Resume URL</label>
                            <input type="url" value={profile.resumeUrl} onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>LinkedIn Profile</label>
                            <input type="url" value={profile.linkedinProfile} onChange={e => setProfile({ ...profile, linkedinProfile: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>GitHub Profile</label>
                            <input type="url" value={profile.githubProfile} onChange={e => setProfile({ ...profile, githubProfile: e.target.value })} />
                        </div>
                    </div>

                    <h2>Documents & Verification</h2>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>College ID Card (Upload Image/PDF)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const token = localStorage.getItem('authToken');

                                        try {
                                            // Show uploading state (simple alert for now or status adjacent)
                                            e.target.disabled = true;
                                            const res = await fetch(`${API_BASE_URL}/student-profile/upload-id-card`, {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${token}` },
                                                body: formData
                                            });

                                            if (res.ok) {
                                                alert('ID Card uploaded successfully!');
                                                // Refresh profile to show uploaded status if needed
                                            } else {
                                                alert('Failed to upload ID Card');
                                            }
                                        } catch (err) {
                                            alert('Error uploading ID Card');
                                        } finally {
                                            e.target.disabled = false;
                                        }
                                    }}
                                    className="form-control"
                                />
                                {profile.idCardUrl && <span className="badge badge-success">Uploaded</span>}
                            </div>
                            <small className="text-muted">Required for verification. Please upload a clear scan or photo.</small>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Save Profile</button>
                </form>
            </section>
        </main>
    );
};

export default StudentProfile;
