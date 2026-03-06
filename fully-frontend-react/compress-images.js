// TinyPNG Image Compression Script
// Run with: node compress-images.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// Your TinyPNG API Key
const API_KEY = 'LpMLrJqYCsZZk04LgY70MQDJ7yyKDKR5';

// Directory containing images
const IMAGE_DIR = path.join(__dirname, 'public', 'images');

// Supported formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];

// Get all image files
function getImageFiles(dir) {
    const files = fs.readdirSync(dir);
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_FORMATS.includes(ext);
    }).map(file => path.join(dir, file));
}

// Compress a single image
function compressImage(filePath) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(filePath);
        console.log(`🔄 Compressing: ${fileName}...`);

        const options = {
            method: 'POST',
            hostname: 'api.tinify.com',
            path: '/shrink',
            auth: 'api:' + API_KEY,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 201) {
                // Get the compressed image URL
                const compressedUrl = res.headers.location;

                // Download the compressed image
                https.get(compressedUrl, (downloadRes) => {
                    const chunks = [];
                    downloadRes.on('data', chunk => chunks.push(chunk));
                    downloadRes.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        const originalSize = fs.statSync(filePath).size;
                        const compressedSize = buffer.length;
                        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

                        // Save compressed image (overwrite original)
                        fs.writeFileSync(filePath, buffer);

                        console.log(`✅ ${fileName}: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${savings}% saved)`);
                        resolve({ fileName, originalSize, compressedSize, savings });
                    });
                }).on('error', reject);
            } else {
                reject(new Error(`Failed to compress ${fileName}: ${res.statusCode}`));
            }
        });

        req.on('error', reject);

        // Send the image file
        const fileData = fs.readFileSync(filePath);
        req.write(fileData);
        req.end();
    });
}

// Main function
async function compressAllImages() {
    console.log('🚀 Starting image compression...\n');

    const imageFiles = getImageFiles(IMAGE_DIR);

    if (imageFiles.length === 0) {
        console.log('❌ No images found in /public/images/');
        return;
    }

    console.log(`📁 Found ${imageFiles.length} images to compress\n`);

    let totalOriginal = 0;
    let totalCompressed = 0;
    let successCount = 0;
    let failCount = 0;

    for (const filePath of imageFiles) {
        try {
            const result = await compressImage(filePath);
            totalOriginal += result.originalSize;
            totalCompressed += result.compressedSize;
            successCount++;
        } catch (error) {
            console.error(`❌ Error compressing ${path.basename(filePath)}:`, error.message);
            failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1);

    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPRESSION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully compressed: ${successCount} images`);
    console.log(`❌ Failed: ${failCount} images`);
    console.log(`📦 Total original size: ${(totalOriginal / 1024).toFixed(1)} KB`);
    console.log(`📦 Total compressed size: ${(totalCompressed / 1024).toFixed(1)} KB`);
    console.log(`💾 Total savings: ${(totalOriginal - totalCompressed) / 1024} KB (${totalSavings}%)`);
    console.log('='.repeat(50));
    console.log('\n✨ All done! Your images have been optimized.');
}

// Run the script
compressAllImages().catch(console.error);
