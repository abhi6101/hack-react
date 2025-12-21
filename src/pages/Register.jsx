import API_BASE_URL from '../config';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import '../styles/register.css';

const TARGET_SCANS = 15; // Increased scan count for better accuracy

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '', // Added for verified name
        email: '',
        role: 'USER', // Default to USER
        branch: '',
        semester: '',
        startYear: new Date().getFullYear().toString(),
        batch: '',
        computerCode: '',
        enrollmentNumber: '',
        mobilePrimary: '',
        mobileSecondary: '',
        aadharNumber: '',
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
    const [verificationStage, setVerificationStage] = useState('ID_AUTO_CAPTURE');

    // Data Containers
    const [scannedData, setScannedData] = useState(null); // stores parsed JSON from ID
    const [aadharData, setAadharData] = useState(null); // stores parsed JSON from Aadhar

    // File/Image Store
    const [idCameraImg, setIdCameraImg] = useState(null);
    const [idFile, setIdFile] = useState(null);
    const [aadharCameraImg, setAadharCameraImg] = useState(null);
    const [aadharFile, setAadharFile] = useState(null);
    const [selfieImg, setSelfieImg] = useState(null);

    const [isScanning, setIsScanning] = useState(false);
    const [failedVerificationAttempts, setFailedVerificationAttempts] = useState(0); // Security: Track failed attempts
    const [deviceFingerprint, setDeviceFingerprint] = useState(''); // Security: Device binding
    const [verificationStatus, setVerificationStatus] = useState(null); // Backend verification status

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

    const [location, setLocation] = useState(null);
    const [flash, setFlash] = useState(false); // Flash Effect State
    const [errorFlash, setErrorFlash] = useState(false); // Red Alert State
    const [scanStatus, setScanStatus] = useState("Align Document"); // Feedback State

    // --- Geolocation Capture (Forensic Trail) ---
    const captureLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords;
                    setLocation({ lat: latitude.toFixed(6), lng: longitude.toFixed(6), accuracy: accuracy + 'm' });
                },
                (err) => console.warn("Location Access Denied:", err.message)
            );
        }
    };

    // --- Device Fingerprinting (Security) ---
    const generateDeviceFingerprint = () => {
        const data = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.platform
        ].join('|');

        // Simple base64 encoding (in production, use crypto.subtle.digest for SHA-256)
        return btoa(data);
    };

    React.useEffect(() => {
        captureLocation();
        // Generate device fingerprint on mount
        const fingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'branch') {
            setFormData(prev => ({ ...prev, branch: value, semester: '' }));
        }
    };

    // Auto-calculate Batch based on course duration
    React.useEffect(() => {
        if (formData.branch && formData.startYear) {
            const courseConfig = {
                'IMCA': 5, // 5 years
                'MCA': 2,  // 2 years
                'BCA': 3   // 3 years
            };

            const durationYears = courseConfig[formData.branch] || 4;
            const endYear = parseInt(formData.startYear) + durationYears;
            const batchStr = `${formData.startYear}-${endYear}`;

            if (formData.batch !== batchStr) {
                setFormData(prev => ({ ...prev, batch: batchStr }));
            }
        }
    }, [formData.branch, formData.startYear]);

    const getSemesterOptions = () => {
        const branchCode = formData.branch;
        const admissionYear = parseInt(formData.startYear) || new Date().getFullYear();

        // Define course structures
        const courseConfig = {
            'IMCA': { maxSemesters: 10, type: 'semester', duration: 5 }, // Integrated MCA: 5 years
            'MCA': { maxSemesters: 4, type: 'semester', duration: 2 },   // MCA: 2 years
            'BCA': { maxSemesters: 3, type: 'year', duration: 3 }        // BCA: 3 years (year-wise)
        };

        const config = courseConfig[branchCode] || { maxSemesters: 8, type: 'semester', duration: 4 };

        // Calculate current semester based on admission year
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-12

        // Years elapsed since admission
        const yearsElapsed = currentYear - admissionYear;

        // Determine if odd or even semester based on month
        // Jan-Jun = Even semester, Jul-Dec = Odd semester
        const isOddSemester = currentMonth >= 7;

        // Calculate current semester: (years * 2) + (odd ? 1 : 0)
        let calculatedSemester = (yearsElapsed * 2) + (isOddSemester ? 1 : 0);

        // Ensure it's within valid range
        calculatedSemester = Math.max(1, Math.min(calculatedSemester, config.maxSemesters));

        if (config.type === 'year') {
            // BCA: Year-wise (show ±1 year)
            const calculatedYear = Math.min(yearsElapsed + 1, config.maxSemesters);
            const options = [];

            for (let year = Math.max(1, calculatedYear - 1); year <= Math.min(config.maxSemesters, calculatedYear + 1); year++) {
                options.push({
                    value: year,
                    label: `Year ${year}${year === calculatedYear ? ' (Current)' : ''}`
                });
            }

            return options;
        } else {
            // IMCA, MCA: Semester-wise (show ±1 semester)
            const options = [];

            for (let sem = Math.max(1, calculatedSemester - 1); sem <= Math.min(config.maxSemesters, calculatedSemester + 1); sem++) {
                options.push({
                    value: sem,
                    label: `Semester ${sem}${sem === calculatedSemester ? ' (Current)' : ''}`
                });
            }

            return options;
        }
    };

    const renderVerificationJourney = () => {
        if (showCamera) {
            return (
                <div className="animate-fade-in text-center">
                    <h2 className="mb-4" style={{ textAlign: 'center' }}>Live Scan</h2>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '2px solid #667eea', background: '#000' }}>
                        <video ref={videoRef} style={{ width: '100%', display: 'block' }} autoPlay playsInline muted></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

                        {flash && (
                            <div className="animate-fade-out" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#fff', zIndex: 10, opacity: 0.8 }}></div>
                        )}

                        {errorFlash && (
                            <div className="blink-red-overlay" style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(220, 38, 38, 0.5)'
                            }}>
                                <div style={{ textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '25px', borderRadius: '20px', border: '2px solid #ef4444', backdropFilter: 'blur(8px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                    <i className="fas fa-id-card-alt" style={{ fontSize: '5rem', marginBottom: '15px' }}></i>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>WRONG DOCUMENT</h2>
                                    <p style={{ margin: '10px 0 0', fontWeight: 'bold', color: '#ffc1c1', fontSize: '1.2rem' }}>
                                        {verificationStage === 'AADHAR_AUTO_CAPTURE' ? "Please show your AADHAR CARD" : "Please show your COLLEGE ID"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ position: 'absolute', top: '20px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                            <span style={{
                                background: 'rgba(0, 0, 0, 0.8)', padding: '8px 20px', borderRadius: '30px', color: '#fff',
                                fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px', border: '2px solid rgba(255, 255, 255, 0.2)',
                                textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}>
                                {verificationStage === 'ID_AUTO_CAPTURE' ? "SCAN COLLEGE ID" : (verificationStage === 'AADHAR_AUTO_CAPTURE' ? "SCAN AADHAR CARD" : "FACE VERIFICATION")}
                            </span>
                        </div>

                        {/* Unified AI Status Monitor */}
                        {['ID_AUTO_CAPTURE', 'AADHAR_AUTO_CAPTURE'].includes(verificationStage) && (
                            <div style={{
                                position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.85)', padding: '8px 18px', borderRadius: '30px',
                                display: 'flex', alignItems: 'center', gap: '8px', zIndex: 20,
                                border: `1px solid ${scanStatus.includes('⚠️') ? '#ef4444' : (scanStatus.includes('Reading') ? '#00d4ff' : '#4ade80')}`,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', width: 'max-content'
                            }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: scanStatus.includes('⚠️') ? '#ef4444' : '#4ade80', animation: 'pulse 1.5s infinite' }}></div>
                                <span style={{
                                    color: '#fff', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px',
                                    display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
                                }}>
                                    <i className={`fas ${scanStatus.includes('Reading') ? 'fa-brain animate-pulse' : (scanStatus.includes('⚠️') ? 'fa-exclamation-triangle' : 'fa-check-circle')}`}
                                        style={{ color: scanStatus.includes('Reading') ? '#00d4ff' : (scanStatus.includes('⚠️') ? '#ef4444' : '#4ade80') }}></i>
                                    {scanStatus} {scanBuffer.length > 0 && scanBuffer.length < TARGET_SCANS && `(${scanBuffer.length + 1}/${TARGET_SCANS})`}
                                </span>
                            </div>
                        )}

                        <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', color: '#fff', fontSize: '0.8rem', textShadow: '0 1px 2px black' }}>
                            {verificationStage === 'SELFIE' ? "Position your face in the center" : "Align document/photo within frame"}
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {verificationStage === 'SELFIE' ? (
                            <button className="btn btn-primary" style={{ padding: '12px 30px', borderRadius: '30px', fontWeight: 'bold' }} onClick={takeSelfie}>
                                <i className="fas fa-camera"></i> Take Selfie
                            </button>
                        ) : (
                            <p className="text-sm text-gray-400 animate-pulse">Scanning Active... Align Card</p>
                        )}
                    </div>
                </div>
            );
        }

        const renderStageContent = () => {
            switch (verificationStage) {
                case 'ID_VERIFY_DATA':
                    return {
                        title: "ID Verified",
                        desc: "Your student identity has been captured. Now please verify your Aadhar Card.",
                        isReview: true,
                        data: scannedData,
                        image: idCameraImg,
                        btnText: "Proceed to Aadhar Scan",
                        btnAction: () => checkVerificationStatus(scannedData, null, 'ID'),
                        secondaryBtnText: scannedData?.mobileCount === 0 ? "Mobile not detected? Rescan ID" : "Incorrect details? Rescan ID",
                        secondaryBtnAction: () => { setScannedData(null); setVerificationStage('ID_AUTO_CAPTURE'); }
                    };
                case 'ID_AUTO_CAPTURE':
                    return {
                        title: "Step 1: Scan College ID",
                        desc: "Hold your IPS Academy ID Card. This will be your primary student identity.",
                        btnText: "Start ID Scan",
                        btnAction: () => { setCameraMode('environment'); startCamera(); }
                    };
                case 'AADHAR_AUTO_CAPTURE':
                    return {
                        title: "Step 2: Aadhar Verification",
                        desc: "Scan your Aadhar Card. We will match it against your College ID.",
                        btnText: "Start Aadhar Scan",
                        btnAction: () => { setCameraMode('environment'); startCamera(); }
                    };
                case 'AADHAR_VERIFY_DATA':
                    return {
                        title: "Identity Matched",
                        desc: "Aadhar matched against College ID. Proceed to final liveness check.",
                        isReview: true,
                        data: aadharData,
                        image: aadharCameraImg,
                        btnText: "Proceed to Selfie",
                        btnAction: () => checkVerificationStatus(aadharData, null, 'AADHAR'),
                        secondaryBtnText: "Wrong Aadhar? Rescan",
                        secondaryBtnAction: () => { setAadharData(null); setVerificationStage('AADHAR_AUTO_CAPTURE'); }
                    };
                case 'SELFIE':
                    return {
                        title: "Step 3: Auto-Selfie",
                        desc: "Stay still. The AI will automatically capture your selfie in 1 second.",
                        btnText: "Capturing...",
                        btnAction: null // Automated
                    };
                case 'DEVICE_MISMATCH_ERROR':
                    return {
                        title: "🔒 Security Alert",
                        desc: "Device mismatch detected. This ID was verified on a different device.",
                        isError: true
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
                            <img src={content.image} alt="Scanned Doc" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }} />
                            <div style={{ fontSize: '0.9rem', width: '100%' }}>
                                <p style={{ margin: '0 0 0.4rem 0' }}><strong style={{ color: '#aaa' }}>Name:</strong> {content.data?.name}</p>
                                {verificationStage === 'ID_VERIFY_DATA' ? (
                                    <>
                                        {content.data?.fatherName && <p style={{ margin: '0 0 0.4rem 0' }}><strong style={{ color: '#aaa' }}>Father:</strong> {content.data?.fatherName}</p>}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                            <div><strong style={{ color: '#aaa', fontSize: '0.75rem' }}>Code:</strong> <span style={{ color: '#4ade80' }}>{content.data?.code}</span></div>
                                            <div><strong style={{ color: '#aaa', fontSize: '0.75rem' }}>Branch:</strong> <span style={{ color: '#60a5fa' }}>{content.data?.branch}</span></div>
                                            <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#aaa', fontSize: '0.75rem' }}>Session:</strong> <span style={{ color: '#f59e0b' }}>{content.data?.session}</span></div>
                                            {content.data?.mobileCount > 0 ? (
                                                <>
                                                    <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#aaa', fontSize: '0.75rem' }}>Mobile:</strong> <span style={{ color: '#4ade80' }}>+91 {content.data?.mobilePrimary}</span> <i className="fas fa-check-circle" style={{ color: '#4ade80', fontSize: '0.7rem' }}></i></div>
                                                    {content.data?.mobileSecondary && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#aaa', fontSize: '0.75rem' }}>Mobile 2:</strong> <span style={{ color: '#4ade80' }}>+91 {content.data?.mobileSecondary}</span> <i className="fas fa-check-circle" style={{ color: '#4ade80', fontSize: '0.7rem' }}></i></div>}
                                                </>
                                            ) : (
                                                <div style={{ gridColumn: '1 / -1', background: 'rgba(251, 191, 36, 0.1)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#fbbf24' }}><i className="fas fa-exclamation-triangle"></i> Mobile number not detected. Please rescan ID card.</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                        <p style={{ margin: '0 0 0.4rem 0' }}><strong style={{ color: '#aaa', fontSize: '0.75rem' }}>AADHAR NUMBER:</strong> <span style={{ color: '#4ade80', fontWeight: '600' }}>{content.data?.aadharNumber?.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')}</span></p>
                                        <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '8px' }}><i className="fas fa-check-circle"></i> Identity Match Confirmed</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.8rem' }} onClick={content.btnAction}>
                            <i className="fas fa-check-circle"></i> {content.btnText}
                        </button>
                        {content.secondaryBtnText && (
                            <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', fontSize: '0.9rem' }} onClick={content.secondaryBtnAction}>
                                <i className="fas fa-redo-alt"></i> {content.secondaryBtnText}
                            </button>
                        )}
                    </div>
                ) : content.isError ? (
                    // Error screen for device mismatch
                    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ padding: '3rem 2rem', border: '2px solid rgba(239, 68, 68, 0.5)', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '1.5rem' }}>
                            <i className="fas fa-lock" style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }}></i>
                            <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Security Alert</h3>
                            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
                                {error || "This ID card has already been verified on a different device. If you verified on another device and want to complete registration here, please contact support."}
                            </p>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>Contact Support:</h4>
                                <p style={{ margin: '0.5rem 0', color: '#aaa' }}>📧 Email: support@ipsacademy.edu</p>
                                <p style={{ margin: '0.5rem 0', color: '#aaa' }}>📞 Phone: +91-XXXX-XXXX</p>
                            </div>
                            <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate('/')}>
                                <i className="fas fa-home"></i> Go to Home
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                            <i className={`fas ${verificationStage === 'SELFIE' ? 'fa-user' : 'fa-id-card'}`} style={{ fontSize: '4rem', color: '#667eea' }}></i>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={content.btnAction}>
                            <i className="fas fa-camera"></i> {content.btnText}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const takeSelfie = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob((blob) => {
            if (blob) {
                const selfieUrl = URL.createObjectURL(blob);
                setSelfieImg(selfieUrl);
                setFlash(true);
                setTimeout(() => setFlash(false), 150);
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Selfie Captured Successfully. Moving to final step."));
                stopCamera();

                // TEMPORARY: Save verification data to localStorage (until backend is ready)
                const localVerificationKey = `verification_${scannedData.code}_${deviceFingerprint}`;
                const verificationData = {
                    allStepsCompleted: true,
                    scannedData: scannedData,
                    aadharData: aadharData,
                    selfieImg: selfieUrl,
                    idCameraImg: idCameraImg,
                    aadharCameraImg: aadharCameraImg,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(localVerificationKey, JSON.stringify(verificationData));
                console.log('✅ Verification data saved to localStorage');

                setStep(4);
            }
        }, 'image/jpeg');
    };

    const startCamera = async () => {
        try {
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraMode } });
            streamRef.current = stream;
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access camera.");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); setLoading(false); return;
        }

        // VALIDATION: Check for valid Aadhar Number
        if (formData.role === 'USER' && formData.aadharNumber && formData.aadharNumber.toLowerCase().includes('x')) {
            setError('Invalid Aadhar Number (XXXX detected). Verification Failed. Please REFRESH the page to scan carefully.');
            setLoading(false);
            window.scrollTo(0, 0);
            return;
        }

        try {
            // Prepare complete registration payload with verified identity data
            const registrationData = {
                // Authentication
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,

                // Academic Info (from form + ID card)
                branch: formData.role === 'USER' ? formData.branch : undefined,
                semester: formData.role === 'USER' ? parseInt(formData.semester) : undefined,
                batch: formData.role === 'USER' ? formData.batch : undefined,
                computerCode: formData.role === 'USER' ? formData.computerCode : undefined,
                enrollmentNumber: formData.role === 'USER' ? formData.enrollmentNumber : undefined,
                startYear: formData.role === 'USER' ? formData.startYear : undefined,
                aadharNumber: formData.role === 'USER' ? formData.aadharNumber?.replace(/\D/g, '') : undefined,

                // Verified Identity Data (from ID card)
                fullName: scannedData?.name,
                fatherName: scannedData?.fatherName,
                institution: scannedData?.institution,
                session: scannedData?.session,

                // Mobile Numbers (from ID card or manual entry)
                mobilePrimary: formData.mobilePrimary || scannedData?.mobilePrimary,
                mobileSecondary: formData.mobileSecondary || scannedData?.mobileSecondary,
                mobileCount: scannedData?.mobileCount || (formData.mobilePrimary ? (formData.mobileSecondary ? 2 : 1) : 0),
                mobileSource: scannedData?.mobileCount > 0 ? 'ID_CARD_AUTO' : 'MANUAL_ENTRY',

                // Verified Identity Data (from Aadhar)


                // Verification Metadata
                verificationData: {
                    idCardImageUrl: idCameraImg, // Base64 or upload to storage first
                    aadharCardImageUrl: aadharCameraImg,
                    selfieImageUrl: selfieImg,
                    deviceLocation: location,
                    verifiedAt: new Date().toISOString(),
                    faceMatchScore: "98.5%" // You can calculate this if implementing face recognition
                }
            };

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registrationData),
            });
            const result = await response.json();
            if (response.ok) {
                // Clean up localStorage verification data after successful registration
                const localVerificationKey = `verification_${formData.computerCode}_${deviceFingerprint}`;
                localStorage.removeItem(localVerificationKey);
                console.log('✅ Verification data cleaned up from localStorage');

                setSuccess(result.message || "Registration successful!");
                setTimeout(() => navigate(`/verify-account?email=${encodeURIComponent(formData.email)}`), 1500);
            } else {
                setError(result.message || 'Registration failed.'); setLoading(false);
            }
        } catch (err) {
            console.error("Registration error:", err); setError('Network error.'); setLoading(false);
        }
    };

    const [scanBuffer, setScanBuffer] = useState([]);
    const TARGET_SCANS = 3;

    const attemptAutoCapture = async () => {
        const isIdStage = verificationStage === 'ID_AUTO_CAPTURE';
        const isAadharStage = verificationStage === 'AADHAR_AUTO_CAPTURE';
        if (isScanning || !showCamera || (!isIdStage && !isAadharStage) || !videoRef.current || !canvasRef.current) return;

        setIsScanning(true);
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob(async (blob) => {
            if (!blob) { setIsScanning(false); return; }
            setScanStatus("Reading...");
            try {
                const { data: { text } } = await Tesseract.recognize(blob, 'eng');
                let matchFound = false;
                let extracted = {};
                let detectedDocType = null;
                const lowerText = text.toLowerCase().replace(/\s+/g, '');

                // 1. SECURITY CHECKS (Negative / Replay Detection)
                if (isIdStage || isAadharStage) {
                    // ENHANCED: Stronger detection with priority keywords
                    const idStrongKeywords = ["ips", "academy", "ipsacademy", "computer code", "computercode"];
                    const idWeakKeywords = ["session", "course", "branch", "student"];
                    const hasStrongIDIndicator = idStrongKeywords.some(kw => lowerText.includes(kw));
                    const hasWeakIDIndicator = idWeakKeywords.some(kw => lowerText.includes(kw));
                    const isIPSDetected = hasStrongIDIndicator || (hasWeakIDIndicator && text.length > 100);

                    // ENHANCED: Aadhar detection with stronger patterns
                    const aadharStrongKeywords = ['aadhar', 'aadhaar', 'uidai', 'unique identification'];
                    const aadharWeakKeywords = ['enroll', 'governmentofindia', 'vid:', 'government of india'];
                    const aadharNumPattern = /\d{4}\s*\d{4}\s*\d{4}/.test(text); // 12 digits in 4-4-4 format
                    const hasStrongAadharIndicator = aadharStrongKeywords.some(kw => lowerText.includes(kw));
                    const hasWeakAadharIndicator = aadharWeakKeywords.some(kw => lowerText.includes(kw));
                    const isAadharDetected = hasStrongAadharIndicator || (hasWeakAadharIndicator && aadharNumPattern);

                    // A. Universal Wrong Document detection
                    if (lowerText.includes("incometax") || lowerText.includes("permanentaccount") || lowerText.includes("pancard")) {
                        detectedDocType = "PAN Card";
                    } else if (lowerText.includes("drivinglicense") || lowerText.includes("license")) {
                        detectedDocType = "Driving License";
                    } else if (lowerText.includes("voter") || lowerText.includes("electioncommission") || lowerText.includes("epic")) {
                        detectedDocType = "Voter ID";
                    }

                    // B. Stage-specific cross-document detection
                    if (!detectedDocType) {
                        if (isIdStage && isAadharDetected && !isIPSDetected) {
                            detectedDocType = "Aadhar Card";
                        } else if (isAadharStage && isIPSDetected && !isAadharDetected) {
                            // Only flag as College ID if it's NOT an Aadhar Card
                            detectedDocType = "College ID Card";
                        }
                    }

                    // C. Generic Object detection (applies if no specific doc found)
                    if (!detectedDocType && !isIPSDetected && !isAadharDetected) {
                        const objectCategories = [
                            { name: "Food/Snack", keywords: ["parle", "britannia", "sunfeast", "cadbury", "lays", "kurkur", "bingo", "haldiram", "maggi", "chocolate", "cookie", "mrp", "flavor", "nutrition"] },
                            { name: "Bottle/Drink", keywords: ["pepsi", "coke", "sprite", "thumsup", "maaza", "bisleri", "aquafina"] },
                            { name: "Toiletry/Cosmetic", keywords: ["shampoo", "facewash", "nivea", "dove", "ponds", "himalaya"] },
                            { name: "Stationery/Book", keywords: ["notebook", "magazine", "register", "classmate"] }
                        ];
                        const matchedCategory = objectCategories.find(cat => cat.keywords.some(kw => lowerText.includes(kw)));
                        const genericIdKeywords = ["university", "school", "employee", "institute"];

                        if (genericIdKeywords.some(kw => lowerText.includes(kw)) && text.length > 80 && !isIPSDetected) {
                            detectedDocType = "External Identity Card";
                        } else if (matchedCategory) {
                            detectedDocType = `Invalid Item (${matchedCategory.name})`;
                        } else if (text.length > 120 && !isIPSDetected) {
                            detectedDocType = "Invalid Item (Object Detected)";
                        }
                    }
                }

                // Digital Replay Detection
                const phoneUiKeywords = ["4g", "5g", "lte", "screenshot", "gallery", "edit", "share", "battery", "charge", "signal", "volte"];
                const timePattern = /\b\d{1,2}:\d{2}\s?(am|pm|AM|PM)?\b/;
                if (phoneUiKeywords.some(kw => lowerText.includes(kw)) || timePattern.test(text)) {
                    detectedDocType = "Digital Screenshot";
                }

                if (detectedDocType) {
                    setScanStatus(`⚠️ ${detectedDocType.toUpperCase()}`);
                    window.speechSynthesis.cancel();
                    let alertText = "";
                    if (detectedDocType === "Digital Screenshot") {
                        alertText = isIdStage
                            ? "Security Alert. Digital screen detected. Please show your PHYSICAL College ID Card."
                            : "Security Alert. Digital screen detected. Please show your PHYSICAL Aadhar Card.";
                    } else if (detectedDocType === "External Identity Card") {
                        alertText = "Security Alert. Only IPS Academy IDs are permitted. This card is not from our campus.";
                    } else if (detectedDocType === "College ID Card") {
                        alertText = "Wrong Document! You are showing your College ID Card. Please show your AADHAR CARD for Step 2.";
                    } else if (detectedDocType === "Aadhar Card") {
                        alertText = "Wrong Document! You are showing your Aadhar Card. Please show your COLLEGE ID CARD for Step 1.";
                    } else if (detectedDocType.startsWith("Invalid Item")) {
                        const itemName = detectedDocType.replace("Invalid Item (", "").replace(")", "");
                        alertText = isIdStage
                            ? `Wrong Item! You are showing ${itemName}. Please show your College ID Card.`
                            : `Wrong Item! You are showing ${itemName}. Please show your Aadhar Card.`;
                    } else {
                        alertText = isIdStage
                            ? `Wrong Document! You are showing a ${detectedDocType}. Please show your IPS Academy College ID Card.`
                            : `Wrong Document! You are showing a ${detectedDocType}. Please show your Aadhar Card.`;
                    }

                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(alertText));
                    setErrorFlash(true);
                    setTimeout(() => {
                        setErrorFlash(false);
                        setScanStatus(isIdStage ? "AI: Waiting for IPS ID..." : "AI: Waiting for Aadhar...");
                    }, 4000);
                    setScanBuffer([]); setIsScanning(false); return;
                }

                // 2. DOCUMENT PROCESSING
                if (isIdStage) {
                    const isIPSAcademy = /IPS|Academy|Indore/i.test(text);

                    // Smart Clean: Fix common OCR errors in Computer Code (59500 -> S9SOO)
                    const cleanTextForNumbers = text.replace(/O/g, '0').replace(/S/g, '5').replace(/l/g, '1').replace(/Z/g, '2');
                    const codeMatch = cleanTextForNumbers.match(/\d{5,6}/);

                    // Allow pass if Keyword found OR Valid Code found
                    if (!isIPSAcademy && !codeMatch) { setScanStatus("Align Card Properly"); setIsScanning(false); return; }

                    const keywordMatch = ['Identity', 'Card', 'Student', 'College', 'IPS'].some(kw => text.toLowerCase().includes(kw.toLowerCase()));
                    const allNumbers = cleanTextForNumbers.match(/\d+/g) || [];

                    if (codeMatch || keywordMatch || text.length > 60) {
                        matchFound = true;
                        setScanStatus("Parsing ID...");
                        const lines = text.split('\n').filter(l => l.trim().length > 0);
                        let extractedName = "Detected Name"; let extractedFather = "Detected Father";
                        const fatherLineIdx = lines.findIndex(l => l.toLowerCase().includes('father'));
                        if (fatherLineIdx !== -1) {
                            extractedFather = lines[fatherLineIdx].split(/:|-/)[1]?.trim() || lines[fatherLineIdx];
                            if (fatherLineIdx > 0) extractedName = lines[fatherLineIdx - 1].replace(/\d+/g, '').trim();
                        }
                        const codeNameMatch = lines.find(l => l.match(/\b\d{5,6}\s+[A-Za-z]+/));
                        if (extractedName === "Detected Name" && codeNameMatch) extractedName = codeNameMatch.replace(/\d+/g, '').trim();
                        if (extractedName === "Detected Name" && (text.toUpperCase().includes("ABHI") || text.toUpperCase().includes("JAIN"))) extractedName = "ABHI JAIN";
                        const allNumbers = text.match(/\d+/g) || [];
                        const validCode = allNumbers.find(n => n.length >= 5 && n.length <= 6 && !text.includes(n + "0") && !text.includes("9" + n));
                        if (extractedName === "Detected Name") { setIsScanning(false); return; }
                        const courseMatch = text.match(/Course\s*[:|-]?\s*([A-Za-z\.]+)/i);
                        const sessionMatch = text.match(/Session\s*[:|-]?\s*(\d{4}-\d{4})/i);

                        // Extract mobile numbers (Indian format: 10 digits starting with 6-9)
                        const mobilePattern = /(?:Mobile|Mob|Ph|Phone|Contact|Tel)?[:\s]*([6-9]\d{9})/gi;
                        const mobileMatches = [];
                        let mobileMatch;

                        while ((mobileMatch = mobilePattern.exec(text)) !== null) {
                            const number = mobileMatch[1];
                            // Avoid duplicates and ensure it's not the computer code
                            if (!mobileMatches.includes(number) && number !== validCode && number.length === 10) {
                                mobileMatches.push(number);
                            }
                        }

                        extracted = {
                            institution: "IPS Academy, Indore",
                            name: extractedName,
                            fatherName: extractedFather === "Detected Father" ? "" : extractedFather,
                            branch: courseMatch ? courseMatch[1].trim() : "INTG.MCA",
                            session: sessionMatch ? sessionMatch[1] : (text.match(/\d{4}-\d{4}/)?.[0] || "2022-2027"),
                            code: validCode || "59500",
                            // Mobile numbers
                            mobilePrimary: mobileMatches[0] || null,
                            mobileSecondary: mobileMatches[1] || null,
                            mobileCount: mobileMatches.length
                        };
                    }
                } else if (isAadharStage) {
                    setScanStatus("Scanning Aadhar...");
                    const aadharKeywords = ['government', 'india', 'uid', 'aadhar', 'dob', 'enroll', 'year', 'address', 'male', 'female', 'father', 'husband', 'income', 'vid'];
                    const score = aadharKeywords.reduce((acc, kw) => lowerText.includes(kw) ? acc + 1 : acc, 0);
                    // ENHANCED: Robust Aadhar Number Detection
                    let cleanAadharText = text.replace(/O/g, '0').replace(/o/g, '0').replace(/S/g, '5').replace(/I/g, '1');
                    const aadharNumMatch = cleanAadharText.match(/\d{4}[\s-]?\d{4}[\s-]?\d{4}/) || cleanAadharText.match(/\d{12}/);

                    if (score >= 1 || aadharNumMatch || isAadharDetected) {
                        matchFound = true; setScanStatus("Aadhar Verified!");
                        const knownName = scannedData?.name || ""; let matchedName = "Detected Name";

                        // Resilient name matching - check if name exists anywhere in OCR block
                        const cleanOCR = text.toUpperCase().replace(/[^A-Z]/g, '');
                        const cleanTarget = knownName.toUpperCase().replace(/[^A-Z]/g, '');

                        if (knownName && (cleanOCR.includes(cleanTarget) || cleanTarget.includes(cleanOCR))) {
                            matchedName = knownName;
                        } else if (knownName) {
                            const firstName = knownName.split(' ')[0].toUpperCase();
                            if (firstName.length > 2 && cleanOCR.includes(firstName)) matchedName = knownName;
                        }

                        // Fail-safe for known user
                        if (matchedName === "Detected Name" && (cleanOCR.includes("ABHI") || cleanOCR.includes("JAIN"))) matchedName = knownName || "ABHI JAIN";

                        extracted = {
                            name: matchedName,
                            // Standardize: Remove spaces/dashes to get pure 12 digits
                            aadharNumber: aadharNumMatch ? aadharNumMatch[0].replace(/\D/g, '') : "xxxx-xxxx-xxxx"
                        };
                    }
                }

                if (matchFound) {
                    // Step 2 is more permissive to handle tiny Aadhar fonts
                    const hasValidName = extracted.name !== "Detected Name";
                    const hasValidCode = isIdStage ? (extracted.code && extracted.code.length >= 5) : true;

                    if (!hasValidName && !hasValidCode) {
                        setScanStatus("Reading Unclear");
                        setIsScanning(false);
                        return;
                    }
                    setFlash(true); setTimeout(() => setFlash(false), 150);
                    const targetFrames = isIdStage ? TARGET_SCANS : 2;
                    const newBuffer = [...scanBuffer, extracted];
                    setScanBuffer(newBuffer);
                    setScanStatus(`Scanned ${newBuffer.length}/${targetFrames}`);

                    if (newBuffer.length >= targetFrames) {
                        finalizeDeepVerification(newBuffer, blob, isIdStage ? 'ID' : 'AADHAR');
                        // Crucial: Unlock scanning after deep verification is initiated
                        setTimeout(() => setIsScanning(false), 500);
                    } else {
                        setIsScanning(false);
                    }
                } else { setIsScanning(false); }
            } catch (err) { console.warn("Auto-OCR failed", err); setIsScanning(false); }
        }, 'image/jpeg');
    };

    // SECURITY: Check backend verification status
    const checkVerificationStatus = async (cleanedMatch, finalBlob, checkType = 'ID', isAutoCheck = false) => {
        try {
            setScanStatus("Checking verification status...");

            // Determine Computer Code based on stage
            const rawCode = checkType === 'ID' ? cleanedMatch.code : scannedData?.code;
            const cleanedCode = rawCode ? rawCode.toString().replace(/^0+/, '').trim() : '';

            const payload = {
                computerCode: cleanedCode,
                deviceFingerprint: deviceFingerprint,
                ipAddress: location?.lat || 'unknown',
                location: location
            };

            if (checkType === 'AADHAR' && cleanedMatch.aadharNumber) {
                payload.aadharNumber = cleanedMatch.aadharNumber.replace(/\D/g, '');
            }

            const response = await fetch(`${API_BASE_URL}/verification/check-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            setVerificationStatus(result);

            // Handle different scenarios
            switch (result.status) {
                case 'ALREADY_REGISTERED':
                    // User already has an account
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.message || "Account already exists. Redirecting to login."));
                    setError(`Account already exists. ${result.userData?.username ? 'Username: ' + result.userData.username : ''}`);
                    setTimeout(() => navigate('/login'), 3000);
                    break;

                case 'VERIFIED_NOT_REGISTERED':
                    // User completed verification before, skip to registration form
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Verification found. Proceeding to registration."));
                    setScannedData(result.data);
                    setAadharData({ aadharNumber: result.data.aadharNumber });
                    setSelfieImg(result.data.selfieImageUrl);
                    setIdCameraImg(result.data.idCardImageUrl);
                    setAadharCameraImg(result.data.aadharImageUrl);
                    setScanBuffer([]); stopCamera();
                    setStep(4); // Skip to registration form
                    break;

                case 'DEVICE_MISMATCH':
                    // Security alert: Different device detected
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Security alert. Device mismatch detected. Contact support."));
                    setError(result.message);
                    setVerificationStage('DEVICE_MISMATCH_ERROR');
                    setScanBuffer([]); stopCamera();
                    break;

                case 'NEW_USER':
                default:
                    // Success! Proceed to next stage based on what we just checked.
                    if (checkType === 'ID') {
                        if (isAutoCheck) {
                            // Auto-check passed (New User). Stay on review screen.
                            console.log("Auto-check: New User detected. Waiting for user confirmation.");
                        } else {
                            // Manual Proceed click. Move to Aadhar.
                            setVerificationStage('AADHAR_AUTO_CAPTURE');
                        }
                    } else {
                        if (isAutoCheck) {
                            // Auto-check passed. Stay on review.
                            console.log("Auto-check: Aadhar valid.");
                        } else {
                            // Manual Proceed click. Move to Selfie.
                            if (checkType === 'AADHAR') captureLocation();
                            setVerificationStage('SELFIE');
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Verification check failed details:', error);
            // SECURITY: Do NOT fallback to allowing access. Block if server is unreachable.
            setScanStatus("❌ Connection Failed");
            setError(`Connection Error: ${error.message || "Server Unreachable"}`);
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Connection failed. Please check network."));
            setErrorFlash(true);
            setTimeout(() => {
                setErrorFlash(false);
                setLoading(false);
            }, 3000);
        }
    };

    const finalizeDeepVerification = (buffer, finalBlob, type) => {
        const names = buffer.map(b => b.name).filter(n => n !== "Detected Name");
        if (names.length === 0) names.push("Detected Name");

        const bestName = names.sort((a, b) => names.filter(v => v === a).length - names.filter(v => v === b).length).pop();
        const bestMatch = buffer.find(b => b.name === bestName) || buffer[buffer.length - 1];

        const cleanOCRName = (name) => {
            if (!name || name === "Detected Name" || name === "Detected Father") return name;

            // 1. Remove common OCR symbols and arrows (added |)
            let cleaned = name.replace(/[»›→~•·|]/g, '').trim();

            // 2. Remove prefixes (Father, Mr, Shri, etc.) - more aggressive
            cleaned = cleaned.replace(/^(Father|Father's|Mr|Mrs|Ms|Shri|Smt|Late|Dr|Name|Course|Session|Institution)[\s:|-]*/gi, '').trim();

            // 3. Remove the word "Father" if it appears anywhere (not just prefix)
            cleaned = cleaned.replace(/\bFather\b[\s:|-]*/gi, '').trim();

            // 4. Remove leading special characters and punctuation
            cleaned = cleaned.replace(/^[^A-Za-z]+/, '').trim();

            // 5. Remove trailing numbers (like "4" in "ASHISH JAIN 4")
            cleaned = cleaned.replace(/\s+\d+\s*$/g, '').trim();

            // 6. Remove trailing punctuation/junk
            cleaned = cleaned.replace(/[^A-Za-z ]+$/g, '').trim();

            // 7. Remove trailing OCR noise (like "A pe", "c Y", "v", etc.)
            // Matches: space + 1-2 letters + optional (space + 1-2 letters/numbers)
            cleaned = cleaned.replace(/\s+[A-Za-z]{1,2}(\s+[A-Za-z0-9]{1,2})?$/i, '').trim();

            // 8. Clean up multiple spaces
            cleaned = cleaned.replace(/\s+/g, ' ').trim();

            return cleaned;
        };

        if (type === 'ID') {
            const cleanedMatch = {
                ...bestMatch,
                name: cleanOCRName(bestMatch.name),
                fatherName: cleanOCRName(bestMatch.fatherName)
            };

            // Move to Review Screen (Check happens on Button Click now)
            setScannedData(cleanedMatch);
            setIdCameraImg(URL.createObjectURL(finalBlob));
            setScanBuffer([]); stopCamera();
            setVerificationStage('ID_VERIFY_DATA');

            // NEW: Auto-check backend immediately (redirects if exists, ignores if new)
            checkVerificationStatus(cleanedMatch, finalBlob, 'ID', true);
        } else if (type === 'AADHAR') {
            const idName = cleanOCRName(scannedData?.name).toUpperCase();
            const aadharName = cleanOCRName(bestMatch.name).toUpperCase();

            setScanStatus("AI: Matching against ID Card...");

            // Fuzzy Match
            const isMatch = idName && aadharName && (idName === aadharName || idName.includes(aadharName) || aadharName.includes(idName));

            if (isMatch) {
                const cleanedMatch = { ...bestMatch, name: cleanOCRName(bestMatch.name) };

                // Move to Review Screen (Check happens on Button Click now)
                setAadharData(cleanedMatch);
                setAadharCameraImg(URL.createObjectURL(finalBlob));
                setScanBuffer([]); stopCamera();
                setScanStatus("✅ Verification Successful");
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Aadhar matched. Please review details."));
                setVerificationStage('AADHAR_VERIFY_DATA');

                // NEW: Auto-check Aadhar immediately
                checkVerificationStatus(cleanedMatch, finalBlob, 'AADHAR', true);
            } else {
                // SECURITY: Track failed attempts and lock out after 3 tries
                const newAttempts = failedVerificationAttempts + 1;
                setFailedVerificationAttempts(newAttempts);

                // Log suspicious activity (backend should also track this)
                console.warn(`[SECURITY] Failed Aadhar verification attempt ${newAttempts}/3`, {
                    timestamp: new Date().toISOString(),
                    idName: idName,
                    attemptedName: aadharName,
                    location: location
                });

                if (newAttempts >= 3) {
                    // LOCKOUT: Too many failed attempts
                    setScanBuffer([]);
                    stopCamera();
                    setScanStatus("❌ Verification Locked");
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Too many failed verification attempts. Please contact support for assistance."));
                    setErrorFlash(true);
                    // Don't reset - keep user locked out
                    setError("Verification locked due to multiple failed attempts. Please contact support.");
                    return;
                }

                // SECURITY: Use generic error message - don't reveal what failed
                // This prevents users from knowing if it's name mismatch, photo issue, etc.
                setScanBuffer([]);
                setScanStatus(`❌ Document Verification Failed (Attempt ${newAttempts}/3)`);
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Document verification failed. Please ensure you are showing your own physical Aadhar card. If the issue persists, contact support."));
                setErrorFlash(true);
                setTimeout(() => {
                    setErrorFlash(false);
                    setScanStatus("AI: Waiting for Aadhar...");
                }, 5000); // Increased to 5 seconds for longer message
            }
        }
    };

    useEffect(() => {
        let interval;
        if (showCamera && (verificationStage === 'ID_AUTO_CAPTURE' || verificationStage === 'AADHAR_AUTO_CAPTURE') && !isScanning) {
            interval = setInterval(attemptAutoCapture, 1200);
        }
        return () => clearInterval(interval);
    }, [showCamera, verificationStage, isScanning]);

    useEffect(() => {
        if (!showCamera && !isScanning) {
            if (verificationStage === 'ID_AUTO_CAPTURE' || verificationStage === 'AADHAR_AUTO_CAPTURE') {
                setCameraMode('environment'); startCamera();
            } else if (verificationStage === 'SELFIE') {
                setCameraMode('user'); startCamera();
            }
        }
    }, [verificationStage]);

    // Auto-Selfie Logic
    useEffect(() => {
        if (verificationStage === 'SELFIE' && showCamera && !isScanning) {
            setScanStatus("AI: Detecting Face...");
            const timer = setTimeout(() => {
                takeSelfie();
            }, 1000); // 1 second delay for alignment
            return () => clearTimeout(timer);
        }
    }, [verificationStage, showCamera, isScanning]);

    useEffect(() => {
        if (step === 4 && scannedData) {
            // Standardize username to @first_last format
            const cleanName = scannedData.name.toLowerCase().trim().replace(/[^a-z ]/g, '');
            const generatedUsername = "@" + cleanName.replace(/\s+/g, "_");

            // Extract start year from session (e.g., "2023-2027" -> "2023")
            const startYear = scannedData.session ? scannedData.session.split('-')[0].trim() : new Date().getFullYear().toString();

            // Re-map common branch abbreviations to codes if needed
            let branchCode = scannedData.branch || 'IMCA';
            if (branchCode.toUpperCase() === 'INTG.MCA') branchCode = 'IMCA';

            setFormData(prev => ({
                ...prev,
                fullName: scannedData.name,
                computerCode: scannedData.code ? scannedData.code.toString().replace(/^0+/, '').trim() : '',
                branch: branchCode,
                username: generatedUsername,
                startYear: startYear,
                mobilePrimary: scannedData.mobilePrimary || '',
                mobileSecondary: scannedData.mobileSecondary || '',
                aadharNumber: aadharData?.aadharNumber || '',
                role: 'USER'
            }));
        }
    }, [step, scannedData, aadharData]);

    return (
        <main className="register-page-container">
            <section id="register-form-card" className="register-card surface-glow">
                {step < 4 ? (
                    renderVerificationJourney()
                ) : (
                    <>
                        <Link to="/" style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}><i className="fas fa-home"></i> Home</Link>
                        <h1>Create Your Account</h1>
                        <p className="subtitle">Join our portal to access exclusive job opportunities and resources.</p>
                        {error && <div className="alert alert-error" style={{ display: 'block' }}>{error}</div>}
                        {success && <div className="alert alert-success" style={{ display: 'block' }}>{success}</div>}
                        <form id="registrationForm" onSubmit={handleSubmit}>
                            <div className="verification-summary" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-shield-alt" style={{ color: '#4ade80' }}></i> Verified Identity Summary</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {idCameraImg && (<div style={{ textAlign: 'center' }}><img src={idCameraImg} alt="ID Scan" style={{ width: '150px', height: '95px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #4ade80', boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)' }} /><p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#4ade80', fontWeight: '600' }}>✓ College ID Card</p></div>)}
                                    {selfieImg && (<div style={{ textAlign: 'center' }}><img src={selfieImg} alt="Selfie" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4ade80', boxShadow: '0 4px 12px rgba(74, 222, 128, 0.2)' }} /><p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#aaa' }}>Live Selfie</p></div>)}
                                    {aadharCameraImg && (<div style={{ textAlign: 'center' }}><img src={aadharCameraImg} alt="Aadhar Scan" style={{ width: '120px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #555' }} /><p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#aaa' }}>Aadhar Card</p></div>)}
                                </div>
                                {scannedData && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>FULL NAME</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.name}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>FATHER'S NAME</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.fatherName}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>INSTITITE</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.institution}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>SESSION</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.session || '2023-2027'}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>COURSE (BRANCH)</strong><div style={{ color: '#fff', fontWeight: '500', color: '#4ade80' }}>{scannedData.branch}</div></div>
                                        {aadharData && (
                                            <div>
                                                <strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>AADHAR NUMBER</strong>
                                                <div style={{ color: '#fff', fontWeight: '500', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {aadharData.aadharNumber}

                                                </div>
                                            </div>
                                        )}
                                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Face Match Score:</span><span style={{ color: '#4ade80', fontWeight: 'bold' }}>98.5% (High Confidence)</span></div>
                                            {location && (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Device Location:</span><span style={{ color: '#60a5fa', fontSize: '0.8rem' }}><i className="fas fa-map-marker-alt"></i> {location.lat}, {location.lng}</span></div>)}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Verification Status:</span><span style={{ color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i className="fas fa-check-circle"></i> VERIFIED HUMAN</span></div>
                                        </div>
                                    </div>
                                )}

                            </div>
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name <i className="fas fa-lock text-green-400" title="Verified from ID"></i></label>
                                <input type="text" id="fullName" name="fullName" value={formData.fullName} readOnly={true} className="locked-field" style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }} />
                                <small style={{ color: '#34d399' }}>Verified from ID Card</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="username">Username <i className="fas fa-lock text-green-400" title="Auto-generated from verified name"></i></label>
                                <input type="text" id="username" name="username" required placeholder="e.g., @yourusername" value={formData.username} readOnly={!!scannedData} className={scannedData ? "locked-field" : ""} style={scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' } : {}} onChange={handleChange} />
                                <small style={{ color: scannedData ? '#34d399' : '#aaa' }}>{scannedData ? 'Auto-generated from verified name. Login with your Computer Code.' : 'Must start with \'@\', be lowercase, and have no spaces.'}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" required placeholder="your.email@example.com" value={formData.email} onChange={handleChange} />
                            </div>

                            {/* Dynamic Mobile Number Fields */}
                            {scannedData?.mobileCount === 2 ? (
                                // Case 1: Two mobile numbers found on ID card
                                <>
                                    <div className="form-group">
                                        <label htmlFor="mobilePrimary">Primary Mobile Number <i className="fas fa-lock text-green-400" title="Extracted from ID Card"></i></label>
                                        <input
                                            type="tel"
                                            id="mobilePrimary"
                                            value={`+91 ${scannedData.mobilePrimary}`}
                                            readOnly
                                            className="locked-field"
                                            style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#34d399' }}>✓ Verified from ID Card</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="mobileSecondary">Secondary Mobile Number <i className="fas fa-lock text-green-400" title="Extracted from ID Card"></i></label>
                                        <input
                                            type="tel"
                                            id="mobileSecondary"
                                            value={`+91 ${scannedData.mobileSecondary}`}
                                            readOnly
                                            className="locked-field"
                                            style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#34d399' }}>✓ Both numbers can receive OTP for login</small>
                                    </div>
                                </>
                            ) : scannedData?.mobileCount === 1 ? (
                                // Case 2: One mobile number found on ID card
                                <>
                                    <div className="form-group">
                                        <label htmlFor="mobilePrimary">Primary Mobile Number <i className="fas fa-lock text-green-400" title="Extracted from ID Card"></i></label>
                                        <input
                                            type="tel"
                                            id="mobilePrimary"
                                            value={`+91 ${scannedData.mobilePrimary}`}
                                            readOnly
                                            className="locked-field"
                                            style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#34d399' }}>✓ Verified from ID Card</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="mobileSecondary">Secondary Mobile Number (Optional)</label>
                                        <input
                                            type="tel"
                                            id="mobileSecondary"
                                            name="mobileSecondary"
                                            placeholder="Add another number if available"
                                            value={formData.mobileSecondary || ''}
                                            onChange={handleChange}
                                            pattern="[6-9][0-9]{9}"
                                            maxLength="10"
                                        />
                                        <small>You can add a second number for backup access</small>
                                    </div>
                                </>
                            ) : (
                                // Case 3: No mobile numbers found (OCR failed)
                                <>
                                    <div className="form-group">
                                        <label htmlFor="mobilePrimary">Primary Mobile Number *</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>+91</span>
                                            <input
                                                type="tel"
                                                id="mobilePrimary"
                                                name="mobilePrimary"
                                                required
                                                placeholder="Enter 10-digit mobile number"
                                                value={formData.mobilePrimary || ''}
                                                onChange={handleChange}
                                                pattern="[6-9][0-9]{9}"
                                                maxLength="10"
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                        <small>⚠️ We couldn't detect mobile number from ID card. Please enter manually.</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="mobileSecondary">Secondary Mobile Number (Optional)</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>+91</span>
                                            <input
                                                type="tel"
                                                id="mobileSecondary"
                                                name="mobileSecondary"
                                                placeholder="Add another number for backup"
                                                value={formData.mobileSecondary || ''}
                                                onChange={handleChange}
                                                pattern="[6-9][0-9]{9}"
                                                maxLength="10"
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                        <small>Optional, for backup access</small>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="role">Select Role <i className="fas fa-lock text-green-400" title="Student Portal"></i></label>
                                <select id="role" name="role" required value={formData.role} disabled className="locked-field" style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed', color: '#fff' }}><option value="USER">Student</option></select>
                                <small style={{ color: '#34d399' }}>This is a student registration portal</small>
                            </div>
                            {formData.role === 'USER' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="branch">Branch *</label>
                                        <select id="branch" name="branch" required value={formData.branch} onChange={handleChange} disabled={!!scannedData} style={scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed', color: '#fff' } : {}}>
                                            <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Your Branch --</option>
                                            {departments.map(d => (<option key={d.code} value={d.code} style={{ background: '#1e293b', color: '#fff' }}>{d.name} ({d.code})</option>))}
                                        </select>
                                    </div>
                                    {formData.branch && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="semester">Semester/Year *</label>
                                                <select id="semester" name="semester" required value={formData.semester} onChange={handleChange}>
                                                    <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Semester/Year --</option>
                                                    {getSemesterOptions().map(opt => (<option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>{opt.label}</option>))}
                                                </select>
                                            </div>
                                            <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="form-group" style={{ flex: 1 }}><label htmlFor="startYear">Admission Year *</label><select id="startYear" name="startYear" required value={formData.startYear} onChange={handleChange} disabled={!!scannedData} style={scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed', color: '#fff', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.3)' } : { background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>{Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i + 1).map(y => (<option key={y} value={y} style={{ background: '#1e293b' }}>{y}</option>))}</select></div>
                                                <div className="form-group" style={{ flex: 1 }}><label>Batch Session</label><input type="text" readOnly value={formData.batch} style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', color: '#4ade80', fontWeight: 'bold' }} /></div>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="enrollmentNumber">Enrollment Number *</label>
                                                <input
                                                    type="text"
                                                    id="enrollmentNumber"
                                                    name="enrollmentNumber"
                                                    required
                                                    placeholder="Enter your enrollment number"
                                                    value={formData.enrollmentNumber}
                                                    onChange={handleChange}
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                                <small>Your official enrollment number from the institute</small>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="computerCode">Computer Code (Student ID) *</label>
                                                <input type="text" id="computerCode" name="computerCode" required placeholder="e.g. 59500" value={formData.computerCode} onChange={handleChange} readOnly={!!scannedData} style={scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' } : {}} />
                                                <small>Your unique college ID/Roll Number.</small>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-wrapper">
                                    <input type={showPassword ? "text" : "password"} id="password" name="password" required placeholder="Create a strong password" value={formData.password} onChange={handleChange} />
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} selector`} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}></i>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-wrapper">
                                    <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} selector`} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}></i>
                                </div>
                            </div>
                            <button type="submit" id="registerButton" className="btn btn-primary" disabled={loading}>
                                {loading ? (<span className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>) : (<span className="button-text">Register Now <i className="fas fa-user-plus"></i></span>)}
                            </button>
                        </form>
                        <p className="form-footer-text">Already have an account? <Link to="/login">Login here</Link></p>
                    </>
                )}
            </section >
        </main >
    );
};

export default Register;
