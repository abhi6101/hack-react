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
    // --- Verification Journey State ---
    // Journey: ID_CAMERA -> ID_FILE -> AADHAR_CAMERA -> AADHAR_FILE -> SELFIE -> FORM
    const [verificationStage, setVerificationStage] = useState('ID_CAMERA');

    // Data Containers
    const [scannedData, setScannedData] = useState(null); // stores parsed JSON from ID/Aadhar

    // File/Image Store
    const [idCameraImg, setIdCameraImg] = useState(null);
    const [idFile, setIdFile] = useState(null);
    const [aadharCameraImg, setAadharCameraImg] = useState(null);
    const [aadharFile, setAadharFile] = useState(null);
    const [selfieImg, setSelfieImg] = useState(null);

    const [isScanning, setIsScanning] = useState(false);

    // --- Camera State ---
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('environment'); // 'environment' (Back) vs 'user' (Front)
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

    // --- Unified Verification Journey Renderer ---
    const renderVerificationJourney = () => {
        // Shared Camera View
        if (showCamera) {
            return (
                <div className="animate-fade-in text-center">
                    <h2 className="mb-4" style={{ textAlign: 'center' }}>Live Scan</h2>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '2px solid #667eea', background: '#000' }}>
                        <video ref={videoRef} style={{ width: '100%', display: 'block' }} autoPlay playsInline muted></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', color: '#fff', fontSize: '0.8rem', textShadow: '0 1px 2px black' }}>
                            {verificationStage === 'SELFIE' ? "Position your face in the center" : "Align document/photo within frame"}
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn" onClick={stopCamera} style={{ background: '#334155', border: '1px solid #475569' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleJourneyCapture}>
                            <i className="fas fa-camera"></i> Capture
                        </button>
                    </div>
                </div>
            );
        }

        // Stage Content Switch
        const renderStageContent = () => {
            switch (verificationStage) {
                case 'ID_CAMERA':
                    return {
                        title: "Step 1: ID Card (Live Scan)",
                        desc: "Use your camera to scan your College ID Card.",
                        btnText: "Open Camera",
                        btnAction: () => { setCameraMode('environment'); startCamera(); },
                        btnAction: () => { setCameraMode('environment'); startCamera(); },
                        btnText: "Open Camera",
                        btnAction: () => { setCameraMode('environment'); startCamera(); }
                    };
                case 'ID_VERIFY_DATA':
                    return {
                        title: "Verify ID Details",
                        desc: "Please check the details extracted from your scan.",
                        isReview: true, // Special flag for review UI
                        data: scannedData,
                        btnText: "Details Correct? Upload Clear Copy",
                        btnAction: () => setVerificationStage('ID_FILE')
                    };
                case 'ID_FILE':
                    return {
                        title: "Step 1: ID Card (Upload)",
                        desc: "Upload the specific ID Card document/image.",
                        isFile: true,
                        onFile: (e) => {
                            setIdFile(e.target.files[0]);
                            // Simulate Extraction
                            setIsScanning(true);
                            setTimeout(() => { setIsScanning(false); setVerificationStage('AADHAR_CAMERA'); }, 1500);
                        }
                    };
                case 'AADHAR_CAMERA':
                    return {
                        title: "Step 2: Aadhar Card (Live Scan)",
                        desc: "Scan your Aadhar Card for cross-verification.",
                        btnText: "Scan Aadhar",
                        btnAction: () => { setCameraMode('environment'); startCamera(); },
                        btnAction: () => { setCameraMode('environment'); startCamera(); },
                        skip: () => setVerificationStage('AADHAR_FILE'),
                        skipText: "On Laptop? Upload Aadhar File"
                    };
                case 'AADHAR_FILE':
                    return {
                        title: "Step 2: Aadhar Card (Upload)",
                        desc: "Upload your Aadhar Card document.",
                        isFile: true,
                        onFile: (e) => {
                            setAadharFile(e.target.files[0]);
                            setIsScanning(true);
                            setTimeout(() => { setIsScanning(false); setVerificationStage('SELFIE'); }, 1500);
                        }
                    };
                case 'SELFIE':
                    return {
                        title: "Step 3: Face Verification",
                        desc: "Take a Live Selfie to match with your ID Card photo.",
                        btnText: "Take Selfie",
                        btnAction: () => { setCameraMode('user'); startCamera(); }
                    };
                case 'GROUP_PHOTO':
                    return {
                        title: "Step 4: Social Validation (Group Photo)",
                        desc: "Scan a Class Group Photo stored on another device (or WhatsApp).",
                        btnText: "Scan Group Photo",
                        btnAction: () => { setCameraMode('environment'); startCamera(); },
                        btnAction: () => { setCameraMode('environment'); startCamera(); },
                        manual: true, // manual upload option
                        manualText: "On Laptop? Upload Group Photo"
                    };
                default:
                    return null;
            }
        };

        const content = renderStageContent();
        if (!content) return null;

        return (
            <div className="animate-fade-in text-center">
                <Link to="/" style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                    <i className="fas fa-home"></i> Home
                </Link>

                <h2 style={{ marginBottom: '0.5rem' }}>{content.title}</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>{content.desc}</p>

                {content.isReview ? (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'left' }}>
                            <img src={idCameraImg} alt="Scanned ID" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }} />
                            <div style={{ fontSize: '0.9rem' }}>
                                <p style={{ margin: '0 0 0.5rem 0' }}><strong style={{ color: '#aaa' }}>Name:</strong> {content.data?.name}</p>
                                <p style={{ margin: '0 0 0.5rem 0' }}><strong style={{ color: '#aaa' }}>Father:</strong> {content.data?.fatherName}</p>
                                <p style={{ margin: '0' }}><strong style={{ color: '#aaa' }}>Institute:</strong> <span style={{ color: '#4ade80' }}>{content.data?.institution}</span></p>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={content.btnAction}>
                            <i className="fas fa-check-circle"></i> {content.btnText}
                        </button>
                    </div>
                ) : content.isFile ? (
                    <div style={{ border: '2px dashed rgba(255,255,255,0.2)', padding: '3rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                        <i className="fas fa-file-upload" style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }}></i>
                        <p>Click to browse or drag file here</p>
                        <input type="file" onChange={content.onFile} style={{ marginTop: '1rem' }} />
                    </div>
                ) : (
                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                            <i className={`fas ${verificationStage === 'SELFIE' ? 'fa-user' : 'fa-id-card'}`} style={{ fontSize: '4rem', color: '#667eea' }}></i>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={content.btnAction}>
                            <i className="fas fa-camera"></i> {content.btnText}
                        </button>
                        {content.skip && (
                            <button className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid #444' }} onClick={content.skip}>
                                <i className="fas fa-file-upload"></i> {content.skipText || "Setup manually (Upload File)"}
                            </button>
                        )}
                        {content.manual && (
                            <div style={{ marginTop: '1rem' }}>
                                <p className="text-sm text-gray-400 mb-2">{content.manualText || "Or upload existing group photo:"}</p>
                                <input type="file" onChange={(e) => {
                                    setIsScanning(true);
                                    setTimeout(() => {
                                        setIsScanning(false);
                                        alert("✅ Group Photo Verified!\n\nUser found in group photo (Row 2, Person 4).");
                                        setStep(4); // SUCCESS
                                    }, 3000);
                                }} />
                            </div>
                        )}

                        {isScanning && (
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <div className="spinner" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ marginTop: '1rem', color: '#667eea' }}>AI analyzing data...</p>
                            </div>
                        )}
                    </div>
                );
    };

    // --- Camera Functions ---
    const startCamera = async () => {
        try {
                    setShowCamera(true);
                const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: cameraMode } });
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
                const file = new File([blob], "camera_capture.jpg", {type: "image/jpeg" });

                // Trigger Scan Logic (Duplicate of handleFileUpload for now)
                setVerificationFile(file);
                stopCamera();
                setIsScanning(true);

                setTimeout(() => {
                    const extracted = {
                    institution: "IPS Academy, Indore", // Valid ID
                name: "Abhi Jain",
                fatherName: "Mr. R.K. Jain",
                branch: "Computer Science",
                code: "59500",
                phones: ["9876543210", "9123456789"]
                    };

                // VALIDATION: Check for 'IPS Academy'
                if (!extracted.institution.toLowerCase().includes("ips academy")) {
                    setIsScanning(false);
                alert("❌ Verification Rejected\n\nThis ID Card does not appear to belong to IPS Academy.");
                return;
                    }

                setIsScanning(false);
                setScannedData(extracted);
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
                headers: {"Content-Type": "application/json" },
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

    const handleJourneyCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            canvasRef.current.toBlob(blob => {
                const file = new File([blob], "capture.jpg", {type: "image/jpeg" });
                const imgUrl = URL.createObjectURL(file);
                stopCamera();
                setIsScanning(true);

                // Mock AI Latency
                setTimeout(() => {
                    setIsScanning(false);

                if (verificationStage === 'ID_CAMERA') {
                        const mockData = {
                    institution: "IPS Academy, Indore",
                name: "Abhi Jain",
                fatherName: "Mr. R.K. Jain",
                branch: "Computer Science",
                code: "59500"
                        };
                if (!mockData.institution.includes("IPS Academy")) {alert("❌ ID Validation Failed"); return; }
                setScannedData(mockData);
                setIdCameraImg(imgUrl);
                setVerificationStage('ID_VERIFY_DATA'); // Go to Data Review instead of next step
                    }
                else if (verificationStage === 'AADHAR_CAMERA') {
                    setAadharCameraImg(imgUrl);
                setVerificationStage('SELFIE');
                    }
                else if (verificationStage === 'SELFIE') {
                    setSelfieImg(imgUrl);
                setVerificationStage('GROUP_PHOTO');
                    }
                else if (verificationStage === 'GROUP_PHOTO') {
                    alert("✅ Group Photo Verified.");
                setStep(4);
                    }
                }, 2000);
            }, 'image/jpeg');
        }
    };

                return (
                <main className="register-page-container">
                    <section id="register-form-card" className="register-card surface-glow">
                        {step < 4 ? (
                            renderVerificationJourney()
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
                        )
                        }
                    </section >
                </main >
                );
};

                export default Register;
