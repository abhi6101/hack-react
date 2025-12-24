// IMPROVED AADHAR SCANNING LOGIC
// Replace the handleStartAadharScan and attemptAadharScan functions with these:

const handleStartAadharScan = async () => {
    setStage('AADHAR_SCAN');
    setScanStatus('📸 Preparing to capture Aadhar card...');
    setAadharScanAttempt(0);
    setAadharCaptureCount(0);
    setAadharCaptures([]);
    if (!cameraActive) {
        await startCamera();
    }
    setTimeout(() => {
        setScanStatus('📸 Capture 1/4: Hold Aadhar card steady...');
        setTimeout(() => captureAadharFrame(1), 1500);
    }, 1000);
};

const captureAadharFrame = async (frameNumber) => {
    if (!cameraActive) return;

    setScanStatus(`📸 Capturing frame ${frameNumber}/4...`);
    const imageData = captureFrame();

    if (!imageData) {
        setScanStatus(`❌ Failed to capture frame ${frameNumber}. Retrying...`);
        setTimeout(() => captureAadharFrame(frameNumber), 1000);
        return;
    }

    // Perform OCR on this frame
    setIsScanning(true);
    setScanStatus(`🔍 Analyzing frame ${frameNumber}/4...`);
    const text = await performOCR(imageData);
    const extracted = extractAadharData(text);

    // Store this capture with its score
    const score = calculateAadharScore(extracted);
    const newCaptures = [...aadharCaptures, { imageData, extracted, score, frameNumber }];
    setAadharCaptures(newCaptures);
    setAadharCaptureCount(frameNumber);

    // Show progress
    const foundItems = [];
    if (extracted.aadharNumber) foundItems.push('Aadhar#');
    if (extracted.dob) foundItems.push('DOB');
    if (extracted.gender) foundItems.push('Gender');
    if (extracted.name) foundItems.push('Name');

    setScanStatus(`✓ Frame ${frameNumber}/4 captured! Found: ${foundItems.length > 0 ? foundItems.join(', ') : 'None'}`);

    if (frameNumber < 4) {
        // Capture next frame
        setTimeout(() => {
            setScanStatus(`📸 Capture ${frameNumber + 1}/4: Hold steady...`);
            setTimeout(() => captureAadharFrame(frameNumber + 1), 1500);
        }, 1000);
    } else {
        // All 4 frames captured, pick the best one
        processBestAadharCapture(newCaptures);
    }
};

const calculateAadharScore = (extracted) => {
    let score = 0;
    if (extracted.aadharNumber) score += 40;
    if (extracted.dob) score += 30;
    if (extracted.gender) score += 20;
    if (extracted.name) score += 10;
    return score;
};

const processBestAadharCapture = (captures) => {
    setScanStatus('🔍 Analyzing all captures...');

    // Find the capture with the highest score
    const bestCapture = captures.reduce((best, current) =>
        current.score > best.score ? current : best
    );

    const { imageData, extracted, frameNumber } = bestCapture;

    // Check if we have all required fields
    if (extracted.aadharNumber && extracted.dob && extracted.gender) {
        // Validate name match with ID card
        if (idData && extracted.name) {
            const idName = (idData.name || '').toLowerCase().trim();
            const aadharName = extracted.name.toLowerCase().trim();

            // Check if names are similar
            const nameMatch = idName.includes(aadharName) ||
                aadharName.includes(idName) ||
                idName === aadharName;

            if (!nameMatch && idName) {
                setScanStatus(`⚠️ Name mismatch! ID: "${idData.name}" vs Aadhar: "${extracted.name}"`);
                setError(`Name mismatch detected. ID Card shows "${idData.name}" but Aadhar shows "${extracted.name}". Please ensure both documents belong to the same person.`);
                setIsScanning(false);

                // Give user option to retry or continue
                setTimeout(() => {
                    if (window.confirm('Name mismatch detected. Do you want to retry Aadhar scan?')) {
                        handleStartAadharScan();
                    } else {
                        // Continue anyway
                        proceedWithAadharData(imageData, extracted, frameNumber);
                    }
                }, 2000);
                return;
            }
        }

        proceedWithAadharData(imageData, extracted, frameNumber);
    } else {
        // Missing required fields
        const missing = [];
        if (!extracted.aadharNumber) missing.push('Aadhar#');
        if (!extracted.dob) missing.push('DOB');
        if (!extracted.gender) missing.push('Gender');

        setScanStatus(`❌ Best capture (Frame ${frameNumber}) still missing: ${missing.join(', ')}`);
        setError(`Failed to extract all required fields after 4 attempts. Missing: ${missing.join(', ')}. Please try again with better lighting and card clarity.`);
        setIsScanning(false);

        // Offer to retry
        setTimeout(() => {
            if (window.confirm('Failed to scan Aadhar completely. Retry?')) {
                handleStartAadharScan();
            }
        }, 2000);
    }
};

const proceedWithAadharData = (imageData, extracted, frameNumber) => {
    setAadharData({
        ...extracted,
        image: imageData
    });

    const foundItems = [];
    if (extracted.aadharNumber) foundItems.push('Aadhar#');
    if (extracted.dob) foundItems.push('DOB');
    if (extracted.gender) foundItems.push('Gender');
    if (extracted.name) foundItems.push('Name');

    setScanStatus(`✅ Aadhar Scanned Successfully! (Best: Frame ${frameNumber}) Found: ${foundItems.join(', ')}`);
    setIsScanning(false);
    setError('');

    // Auto-proceed to selfie
    setTimeout(() => {
        handleCaptureSelfie();
    }, 2000);
};
