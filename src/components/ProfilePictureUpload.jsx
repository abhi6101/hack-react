import React, { useState } from 'react';
import { getDefaultAvatar } from '../utils/avatar';
import '../styles/profile-picture.css';

const ProfilePictureUpload = ({ currentPicture, username, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/profile/picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Profile picture updated successfully!');
                setSelectedFile(null);
                setPreview(null);
                if (onUploadSuccess) {
                    onUploadSuccess(data.url);
                }
            } else {
                setError(data.message || 'Failed to upload picture');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) {
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://placement-portal-backend-nwaj.onrender.com/api/profile/picture', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Profile picture removed successfully!');
                if (onUploadSuccess) {
                    onUploadSuccess(null);
                }
            } else {
                setError(data.message || 'Failed to remove picture');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        setError('');
    };

    return (
        <div className="profile-picture-upload">
            <div className="current-picture">
                <img
                    src={preview || currentPicture || getDefaultAvatar(username)}
                    alt="Profile"
                    className="profile-avatar-large"
                />
                {!preview && (
                    <div className="picture-actions">
                        <label htmlFor="picture-input" className="btn btn-primary btn-sm">
                            <i className="fas fa-camera"></i> Change Picture
                        </label>
                        {currentPicture && (
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger btn-sm"
                                disabled={uploading}
                            >
                                <i className="fas fa-trash"></i> Remove
                            </button>
                        )}
                    </div>
                )}
            </div>

            <input
                id="picture-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {preview && (
                <div className="upload-actions">
                    <button
                        onClick={handleUpload}
                        className="btn btn-primary"
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Uploading...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload"></i> Upload
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i> {success}
                </div>
            )}

            <p className="upload-hint">
                <i className="fas fa-info-circle"></i> Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
            </p>
        </div>
    );
};

export default ProfilePictureUpload;
