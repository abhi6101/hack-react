# 🔧 MANUAL INTEGRATION GUIDE

## Problem
The Aadhar scanning in AccountRecovery.jsx is still using the old single-attempt logic instead of the new 4-frame multi-capture system.

## Solution
Replace the old functions with the new ones from AADHAR_MULTI_FRAME_SCAN.js

---

## Step-by-Step Instructions:

### Step 1: Open AccountRecovery.jsx
Location: `src/pages/AccountRecovery.jsx`

### Step 2: Find the OLD functions (around line 227-284)
Look for these two functions:
- `handleStartAadharScan` (line ~227)
- `attemptAadharScan` (line ~239)

### Step 3: DELETE the old functions
Delete everything from line 227 to line 284 (both functions completely)

### Step 4: COPY the new functions
Open `AADHAR_MULTI_FRAME_SCAN.js` and copy ALL the code (lines 4-165)

### Step 5: PASTE at line 227
Paste the copied code where you deleted the old functions

### Step 6: Save the file

---

## What You're Replacing:

### OLD CODE (DELETE THIS):
```javascript
const handleStartAadharScan = async () => {
    setStage('AADHAR_SCAN');
    setScanStatus('');
    setAadharScanAttempt(0);
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
    // ... rest of old code
};
```

### NEW CODE (PASTE THIS):
```javascript
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
    // ... new multi-frame logic
};

const calculateAadharScore = (extracted) => {
    // ... scoring logic
};

const processBestAadharCapture = (captures) => {
    // ... best frame selection
};

const proceedWithAadharData = (imageData, extracted, frameNumber) => {
    // ... proceed logic
};
```

---

## Quick Fix (Alternative):

If manual editing is difficult, I can create a completely new AccountRecovery.jsx file with all the correct code integrated. Would you like me to do that instead?

---

## Verification:

After replacing, you should see these 5 functions in AccountRecovery.jsx:
1. ✅ `handleStartAadharScan()` - Initiates 4-frame capture
2. ✅ `captureAadharFrame(frameNumber)` - Captures one frame
3. ✅ `calculateAadharScore(extracted)` - Scores the data
4. ✅ `processBestAadharCapture(captures)` - Selects best frame
5. ✅ `proceedWithAadharData(...)` - Proceeds with selected data

---

## Testing:

After integration, test by:
1. Going to Account Recovery flow
2. Scanning ID card
3. When Aadhar scan starts, you should see:
   - "📸 Preparing to capture Aadhar card..."
   - "📸 Capture 1/4: Hold Aadhar card steady..."
   - "📸 Capturing frame 1/4..."
   - etc.

---

**Need Help?** Let me know if you want me to create a complete new AccountRecovery.jsx file with everything integrated!
