import API_BASE_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import '../styles/register.css';

const AccountRecovery = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Session data
    const email = sessionStorage.getItem('recoveryEmail');
    const token = sessionStorage.getItem('recoveryToken');
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    // Verification stages
    const [stage, setStage] = useState('INTRO'); // INTRO, ID_SCAN, AADHAR_SCAN, SELFIE, FORM
    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [idScanAttempt, setIdScanAttempt] = useState(0);
    const [aadharScanAttempt, setAadharScanAttempt] = useState(0);

    // Scanned data
    const [idData, setIdData] = useState(null);
    const [aadharData, setAadharData] = useState(null);
    const [selfieImage, setSelfieImage] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        semester: '',
        enrollmentNumber: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if missing required data
    useEffect(() => {
        if (!email || !token) {
            navigate('/forgot-password');
        }
    }, [email, token, navigate]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Failed to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.95);
    };

    const performOCR = async (imageData) => {
        try {
            const result = await Tesseract.recognize(imageData, 'eng', {
                logger: () => { }
            });
            return result.data.text;
        } catch (err) {
            console.error('OCR error:', err);
            return '';
        }
    };

    const extractComputerCode = (text) => {
        const patterns = [
            /(?:Computer\s*Code|Code|ID)[:\s]*(\d{5,6})/i,
            /\b(\d{5,6})\b/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const extractAadharData = (text) => {
        // Aadhar Number: 12 digits (often in 4-4-4 format)
        // Look for patterns like "5590 8885 4237" or "559088854237"
        const aadharMatch = text.match(/\b\d{4}\s*\d{4}\s*\d{4}\b/) ||
            text.match(/\b\d{12}\b/);

        // DOB: Look for patterns like "23/03/2005" or "23-03-2005"
        // Common patterns: "DOB : 23/03/2005" or "जन्म तिथि / DOB : 23/03/2005"
        const dobMatch = text.match(/(?:DOB|Date of Birth|जन्म तिथि)[:\s\/]*((\d{2})[\\/\-](\d{2})[\\/\-](\d{4}))/i) ||
            text.match(/\b(\d{2}[\\/\-]\d{2}[\\/\-]\d{4})\b/);

        // Gender: Look for "Male", "Female", "पुरुष", "महिला"
        const genderMatch = text.match(/\b(Male|Female|MALE|FEMALE|पुरुष|महिला)\b/i);

        // Name extraction: Look for capitalized English name
        // Typically appears after photo, before DOB
        // Example: "Abhi Jain" or "ABHI JAIN"
        const lines = text.split('\n').filter(line => line.trim());
        let name = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip common header text
            if (line.includes('GOVERNMENT') ||
                line.includes('INDIA') ||
                line.includes('भारत') ||
                line.includes('सरकार') ||
                line.includes('आधार') ||
                line.includes('UIDAI')) {
                continue;
            }

            // Look for name pattern: 2-4 words, mostly letters, 5-50 chars
            if (line.length >= 5 && line.length <= 50) {
                // English name pattern (e.g., "Abhi Jain", "ABHI JAIN")
                if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/i.test(line) ||
                    /^[A-Z\s]+$/.test(line)) {

                    // Avoid lines that are just gender or other keywords
                    if (!line.match(/^(MALE|FEMALE|DOB|VID)$/i)) {
                        name = line;
                        break;
                    }
                }
            }
        }

        // Clean up extracted data
        const aadharNumber = aadharMatch ? aadharMatch[0].replace(/\s/g, '') : null;
        const dob = dobMatch ? (dobMatch[1] || dobMatch[0]) : null;
        const gender = genderMatch ? (genderMatch[1] === 'पुरुष' ? 'Male' :
            genderMatch[1] === 'महिला' ? 'Female' :
                genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase()) : null;

        return {
            aadharNumber,
            dob,
            gender,
            name: name || null
        };
    };

    const handleStartIDScan = async () => {
        setStage('ID_SCAN');
        setError('');
        setIdScanAttempt(0); // Reset counter
        await startCamera();
        setTimeout(() => {
            attemptIDScan();
        }, 1000);
    };

    const attemptIDScan = async () => {
        if (!cameraActive) return;

        setIdScanAttempt(prev => prev + 1);
        setIsScanning(true);
        setScanStatus(`Scanning ID Card... (Attempt ${idScanAttempt + 1})`);

        const imageData = captureFrame();
        if (!imageData) {
            setScanStatus(`Failed to capture. Retrying... (Attempt ${idScanAttempt + 1})`);
            setTimeout(attemptIDScan, 2000);
            return;
        }

        const text = await performOCR(imageData);
        const computerCode = extractComputerCode(text);

        if (computerCode) {
            setIdData({
                computerCode,
                image: imageData
            });
            setScanStatus(`✓ ID Card Scanned Successfully! (Attempt ${idScanAttempt + 1})`);
            setIsScanning(false);

            // Auto-proceed to Aadhar scan
            setTimeout(() => {
                handleStartAadharScan();
            }, 1500);
        } else {
            setScanStatus(`ID Card not clear. Retrying... (Attempt ${idScanAttempt + 1})`);
            setTimeout(attemptIDScan, 2000);
        }
    };

    const handleStartAadharScan = async () => {
        setStage('AADHAR_SCAN');
        setScanStatus('');
        setAadharScanAttempt(0); // Reset counter
        if (!cameraActive) {
            await startCamera();
        }
        setTimeout(() => {
            attemptAadharScan();
        }, 1000);
    };

    const attemptAadharScan = async () => {
        if (!cameraActive) return;

        setAadharScanAttempt(prev => prev + 1);
        setIsScanning(true);
        setScanStatus(`Scanning Aadhar... (Attempt ${aadharScanAttempt + 1})`);

        const imageData = captureFrame();
        if (!imageData) {
            setScanStatus(`Failed to capture. Retrying... (Attempt ${aadharScanAttempt + 1})`);
            setTimeout(attemptAadharScan, 2000);
            return;
        }

        const text = await performOCR(imageData);
        const extracted = extractAadharData(text);

        // Show what was found
        const foundItems = [];
        if (extracted.aadharNumber) foundItems.push('Aadhar#');
        if (extracted.dob) foundItems.push('DOB');
        if (extracted.gender) foundItems.push('Gender');
        if (extracted.name) foundItems.push('Name');

        if (extracted.aadharNumber && extracted.dob && extracted.gender) {
            setAadharData({
                ...extracted,
                image: imageData
            });
            setScanStatus(`✓ Aadhar Scanned Successfully! Found: ${foundItems.join(', ')} (Attempt ${aadharScanAttempt + 1})`);
            setIsScanning(false);

            // Auto-proceed to selfie
            setTimeout(() => {
                handleCaptureSelfie();
            }, 1500);
        } else {
            const missing = [];
            if (!extracted.aadharNumber) missing.push('Aadhar#');
            if (!extracted.dob) missing.push('DOB');
            if (!extracted.gender) missing.push('Gender');

            setScanStatus(`Aadhar not clear. Missing: ${missing.join(', ')}. Retrying... (Attempt ${aadharScanAttempt + 1})`);
            setTimeout(attemptAadharScan, 2000);
        }
    };

    const handleCaptureSelfie = () => {
        setStage('SELFIE');
        setScanStatus('Capturing selfie...');

        setTimeout(() => {
            const selfie = captureFrame();
            if (selfie) {
                setSelfieImage(selfie);
                setScanStatus('Selfie captured!');
                stopCamera();

                // Proceed to form
                setTimeout(() => {
                    setStage('FORM');
                }, 1000);
            }
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/complete-recovery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    computerCode: idData.computerCode,
                    aadharNumber: aadharData.aadharNumber,
                    dob: aadharData.dob,
                    gender: aadharData.gender,
                    name: aadharData.name || userData.existingData?.name,
                    semester: formData.semester,
                    enrollmentNumber: formData.enrollmentNumber,
                    newPassword: formData.newPassword,
                    selfieImage: selfieImage,
                    idCardImage: idData.image,
                    aadharImage: aadharData.image
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear session storage
                sessionStorage.removeItem('recoveryEmail');
                sessionStorage.removeItem('recoveryToken');
                sessionStorage.removeItem('userData');

                // Redirect to success page
                navigate('/reset-success', {
                    state: {
                        computerCode: idData.computerCode,
                        name: aadharData.name || userData.existingData?.name
                    }
                });
            } else {
                setError(data.message || 'Failed to complete recovery. Please try again.');
            }
            setLoading(false);
        } catch (err) {
            console.error('Recovery error:', err);
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    if (!email || !token) return null;

    // Render different stages
    if (stage === 'INTRO') {
        return (
            <div className="login-body-wrapper">
                <section className="login-section">
                    <div className="login-card surface-glow">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 1rem',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                color: '#fff'
                            }}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <h1 style={{ marginBottom: '0.5rem' }}>Account Verification Required</h1>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Your account needs to be verified and upgraded.
                            </p>

                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                textAlign: 'left'
                            }}>
                                <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                    <i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Email: {email}
                                </p>
                                <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                    <i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Computer Code: Missing
                                </p>
                                <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                                    <i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i> Identity Verification: Missing
                                </p>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                textAlign: 'left'
                            }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                                    To complete password reset, we need to:
                                </p>
                                <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                    <li>Scan your College ID Card</li>
                                    <li>Scan your Aadhar Card</li>
                                    <li>Verify your identity</li>
                                    <li>Set new password</li>
                                </ol>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#fbbf24' }}>
                                    <i className="fas fa-info-circle"></i> This is a one-time process.
                                </p>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleStartIDScan}
                                style={{ width: '100%' }}
                            >
                                <i className="fas fa-id-card"></i> Start Verification
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (stage === 'ID_SCAN' || stage === 'AADHAR_SCAN' || stage === 'SELFIE') {
        return (
            <div className="register-container">
                <div className="camera-overlay">
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: stage === 'SELFIE' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(102, 126, 234, 0.9)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '20px',
                        color: '#fff',
                        fontWeight: 'bold'
                    }}>
                        {stage === 'ID_SCAN' && 'SCANNING ID CARD'}
                        {stage === 'AADHAR_SCAN' && 'SCANNING AADHAR'}
                        {stage === 'SELFIE' && 'CAPTURING SELFIE'}
                    </div>

                    {scanStatus && (
                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.8)',
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            color: '#fff'
                        }}>
                            {isScanning && <i className="fas fa-spinner fa-spin"></i>} {scanStatus}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (stage === 'FORM') {
        return (
            <div className="login-body-wrapper">
                <section className="login-section">
                    <div className="login-card surface-glow" style={{ maxWidth: '600px' }}>
                        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Complete Your Account Recovery</h1>

                        {error && (
                            <div className="alert alert-error" role="alert" style={{ display: 'block', marginBottom: '1rem' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Verified Details */}
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                                    <i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Verified Details
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                    <p style={{ margin: '0.5rem 0' }}><strong>Name:</strong> {aadharData?.name}</p>
                                    <p style={{ margin: '0.5rem 0' }}><strong>Computer Code:</strong> {idData?.computerCode}</p>
                                    <p style={{ margin: '0.5rem 0' }}><strong>Aadhar:</strong> ****-****-{aadharData?.aadharNumber?.slice(-4)}</p>
                                    <p style={{ margin: '0.5rem 0' }}><strong>DOB:</strong> {aadharData?.dob}</p>
                                    <p style={{ margin: '0.5rem 0' }}><strong>Gender:</strong> {aadharData?.gender}</p>
                                    <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {email}</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="input-group">
                                <label htmlFor="semester">Semester (Optional)</label>
                                <select
                                    id="semester"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <option key={sem} value={sem}>{sem}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="enrollmentNumber">Enrollment Number (Optional)</label>
                                <input
                                    type="text"
                                    id="enrollmentNumber"
                                    value={formData.enrollmentNumber}
                                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                                    placeholder="Enter enrollment number"
                                />
                            </div>

                            {/* New Password */}
                            <div className="input-group">
                                <label htmlFor="newPassword">
                                    <i className="fas fa-lock"></i> New Password
                                </label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="newPassword"
                                        required
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    />
                                    <i
                                        className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ cursor: 'pointer' }}
                                    ></i>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword">
                                    <i className="fas fa-check-circle"></i> Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    required
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Completing Recovery...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i> Complete Account Recovery
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        );
    }

    return null;
};

export default AccountRecovery;
