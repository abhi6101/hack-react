import API_BASE_URL from '../config';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        branch: '',
        semester: '',
        startYear: new Date().getFullYear().toString(),
        batch: '',
        computerCode: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departments, setDepartments] = useState([]);

    // --- Identity Verification State ---
    const [step, setStep] = useState(1); // 1: Choice, 2: Upload, 3: Verify Data, 4: Final Form
    const [verifyMethod, setVerifyMethod] = useState('id_card'); // 'id_card' or 'fee_receipt'
    const [scannedData, setScannedData] = useState(null);
    const [verificationFile, setVerificationFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // --- Camera State ---
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    React.useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/public/departments`);
                if (res.ok) setDepartments(await res.json());
            } catch (e) {
                console.error("Failed to load departments", e);
            }
        };
        fetchDepts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Reset semester when branch changes
        if (name === 'branch') {
            setFormData(prev => ({ ...prev, branch: value, semester: '' }));
        }
    };

    // Auto-calculate Batch
    React.useEffect(() => {
        if (formData.branch && formData.startYear) {
            const dept = departments.find(d => d.code === formData.branch);
            if (dept) {
                const durationYears = Math.ceil((dept.maxSemesters || 8) / 2);
                const endYear = parseInt(formData.startYear) + durationYears;
                const batchStr = `${formData.startYear}-${endYear}`;
                if (formData.batch !== batchStr) {
                    setFormData(prev => ({ ...prev, batch: batchStr }));
                }
            }
        }
    }, [formData.branch, formData.startYear, departments]);

    // Get semester options based on selected branch
    const getSemesterOptions = () => {
        const branchCode = formData.branch;
        const dept = departments.find(d => d.code === branchCode);
        const maxSem = (dept && dept.maxSemesters) ? dept.maxSemesters : 8;

        return Array.from({ length: maxSem }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }));
    };

    // --- Steps Renderers ---

    // Step 1: Upload Document (Primary: ID Card, Secondary: Fee Receipt [Fallback])
    const renderStep1 = () => (
        <div className="animate-fade-in">
            <Link to="/" style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                color: '#667eea',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600'
            }}>
                <i className="fas fa-home"></i> Home
            </Link>

            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                {verifyMethod === 'id_card' ? 'Upload College ID Card' : 'Upload Fee Receipt + Aadhar'}
            </h2>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#aaa', marginBottom: '2rem' }}>
                {verifyMethod === 'id_card'
                    ? "Please upload a clear photo of your ID Card to verify your identity."
                    : "Since ID details were incorrect, please upload Fee Receipt & Aadhar for manual verification."}
            </p>

            {showCamera ? (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '2px solid #667eea', background: '#000' }}>
                        <video ref={videoRef} style={{ width: '100%', display: 'block' }} autoPlay playsInline muted></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', color: '#fff', fontSize: '0.8rem', textShadow: '0 1px 2px black' }}>
                            Align ID Card within frame
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn" onClick={stopCamera} style={{ background: '#334155', border: '1px solid #475569' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={capturePhoto}>
                            <i className="fas fa-camera"></i> Capture Photo
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div
                        style={{
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '3rem',
                            textAlign: 'center',
                            background: verifyMethod === 'id_card' ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.05)',
                            borderColor: verifyMethod === 'id_card' ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.3)',
                            marginBottom: '1rem'
                        }}
                    >
                        <i className={`fas ${verifyMethod === 'id_card' ? 'fa-id-card' : 'fa-file-invoice'}`} style={{ fontSize: '3rem', color: verifyMethod === 'id_card' ? '#667eea' : '#d1d5db', marginBottom: '1rem' }}></i>
                        <p>Click to browse or drag {verifyMethod === 'id_card' ? 'ID Card' : 'Documents'} here</p>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            style={{ marginTop: '1rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', justifyContent: 'center' }}>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>OR</span>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                    </div>

                    <button
                        className="btn"
                        style={{ display: 'block', width: '100%', background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)', marginBottom: '2rem' }}
                        onClick={startCamera}
                    >
                        <i className="fas fa-camera" style={{ marginRight: '0.5rem' }}></i> Use Camera to Scan
                    </button>
                </>
            )}

            {isScanning && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div className="spinner" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '1rem', color: '#667eea' }}>AI is analyzing your document...</p>
                </div>
            )}
        </div>
    );

    // Step 2: Verify Extracted Data
    const renderStep2 = () => (
        <div className="animate-fade-in">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Scan Complete</h2>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '2rem' }}>
                <h4 style={{ color: '#34d399', marginBottom: '0.5rem' }}><i className="fas fa-check-circle"></i> We found the following:</h4>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Name:</span>
                        <span style={{ fontWeight: 'bold' }}>{scannedData?.name || "Abhi Jain"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Father's Name:</span>
                        <span style={{ fontWeight: 'bold' }}>{scannedData?.fatherName || "Mr. R.K. Jain"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Branch:</span>
                        <span style={{ fontWeight: 'bold' }}>{scannedData?.branch || "Computer Science"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Computer Code:</span>
                        <span style={{ fontWeight: 'bold' }}>{scannedData?.code || "59500"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Phone:</span>
                        <span style={{ fontWeight: 'bold', color: '#fca5a5' }}>
                            {scannedData?.phone || "9876543210"}
                        </span>
                    </div>
                </div>
            </div>

            <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Is this information correct?</p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    className="btn"
                    style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    onClick={() => {
                        if (window.confirm("If OCR details are wrong, you must upload Fee Receipt + Aadhar for Manual Verification. Proceed?")) {
                            setVerifyMethod('fee_receipt');
                            setScannedData(null);
                            setStep(1);
                        }
                    }}
                >
                    No, Details are Wrong
                </button>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                        // Send OTP Logic
                        setOtpSent(true);
                        alert(`OTP sent to ${scannedData?.phone || 'your mobile number'}`);
                        setStep(3); // Go to OTP Step
                    }}
                >
                    Yes, Send OTP
                </button>
            </div>
        </div>
    );

    // Step 3: OTP Verification
    const renderStep3 = () => (
        <div className="animate-fade-in">
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Verify Mobile</h2>
            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>
                Enter the 4-digit OTP sent to <br />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{scannedData?.phone || "your number"}</span>
            </p>

            <div style={{ maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
                <input
                    type="text"
                    placeholder="- - - -"
                    maxLength="4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                        width: '100%',
                        fontSize: '2rem',
                        textAlign: 'center',
                        letterSpacing: '1rem',
                        padding: '1rem',
                        marginBottom: '2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                    }}
                />

                <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                        if (otp === '1234') {
                            // OTP Verified, Auto-fill and Go to Form
                            setFormData(prev => ({
                                ...prev,
                                username: (scannedData?.name || "abhi").toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 100),
                                computerCode: scannedData?.code || "59500",
                            }));
                            setStep(4);
                        } else {
                            alert("Invalid OTP. Try 1234.");
                        }
                    }}
                >
                    Verify & Proceed
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#667eea', cursor: 'pointer' }} onClick={() => alert("OTP Resent!")}>Resend OTP</p>
            </div>
        </div>
    );

    // Handler for File Upload (Mock Scan)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVerificationFile(file);
        setIsScanning(true);

        // Simulate AI Delay (2 seconds)
        setTimeout(() => {
            setIsScanning(false);
            // Mock Extracted Data - In real app, this comes from Backend OCR
            setScannedData({
                name: "Abhi Jain",
                fatherName: "Mr. R.K. Jain",
                branch: "Computer Science",
                code: "59500",
                phone: "9876543210"
            });
            setStep(2);
        }, 2000);
    };

    // --- Camera Functions ---
    const startCamera = async () => {
        try {
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            // Short delay to ensure video element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access camera. Please allow permissions or use file upload.");
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            // Set canvas size to match video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            canvasRef.current.toBlob(blob => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });

                // Trigger Scan Logic (Duplicate of handleFileUpload for now)
                setVerificationFile(file);
                stopCamera();
                setIsScanning(true);

                setTimeout(() => {
                    setIsScanning(false);
                    setScannedData({
                        name: "Abhi Jain",
                        fatherName: "Mr. R.K. Jain",
                        branch: "Computer Science",
                        code: "59500",
                        phone: "9876543210"
                    });
                    setStep(2);
                }, 2000);
            }, 'image/jpeg');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    branch: formData.role === 'USER' ? formData.branch : undefined,
                    semester: formData.role === 'USER' ? parseInt(formData.semester) : undefined,
                    batch: formData.role === 'USER' ? formData.batch : undefined,
                    computerCode: formData.role === 'USER' ? formData.computerCode : undefined
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(result.message || "Registration successful! Redirecting to verification...");
                setLoading(false);
                setTimeout(() => {
                    // Navigate to verify page with email param
                    // Using window.location to ensure fresh state or useNavigate
                    // Since I am in a component, I likely have access to navigate (wait, Register.jsx used Link. I need to add useNavigate)
                    navigate(`/verify-account?email=${encodeURIComponent(formData.email)}`);
                }, 1500);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="register-page-container">
            <section id="register-form-card" className="register-card surface-glow">
                {step < 4 ? (
                    <>
                        <Link to="/" style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            color: '#667eea',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            <i className="fas fa-home"></i> Home
                        </Link>
                        <h1 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Identity Check</h1>
                        <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '2rem' }}>Safety Step {step}/3</p>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </>
                ) : (
                    <>
                        <Link to="/" style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            color: '#667eea',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            <i className="fas fa-home"></i> Home
                        </Link>
                        <h1>Create Your Account</h1>
                        <p className="subtitle">Join our portal to access exclusive job opportunities and resources.</p>

                        {error && <div className="alert alert-error" style={{ display: 'block' }}>{error}</div>}
                        {success && <div className="alert alert-success" style={{ display: 'block' }}>{success}</div>}

                        <form id="registrationForm" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    placeholder="e.g., @yourusername"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                <small>Must start with '@', be lowercase, and have no spaces.</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Select Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Please Select a Role --</option>
                                    <option value="USER">Student</option>
                                </select>
                            </div>

                            {/* Branch/Semester fields - Only for Students */}
                            {formData.role === 'USER' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="branch">Branch *</label>
                                        <select
                                            id="branch"
                                            name="branch"
                                            required
                                            value={formData.branch}
                                            onChange={handleChange}
                                        >
                                            <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Your Branch --</option>
                                            {departments.length > 0 ? departments.map(d => (
                                                <option key={d.code} value={d.code} style={{ background: '#1e293b', color: '#fff' }}>
                                                    {d.name} ({d.code})
                                                </option>
                                            )) : (
                                                <>
                                                    <option value="IMCA" style={{ background: '#1e293b', color: '#fff' }}>IMCA (Integrated MCA)</option>
                                                    <option value="MCA" style={{ background: '#1e293b', color: '#fff' }}>MCA (Master's)</option>
                                                    <option value="BCA" style={{ background: '#1e293b', color: '#fff' }}>BCA (Bachelor's)</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {formData.branch && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="semester">Semester/Year *</label>
                                                <select
                                                    id="semester"
                                                    name="semester"
                                                    required
                                                    value={formData.semester}
                                                    onChange={handleChange}
                                                >
                                                    <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Semester/Year --</option>
                                                    {getSemesterOptions().map(opt => (
                                                        <option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label htmlFor="startYear">Admission Year *</label>
                                                    <select
                                                        id="startYear"
                                                        name="startYear"
                                                        required
                                                        value={formData.startYear}
                                                        onChange={handleChange}
                                                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}
                                                    >
                                                        {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i + 1).map(y => (
                                                            <option key={y} value={y} style={{ background: '#1e293b' }}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Batch Session</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={formData.batch}
                                                        style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', color: '#4ade80', fontWeight: 'bold' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="computerCode">Computer Code (Student ID) *</label>
                                                <input
                                                    type="text"
                                                    id="computerCode"
                                                    name="computerCode"
                                                    required
                                                    placeholder="e.g. 59500"
                                                    value={formData.computerCode}
                                                    onChange={handleChange}
                                                />
                                                <small>Your unique college ID/Roll Number.</small>
                                            </div>

                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                color: '#fca5a5'
                                            }}>
                                                <strong>⚠️ Important:</strong> Fill this carefully! Your branch and semester will be used to match you with eligible job opportunities. This can only be updated at the end of each semester.
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        required
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <i
                                        className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ cursor: 'pointer' }}
                                    ></i>
                                </div>
                                <small>Min. 8 characters, with 1 number & 1 special character.</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        required
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <i
                                        className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ cursor: 'pointer' }}
                                    ></i>
                                </div>
                            </div>

                            <button type="submit" id="registerButton" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <span className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                ) : (
                                    <span className="button-text">Register Now <i className="fas fa-user-plus"></i></span>
                                )}
                            </button>
                        </form>
                        <p className="form-footer-text">Already have an account? <Link to="/login">Login here</Link></p>
                    </>
                )}
            </section>
        </main>
    );
};

export default Register;
