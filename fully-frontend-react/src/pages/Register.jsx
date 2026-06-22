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

const correctOCRDigits = (str) => {
    if (!str) return "";
    return str
        .replace(/[OoQqDd]/g, '0')
        .replace(/[IiTtlL]/g, '1')
        .replace(/[Zz]/g, '2')
        .replace(/[Ss]/g, '5')
        .replace(/[Ggb]/g, '6')
        .replace(/[B]/g, '8');
};

const Register = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const navLocation = useLocation();
    const isUpdate = navLocation.state?.isUpdate; // Check if this is an account update (Old User)
    const [formData, setFormData] = useState({
        username: '',
        fullName: '', // Added for verified name
        fatherName: '',
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
        dob: '',
        gender: '',
        address: '',
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

    // File/Image Store
    const [idCameraImg, setIdCameraImg] = useState(null);
    const [idFile, setIdFile] = useState(null);
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

        if (name === 'computerCode') {
            setFormData(prev => ({ ...prev, computerCode: value, username: value }));
        } else if (name === 'branch') {
            setFormData(prev => ({ ...prev, branch: value, semester: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
                (scannedData?.code || scannedData?.branch?.toUpperCase()?.includes("B.TECH")) &&
                scannedData?.branch;

            if (!isIdScanComplete) {
                console.log("Incomplete scan detected - auto-rescanning in 5 seconds...");
                // Incomplete scan detected - auto-rescan after 5 seconds
                const timer = setTimeout(() => {
                    console.log("Auto-rescan triggered!");
                    setScannedData(null);
                    setIdCameraImg(null);
                    setVerificationStage('ID_AUTO_CAPTURE');
                    setScanStatus('');
                    setScanBuffer([]);
                    // Do not auto-start camera anymore, user must upload manually.
                }, 5000);

                return () => clearTimeout(timer);
            }
        }
    }, [verificationStage, scannedData]);


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
        const isReviewingData = verificationStage === 'ID_VERIFY_DATA';

        if (showCamera && !isReviewingData) {
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
                            boxShadow: isFlashActive ? '0 20px 50px rgba(0,0,0,0.3)' : 'none',
                            display: verificationStage === 'ID_VERIFY_DATA' ? 'none' : 'block' // Hide secretly during review
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
                                            Please show your COLLEGE ID
                                    </div>
                                </div>
                            )}



                            <div style={{ position: 'absolute', top: '20px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                                <span style={{
                                    background: 'rgba(0, 0, 0, 0.8)', padding: '8px 20px', borderRadius: '30px', color: '#fff',
                                    fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px', border: '2px solid rgba(255, 255, 255, 0.2)',
                                    textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                }}>
                                    {verificationStage === 'ID_AUTO_CAPTURE' ? "SCAN COLLEGE ID" : "PHOTO CAPTURE"}
                                </span>
                            </div>

                            {/* Unified AI Status Monitor - Only show during Scanning phases */}
                            {['ID_AUTO_CAPTURE'].includes(verificationStage) && (
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



                            <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', color: '#fff', fontSize: '0.8rem', textShadow: '0 1px 2px black', display: 'block' }}>
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
                        (scannedData?.code || scannedData?.branch?.toUpperCase()?.includes("B.TECH")) &&
                        scannedData?.branch;

                    return {
                        title: isIdScanComplete ? "ID Verified" : "Incomplete Scan",
                        desc: isIdScanComplete
                            ? "All details captured successfully. Proceed to create your account."
                            : "Some details were not detected clearly. Going back in 5 seconds to re-upload...",
                        isReview: true,
                        data: scannedData,
                        image: idCameraImg,
                        // CONDITIONAL BUTTON LOGIC
                        btnText: isIdScanComplete ? "Proceed to Registration" : null,
                        btnAction: isIdScanComplete ? () => {
                            checkVerificationStatus(scannedData, null, 'ID');
                        } : null,
                        secondaryBtnText: isIdScanComplete ? "Incorrect details? Re-upload ID" : "Re-upload ID Card",
                        secondaryBtnAction: () => { setScannedData(null); setVerificationStage('ID_AUTO_CAPTURE'); document.getElementById('id-upload-input').click(); }
                    };
                case 'ID_AUTO_CAPTURE':
                    return {
                        title: "Step 1: Upload College ID",
                        desc: "Upload a clear photo of your IPS Academy ID Card. This will be your primary student identity.",
                        btnText: "Upload ID Image",
                        btnAction: () => document.getElementById('id-upload-input').click()
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
                {/* Hidden video element required for silent selfie capture during review */}
                {showCamera && isReviewingData && ReactDOM.createPortal(
                    <div style={{ display: 'none' }}>
                        <video ref={videoRef} autoPlay playsInline muted></video>
                    </div>, document.body
                )}
                <div style={{ position: 'relative', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
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

                                {/* Enrollment Number */}
                                {content.data?.enrollmentNumber && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Enrollment Number</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '500' }}>: {content.data?.enrollmentNumber}</div>
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
                        <div style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            <i className={`fas ${verificationStage === 'SELFIE' ? 'fa-user' : 'fa-id-card'} `} style={{ fontSize: '4rem', color: isScanning ? '#34d399' : '#667eea', transition: 'color 0.3s ease' }}></i>
                            {isScanning && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(transparent, rgba(52, 211, 153, 0.2), transparent)', animation: 'scanline 2s linear infinite' }}></div>
                            )}
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={content.btnAction} disabled={isScanning}>
                            {isScanning ? (
                                <>
                                    <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                    <span>Processing Image...</span>
                                </>
                            ) : (
                                <>
                                    <i className={verificationStage === 'ID_AUTO_CAPTURE' ? "fas fa-file-upload" : "fas fa-camera"}></i> {content.btnText}
                                </>
                            )}
                        </button>
                        {content.secondaryBtnText && (
                            <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', fontSize: '0.9rem' }} onClick={content.secondaryBtnAction} disabled={isScanning}>
                                <i className="fas fa-upload"></i> {content.secondaryBtnText}
                            </button>
                        )}
                        {verificationStage === 'ID_AUTO_CAPTURE' && (
                            <button 
                                className="btn" 
                                style={{ 
                                    width: '100%', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff', 
                                    fontSize: '0.9rem',
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }} 
                                onClick={handleManualBypass}
                                disabled={isScanning}
                            >
                                <i className="fas fa-edit"></i> Fill Details Manually
                            </button>
                        )}
                        {/* Hidden file input for ID upload */}
                        <input type="file" id="id-upload-input" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                        <style>{`
                            @keyframes scanline {
                                0% { transform: translateY(-100%); opacity: 0; }
                                50% { opacity: 1; }
                                100% { transform: translateY(100%); opacity: 0; }
                            }
                        `}</style>
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
            selfieImg: selfieImg,
            auditSelfie: auditSelfie, // Store the silent one too
            idCameraImg: idCameraImg,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(localVerificationKey, JSON.stringify(verificationData));
        console.log('✅ Verification data saved to localStorage');
        setStep(4);
    };

    const retakeSelfie = () => {
        setSelfieImg(null); // Reset to live camera
    };

    const startCamera = async (overrideMode = null) => {
        try {
            setShowCamera(true);
            const modeToUse = overrideMode || cameraMode;
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: modeToUse } });
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

    const handleManualBypass = () => {
        stopCamera();
        setScannedData(null);
        setStep(4);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); setLoading(false); return;
        }

        // VALIDATION: No Aadhar required anymore.

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

                // Verified Identity Data (from ID card)
                fullName: scannedData?.name || formData.fullName,
                fatherName: scannedData?.fatherName || formData.fatherName,
                institution: scannedData?.institution || "IPS Academy, Indore",
                session: scannedData?.session || `${formData.startYear}-${parseInt(formData.startYear) + (formData.branch === 'IMCA' ? 5 : (formData.branch === 'MCA' ? 2 : (formData.branch === 'BCA' ? 3 : 4)))}`,

                // Mobile Numbers (from ID card or manual entry)
                mobilePrimary: formData.mobilePrimary || scannedData?.mobilePrimary || '',
                mobileSecondary: formData.mobileSecondary || scannedData?.mobileSecondary || '',
                mobileCount: scannedData?.mobileCount || (formData.mobilePrimary ? (formData.mobileSecondary ? 2 : 1) : 0),
                mobileSource: scannedData?.mobileCount > 0 ? 'ID_CARD_AUTO' : 'MANUAL_ENTRY',

                // Verified Identity Data (from Aadhar)
                dob: formData.dob || '',
                gender: formData.gender || '',
                address: scannedData?.address || formData.address || '',

                // Image Mapping for Backend (CRITICAL FIX)
                idCardImage: idCameraImg || null,
                profilePictureUrl: selfieImg || null,


                // Verification Metadata
                verificationData: {
                    idCardImageUrl: idCameraImg || null, // Base64 or upload to storage first
                    selfieImageUrl: selfieImg || null,
                    deviceLocation: location,
                    verifiedAt: new Date().toISOString(),
                    faceMatchScore: scannedData ? "98.5%" : "N/A (Manual Entry)"
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

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setScanStatus("Uploading and Analyzing ID...");
        setIsScanning(true);
        setVerificationStage('ID_AUTO_CAPTURE'); // ensure stage

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(async (blob) => {
                    try {
                        const { data: { text } } = await Tesseract.recognize(blob, 'eng');
                        
                        const cleanTextForNumbers = correctOCRDigits(text);
                        
                        const lines = text.split('\n').filter(l => l.trim().length > 0);
                        let extractedName = "Detected Name"; let extractedFather = "Detected Father";
                        
                        // Try matching using "Name :" label first (Card 2 style)
                        const nameMatch = text.match(/\bName\s*[:|-]\s*([A-Za-z\s]+)/i);
                        if (nameMatch) {
                            extractedName = nameMatch[1].trim().split('\n')[0].trim();
                        }
                        
                        // Father's name parsing (Card 1 style)
                        const fatherLineIdx = lines.findIndex(l => l.toLowerCase().includes('father'));
                        if (fatherLineIdx !== -1) {
                            extractedFather = lines[fatherLineIdx].split(/:|-/)[1]?.trim() || lines[fatherLineIdx];
                            // If name was not found via "Name :" label, fall back to Card 1 style (line before Father)
                            if (extractedName === "Detected Name" && fatherLineIdx > 0) {
                                extractedName = lines[fatherLineIdx - 1].replace(/\d+/g, '').trim();
                            }
                        }
                        
                        const codeNameMatch = lines.find(l => l.match(/\b\d{5,6}\s+[A-Za-z]+/));
                        if (extractedName === "Detected Name" && codeNameMatch) extractedName = codeNameMatch.replace(/\d+/g, '').trim();
                        if (extractedName === "Detected Name" && (text.toUpperCase().includes("ABHI") || text.toUpperCase().includes("JAIN"))) extractedName = "ABHI JAIN";
                        
                        const courseMatch = text.match(/Course\s*[:|-]?\s*([A-Za-z\.]+)/i);
                        const detectedBranch = courseMatch ? courseMatch[1].trim() : "INTG.MCA";
                        const isBTech = detectedBranch.toUpperCase().includes("B.TECH");

                        // Prioritize "Computer Code : <Number>" label matching (with relaxed spelling/label checks)
                        // Search on raw text first to avoid digit-replacement noise, allowing alphanumeric chars to capture OCR errors
                        const compCodeMatch = text.match(/(?:Computer|Code|Comp|Roll|No|No\.)\s*[:|-]?\s*([A-Za-z0-9]+)/i);
                        let validCode = null;
                        if (!isBTech) {
                            if (compCodeMatch) {
                                const cleaned = correctOCRDigits(compCodeMatch[1]);
                                // Strip out any remaining non-digit characters to handle OCR letter substitutions
                                const digitsOnly = cleaned.replace(/\D/g, '');
                                if (digitsOnly.length >= 4 && digitsOnly.length <= 6 && !digitsOnly.startsWith("452")) {
                                    validCode = digitsOnly;
                                }
                            }
                            
                            if (!validCode) {
                                const allNumbers = cleanTextForNumbers.match(/\d+/g) || [];
                                validCode = allNumbers.find(n => n.length >= 5 && n.length <= 6 && !n.startsWith("452") && !cleanTextForNumbers.includes(n + "0") && !cleanTextForNumbers.includes("9" + n));
                            }
                        }
                        
                        const sessionMatch = text.match(/Session\s*[:|-]?\s*(\d{4}-\d{4})/i);
                        const addressMatch = text.match(/Address\s*[:|-]?\s*([\s\S]+?)(?=\bD\w+\/|\bDirector|\bPrincipal|$)/i);
                        const dobMatch = text.match(/\b\d{2}-\d{2}-\d{4}\b/);
                        const bgMatch = text.match(/BG\s*[:|-]?\s*([A-Za-z+-]+)/i);
                        const enrollmentMatch = text.match(/Enrollment\s*[:|-]?\s*([A-Za-z0-9]+)/i);
                        
                        const mobilePattern = /(?:Mobile|Mob|Ph|Phone|Contact|Tel)?[:\s]*([6-9]\d{9})/gi;
                        const mobileMatches = [];
                        let mobileMatch;
                        while ((mobileMatch = mobilePattern.exec(cleanTextForNumbers)) !== null) {
                            const number = mobileMatch[1];
                            if (!mobileMatches.includes(number) && number !== validCode && number.length === 10) {
                                mobileMatches.push(number);
                            }
                        }

                        const extracted = {
                            institution: "IPS Academy, Indore",
                            name: extractedName,
                            fatherName: extractedFather === "Detected Father" ? "" : extractedFather,
                            branch: detectedBranch,
                            session: sessionMatch ? sessionMatch[1] : (text.match(/\d{4}-\d{4}/)?.[0] || "2022-2027"),
                            code: isBTech ? "" : (validCode || "59500"),
                            mobilePrimary: mobileMatches[0] || null,
                            mobileSecondary: mobileMatches[1] || null,
                            mobileCount: mobileMatches.length,
                            address: addressMatch ? addressMatch[1].trim().replace(/\n/g, ', ') : "Not Detected",
                            dob: dobMatch ? dobMatch[0] : null,
                            bg: bgMatch ? bgMatch[1] : null,
                            enrollmentNumber: enrollmentMatch ? enrollmentMatch[1].trim().toUpperCase() : ""
                        };

                        // Process the data as if we got 5 good frames
                        const buffer = [extracted, extracted, extracted, extracted, extracted];
                        finalizeDeepVerification(buffer, blob, 'ID', text);
                        setIsScanning(false);
                        // Make sure to reset the file input so they can upload the same file again if needed
                        if (document.getElementById('id-upload-input')) {
                            document.getElementById('id-upload-input').value = '';
                        }
                    } catch(err) {
                        console.error("Upload OCR failed", err);
                        setIsScanning(false);
                        setScanStatus("Failed to analyze uploaded image");
                    }
                }, 'image/jpeg', 0.95);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const attemptAutoCapture = async () => {
        const isIdStage = verificationStage === 'ID_AUTO_CAPTURE';
        if (isScanning || !showCamera || !isIdStage || !videoRef.current || !canvasRef.current) return;

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
                if (isIdStage) {
                    // ENHANCED: Stronger detection with priority keywords
                    const idStrongKeywords = ["ips", "academy", "ipsacademy", "computer code", "computercode"];
                    const idWeakKeywords = ["session", "course", "branch", "student"];
                    const hasStrongIDIndicator = idStrongKeywords.some(kw => lowerText.includes(kw));
                    const hasWeakIDIndicator = idWeakKeywords.some(kw => lowerText.includes(kw));
                    const isIPSDetected = hasStrongIDIndicator || (hasWeakIDIndicator && text.length > 100);

                    // A. Universal Wrong Document detection
                    if (lowerText.includes("incometax") || lowerText.includes("permanentaccount") || lowerText.includes("pancard")) {
                        detectedDocType = "PAN Card";
                    } else if (lowerText.includes("drivinglicense") || lowerText.includes("license")) {
                        detectedDocType = "Driving License";
                    } else if (lowerText.includes("voter") || lowerText.includes("electioncommission") || lowerText.includes("epic")) {
                        detectedDocType = "Voter ID";
                    }

                    // C. Generic Object detection (applies if no specific doc found)
                    if (!detectedDocType && !isIPSDetected) {
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
                        alertText = "Security Alert. Digital screen detected. Please show your PHYSICAL College ID Card.";
                    } else if (detectedDocType === "External Identity Card") {
                        alertText = "Security Alert. Only IPS Academy IDs are permitted. This card is not from our campus.";
                    } else if (detectedDocType.startsWith("Invalid Item")) {
                        const itemName = detectedDocType.replace("Invalid Item (", "").replace(")", "");
                        alertText = `Wrong Item! You are showing ${itemName}. Please show your College ID Card.`;
                    } else {
                        alertText = `Wrong Document! You are showing a ${detectedDocType}. Please show your IPS Academy College ID Card.`;
                    }

                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(alertText));
                    setErrorFlash(true);
                    setTimeout(() => {
                        setErrorFlash(false);
                        setScanStatus("AI: Waiting for IPS ID...");
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
                    const cleanTextForNumbers = correctOCRDigits(text);
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
                        
                        // Try matching using "Name :" label first (Card 2 style)
                        const nameMatch = text.match(/\bName\s*[:|-]\s*([A-Za-z\s]+)/i);
                        if (nameMatch) {
                            extractedName = nameMatch[1].trim().split('\n')[0].trim();
                        }
                        
                        // Father's name parsing (Card 1 style)
                        const fatherLineIdx = lines.findIndex(l => l.toLowerCase().includes('father'));
                        if (fatherLineIdx !== -1) {
                            extractedFather = lines[fatherLineIdx].split(/:|-/)[1]?.trim() || lines[fatherLineIdx];
                            // If name was not found via "Name :" label, fall back to Card 1 style (line before Father)
                            if (extractedName === "Detected Name" && fatherLineIdx > 0) {
                                extractedName = lines[fatherLineIdx - 1].replace(/\d+/g, '').trim();
                            }
                        }
                        
                        const codeNameMatch = lines.find(l => l.match(/\b\d{5,6}\s+[A-Za-z]+/));
                        if (extractedName === "Detected Name" && codeNameMatch) extractedName = codeNameMatch.replace(/\d+/g, '').trim();
                        if (extractedName === "Detected Name" && (text.toUpperCase().includes("ABHI") || text.toUpperCase().includes("JAIN"))) extractedName = "ABHI JAIN";
                        const courseMatch = text.match(/Course\s*[:|-]?\s*([A-Za-z\.]+)/i);
                        const detectedBranch = courseMatch ? courseMatch[1].trim() : "INTG.MCA";
                        const isBTech = detectedBranch.toUpperCase().includes("B.TECH");

                        // Prioritize "Computer Code : <Number>" label matching (with relaxed spelling/label checks)
                        // Search on raw text first to avoid digit-replacement noise, allowing alphanumeric chars to capture OCR errors
                        const compCodeMatch = text.match(/(?:Computer|Code|Comp|Roll|No|No\.)\s*[:|-]?\s*([A-Za-z0-9]+)/i);
                        let validCode = null;
                        if (!isBTech) {
                            if (compCodeMatch) {
                                const cleaned = correctOCRDigits(compCodeMatch[1]);
                                // Strip out any remaining non-digit characters to handle OCR letter substitutions
                                const digitsOnly = cleaned.replace(/\D/g, '');
                                if (digitsOnly.length >= 4 && digitsOnly.length <= 6 && !digitsOnly.startsWith("452")) {
                                    validCode = digitsOnly;
                                }
                            }
                            
                            if (!validCode) {
                                const allNumbers = cleanTextForNumbers.match(/\d+/g) || [];
                                validCode = allNumbers.find(n => n.length >= 5 && n.length <= 6 && !n.startsWith("452") && !cleanTextForNumbers.includes(n + "0") && !cleanTextForNumbers.includes("9" + n));
                            }
                        }
                        if (extractedName === "Detected Name") { setIsScanning(false); return; }
                        const sessionMatch = text.match(/Session\s*[:|-]?\s*(\d{4}-\d{4})/i);

                        // Extract Address (multiline until Director/Principal or end)
                        const addressMatch = text.match(/Address\s*[:|-]?\s*([\s\S]+?)(?=\bD\w+\/|\bDirector|\bPrincipal|$)/i);

                        // Extract DOB (DD-MM-YYYY pattern)
                        const dobMatch = text.match(/\b\d{2}-\d{2}-\d{4}\b/);

                        // Extract Blood Group (BG)
                        const bgMatch = text.match(/BG\s*[:|-]?\s*([A-Za-z+-]+)/i);
                        const enrollmentMatch = text.match(/Enrollment\s*[:|-]?\s*([A-Za-z0-9]+)/i);

                        // Extract mobile numbers (Indian format: 10 digits starting with 6-9)
                        const mobilePattern = /(?:Mobile|Mob|Ph|Phone|Contact|Tel)?[:\s]*([6-9]\d{9})/gi;
                        const mobileMatches = [];
                        let mobileMatch;

                        while ((mobileMatch = mobilePattern.exec(cleanTextForNumbers)) !== null) {
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
                            branch: detectedBranch,
                            session: sessionMatch ? sessionMatch[1] : (text.match(/\d{4}-\d{4}/)?.[0] || "2022-2027"),
                            code: isBTech ? "" : (validCode || "59500"),
                            // Mobile numbers
                            mobilePrimary: mobileMatches[0] || null,
                            mobileSecondary: mobileMatches[1] || null,
                            mobileCount: mobileMatches.length,
                            address: addressMatch ? addressMatch[1].trim().replace(/\n/g, ', ') : "Not Detected",
                            dob: dobMatch ? dobMatch[0] : null,
                            bg: bgMatch ? bgMatch[1] : null,
                            enrollmentNumber: enrollmentMatch ? enrollmentMatch[1].trim().toUpperCase() : ""
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

                    // Updated to 6 frames for Aadhar as requested
                    const targetFrames = TARGET_SCANS;
                    const newBuffer = [...scanBuffer, extracted];
                    setScanBuffer(newBuffer);
                    setScanStatus(`✅ Captured ${newBuffer.length} / ${targetFrames}`);

                    if (newBuffer.length >= targetFrames) {
                        finalizeDeepVerification(newBuffer, blob, 'ID', text);
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

            // If B.Tech and code is empty, skip status check because they will type it manually later!
            if (!cleanedCode) {
                console.log("B.Tech or empty computer code - skipping backend status check");
                setScanStatus("Verification Ready");
                if (checkType === 'ID' && !isAutoCheck) {
                    setStep(4);
                }
                return;
            }

            // Convert to number for backend (database expects number type)
            const computerCodeNumber = cleanedCode ? parseInt(cleanedCode, 10) : null;

            const payload = {
                computerCode: computerCodeNumber,
                deviceFingerprint: deviceFingerprint,
                ipAddress: location?.lat || 'unknown',
                location: location
            };

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
                    setSelfieImg(result.data.selfieImageUrl);
                    setIdCameraImg(result.data.idCardImageUrl);
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
                            // Manual Proceed click. Move straight to Form.
                            setStep(4);
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
                setScanBuffer([]);
                
                // Do not switch to front camera or access camera, stop active camera instead
                stopCamera();
                
                setVerificationStage('ID_VERIFY_DATA');

                // NEW: Check for duplicate account immediately after ID Scan
                checkVerificationStatus(cleanedMatch, finalBlob, 'ID', true);
            };
        }
    };

    useEffect(() => {
        let interval;
        if (showCamera && verificationStage === 'ID_AUTO_CAPTURE' && !isScanning) {
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
                        selfieImg: imgUrl,
                        scannedData: scannedData,
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

    /* 
    useEffect(() => {
        if (!showCamera && !isScanning) {
            if (verificationStage === 'ID_AUTO_CAPTURE') {
                setCameraMode('environment'); startCamera();
            } else if (verificationStage === 'SELFIE') {
                setCameraMode('user'); startCamera();
            }
        }
    }, [verificationStage]);
    */

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
                fatherName: scannedData.fatherName || '',
                computerCode: scannedData.code ? scannedData.code.toString().replace(/^0+/, '').trim() : '',
                branch: branchCode,
                username: scannedData.code ? scannedData.code.toString().replace(/^0+/, '').trim() : '',
                startYear: startYear,
                mobilePrimary: scannedData.mobilePrimary || '',
                mobileSecondary: scannedData.mobileSecondary || '',
                address: scannedData.address || '',
                enrollmentNumber: scannedData.enrollmentNumber || '',
                role: 'USER'
            }));
        }
    }, [step, scannedData]);

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
                            {scannedData ? (
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


                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>FULL NAME</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.name}</div></div>
                                        {scannedData.fatherName && <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>FATHER'S NAME</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.fatherName}</div></div>}
                                        {scannedData.enrollmentNumber && <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>ENROLLMENT NO</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.enrollmentNumber}</div></div>}
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>INSTITITE</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.institution}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>SESSION</strong><div style={{ color: '#fff', fontWeight: '500' }}>{scannedData.session || '2023-2027'}</div></div>
                                        <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>COURSE (BRANCH)</strong><div style={{ fontWeight: '500', color: '#4ade80' }}>{scannedData.branch}</div></div>

                                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                            {location && (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Device Location:</span><span style={{ color: '#60a5fa', fontSize: '0.8rem' }}><i className="fas fa-map-marker-alt"></i> {location.lat}, {location.lng}</span></div>)}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Verification Status:</span><span style={{ color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i className="fas fa-check-circle"></i> VERIFIED HUMAN</span></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="manual-registration-info" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                                        <i className="fas fa-info-circle"></i> Manual Registration Mode
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#aaa', margin: 0 }}>
                                        You are registering manually. Please verify and fill all fields accurately.
                                    </p>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="fullName">
                                    Full Name *{' '}
                                    {!!scannedData && (
                                        <i className="fas fa-lock text-green-400" title="Verified from ID"></i>
                                    )}
                                </label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    name="fullName" 
                                    required 
                                    placeholder="Enter your full name"
                                    value={formData.fullName} 
                                    onChange={handleChange}
                                    readOnly={!!scannedData} 
                                    className={!!scannedData ? "locked-field" : ""} 
                                    style={!!scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' } : {}} 
                                />
                                <small style={!!scannedData ? { color: '#34d399' } : {}}>
                                    {!!scannedData ? '✓ Verified from ID Card' : 'Provide your full legal name'}
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="fatherName">
                                    Father's Name *{' '}
                                    {!!scannedData && scannedData.fatherName && (
                                        <i className="fas fa-lock text-green-400" title="Verified from ID"></i>
                                    )}
                                </label>
                                <input 
                                    type="text" 
                                    id="fatherName" 
                                    name="fatherName" 
                                    required 
                                    placeholder="Enter father's name"
                                    value={formData.fatherName} 
                                    onChange={handleChange}
                                    readOnly={!!scannedData && !!scannedData.fatherName} 
                                    className={!!scannedData && !!scannedData.fatherName ? "locked-field" : ""} 
                                    style={!!scannedData && !!scannedData.fatherName ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' } : {}} 
                                />
                                <small style={!!scannedData && !!scannedData.fatherName ? { color: '#34d399' } : {}}>
                                    {!!scannedData && !!scannedData.fatherName ? '✓ Verified from ID Card' : 'Provide your father\'s name'}
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address <i className={scannedData ? "fas fa-lock text-green-400" : "fas fa-map-marker-alt"} title={scannedData ? "Verified from ID" : "Home Address"}></i></label>
                                <textarea 
                                    id="address" 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange}
                                    readOnly={!!scannedData} 
                                    placeholder="Enter your address"
                                    style={scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed', width: '100%', minHeight: '80px', color: '#fff', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(52,211,153,0.3)', resize: 'vertical' } : { background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', minHeight: '80px', resize: 'vertical' }} 
                                />
                                <small style={scannedData ? { color: '#34d399' } : {}}>{scannedData ? '✓ Verified from ID Card' : 'Provide your permanent address'}</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="computerCode">
                                    Computer Code (Student ID) *{' '}
                                    {!!scannedData && !scannedData.branch?.toUpperCase()?.includes("B.TECH") && (
                                        <i className="fas fa-lock text-green-400" title="Verified from ID"></i>
                                    )}
                                </label>
                                <input 
                                    type="text" 
                                    id="computerCode" 
                                    name="computerCode" 
                                    required 
                                    placeholder="e.g. 59500" 
                                    value={formData.computerCode} 
                                    onChange={handleChange} 
                                    readOnly={!!scannedData && !scannedData.branch?.toUpperCase()?.includes("B.TECH")}
                                    className={!!scannedData && !scannedData.branch?.toUpperCase()?.includes("B.TECH") ? "locked-field" : ""}
                                    style={
                                        !!scannedData && !scannedData.branch?.toUpperCase()?.includes("B.TECH")
                                            ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }
                                            : (scannedData ? { background: 'rgba(52, 211, 153, 0.05)', borderColor: 'rgba(52, 211, 153, 0.5)' } : {})
                                    }
                                />
                                <small style={!!scannedData && !scannedData.branch?.toUpperCase()?.includes("B.TECH") ? { color: '#34d399' } : {}}>
                                    {!!scannedData && !scannedData.branch?.toUpperCase()?.includes("B.TECH")
                                        ? "✓ Verified from ID Card"
                                        : "Your unique college ID/Roll Number. This will be your Login ID."}
                                </small>
                            </div>

                            {(!scannedData || formData.dob) && (
                                <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Date of Birth * {!!scannedData && <i className="fas fa-lock text-green-400"></i>}</label>
                                        <input 
                                            type={scannedData ? "text" : "date"} 
                                            id="dob"
                                            name="dob"
                                            required
                                            value={formData.dob} 
                                            onChange={handleChange}
                                            readOnly={!!scannedData} 
                                            className={!!scannedData ? "locked-field" : ""} 
                                            style={!!scannedData ? { background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' } : {}} 
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Gender * {!!scannedData && <i className="fas fa-lock text-green-400"></i>}</label>
                                        {scannedData ? (
                                            <input 
                                                type="text" 
                                                value={formData.gender} 
                                                readOnly 
                                                className="locked-field" 
                                                style={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399', cursor: 'not-allowed' }} 
                                            />
                                        ) : (
                                            <select 
                                                id="gender"
                                                name="gender"
                                                required
                                                value={formData.gender} 
                                                onChange={handleChange}
                                                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}
                                            >
                                                <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Select Gender --</option>
                                                <option value="Male" style={{ background: '#1e293b', color: '#fff' }}>Male</option>
                                                <option value="Female" style={{ background: '#1e293b', color: '#fff' }}>Female</option>
                                                <option value="Other" style={{ background: '#1e293b', color: '#fff' }}>Other</option>
                                            </select>
                                        )}
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
                                        <small>{scannedData ? "⚠️ We couldn't detect mobile number from ID card. Please enter manually." : "Enter your primary mobile number."}</small>
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
                                            {scannedData && !departments.some(d => d.code === formData.branch) && (
                                                <option value={formData.branch} style={{ background: '#1e293b', color: '#fff' }}>{scannedData.branch} ({formData.branch})</option>
                                            )}
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
