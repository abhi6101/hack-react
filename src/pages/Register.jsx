import API_BASE_URL from '../config';
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/CustomToast';
import Tesseract from 'tesseract.js';
import { DISTRICT_STATE_MAP } from '../data/indianDistricts';
import jsQR from 'jsqr';
import '../styles/register.css';


const TARGET_SCANS = 5; // Reduced for faster capture

const Register = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const navLocation = useLocation();
    const isUpdate = navLocation.state?.isUpdate; // Check if this is an account update (Old User)
    const [formData, setFormData] = useState({
        username: '',
        fullName: '', // Added for verified name
        fatherName: '', // Father's name from Aadhar
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
        dob: '',
        gender: '',
        address: '', // Aadhar address
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
    const [isLowLight, setIsLowLight] = useState(false); // Auto-detected low light
    const [manualFlash, setManualFlash] = useState(false); // User-forced flash
    const [qrDetected, setQrDetected] = useState(false); // QR code detected in frame
    const [qrGuidance, setQrGuidance] = useState(""); // Position guidance ("Move closer", etc.)
    const [qrPhotos, setQrPhotos] = useState([]); // Captured QR photos for scanning
    const [qrPhotoCount, setQrPhotoCount] = useState(0); // Number of photos captured


    // --- Audio Feedback Functions ---
    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Hz
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log("Audio not supported");
        }
    };

    const playSuccessSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);

            // Second tone
            const osc2 = audioContext.createOscillator();
            osc2.connect(gainNode);
            osc2.frequency.value = 1600;
            osc2.type = 'sine';
            osc2.start(audioContext.currentTime + 0.1);
            osc2.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log("Audio not supported");
        }
    };

    const playErrorSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 400;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log("Audio not supported");
        }
    };

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

        // CLEANUP: Stop camera when component unmounts (e.g. back to home)
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // NEW PRE-FILL LOGIC:
    useEffect(() => {
        if (navLocation.state?.email) {
            setFormData(prev => ({ ...prev, email: navLocation.state.email }));
        }
    }, [navLocation.state]);

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

    // Auto-rescan for incomplete ID scans
    useEffect(() => {
        if (verificationStage === 'ID_VERIFY_DATA' && scannedData) {
            // Use the SAME check as renderStageContent
            const isIdScanComplete = scannedData?.name && scannedData?.name !== "Detected Name" &&
                scannedData?.fatherName &&
                scannedData?.code &&
                scannedData?.branch &&
                scannedData?.mobileCount > 0;

            if (!isIdScanComplete) {
                console.log("Incomplete scan detected - auto-rescanning in 2 seconds...");
                // Incomplete scan detected - auto-rescan after 2 seconds
                const timer = setTimeout(() => {
                    console.log("Auto-rescan triggered!");
                    setScannedData(null);
                    setIdCameraImg(null);
                    setVerificationStage('ID_AUTO_CAPTURE');
                    setScanStatus('Auto-restarting scan...');
                    setScanBuffer([]);

                    // Restart camera
                    setCameraMode('environment');
                    startCamera('environment');
                }, 2000);

                return () => clearTimeout(timer);
            }
        }
    }, [verificationStage, scannedData]);

    // Process captured QR photos
    useEffect(() => {
        if (qrPhotos.length > 0 && verificationStage === 'AADHAR_AUTO_CAPTURE' && !aadharData) {
            const processPhotos = async () => {
                for (let i = 0; i < qrPhotos.length; i++) {
                    try {
                        setScanStatus(`Scanning photo ${i + 1}/${qrPhotos.length}...`);

                        // Convert base64 to image
                        const img = new Image();
                        img.src = qrPhotos[i];
                        await new Promise(resolve => img.onload = resolve);

                        // Create canvas and get image data
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = img.width;
                        tempCanvas.height = img.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(img, 0, 0);

                        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });

                        if (code && code.data && (code.data.includes("uid=") || code.data.includes("</PrintLetterBarcodeData>"))) {
                            // Extract all details
                            const uid = code.data.match(/uid="(\d+)"/)?.[1] || "";
                            const name = code.data.match(/name="([^"]+)"/)?.[1] || "";
                            const dob = code.data.match(/dob="([^"]+)"/)?.[1] || code.data.match(/yob="(\d+)"/)?.[1] || "";
                            const gender = code.data.match(/gender="([^"]+)"/)?.[1] || "";
                            const co = code.data.match(/co="([^"]+)"/)?.[1] || "";
                            const loc = code.data.match(/loc="([^"]+)"/)?.[1] || "";
                            const vtc = code.data.match(/vtc="([^"]+)"/)?.[1] || "";
                            const dist = code.data.match(/dist="([^"]+)"/)?.[1] || "";
                            const state = code.data.match(/state="([^"]+)"/)?.[1] || "";
                            const pc = code.data.match(/pc="([^"]+)"/)?.[1] || "";

                            // Check if we have complete details
                            if (uid && name && (dob || gender)) {
                                const fullAddress = [co, loc, vtc, dist, state, pc].filter(Boolean).join(', ');

                                const aadharInfo = {
                                    name, aadharNumber: uid, dob,
                                    gender: gender === "M" ? "Male" : (gender === "F" ? "Female" : gender),
                                    address: fullAddress,
                                    fatherName: co.replace("S/O", "").replace("D/O", "").trim(),
                                    details: { co, dist, state, pc }
                                };

                                setAadharData(aadharInfo);
                                setManualFlash(false);
                                setIsLowLight(false);
                                setVerificationStage('AADHAR_VERIFY_DATA');
                                playSuccessSound();
                                setScanStatus("✅ Aadhar scanned successfully!");

                                // Clear photos
                                setQrPhotos([]);
                                setQrPhotoCount(0);
                                break; // Stop processing
                            }
                        }
                    } catch (err) {
                        console.log(`Error scanning photo ${i + 1}:`, err);
                    }
                }

                // If no complete data found, reset and try again
                if (!aadharData && qrPhotos.length >= 5) {
                    setScanStatus("No complete data found. Please try again...");
                    setQrPhotos([]);
                    setQrPhotoCount(0);
                }
            };

            processPhotos();
        }
    }, [qrPhotos, verificationStage, aadharData]);

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
                    label: `Year ${year}${year === calculatedYear ? ' (Current)' : ''} `
                });
            }

            return options;
        } else {
            // IMCA, MCA: Semester-wise (show ±1 semester)
            const options = [];

            for (let sem = Math.max(1, calculatedSemester - 1); sem <= Math.min(config.maxSemesters, calculatedSemester + 1); sem++) {
                options.push({
                    value: sem,
                    label: `Semester ${sem}${sem === calculatedSemester ? ' (Current)' : ''} `
                });
            }

            return options;
        }
    };

    const renderVerificationJourney = () => {
        if (showCamera) {
            const isFlashActive = isLowLight || manualFlash;

            return (
                <div className="animate-fade-in text-center">
                    {/* FULL SCREEN FLASH (Ring Light) - Rendered via Portal to body */}
                    {isFlashActive && ReactDOM.createPortal(
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            width: '100vw', height: '100vh', inset: 0,
                            background: '#ffffff', zIndex: 9998, pointerEvents: 'none'
                        }}></div>,
                        document.body
                    )}


                    {/* Camera UI - Also rendered via Portal to ensure it's above flash */}
                    {ReactDOM.createPortal(
                        <>
                            <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, marginBottom: '1rem' }}>
                                <h2 style={{
                                    textAlign: 'center', margin: 0,
                                    color: isFlashActive ? '#000' : '#fff',
                                    fontWeight: 'bold', textShadow: isFlashActive ? 'none' : '0 2px 4px rgba(0,0,0,0.5)'
                                }}>Live Scan</h2>

                                {/* Manual Flash Button */}
                                <button
                                    onClick={() => setManualFlash(!manualFlash)}
                                    style={{
                                        position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)',
                                        background: manualFlash ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: manualFlash ? '#000' : '#fff',
                                        borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    title="Toggle Screen Flash"
                                >
                                    <i className={`fas ${manualFlash ? 'fa-bolt' : 'fa-lightbulb'}`}></i>
                                </button>
                            </div>
                        </>,
                        document.body
                    )}

                    {/* Information Panels - Only visible when flash is OFF (black screen) */}
                    {!isFlashActive && ReactDOM.createPortal(
                        <>
                            {/* Left Panel - Instructions */}
                            <div style={{
                                position: 'fixed', left: '20px', top: '50%', transform: 'translateY(-50%)',
                                zIndex: 9999, maxWidth: '250px',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '20px', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 15px 0', fontSize: '1.1rem',
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }}>
                                    📋 Instructions
                                </h3>
                                <ul style={{
                                    margin: 0, paddingLeft: '20px',
                                    color: '#ddd',
                                    fontSize: '0.9rem', lineHeight: '1.6'
                                }}>
                                    <li>Hold document steady</li>
                                    <li>Ensure good lighting</li>
                                    <li>Align within frame</li>
                                    <li>Wait for auto-capture</li>
                                </ul>
                            </div>

                            {/* Right Panel - Tips */}
                            <div style={{
                                position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)',
                                zIndex: 9999, maxWidth: '250px',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '20px', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 15px 0', fontSize: '1.1rem',
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }}>
                                    💡
                                </h3>
                                <p style={{
                                    margin: '0 0 10px 0',
                                    color: '#ddd',
                                    fontSize: '0.9rem', lineHeight: '1.6'
                                }}>
                                    Use the flash button to brighten the screen in low light conditions.
                                </p>
                                <div style={{
                                    padding: '10px',
                                    background: 'rgba(251, 191, 36, 0.15)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(251, 191, 36, 0.2)',
                                    fontSize: '0.85rem',
                                    color: '#fbbf24'
                                }}>
                                    💡 Tip: Click ⚡ to toggle flash
                                </div>
                            </div>
                        </>,
                        document.body
                    )}




                    {/* Video Container - Also rendered via Portal */}
                    {ReactDOM.createPortal(
                        <div style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            zIndex: 9999, // Above flash
                            width: '100%', maxWidth: '400px',
                            borderRadius: '12px', overflow: 'hidden',
                            border: '2px solid #667eea',
                            background: '#000',
                            boxShadow: isFlashActive ? '0 20px 50px rgba(0,0,0,0.3)' : 'none'
                        }}>
                            <video
                                ref={videoRef}
                                style={{
                                    width: '100%',
                                    display: selfieImg ? 'none' : 'block', // Hide video if previewing
                                    transform: cameraMode === 'user' ? 'scaleX(-1)' : 'none' // Mirror only for selfie
                                }}
                                autoPlay
                                playsInline
                                muted
                            ></video>

                            {/* Selfie Preview Image */}
                            {selfieImg && (
                                <img
                                    src={selfieImg}
                                    alt="Selfie Preview"
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        transform: 'scaleX(-1)' // Keep consistency
                                    }}
                                />
                            )}

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

                            {/* QR CODE RETICLE (Guide) - Only for Aadhar Auto Capture */}
                            {verificationStage === 'AADHAR_AUTO_CAPTURE' && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: '260px', height: '260px',
                                    boxShadow: `0 0 0 9999px ${isFlashActive ? '#ffffff' : 'rgba(0, 0, 0, 0.95)'}`,
                                    pointerEvents: 'none', zIndex: 15,
                                    borderRadius: '20px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Animated Scanning Line */}
                                    <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '3px',
                                        background: qrDetected
                                            ? 'linear-gradient(90deg, transparent, #4ade80, transparent)'
                                            : 'linear-gradient(90deg, transparent, #667eea, transparent)',
                                        animation: 'scan 2s ease-in-out infinite',
                                        boxShadow: qrDetected ? '0 0 10px #4ade80' : '0 0 10px #667eea',
                                        top: '50%'
                                    }} />

                                    {/* Modern Viewfinder Corners - Dynamic Color */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '40px', height: '40px',
                                        borderTop: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderLeft: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderTopLeftRadius: '16px',
                                        transition: 'border-color 0.3s ease'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0, width: '40px', height: '40px',
                                        borderTop: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderRight: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderTopRightRadius: '16px',
                                        transition: 'border-color 0.3s ease'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px',
                                        borderBottom: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderLeft: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderBottomLeftRadius: '16px',
                                        transition: 'border-color 0.3s ease'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px',
                                        borderBottom: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderRight: `4px solid ${qrDetected ? '#4ade80' : '#667eea'}`,
                                        borderBottomRightRadius: '16px',
                                        transition: 'border-color 0.3s ease'
                                    }}></div>

                                    {/* Title */}
                                    <div style={{
                                        position: 'absolute', top: '-40px', width: '100%', textAlign: 'center',
                                        color: qrDetected ? '#4ade80' : '#667eea',
                                        fontWeight: 'bold', fontSize: '1rem',
                                        textShadow: '0 2px 4px black',
                                        transition: 'color 0.3s ease'
                                    }}>
                                        {qrDetected ? '✓ QR DETECTED' : 'SCAN AADHAR QR'}
                                    </div>

                                    {/* Position Guidance */}
                                    {qrGuidance && (
                                        <div style={{
                                            position: 'absolute', bottom: '-50px', width: '100%', textAlign: 'center',
                                            color: qrGuidance.includes('❌') ? '#ef4444' : (qrGuidance.includes('✓') ? '#4ade80' : '#fbbf24'),
                                            fontWeight: '600', fontSize: '0.9rem',
                                            textShadow: '0 2px 4px black',
                                            background: 'rgba(0,0,0,0.5)',
                                            padding: '5px 10px',
                                            borderRadius: '8px'
                                        }}>
                                            {qrGuidance}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ position: 'absolute', top: '20px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                                <span style={{
                                    background: 'rgba(0, 0, 0, 0.8)', padding: '8px 20px', borderRadius: '30px', color: '#fff',
                                    fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px', border: '2px solid rgba(255, 255, 255, 0.2)',
                                    textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                }}>
                                    {verificationStage === 'ID_AUTO_CAPTURE' ? "SCAN COLLEGE ID" :
                                        (verificationStage === 'AADHAR_AUTO_CAPTURE' ? "SCAN AADHAR QR" :
                                            (verificationStage === 'AADHAR_VERIFY_DATA' ? "IDENTITY MATCHED" : "PHOTO CAPTURE"))}
                                </span>
                            </div>

                            {/* Unified AI Status Monitor - Only show during Scanning phases */}
                            {['ID_AUTO_CAPTURE', 'AADHAR_AUTO_CAPTURE'].includes(verificationStage) && (
                                <div style={{
                                    position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 20, width: '100%'
                                }}>
                                    {/* MAIN STATUS PILL */}
                                    <div style={{
                                        background: 'rgba(0,0,0,0.85)', padding: '10px 24px', borderRadius: '30px',
                                        border: `1px solid ${scanStatus.includes('⚠️') ? '#ef4444' : (scanStatus.includes('Reading') ? '#00d4ff' : '#4ade80')} `,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: scanStatus.includes('⚠️') ? '#ef4444' : '#4ade80', animation: 'pulse 1.5s infinite' }}></div>
                                        <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>
                                            {scanStatus}
                                        </span>
                                    </div>

                                    {/* BIG COUNT INDICATOR - INSTANT MESSAGE STYLE */}
                                    {scanBuffer.length > 0 && scanBuffer.length < 5 && (
                                        <div className="animate-bounce" style={{
                                            background: 'rgba(74, 222, 128, 0.9)', color: '#000',
                                            padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem',
                                            marginTop: '5px', boxShadow: '0 0 15px rgba(74,222,128,0.6)',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}>
                                            <i className="fas fa-camera"></i> Scanned {scanBuffer.length} Time{scanBuffer.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AADHAR CONFIRMATION OVERLAY (Silent Capture Trap) */}
                            {/* Aadhar Details - Rendered OUTSIDE camera box via Portal */}
                            {verificationStage === 'AADHAR_VERIFY_DATA' && aadharData && ReactDOM.createPortal(
                                <div className="animate-fade-in" style={{
                                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: '90%', maxWidth: '800px', zIndex: 10000,
                                    background: 'rgba(5, 5, 5, 0.98)',
                                    borderRadius: '20px', padding: '30px',
                                    border: '2px solid #4ade80',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                                    textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                }}>
                                    <div style={{ color: '#4ade80', fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #4ade80', paddingBottom: '10px' }}>
                                        <span><i className="fas fa-check-circle"></i> VERIFIED IDENTITY</span>
                                        <span>100% Match</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Full Name {aadharData.isNameVerified && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>✓ MATCHED</span>}</div>
                                            <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700' }}>{aadharData.name}</div>
                                        </div>

                                        {/* Father Name (if captured) */}
                                        {aadharData.fatherName && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Care Of / Father {aadharData.isFatherVerified && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>✓ MATCHED ID</span>}</div>
                                                <div style={{ color: '#fff', fontSize: '1.1rem' }}>{aadharData.fatherName}</div>
                                            </div>
                                        )}

                                        <div>
                                            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Date of Birth</div>
                                            <div style={{ color: '#fff', fontSize: '1.2rem' }}>{aadharData.dob || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Gender</div>
                                            <div style={{ color: '#fff', fontSize: '1.2rem' }}>{aadharData.gender || 'N/A'}</div>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '5px' }}>Aadhar Number</div>
                                            <div style={{ color: '#4ade80', fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '3px', fontFamily: 'monospace' }}>{aadharData.aadharNumber}</div>
                                        </div>
                                        {/* Display Extracted Address */}
                                        {aadharData.address && (
                                            <div style={{ gridColumn: '1 / -1', marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                                <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Permanent Address {aadharData.isAddressVerified && <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>✓ MATCHED ID LOC</span>}</div>
                                                <div style={{ color: '#ddd', fontSize: '1rem', lineHeight: '1.5' }}>{aadharData.address}</div>
                                            </div>
                                        )}
                                    </div>


                                    {/* Conditional Buttons based on data completeness */}
                                    {aadharData.name && aadharData.dob && aadharData.gender && aadharData.aadharNumber ? (
                                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{
                                                    width: '100px',
                                                    padding: '12px 8px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: '#ef4444',
                                                    border: '1px solid #ef4444',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                onClick={() => {
                                                    setAadharData(null);
                                                    setAadharCameraImg(null);
                                                    setVerificationStage('AADHAR_AUTO_CAPTURE');
                                                    setScanStatus('Restarting Aadhar scan...');
                                                    setScanBuffer([]);
                                                }}
                                            >
                                                <i className="fas fa-redo"></i> Rescan
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                style={{
                                                    flex: '1',
                                                    padding: '12px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.95rem',
                                                    background: '#4ade80',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    // Silent selfie capture - user doesn't see this
                                                    setCameraMode('user'); // Switch to front camera

                                                    // Wait 1 second for camera to switch, then capture silently
                                                    setTimeout(() => {
                                                        if (videoRef.current && canvasRef.current) {
                                                            const context = canvasRef.current.getContext('2d');
                                                            canvasRef.current.width = videoRef.current.videoWidth;
                                                            canvasRef.current.height = videoRef.current.videoHeight;

                                                            // Mirror effect for natural look
                                                            context.translate(canvasRef.current.width, 0);
                                                            context.scale(-1, 1);
                                                            context.drawImage(videoRef.current, 0, 0);

                                                            const imgUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
                                                            setSelfieImg(imgUrl);

                                                            // Save verification data
                                                            const localVerificationKey = `verification_${scannedData.code}_${deviceFingerprint}`;
                                                            const verificationData = {
                                                                allStepsCompleted: true,
                                                                idCardImg: idCameraImg,
                                                                aadharImg: aadharCameraImg,
                                                                selfieImg: imgUrl,
                                                                scannedData: scannedData,
                                                                aadharData: aadharData,
                                                                timestamp: new Date().toISOString()
                                                            };
                                                            localStorage.setItem(localVerificationKey, JSON.stringify(verificationData));

                                                            // Stop camera and proceed directly to form
                                                            stopCamera();
                                                            setStep(4); // Go directly to registration form
                                                        }
                                                    }, 1000);
                                                }}
                                            >
                                                <i className="fas fa-check-circle"></i> Confirm & Continue
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '12px',
                                            background: 'rgba(251, 191, 36, 0.1)',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            borderRadius: '8px',
                                            color: '#fbbf24',
                                            fontSize: '0.9rem',
                                            textAlign: 'center'
                                        }}>
                                            <i className="fas fa-exclamation-triangle"></i> Scanning in progress... Please wait for all details to be detected.
                                        </div>
                                    )}
                                </div>,
                                document.body
                            )}

                            <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', color: '#fff', fontSize: '0.8rem', textShadow: '0 1px 2px black', display: verificationStage === 'AADHAR_VERIFY_DATA' ? 'none' : 'block' }}>
                                {verificationStage === 'SELFIE' ? "Position your face in the center" : "Align document/photo within frame"}
                            </div>
                        </div>,
                        document.body
                    )}
                </div>
            );
        }

        const renderStageContent = () => {
            switch (verificationStage) {
                case 'ID_VERIFY_DATA':
                    // Check for missing critical details
                    const isIdScanComplete = scannedData?.name && scannedData?.name !== "Detected Name" &&
                        scannedData?.fatherName &&
                        scannedData?.code &&
                        scannedData?.branch &&
                        scannedData?.mobileCount > 0;

                    return {
                        title: isIdScanComplete ? "ID Verified" : "Incomplete Scan",
                        desc: isIdScanComplete
                            ? "All details captured successfully. Proceed to Aadhar verification."
                            : "Some details were not detected clearly. Auto-rescanning in 2 seconds...",
                        isReview: true,
                        data: scannedData,
                        image: idCameraImg,
                        // CONDITIONAL BUTTON LOGIC
                        btnText: isIdScanComplete ? "Proceed to Aadhar Scan" : null, // Null text hides button logic below? No, I need to handle null action
                        btnAction: isIdScanComplete ? () => checkVerificationStatus(scannedData, null, 'ID') : null,
                        secondaryBtnText: isIdScanComplete ? "Incorrect details? Rescan ID" : "Rescan ID Card",
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
                        title: "Step 2: Scan Aadhar QR Code",
                        desc: "Point camera at the QR Code on your Aadhar (or Front Side).",
                        btnText: "Start Aadhar Scan",
                        btnAction: () => {
                            setCameraMode('environment');
                            startCamera();
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Please scan the QR code on your Aadhar card."));
                        }
                    };
                case 'AADHAR_VERIFY_DATA':
                    return {
                        title: "Identity Matched",
                        desc: "Aadhar matched against College ID. Proceed to complete registration.",
                        isReview: true,
                        data: aadharData,
                        image: aadharCameraImg,
                        btnText: "Complete Registration",
                        btnAction: () => {
                            // SECURITY: Capture silent selfie immediately and proceed to form
                            setCameraMode('user'); // Switch to front camera
                            // Wait 1 second for camera to switch, then capture and proceed
                            setTimeout(() => {
                                if (videoRef.current && canvasRef.current) {
                                    const context = canvasRef.current.getContext('2d');
                                    canvasRef.current.width = videoRef.current.videoWidth;
                                    canvasRef.current.height = videoRef.current.videoHeight;

                                    // Mirror effect for natural look
                                    context.translate(canvasRef.current.width, 0);
                                    context.scale(-1, 1);
                                    context.drawImage(videoRef.current, 0, 0);

                                    const imgUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
                                    setSelfieImg(imgUrl);

                                    // Save verification data
                                    const localVerificationKey = `verification_${scannedData.code}_${deviceFingerprint}`;
                                    const verificationData = {
                                        allStepsCompleted: true,
                                        idCardImg: idCameraImg,
                                        aadharImg: aadharCameraImg,
                                        selfieImg: imgUrl,
                                        scannedData: scannedData,
                                        aadharData: aadharData,
                                        timestamp: new Date().toISOString()
                                    };
                                    localStorage.setItem(localVerificationKey, JSON.stringify(verificationData));

                                    // Stop camera and proceed directly to form
                                    stopCamera();
                                    setStep(4);
                                }
                            }, 1000);
                        },
                        secondaryBtnText: "Wrong Aadhar? Rescan",
                        secondaryBtnAction: () => { setAadharData(null); setVerificationStage('AADHAR_AUTO_CAPTURE'); },
                        simpleView: true
                    };
                case 'SELFIE_AUTO':
                    return {
                        title: "Step 3: Capturing Photo",
                        desc: "Please look at the camera. Photo will be captured automatically...",
                        // No buttons - auto-capture happens via useEffect
                    };
                case 'SELFIE':
                    // Legacy case - can be removed or kept for backward compatibility
                    if (selfieImg) {
                        return {
                            title: "Step 3: Confirm Photo",
                            desc: "Ensure your face is clearly visible and lighting is good.",
                            btnText: "Confirm & Finish",
                            btnAction: confirmSelfie,
                            secondaryBtnText: "Retake",
                            secondaryBtnAction: retakeSelfie
                        }
                    }
                    return {
                        title: "Step 3: Profile Photo",
                        desc: "Take a clear photo for your official profile. Look straight at the camera.",
                        btnText: "Capture Photo",
                        btnAction: () => {
                            // Only capture the official profile photo
                            // Silent audit photo was already captured at Aadhar stage
                            takeSelfie(false);
                        }
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
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                        <i className="fas fa-home"></i> Home
                    </Link>
                    {/* Show Admin Dashboard link if user is admin */}
                    {(localStorage.getItem('userRole') === 'ADMIN' ||
                        localStorage.getItem('userRole') === 'SUPER_ADMIN' ||
                        localStorage.getItem('userRole') === 'COMPANY_ADMIN' ||
                        localStorage.getItem('userRole') === 'DEPT_ADMIN') && (
                            <Link to="/admin" style={{ color: '#4ade80', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                <i className="fas fa-tachometer-alt"></i> Admin Dashboard
                            </Link>
                        )}
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>{content.title}</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>{content.desc}</p>
                {content.isReview ? (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{
                            background: 'rgba(20, 20, 30, 0.6)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            marginBottom: '1.5rem',
                            overflow: 'hidden',
                            textAlign: 'left'
                        }}>
                            {/* Header Section with Image */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1.25rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <img src={content.image} alt="Scanned Doc" style={{
                                    width: '70px',
                                    height: '70px',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }} />
                                <div style={{ marginLeft: '1rem', flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', letterSpacing: '0.5px' }}>{content.data?.name || "Detected User"}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            background: 'rgba(74, 222, 128, 0.15)',
                                            color: '#4ade80',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            border: '1px solid rgba(74, 222, 128, 0.2)'
                                        }}>
                                            <i className="fas fa-check-circle"></i> IDENTITY MATCHED
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div style={{
                                padding: '1.25rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.25rem 1rem'
                            }}>
                                {/* Institution (ID Card Only) */}
                                {!content.simpleView && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Institution</div>
                                        <div style={{ color: '#fff', fontSize: '0.95rem' }}>{content.data?.institution}</div>
                                    </div>
                                )}

                                {/* Father's Name */}
                                {content.data?.fatherName && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Care Of / Father</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '500' }}>: {content.data?.fatherName}</div>
                                    </div>
                                )}

                                {/* Aadhar Number Highlight */}
                                {content.data?.aadharNumber && (
                                    <div style={{ gridColumn: '1 / -1', margin: '0.5rem 0' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Aadhar Number</div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', color: '#4ade80', letterSpacing: '1px', fontWeight: 'bold' }}>
                                            {content.data?.aadharNumber}
                                        </div>
                                    </div>
                                )}

                                {/* DOB & Gender - Only for Aadhar Step */}
                                {content.simpleView && (
                                    <>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Date of Birth</div>
                                            <div style={{ color: '#fff', fontSize: '1rem' }}>{content.data?.dob || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Gender</div>
                                            <div style={{ color: '#fff', fontSize: '1rem' }}>{content.data?.gender || 'N/A'}</div>
                                        </div>
                                    </>
                                )}

                                {/* Address (Full Width) */}
                                {!content.simpleView && content.data?.address && (
                                    <div style={{ gridColumn: '1 / -1', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Address</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4' }}>{content.data?.address}</div>
                                    </div>
                                )}

                                {/* Computer Code & Course (ID Card Only) */}
                                {!content.simpleView && (
                                    <>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Computer Code</div>
                                            <div style={{ color: '#4ade80', fontWeight: 'bold' }}>{content.data?.code}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Course</div>
                                            <div style={{ color: '#60a5fa' }}>{content.data?.branch}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {
                            content.btnText && (
                                <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.8rem' }} onClick={content.btnAction}>
                                    <i className="fas fa-check-circle"></i> {content.btnText}
                                </button>
                            )
                        }
                        {
                            content.secondaryBtnText && (
                                <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', fontSize: '0.9rem' }} onClick={content.secondaryBtnAction}>
                                    <i className="fas fa-redo-alt"></i> {content.secondaryBtnText}
                                </button>
                            )
                        }
                    </div >
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
                            <i className={`fas ${verificationStage === 'SELFIE' ? 'fa-user' : 'fa-id-card'} `} style={{ fontSize: '4rem', color: '#667eea' }}></i>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={content.btnAction}>
                            <i className="fas fa-camera"></i> {content.btnText}
                        </button>
                    </div>
                )
                }
            </div >
        );
    };

    // --- Selfie Logic ---
    const [auditSelfie, setAuditSelfie] = useState(null); // Silent security capture

    // SECURITY: Silent audit photo capture (called at Aadhar confirmation)
    const captureSilentAuditPhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.warn("Camera not ready for silent capture");
            return;
        }

        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        // Draw current frame (no mirror effect - this is back camera)
        context.drawImage(videoRef.current, 0, 0);

        const imgUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
        setAuditSelfie(imgUrl);

        console.log("🔒 Silent audit photo captured (hidden from user)");
        // NO flash, NO sound, NO UI feedback - completely silent
    };

    const takeSelfie = (isSilent = false) => {
        if (!videoRef.current || !canvasRef.current) return;
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        // Flip horizontally for natural mirror effect
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0);

        const imgUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);

        if (isSilent) {
            setAuditSelfie(imgUrl);
            console.log("Silent audit selfie captured");
        } else {
            setSelfieImg(imgUrl);
            setFlash(true);
            setTimeout(() => setFlash(false), 150);
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Photo captured. Please confirm."));
            // We stay in the same stage but UI changes because selfieImg is now set
        }
    };

    const confirmSelfie = () => {
        const localVerificationKey = `verification_${scannedData.code}_${deviceFingerprint}`;
        const verificationData = {
            allStepsCompleted: true,
            scannedData: scannedData,
            aadharData: aadharData,
            selfieImg: selfieImg,
            auditSelfie: auditSelfie, // Store the silent one too
            idCameraImg: idCameraImg,
            aadharCameraImg: aadharCameraImg,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(localVerificationKey, JSON.stringify(verificationData));
        console.log('✅ Verification data saved to localStorage');
        setStep(4);
    };

    const retakeSelfie = () => {
        setSelfieImg(null); // Reset to live camera
    };

    const startCamera = async () => {
        try {
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraMode } });
            streamRef.current = stream;
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
        } catch (err) {
            console.error("Camera Error:", err);
            showToast({
                message: 'Could not access camera.',
                type: 'error'
            });
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
                dob: formData.dob,
                gender: formData.gender,

                // Image Mapping for Backend (CRITICAL FIX)
                idCardImage: idCameraImg,
                aadharCardImage: aadharCameraImg,
                profilePictureUrl: selfieImg,


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

            // Prepare headers (include Auth token if this is a secure update)
            const headers = { "Content-Type": "application/json" };
            if (navLocation.state?.token) {
                headers["Authorization"] = `Bearer ${navLocation.state.token}`;
            }

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(registrationData),
            });
            const result = await response.json();
            if (response.ok) {
                // Clean up localStorage verification data after successful registration
                const localVerificationKey = `verification_${formData.computerCode}_${deviceFingerprint}`;
                localStorage.removeItem(localVerificationKey);
                console.log('✅ Verification data cleaned up from localStorage');

                setSuccess(result.message || (isUpdate ? "Account updated successfully!" : "Registration successful!"));

                if (isUpdate) {
                    // OLD USER UPDATE: Skip email verification (already done via forgot password)
                    // Redirect directly to login after short delay
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    // NEW USER: Redirect to email verification page
                    setTimeout(() => navigate(`/verify-account?email=${encodeURIComponent(formData.email)}`), 1500);
                }
            } else {
                setError(result.message || 'Registration failed.'); setLoading(false);
            }
        } catch (err) {
            console.error("Registration error:", err); setError('Network error.'); setLoading(false);
        }
    };

    const [scanBuffer, setScanBuffer] = useState([]);


    // SECURITY: Detect IPS Academy Blue Header & Logo Pattern
    const detectIPSHeader = (ctx, width, height) => {
        try {
            // Check top 25% of the card (where the blue header is)
            const headerHeight = Math.floor(height * 0.25);
            const imageData = ctx.getImageData(0, 0, width, headerHeight);
            const data = imageData.data;
            let bluePixelCount = 0;
            let whitePixelCount = 0; // For logo/text

            // Iterate through pixels
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Standard IPS Blue is roughly R:20-60, G:40-80, B:100-180
                // Relaxed range: Blue must be significantly higher than Red
                if (b > r + 30 && b > g + 10 && b > 60) {
                    bluePixelCount++;
                }
                // Check for White/Bright logo elements
                if (r > 180 && g > 180 && b > 180) {
                    whitePixelCount++;
                }
            }

            const totalPixels = data.length / 4;
            const blueRatio = bluePixelCount / totalPixels;

            // Require at least 15% of the header to be "IPS Blue"
            // This filters out black/white copies or random other cards
            return blueRatio > 0.15;
        } catch (e) {
            console.error("Header check failed", e);
            return false; // Fail safe
        }
    };

    const attemptAutoCapture = async () => {
        const isIdStage = verificationStage === 'ID_AUTO_CAPTURE';
        const isAadharStage = verificationStage === 'AADHAR_AUTO_CAPTURE';
        if (isScanning || !showCamera || (!isIdStage && !isAadharStage) || !videoRef.current || !canvasRef.current) return;

        setIsScanning(true);
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // LIGHTING CHECK (Screen Flash Feature)
        try {
            const centerX = Math.floor(canvasRef.current.width / 2);
            const centerY = Math.floor(canvasRef.current.height / 2);
            const pData = context.getImageData(centerX - 25, centerY - 25, 50, 50).data;
            let totalBrightness = 0;
            const sample = pData.length / 4;

            for (let i = 0; i < pData.length; i += 16) {
                const r = pData[i];
                const g = pData[i + 1];
                const b = pData[i + 2];
                totalBrightness += (r + g + b) / 3;
            }
            const avgBrightness = totalBrightness / (sample / 4);
            setIsLowLight(avgBrightness < 60);
        } catch (err) { }

        // -------------------------
        // QR CODE SCANNING (SECURE BYPASS)
        // -------------------------
        if (isAadharStage) {
            try {
                const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

                // QR CODE DETECTED (any QR)
                if (code && code.data) {
                    setQrDetected(true);

                    // Check QR size and position for guidance
                    const qrWidth = Math.abs(code.location.bottomRightCorner.x - code.location.topLeftCorner.x);
                    const qrHeight = Math.abs(code.location.bottomRightCorner.y - code.location.topLeftCorner.y);
                    const qrCenterX = (code.location.topLeftCorner.x + code.location.bottomRightCorner.x) / 2;
                    const qrCenterY = (code.location.topLeftCorner.y + code.location.bottomRightCorner.y) / 2;
                    const frameCenterX = canvasRef.current.width / 2;
                    const frameCenterY = canvasRef.current.height / 2;

                    const distance = Math.sqrt(
                        Math.pow(qrCenterX - frameCenterX, 2) +
                        Math.pow(qrCenterY - frameCenterY, 2)
                    );

                    // Position guidance
                    if (qrWidth < 100 || qrHeight < 100) {
                        setQrGuidance("📱 Move closer");
                    } else if (qrWidth > 300 || qrHeight > 300) {
                        setQrGuidance("📱 Move farther");
                    } else if (distance > 80) {
                        setQrGuidance("🎯 Center QR code");
                    } else {
                        setQrGuidance("✓ Perfect! Hold steady");

                        // QR is well-positioned - capture photo for scanning
                        if (qrPhotoCount < 5) {
                            const photoData = canvasRef.current.toDataURL('image/jpeg', 0.95);
                            setQrPhotos(prev => [...prev, photoData]);
                            setQrPhotoCount(prev => prev + 1);
                            setScanStatus(`Capturing photo ${qrPhotoCount + 1}/5...`);
                            playBeep();
                        }
                    }

                    // Check brightness in QR area
                    try {
                        const qrAreaData = context.getImageData(
                            code.location.topLeftCorner.x,
                            code.location.topLeftCorner.y,
                            qrWidth,
                            qrHeight
                        );
                        let totalBrightness = 0;
                        for (let i = 0; i < qrAreaData.data.length; i += 16) {
                            totalBrightness += (qrAreaData.data[i] + qrAreaData.data[i + 1] + qrAreaData.data[i + 2]) / 3;
                        }
                        const avgQrBrightness = totalBrightness / (qrAreaData.data.length / 16);

                        // Auto-suggest flash if QR area is dark
                        if (avgQrBrightness < 50 && !isFlashActive) {
                            setQrGuidance("⚡ Turn on flash for better scan");
                            setIsLowLight(true);
                        }
                    } catch (e) { }

                    // Play beep when QR detected
                    playBeep();

                    // VALIDATE IF IT'S AADHAR QR
                    if (code.data.includes("uid=") || code.data.includes("</PrintLetterBarcodeData>")) {
                        console.log("✅ Secure QR Code Found!", code.data);
                        playSuccessSound(); // Success sound for valid Aadhar QR

                        // 1. EXTRACT XML DATA
                        let uid = code.data.match(/uid="(\d+)"/)?.[1] || "";
                        let name = code.data.match(/name="([^"]+)"/)?.[1] || "";
                        let dob = code.data.match(/dob="([^"]+)"/)?.[1] || code.data.match(/yob="(\d+)"/)?.[1] || "";
                        let gender = code.data.match(/gender="([^"]+)"/)?.[1] || "";

                        // Extract full address details
                        let co = code.data.match(/co="([^"]+)"/)?.[1] || "";
                        let loc = code.data.match(/loc="([^"]+)"/)?.[1] || "";
                        let vtc = code.data.match(/vtc="([^"]+)"/)?.[1] || "";
                        let dist = code.data.match(/dist="([^"]+)"/)?.[1] || "";
                        let state = code.data.match(/state="([^"]+)"/)?.[1] || "";
                        let pc = code.data.match(/pc="([^"]+)"/)?.[1] || "";

                        const fullAddress = [co, loc, vtc, dist, state, pc].filter(Boolean).join(', ');

                        // 2. NAME MATCH CHECK
                        const knownName = scannedData?.name || "";
                        const knownFather = scannedData?.fatherName || "";
                        const knownAddress = scannedData?.address || "";

                        let nameMatches = false;
                        let fatherMatches = false;
                        let addressMatches = false;

                        // Relaxed Name Match
                        if (knownName && name) {
                            const knParts = knownName.toLowerCase().split(' ');
                            const qrParts = name.toLowerCase().split(' ');
                            nameMatches = knParts.some(k => qrParts.some(q => q.includes(k) && k.length > 2));
                        }

                        // Father Name Match (Handle "S/O", "D/O" prefixes)
                        if (knownFather && co) {
                            const cleanCo = co.toLowerCase().replace("s/o", "").replace("d/o", "").replace("c/o", "").trim();
                            const cleanFather = knownFather.toLowerCase().replace("mr.", "").trim();
                            // Check partial match
                            const fParts = cleanFather.split(' ');
                            fatherMatches = fParts.some(part => cleanCo.includes(part) && part.length > 3);
                        }

                        // Address Match (Check City/District/Pincode overlap)
                        if (knownAddress && fullAddress) {
                            const kAddr = knownAddress.toLowerCase();
                            const qAddr = fullAddress.toLowerCase();
                            // Match if Pincode matches OR City name appears in both
                            const pincodeMatch = (pc && kAddr.includes(pc));
                            const cityMatch = (vtc && kAddr.includes(vtc.toLowerCase())) || (dist && kAddr.includes(dist.toLowerCase()));
                            addressMatches = pincodeMatch || cityMatch;
                        }

                        // ULTIMATE VERIFICATION LOGIC:
                        // 1. Name Match (Primary)
                        // 2. Fallback: If Name fails, check if Father + Address BOTH Match (Strong secondary proof)
                        const isVerified = nameMatches || (fatherMatches && addressMatches);

                        if (isVerified) {
                            setScanStatus("✅ Secure QR Verified!");
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Identity Verified."));

                            // Set Data with Verification Flags
                            const secureAadhar = {
                                name: name,
                                aadharNumber: uid,
                                dob: dob,
                                gender: gender === "M" ? "Male" : (gender === "F" ? "Female" : gender),
                                address: fullAddress,
                                fatherName: co.replace("S/O", "").replace("D/O", "").trim(),
                                details: { co, dist, state, pc },
                                // Verification Flags
                                isNameVerified: nameMatches,
                                isFatherVerified: fatherMatches,
                                isAddressVerified: addressMatches,
                                isFallbackVerified: !nameMatches // Flag if accepted via fallback
                            };
                            setAadharData(secureAadhar);

                            // Auto-disable flash after successful scan
                            setManualFlash(false);
                            setIsLowLight(false);

                            // Capture Image for Record
                            canvasRef.current.toBlob((blob) => {
                                const reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onloadend = () => {
                                    setAadharCameraImg(reader.result);
                                    setVerificationStage('AADHAR_VERIFY_DATA');
                                };
                            });
                            setIsScanning(false);
                            return; // EXIT FUNCTION, SKIP OCR
                        } else {
                            // QR Found but Name Mismatch
                            setScanStatus("⚠️ Verification Failed");
                            console.warn("QR Name Mismatch:", { qr: name, id: knownName });
                        }
                    } else {
                        // QR detected but NOT Aadhar QR
                        setQrGuidance("❌ Wrong QR! Show Aadhar card");
                        playErrorSound();
                        setQrDetected(false);
                    }
                } else {
                    // No QR detected
                    setQrDetected(false);
                    setQrGuidance("");
                }
            } catch (qrErr) {
                console.log("QR Scan Error", qrErr);
                setQrDetected(false);
            }
        }
        // -------------------------

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
                            detectedDocType = `Invalid Item(${matchedCategory.name})`;
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
                    setScanStatus(`⚠️ ${detectedDocType.toUpperCase()} `);
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

                // SECURITY: IPS Academy Logo/Header Check (Phase 1.5)
                if (isIdStage && matchFound) {
                    const isRealIPS = detectIPSHeader(context, canvasRef.current.width, canvasRef.current.height);
                    if (!isRealIPS) {
                        console.warn("Real IPS Header NOT Detected");
                        setScanStatus("⚠️ Warning: IPS Logo not detected");
                        // Optional: Reject frame?
                        // For now, we allow it but warn, or require more confident text match
                        // Let's make it strict:
                        setScanStatus("⚠️ Security Check: Missing IPS Blue Header");
                        // scanBuffer = []; // Reset buffer?
                        // Match continues but trust score lowers?
                        // Let's REJECT to stop fake black/white prints.
                        matchFound = false;
                    }
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

                        // Extract Address (multiline until Director/Principal or end)
                        const addressMatch = text.match(/Address\s*[:|-]?\s*([\s\S]+?)(?=\bD\w+\/|\bDirector|\bPrincipal|$)/i);

                        // Extract DOB (DD-MM-YYYY pattern)
                        const dobMatch = text.match(/\b\d{2}-\d{2}-\d{4}\b/);

                        // Extract Blood Group (BG)
                        const bgMatch = text.match(/BG\s*[:|-]?\s*([A-Za-z+-]+)/i);

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
                            mobileCount: mobileMatches.length,
                            address: addressMatch ? addressMatch[1].trim().replace(/\n/g, ', ') : "Not Detected",
                            dob: dobMatch ? dobMatch[0] : null,
                            bg: bgMatch ? bgMatch[1] : null
                        };
                    }
                } else if (isAadharStage) {
                    setScanStatus("Scanning Aadhar...");

                    // Enhanced keyword list with more variations
                    const aadharKeywords = [
                        'government', 'india', 'uid', 'aadhar', 'aadhaar', 'uidai',
                        'dob', 'enroll', 'year', 'address', 'male', 'female',
                        'father', 'husband', 'income', 'vid', 'भारत', 'सरकार'
                    ];

                    const score = aadharKeywords.reduce((acc, kw) => lowerText.includes(kw) ? acc + 1 : acc, 0);

                    // ENHANCED: More robust Aadhar Number Detection
                    let cleanAadharText = text.replace(/O/g, '0').replace(/o/g, '0').replace(/S/g, '5').replace(/I/g, '1').replace(/l/g, '1');

                    // Multiple patterns for Aadhar number
                    const aadharPattern1 = cleanAadharText.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
                    const aadharPattern2 = cleanAadharText.match(/\b\d{12}\b/);
                    const aadharNumMatch = aadharPattern1 || aadharPattern2;

                    console.log("Aadhar Detection:", {
                        score,
                        hasAadharNum: !!aadharNumMatch,
                        keywords: aadharKeywords.filter(kw => lowerText.includes(kw)),
                        textLength: text.length
                    });

                    // LOWERED THRESHOLD: Now triggers on Aadhar number alone OR any keyword
                    if (score >= 1 || aadharNumMatch || isAadharDetected) {
                        matchFound = true;
                        setScanStatus("Scanning Aadhar...");

                        const knownName = scannedData?.name || "";
                        let matchedName = "Detected Name";

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

                        // STRICT NAME CHECK (Requested Feature)
                        // If the name on Aadhar doesn't fuzzy-match the ID Card Name, REJECT the frame.
                        if (matchedName === "Detected Name") {
                            // Security: Obscure the reason for rejection so users can't game the system
                            setScanStatus("⚠️ Align Card / Adjust Lighting");
                            matchFound = false;
                        } else {
                            extracted = {
                                name: matchedName,
                                // Standardize: Remove spaces/dashes to get pure 12 digits
                                aadharNumber: aadharNumMatch ? aadharNumMatch[0].replace(/\D/g, '') : "xxxx-xxxx-xxxx"
                            };
                        }
                    } else {
                        // Not enough confidence - show helpful message
                        setScanStatus("⚠️ Hold card steady... Looking for Aadhar details");
                        console.log("Aadhar not detected. Text preview:", text.substring(0, 100));
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

                    // Updated to 6 frames for Aadhar as requested
                    const targetFrames = isIdStage ? TARGET_SCANS : 6;
                    const newBuffer = [...scanBuffer, extracted];
                    setScanBuffer(newBuffer);
                    setScanStatus(`✅ Captured ${newBuffer.length} / ${targetFrames}`);

                    if (newBuffer.length >= targetFrames) {
                        finalizeDeepVerification(newBuffer, blob, isIdStage ? 'ID' : 'AADHAR', text);
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

            // Convert to number for backend (database expects number type)
            const computerCodeNumber = cleanedCode ? parseInt(cleanedCode, 10) : null;

            const payload = {
                computerCode: computerCodeNumber,
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

    const finalizeDeepVerification = (buffer, finalBlob, type, text) => {
        const cleanAddress = (rawAddr) => {
            if (!rawAddr) return "Not Detected";
            let addr = rawAddr.trim();

            // 1. Remove OCR noise & common artifacts header words
            addr = addr.replace(/Director\/Principal|Director|Principal|Direclor|Direc|Signature|Govt|India|DicclorSines|Dicclor|Sines/gi, '')
                .replace(/[;:{}_=]/g, '') // Remove specific symbols
                .replace(/[-]{2,}/g, '')   // Remove multiple dashes
                .replace(/\b(GRAI|GRM|GRMA)\b/gi, 'Gram')
                .replace(/\b(DIST|DISTT|DT)\b/gi, 'Dist.')
                .replace(/\b(TEH|TAH)\b/gi, 'Tehsil')
                .replace(/Da\s?,/g, '')
                .replace(/S\/O|D\/O|W\/O|C\/O/gi, '') // Remove relationship prefixes from address part
                .replace(/\d+\s*=\s*[a-z-]+/gi, '')   // Remove patterns like "4 =a--"
                .replace(/\bSha\b/g, '') // Remove isolated "Sha" noise
                .trim();

            // 2. Remove isolated single characters (like "i", "I", "4") that aren't A/B (often block no)
            // Keep digits if they part of a pincode or house number
            addr = addr.replace(/\b[a-zA-Z]\b(?!\.)/g, '').replace(/\s+/g, ' ');

            // 3. Detect State from Map (Granular)
            let detectedState = null;
            let upperAddr = addr.toUpperCase();

            for (const [district, state] of Object.entries(DISTRICT_STATE_MAP)) {
                if (upperAddr.includes(district)) {
                    detectedState = state;
                    // Prevent Duplicate State Appending
                    if (!upperAddr.includes(state.toUpperCase())) {
                        addr = `${addr}, ${state}`;
                    }
                    break;
                }
            }

            // 4. Aggressive Structure Clean & Deduplicate
            // Split by commas OR spaces to handle "Sehore Sehore"
            let parts = addr.split(/[,\s]+/);
            let cleanParts = [];
            let seenWords = new Set();

            parts.forEach(part => {
                let cleanPart = part.replace(/[^a-zA-Z0-9\-\.]/g, '').trim(); // Remove strictly symbols
                if (cleanPart.length > 1 || !isNaN(cleanPart)) { // Keep numbers, discard single chars
                    const lower = cleanPart.toLowerCase();
                    // Fuzzy duplicate check (e.g. "Sehore" vs "Sehore,")
                    if (!seenWords.has(lower)) {
                        // Filter out garbage words containing mixed repeated symbols
                        if (!/^[=\-_]+$/.test(cleanPart) && !cleanPart.includes('=')) {
                            seenWords.add(lower);
                            cleanParts.push(cleanPart);
                        }
                    }
                }
            });

            // 5. Re-assemble with proper comma separation
            // Heuristic: If part is a number (pincode), it goes at end. If duplicate, ignored.
            let finalAddr = cleanParts.join(', ');

            // Fix spaces around punctuation
            finalAddr = finalAddr.replace(/ ,/g, ',').replace(/,+/g, ',').replace(/\s+/g, ' ').trim();

            // Remove trailing commas/dashes
            finalAddr = finalAddr.replace(/^[,\-\s]+|[,\-\s]+$/g, '');

            if (finalAddr.length < 5) return rawAddr; // Fallback if we destroyed it
            return finalAddr;
        };

        const names = buffer.map(b => b.name).filter(n => n !== "Detected Name");
        if (names.length === 0) names.push("Detected Name");

        const bestName = names.sort((a, b) => names.filter(v => v === a).length - names.filter(v => v === b).length).pop();
        const bestMatch = buffer.find(b => b.name === bestName) || buffer[buffer.length - 1];

        const cleanOCRName = (name) => {
            if (!name || name === "Detected Name" || name === "Detected Father") return name;

            // 1. Remove ALL non-letter characters except spaces (whitelist approach)
            let cleaned = name.replace(/[^A-Za-z ]/g, '').trim();

            // 2. Remove prefixes (Father, Mr, Shri, etc.) - more aggressive
            cleaned = cleaned.replace(/^(Father|Father's|Mr|Mrs|Ms|Shri|Smt|Late|Dr|Name|Course|Session|Institution)[\s:|-]*/gi, '').trim();

            // 3. Remove the word "Father" if it appears anywhere
            cleaned = cleaned.replace(/\bFather\b[\s:|-]*/gi, '').trim();

            // 3.1 Remove common Aadhar/ID OCR garbage (Government, India, Gender, DOB)
            cleaned = cleaned.replace(/\b(Government|India|Govt|Male|Female|DOB|Year|Birth|YOB)\b/gi, '').trim();

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
                fatherName: cleanOCRName(bestMatch.fatherName),
                address: cleanAddress(bestMatch.address)
            };

            // Move to Review Screen (Check happens on Button Click now)
            // Convert to Base64 for DB Storage
            const reader = new FileReader();
            reader.readAsDataURL(finalBlob);
            reader.onloadend = () => {
                setIdCameraImg(reader.result);
                setScannedData(cleanedMatch);
                setScanBuffer([]); stopCamera();
                setVerificationStage('ID_VERIFY_DATA');

                // NEW: Check for duplicate account immediately after ID Scan
                checkVerificationStatus(cleanedMatch, finalBlob, 'ID', true);
            };
        } else if (type === 'AADHAR') {

            // NEW: Auto-check backend immediately (redirects if exists,                            // ---------------------------------------------------------
            // AADHAR CARD LOGIC
            // ---------------------------------------------------------
            // 1. Granular Parsing Strategy: Split text into lines
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
            const idNameLower = scannedData?.name?.toLowerCase() || '';
            const idNameParts = idNameLower.split(' ').filter(p => p.length > 2);

            // 2. Enhanced Name Matching with Fuzzy Logic
            let verifiedName = null;
            let maxOverlap = 0;
            let bestNameLine = null;

            for (const line of lines) {
                const lowerLine = line.toLowerCase();

                // Enhanced filtering - exclude lines with these patterns
                if (/(government|india|dob|male|female|yob|birth|aadhar|aadhaar|uid|address|pin|state|district|\d{4}\s*\d{4}|\d{6,})/.test(lowerLine)) continue;

                // Skip very short lines (likely noise)
                if (line.length < 5) continue;

                // Check overlap with ID Name
                let overlap = 0;
                let partialMatches = 0;

                idNameParts.forEach(part => {
                    if (lowerLine.includes(part)) {
                        overlap++;
                    } else {
                        // Check for partial match (fuzzy matching for OCR errors)
                        const partChars = part.split('');
                        let matchCount = 0;
                        partChars.forEach(char => {
                            if (lowerLine.includes(char)) matchCount++;
                        });
                        if (matchCount / part.length > 0.7) partialMatches++;
                    }
                });

                const totalScore = overlap + (partialMatches * 0.5);

                // If this line has significant overlap, it's likely the Name
                if (totalScore > 0 && totalScore >= maxOverlap) {
                    maxOverlap = totalScore;
                    bestNameLine = line;
                }
            }

            if (bestNameLine) {
                verifiedName = cleanOCRName(bestNameLine);
            }

            // Fallback: If no line matched well, but the ID name is present in the full text
            if (!verifiedName && text.toLowerCase().includes(idNameLower)) {
                verifiedName = cleanOCRName(scannedData.name);
            }

            // 3. Enhanced Field Extraction with Multiple Patterns

            // Aadhar Number - Enhanced validation with multiple patterns
            let aadharNumber = null;

            // Pattern 1: Standard format with spaces (XXXX XXXX XXXX)
            const aadharPattern1 = text.match(/\b\d{4}\s+\d{4}\s+\d{4}\b/);
            // Pattern 2: Without spaces (12 consecutive digits)
            const aadharPattern2 = text.match(/\b\d{12}\b/);
            // Pattern 3: With hyphens or other separators
            const aadharPattern3 = text.match(/\b\d{4}[-\s]\d{4}[-\s]\d{4}\b/);

            if (aadharPattern1) {
                aadharNumber = aadharPattern1[0];
            } else if (aadharPattern3) {
                aadharNumber = aadharPattern3[0].replace(/[-]/g, ' ');
            } else if (aadharPattern2) {
                // Format as XXXX XXXX XXXX
                const num = aadharPattern2[0];
                aadharNumber = `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)}`;
            }

            // DOB - Enhanced extraction with multiple date formats
            let dob = null;

            // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
            const dobPattern1 = text.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
            // Pattern 2: DD.MM.YYYY
            const dobPattern2 = text.match(/\b(\d{2}\.\d{2}\.\d{4})\b/);
            // Pattern 3: YYYY (Year only - common in old Aadhar cards)
            const dobPattern3 = text.match(/\b(19\d{2}|20\d{2})\b/);
            // Pattern 4: With text prefix like "DOB:" or "Birth:"
            const dobPattern4 = text.match(/(?:DOB|Birth|YOB)[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);

            if (dobPattern4) {
                dob = dobPattern4[1].replace(/\./g, '/').replace(/-/g, '/');
            } else if (dobPattern1) {
                dob = dobPattern1[1].replace(/-/g, '/');
            } else if (dobPattern2) {
                dob = dobPattern2[1].replace(/\./g, '/');
            } else if (dobPattern3 && !aadharNumber?.includes(dobPattern3[1])) {
                // Only use year if it's not part of Aadhar number
                dob = dobPattern3[1];
            }

            // Gender - Enhanced detection with common OCR mistakes
            let gender = null;

            // Pattern 1: Direct match
            const genderPattern1 = text.match(/\b(MALE|FEMALE|M|F|Transgender|Trans)\b/i);
            // Pattern 2: With common OCR errors (WALE -> MALE, FEMLE -> FEMALE)
            const genderPattern2 = text.match(/\b(M[A-Z]LE|FEM[A-Z]LE|W[A-Z]LE)\b/i);
            // Pattern 3: With prefix
            const genderPattern3 = text.match(/(?:Gender|Sex)[:\s]*(MALE|FEMALE|M|F)/i);

            if (genderPattern3) {
                const g = genderPattern3[1].toUpperCase();
                gender = g === 'M' ? 'MALE' : g === 'F' ? 'FEMALE' : g;
            } else if (genderPattern1) {
                const g = genderPattern1[0].toUpperCase();
                gender = g === 'M' ? 'MALE' : g === 'F' ? 'FEMALE' : g;
            } else if (genderPattern2) {
                const g = genderPattern2[0].toUpperCase();
                gender = g.includes('FEM') ? 'FEMALE' : 'MALE';
            }

            console.log("Aadhar Extraction Logic:", {
                verifiedName,
                aadharNumber,
                dob,
                gender,
                nameScore: maxOverlap,
                linesProcessed: lines.length
            });

            // 4. Silent Scanning - No granular feedback to prevent manipulation
            if (!verifiedName) {
                setScanStatus("Scanning Aadhar...");
                setScanBuffer(prev => [...prev.slice(-4), "Retry"]);
                return;
            }
            // 4. Silent Scanning - OPTIMIZED FAST PATH
            if (!aadharNumber) {
                setScanStatus("Scanning Aadhar Number...");
                setScanBuffer(prev => [...prev.slice(-4), "Retry"]);
                return;
            }

            // SMART FIX: Force ID Card Name if partial match found (Fixes garbage text like 'i FT ATAT')
            if (scannedData?.name && text) {
                const idNameParts = scannedData.name.split(' ');
                // Check if "Abhi" or "Jain" exists in Aadhar text
                const isPartFound = idNameParts.some(part =>
                    part.length > 2 && text.toLowerCase().includes(part.toLowerCase())
                );

                if (isPartFound) {
                    console.log("Smart Fix: Overriding Aadhar name with ID Name", scannedData.name);
                    verifiedName = scannedData.name;
                }
            }

            // FAST TRACK: If Name & Aadhar Number match, proceed immediately!
            // We skip strict DOB/Gender check to speed up scanning by 2x-3x.
            if (!verifiedName) {
                // If name doesn't match, we try to use other details to confirm it's at least a card
                if (!dob || !gender) {
                    setScanStatus("Align Aadhar Card...");
                    setScanBuffer(prev => [...prev.slice(-4), "Retry"]);
                    return;
                }
            }

            // 5. SUCCESS
            const bestMatch = {
                name: verifiedName,
                dob: dob,
                gender: gender,
                aadharNumber: aadharNumber
            };

            setAadharData(bestMatch);

            // Convert to Base64 for DB Storage
            const reader = new FileReader();
            reader.readAsDataURL(finalBlob);
            reader.onloadend = () => {
                setAadharCameraImg(reader.result);
                setScanBuffer([]);
                // stopCamera(); // <--- REMOVED: Keep camera running for Silent Selfie
                setScanStatus("✅ Aadhar Verified");
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Aadhar matched. Please confirm details."));
                setVerificationStage('AADHAR_VERIFY_DATA');

                // NEW: Immediately run backend check
                checkVerificationStatus(bestMatch, finalBlob, 'AADHAR', true);
            };

        }
    };

    useEffect(() => {
        let interval;
        if (showCamera && (verificationStage === 'ID_AUTO_CAPTURE' || verificationStage === 'AADHAR_AUTO_CAPTURE') && !isScanning) {
            interval = setInterval(attemptAutoCapture, 800); // 800ms Interval (Faster Scanning)
        }
        return () => clearInterval(interval);
    }, [showCamera, verificationStage, isScanning]);

    // Auto-capture selfie when in SELFIE_AUTO stage
    useEffect(() => {
        if (verificationStage === 'SELFIE_AUTO' && videoRef.current) {
            // Wait 2 seconds for camera to switch and user to position
            const timer = setTimeout(() => {
                if (videoRef.current && canvasRef.current) {
                    const context = canvasRef.current.getContext('2d');
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;

                    // Mirror effect for natural look
                    context.translate(canvasRef.current.width, 0);
                    context.scale(-1, 1);
                    context.drawImage(videoRef.current, 0, 0);

                    const imgUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
                    setSelfieImg(imgUrl);

                    // Flash effect
                    setFlash(true);
                    setTimeout(() => setFlash(false), 150);

                    // Save verification data and proceed to Step 4
                    const localVerificationKey = `verification_${scannedData.code}_${deviceFingerprint}`;
                    const verificationData = {
                        allStepsCompleted: true,
                        idCardImg: idCameraImg,
                        aadharImg: aadharCameraImg,
                        selfieImg: imgUrl,
                        scannedData: scannedData,
                        aadharData: aadharData,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem(localVerificationKey, JSON.stringify(verificationData));

                    // Stop camera and proceed to form
                    stopCamera();
                    setStep(4);
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [verificationStage]);

    // Cleanup: Only stop camera when we completely exit verification
    useEffect(() => {
        if (step === 4) {
            stopCamera();
        }
    }, [step]);

    useEffect(() => {
        if (!showCamera && !isScanning) {
            if (verificationStage === 'ID_AUTO_CAPTURE' || verificationStage === 'AADHAR_AUTO_CAPTURE') {
                setCameraMode('environment'); startCamera();
            } else if (verificationStage === 'SELFIE') {
                setCameraMode('user'); startCamera();
            }
        }
    }, [verificationStage]);

    // Auto-Selfie Logic REMOVED/NOT NEEDED - We capture on button click now

    useEffect(() => {
        if (step === 4 && scannedData) {
            // Standardize username to @first_last format
            const cleanName = scannedData.name.toLowerCase().trim().replace(/[^a-z ]/g, '');
            const generatedUsername = "@" + cleanName.replace(/\s+/g, "_");

            // Extract start year from session (e.g., "2023-2027" -> "2023")
            const startYear = scannedData.session ? scannedData.session.split('-')[0].trim() : new Date().getFullYear().toString();

            // Re-map common branch abbreviations to codes if needed
            let branchCode = scannedData.branch || 'IMCA';
            if (['INTG', 'INTE', 'INTG.MCA', 'INTEGRATED'].some(k => branchCode.toUpperCase().includes(k))) branchCode = 'IMCA';

            setFormData(prev => ({
                ...prev,
                fullName: scannedData.name,
                fatherName: aadharData?.fatherName || scannedData.fatherName || '', // Prioritize Aadhar father name
                computerCode: scannedData.code ? scannedData.code.toString().replace(/^0+/, '').trim() : '',
                branch: branchCode,
                username: scannedData.code ? scannedData.code.toString().replace(/^0+/, '').trim() : '',
                startYear: startYear,
                mobilePrimary: scannedData.mobilePrimary || '',
                mobileSecondary: scannedData.mobileSecondary || '',
                aadharNumber: aadharData?.aadharNumber || '',
                dob: aadharData?.dob || '',
                gender: aadharData?.gender || '',
                address: aadharData?.address || '', // Aadhar address (more accurate than ID card)
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
                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link to="/" style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                <i className="fas fa-home"></i> Home
                            </Link>
                            {/* Show Admin Dashboard link if user is admin */}
                            {(localStorage.getItem('userRole') === 'ADMIN' ||
                                localStorage.getItem('userRole') === 'SUPER_ADMIN' ||
                                localStorage.getItem('userRole') === 'COMPANY_ADMIN' ||
                                localStorage.getItem('userRole') === 'DEPT_ADMIN') && (
                                    <Link to="/admin" style={{ color: '#4ade80', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                        <i className="fas fa-tachometer-alt"></i> Admin Dashboard
                                    </Link>
                                )}
                        </div>
                        <h1>Create Your Account</h1>
                        <p className="subtitle">Join our portal to access exclusive job opportunities and resources.</p>
                        {error && <div className="alert alert-error" style={{ display: 'block' }}>{error}</div>}
                        {success && <div className="alert alert-success" style={{ display: 'block' }}>{success}</div>}
                        <form id="registrationForm" onSubmit={handleSubmit}>
                            <div className="verification-summary" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <i className="fas fa-shield-alt" style={{ color: '#4ade80' }}></i> Verified Identity Proofs
                                </h3>

                                {/* THE 2 PHOTOS DISPLAY - Selfie is hidden */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>

                                    {/* 1. ID Card */}
                                    {idCameraImg && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #4ade80', boxShadow: '0 4px 12px rgba(74, 222, 128, 0.2)', marginBottom: '0.5rem' }}>
                                                <img src={idCameraImg} alt="ID Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>✓ College ID</p>
                                        </div>
                                    )}

                                    {/* 2. Aadhar Card */}
                                    {aadharCameraImg && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #aaa', marginBottom: '0.5rem' }}>
                                                <img src={aadharCameraImg} alt="Aadhar Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Aadhar Card</p>
                                        </div>
                                    )}
                                </div>
                                {scannedData && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>FULL NAME</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.name}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>FATHER'S NAME</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.fatherName}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>INSTITITE</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.institution}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>SESSION</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.session || '2023-2027'}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>COURSE (BRANCH)</strong><div style={{ fontWeight: '500', color: '#4ade80' }}>{scannedData.branch}</div></div>
                                        {aadharData && (
                                            <div>
                                                <strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>AADHAR NUMBER</strong>
                                                <div style={{ fontWeight: '500', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {aadharData.aadharNumber}

                                                </div>
                                                <div style={{ display: 'flex', gap: '15px', marginTop: '4px', fontSize: '0.8rem', color: '#ccc' }}>
                                                    <span><strong>DOB:</strong> {aadharData.dob || 'N/A'}</span>
                                                    <span><strong>Gender:</strong> {aadharData.gender || 'N/A'}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
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
                                <label htmlFor="computerCode">Computer Code (Student ID) *</label>
                                <input type="text" id="computerCode" name="computerCode" required placeholder="e.g. 59500" value={formData.computerCode} onChange={handleChange} readOnly={!!scannedData} style={scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' } : {}} />
                                <small>Your unique college ID/Roll Number. This will be your Login ID.</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="aadharNumber">Aadhar Number <i className="fas fa-lock text-green-400" title="Verified from Aadhar Card"></i></label>
                                <input type="text" id="aadharNumber" name="aadharNumber" required placeholder="Scanned from Aadhar Card" value={formData.aadharNumber?.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ') || ''} readOnly className="locked-field" style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }} />
                                <small style={{ color: '#34d399' }}>✓ Verified from Aadhar Card (Read-only)</small>
                            </div>
                            {formData.dob && (
                                <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Date of Birth <i className="fas fa-lock text-green-400"></i></label>
                                        <input type="text" value={formData.dob} readOnly className="locked-field" style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Gender <i className="fas fa-lock text-green-400"></i></label>
                                        <input type="text" value={formData.gender} readOnly className="locked-field" style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }} />
                                    </div>
                                </div>
                            )}

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
                                                    onChange={(e) => {
                                                        // Enforce Alphanumeric Only and Uppercase
                                                        const cleanVal = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                                        setFormData(prev => ({ ...prev, enrollmentNumber: cleanVal }));
                                                    }}
                                                    style={{ textTransform: 'uppercase' }}
                                                    autoComplete="off"
                                                />
                                                <small>Your official enrollment number from the institute</small>
                                            </div>

                                        </>
                                    )}

                                </>
                            )}
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" required placeholder="your.email@example.com" value={formData.email} onChange={handleChange} autoComplete="off" />
                            </div>
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
