# Fixes Needed for Register.jsx

## Issue 1: Missing ID Card Photo in Registration Form

**Problem:** The ID card photo is not showing in the "Verified Identity Summary" section of the registration form.

**Solution:** The code exists in commit `886ca2c` but got lost. Need to add this code around line 979:

```jsx
<div className="verification-summary" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-shield-alt" style={{ color: '#4ade80' }}></i> Verified Identity Summary</h3>
    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {/* ID CARD FIRST - MOST IMPORTANT */}
        {idCameraImg && (<div style={{ textAlign: 'center' }}><img src={idCameraImg} alt="ID Scan" style={{ width: '150px', height: '95px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #4ade80', boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)' }} /><p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#4ade80', fontWeight: '600' }}>✓ College ID Card</p></div>)}
        {selfieImg && (<div style={{ textAlign: 'center' }}><img src={selfieImg} alt="Selfie" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4ade80', boxShadow: '0 4px 12px rgba(74, 222, 128, 0.2)' }} /><p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#aaa' }}>Live Selfie</p></div>)}
        {aadharCameraImg && (<div style={{ textAlign: 'center' }}><img src={aadharCameraImg} alt="Aadhar Scan" style={{ width: '120px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #555' }} /><p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#aaa' }}>Aadhar Card</p></div>)}
    </div>
</div>
```

---

## Issue 2: Wrong Batch Calculation for IMCA

**Problem:** IMCA shows "2022-2026" (4 years) but should be "2022-2027" (5 years).

**Root Cause:** The backend `/public/departments` API returns wrong `maxSemesters` for IMCA.

**Current:** IMCA has `maxSemesters: 8` (4 years)
**Should Be:** IMCA has `maxSemesters: 10` (5 years)

**Solution:** Update the backend database:

```sql
UPDATE departments 
SET max_semesters = 10 
WHERE code = 'IMCA';
```

OR if the frontend calculates it:

```javascript
// In the batch calculation logic
const getBatchEndYear = (branch, startYear) => {
    const durationMap = {
        'IMCA': 5,  // 5 years (10 semesters)
        'MCA': 2,   // 2 years (4 semesters)
        'BCA': 3,   // 3 years (6 semesters)
        // ... other courses
    };
    
    const duration = durationMap[branch] || 4; // default 4 years
    return parseInt(startYear) + duration;
};
```

---

## Issue 3: localStorage Verification Resumption Missing

**Problem:** When users complete verification (ID → Aadhar → Selfie), close browser, and rescan ID, they should skip to registration form. But this isn't working.

**Solution:** Add localStorage save/check code:

### A. Save verification data after selfie (in `takeSelfie` function):

```javascript
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
            
            // SAVE TO LOCALSTORAGE
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
```

### B. Check localStorage on ID scan (in `checkVerificationStatus` function):

```javascript
const checkVerificationStatus = async (cleanedMatch, finalBlob) => {
    try {
        setScanStatus("Checking verification status...");
        
        // Check localStorage first
        const localVerificationKey = `verification_${cleanedMatch.code}_${deviceFingerprint}`;
        const localVerification = localStorage.getItem(localVerificationKey);
        
        if (localVerification) {
            const savedData = JSON.parse(localVerification);
            
            if (savedData.allStepsCompleted) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Verification found. Proceeding to registration."));
                setScannedData(savedData.scannedData);
                setAadharData(savedData.aadharData);
                setSelfieImg(savedData.selfieImg);
                setIdCameraImg(savedData.idCameraImg);
                setAadharCameraImg(savedData.aadharCameraImg);
                setScanBuffer([]); stopCamera();
                setStep(4); // Skip to registration form
                return;
            }
        }
        
        // If not in localStorage, continue normal flow
        setScannedData(cleanedMatch);
        setIdCameraImg(URL.createObjectURL(finalBlob));
        setScanBuffer([]); stopCamera();
        setVerificationStage('ID_VERIFY_DATA');
        
    } catch (error) {
        console.error('Verification check failed:', error);
        setScannedData(cleanedMatch);
        setIdCameraImg(URL.createObjectURL(finalBlob));
        setScanBuffer([]); stopCamera();
        setVerificationStage('ID_VERIFY_DATA');
    }
};
```

### C. Clean up after registration (in `handleSubmit` function):

```javascript
if (response.ok) {
    // Clean up localStorage
    const localVerificationKey = `verification_${formData.computerCode}_${deviceFingerprint}`;
    localStorage.removeItem(localVerificationKey);
    console.log('✅ Verification data cleaned up from localStorage');
    
    setSuccess(result.message || "Registration successful!");
    setTimeout(() => navigate(`/verify-account?email=${encodeURIComponent(formData.email)}`), 1500);
}
```

---

## Quick Fix: Use Commit e5ead17

The easiest solution is to use the Register.jsx from commit `e5ead17` which has all these features:

```bash
git show e5ead17:src/pages/Register.jsx > src/pages/Register.jsx
git add src/pages/Register.jsx
git commit -m "fix: restore all features - ID photo, localStorage, IMCA duration"
git push origin main
```

This commit has:
- ✅ localStorage verification resumption
- ✅ ID card photo display
- ✅ Enrollment number field
- ✅ All security features
