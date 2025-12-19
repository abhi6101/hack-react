from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import re
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# IMPORTANT: PATH TO TESSERACT. Users must install this.
# On Windows, it's usually here. If not, add to PATH or change this line.
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_bytes):
    # Convert to standard PIL Image
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to OpenCV format
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    
    # Grayscale
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    
    # Thresholding to get black text on white background
    # OTSU thresholding handles varying lighting
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Convert back to PIL for Tesseract
    return Image.fromarray(thresh)

def extract_details(text):
    data = {}
    
    # --- IPS ACADEMY SPECIAL LOGIC ---
    # Look for "IPS Academy" to trigger specific parsing
    is_ips = re.search(r'IPS\s*Academy', text, re.IGNORECASE)
    
    if is_ips:
        # 1. Enrollment and Name are often on the same line: "59500 ABHI JAIN"
        # Regex: Start of line -> 5-digit number -> whitespace -> Name
        ips_identity_match = re.search(r'(?m)^(\d{5,6})\s+([A-Z\s]+)$', text)
        if ips_identity_match:
            data['enrollmentNumber'] = ips_identity_match.group(1).strip()
            # Avoid capturing "Father" if it leaks into the group
            raw_name = ips_identity_match.group(2).strip()
            data['fullName'] = raw_name
    
    # --- GENERIC LOGIC (Fallback) ---
    
    # 1. Names (Heuristic: Lines after "Name:" if not found above)
    if 'fullName' not in data:
        name_match = re.search(r'(?:Name|Student Name)\s*[:\.-]\s*([A-Za-z\s]+)', text, re.IGNORECASE)
        if name_match:
            data['fullName'] = name_match.group(1).strip()
    
    # 2. Enrollment / ID (Heuristic: "Enr No", "ID:" if not found above)
    if 'enrollmentNumber' not in data:
        enr_match = re.search(r'(?:Enrollment|Enr|Roll|Reg|ID)\s*(?:No|Number|Num)?\s*[:\.-]\s*([A-Z0-9]+)', text, re.IGNORECASE)
        if enr_match:
            data['enrollmentNumber'] = enr_match.group(1).strip()
        # Fallback: Just look for the 59500 pattern if we missed it
        elif is_ips:
             simple_id = re.search(r'\b(\d{5})\b', text)
             if simple_id: data['enrollmentNumber'] = simple_id.group(1)

    # 3. Branch / Course
    # We look for keywords like "B.Tech", "MCA", "BCA", "CSE", "INTG.MCA"
    branch_map = {
        'INTG.MCA': 'IMCA', # IPS Specific
        'MCA': 'MCA',
        'BCA': 'BCA',
        'Computer Science': 'CSE',
        'CSE': 'CSE',
        'B.Tech': 'BTECH',
    }
    
    for key, code in branch_map.items():
        if re.search(re.escape(key), text, re.IGNORECASE):
            data['branch'] = code
            break

    # 4. Batch / Session (Pattern: 20xx-20xx)
    batch_match = re.search(r'(20\d{2}\s*[-–]\s*20\d{2})', text)
    if batch_match:
        data['batch'] = batch_match.group(1).replace('–', '-')

    # 5. Fallback Name Extraction (Look for first line that looks like a name if not found)
    # This is risky, keeping it simple for now.
    
    return data

@app.route('/scan-id', methods=['POST'])
def scan_id():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Preprocess
        processed_img = preprocess_image(file.read())
        
        # OCR
        text = pytesseract.image_to_string(processed_img)
        print("--- Extracted Text ---")
        print(text)
        print("----------------------")
        
        # Parse
        extracted_data = extract_details(text)
        extracted_data['raw_text'] = text # Debug info
        
        return jsonify(extracted_data)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with backend (8080) and frontend (5173/3000)
    app.run(port=5001, debug=True)
