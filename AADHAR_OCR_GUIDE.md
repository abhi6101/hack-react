# 🪪 Aadhar Card OCR Extraction Guide

## 📋 **Aadhar Card Structure**

Based on actual Aadhar card analysis, here's the detailed structure:

### **Visual Layout:**

```
┌─────────────────────────────────────────────────────┐
│  🇮🇳 Logo    भारत सरकार (Orange bar)                │
│              Government of India (Green bar)         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Photo]     अभी जैन                                │
│              Abhi Jain                               │
│              जन्म तिथि / DOB : 23/03/2005           │
│              पुरुष / Male                      [QR] │
│                                                      │
│              5590 8885 4237                          │
│                                                      │
│  मेरा आधार, मेरी पहचान (Red tagline)                │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 **Color Scheme**

| Element | Color | Description |
|---------|-------|-------------|
| **Header Bar 1** | Orange/Saffron | `भारत सरकार` |
| **Header Bar 2** | Green | `Government of India` |
| **Background** | Light Gray/White | Card background |
| **Text** | Black | Main text content |
| **Tagline** | Red | `मेरा आधार, मेरी पहचान` |
| **Aadhar Number** | Black (Bold) | Large, prominent |

---

## 📊 **Data Fields to Extract**

### **1. Name (नाम)**

**Location**: Below photo, first text line

**Formats**:
- Hindi: `अभी जैन`
- English: `Abhi Jain` or `ABHI JAIN`

**Pattern**:
```regex
/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/i  // Abhi Jain
/^[A-Z\s]+$/                        // ABHI JAIN
```

**Extraction Logic**:
- Look for 2-4 words
- Length: 5-50 characters
- Mostly alphabetic characters
- Skip: GOVERNMENT, INDIA, भारत, सरकार, आधार, MALE, FEMALE

---

### **2. Date of Birth (जन्म तिथि / DOB)**

**Location**: After name, before gender

**Formats**:
- `जन्म तिथि / DOB : 23/03/2005`
- `DOB : 23/03/2005`
- `23/03/2005`

**Pattern**:
```regex
/(?:DOB|Date of Birth|जन्म तिथि)[:\s\/]*((\d{2})[\/\-](\d{2})[\/\-](\d{4}))/i
/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/
```

**Format**: DD/MM/YYYY or DD-MM-YYYY

---

### **3. Gender (लिंग)**

**Location**: After DOB, before QR code

**Formats**:
- Hindi: `पुरुष` (Male), `महिला` (Female)
- English: `Male`, `Female`, `MALE`, `FEMALE`

**Pattern**:
```regex
/\b(Male|Female|MALE|FEMALE|पुरुष|महिला)\b/i
```

**Normalization**:
- `पुरुष` → `Male`
- `महिला` → `Female`
- Capitalize first letter: `male` → `Male`

---

### **4. Aadhar Number (आधार संख्या)**

**Location**: Large text in center/bottom area

**Format**: 12 digits in 4-4-4 pattern

**Examples**:
- `5590 8885 4237` (with spaces)
- `559088854237` (without spaces)

**Pattern**:
```regex
/\b\d{4}\s*\d{4}\s*\d{4}\b/  // With optional spaces
/\b\d{12}\b/                  // Without spaces
```

**Cleaning**: Remove all spaces → `559088854237`

---

## 🔍 **OCR Extraction Algorithm**

### **Step 1: Capture Image**
```javascript
const imageData = captureFrame(); // From camera
```

### **Step 2: Perform OCR**
```javascript
const text = await performOCR(imageData); // Using Tesseract.js
```

### **Step 3: Extract Data**

#### **Aadhar Number:**
```javascript
const aadharMatch = text.match(/\b\d{4}\s*\d{4}\s*\d{4}\b/) || 
                   text.match(/\b\d{12}\b/);
const aadharNumber = aadharMatch ? aadharMatch[0].replace(/\s/g, '') : null;
```

#### **Date of Birth:**
```javascript
const dobMatch = text.match(/(?:DOB|Date of Birth|जन्म तिथि)[:\s\/]*((\d{2})[\/\-](\d{2})[\/\-](\d{4}))/i) ||
                text.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
const dob = dobMatch ? (dobMatch[1] || dobMatch[0]) : null;
```

#### **Gender:**
```javascript
const genderMatch = text.match(/\b(Male|Female|MALE|FEMALE|पुरुष|महिला)\b/i);
const gender = genderMatch ? 
    (genderMatch[1] === 'पुरुष' ? 'Male' : 
     genderMatch[1] === 'महिला' ? 'Female' : 
     genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase()) 
    : null;
```

#### **Name:**
```javascript
const lines = text.split('\n').filter(line => line.trim());
let name = '';

for (const line of lines) {
    // Skip headers
    if (line.includes('GOVERNMENT') || 
        line.includes('INDIA') || 
        line.includes('भारत') ||
        line.includes('सरकार') ||
        line.includes('आधार')) {
        continue;
    }
    
    // Match name pattern
    if (line.length >= 5 && line.length <= 50) {
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/i.test(line) || 
            /^[A-Z\s]+$/.test(line)) {
            if (!line.match(/^(MALE|FEMALE|DOB|VID)$/i)) {
                name = line;
                break;
            }
        }
    }
}
```

---

## ✅ **Validation Rules**

### **Required Fields:**
All 3 fields must be present for successful extraction:
1. ✅ Aadhar Number (12 digits)
2. ✅ Date of Birth (DD/MM/YYYY)
3. ✅ Gender (Male/Female)

### **Optional Field:**
- Name (extracted if available)

### **Success Criteria:**
```javascript
if (extracted.aadharNumber && extracted.dob && extracted.gender) {
    // ✅ Success!
    setScanStatus(`✓ Aadhar Scanned Successfully! Found: Aadhar#, DOB, Gender, Name`);
} else {
    // ❌ Retry
    const missing = [];
    if (!extracted.aadharNumber) missing.push('Aadhar#');
    if (!extracted.dob) missing.push('DOB');
    if (!extracted.gender) missing.push('Gender');
    setScanStatus(`Aadhar not clear. Missing: ${missing.join(', ')}. Retrying...`);
}
```

---

## 🎯 **Scan Feedback System**

### **During Scanning:**
```
Scanning Aadhar... (Attempt 1)
Scanning Aadhar... (Attempt 2)
Scanning Aadhar... (Attempt 3)
```

### **On Partial Success:**
```
Aadhar not clear. Missing: DOB. Retrying... (Attempt 2)
Aadhar not clear. Missing: Gender. Retrying... (Attempt 3)
Aadhar not clear. Missing: Aadhar#, DOB. Retrying... (Attempt 4)
```

### **On Complete Success:**
```
✓ Aadhar Scanned Successfully! Found: Aadhar#, DOB, Gender, Name (Attempt 5)
```

---

## 📸 **Best Practices for Scanning**

### **For Users:**
1. **Lighting**: Ensure good, even lighting
2. **Focus**: Keep card steady and in focus
3. **Angle**: Hold card flat, parallel to camera
4. **Distance**: Keep card at arm's length
5. **Background**: Use plain, contrasting background
6. **Clarity**: Ensure all text is clearly visible

### **For Developers:**
1. **Auto-retry**: Automatically retry every 2 seconds
2. **Feedback**: Show attempt counter and missing fields
3. **Patience**: Allow multiple attempts (no hard limit)
4. **Guidance**: Display helpful tips if scanning fails repeatedly
5. **Manual Entry**: Provide fallback for manual data entry

---

## 🔧 **Troubleshooting**

### **Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| **Aadhar# not detected** | Poor lighting, blur | Improve lighting, hold steady |
| **DOB not detected** | Small text, glare | Adjust angle, reduce glare |
| **Gender not detected** | OCR misread Hindi/English | Ensure clear text visibility |
| **Name not detected** | Similar to headers | Not critical, can be optional |

### **OCR Optimization:**
- Use Tesseract.js with English + Hindi language support
- Preprocess image: contrast enhancement, noise reduction
- Multiple scan attempts with slight delays
- Show real-time feedback to guide user

---

## 📝 **Example Output**

### **Successful Extraction:**
```javascript
{
    aadharNumber: "559088854237",
    dob: "23/03/2005",
    gender: "Male",
    name: "Abhi Jain"
}
```

### **Partial Extraction (Retry):**
```javascript
{
    aadharNumber: "559088854237",
    dob: null,              // ❌ Missing
    gender: "Male",
    name: "Abhi Jain"
}
// Status: "Missing: DOB. Retrying... (Attempt 3)"
```

---

## 🚀 **Implementation Status**

- ✅ Aadhar number extraction (12 digits)
- ✅ DOB extraction (DD/MM/YYYY)
- ✅ Gender extraction (Male/Female + Hindi)
- ✅ Name extraction (English)
- ✅ Hindi text support (पुरुष, महिला, जन्म तिथि)
- ✅ Scan attempt counter
- ✅ Missing fields feedback
- ✅ Auto-retry mechanism
- ✅ Success indicators

---

**Last Updated**: 2025-12-22
**Based on**: Actual Aadhar Card Structure Analysis
