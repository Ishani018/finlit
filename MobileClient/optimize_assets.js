const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const MAX_WIDTH = 512;
const QUALITY = 75;

async function processDirectory(directory) {
    if (!fs.existsSync(directory)) return;

    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processDirectory(fullPath);
        } else if (file.match(/\.(png|jpg|jpeg)$/i)) {
            await processImage(fullPath);
        }
    }
}

async function processImage(filePath) {
    try {
        const size = fs.statSync(filePath).size;

        // Skip if small enough (already optimized)
        if (size < 500 * 1024) return;

        console.log(`Optimizing: ${path.basename(filePath)} (${(size / 1024 / 1024).toFixed(2)} MB)`);

        const image = await Jimp.read(filePath);
        // Note: Jimp.read in v0 returns a promise resolving to an image

        if (image.bitmap.width > MAX_WIDTH) {
            image.resize(MAX_WIDTH, Jimp.AUTO);
        }

        image.quality(QUALITY);

        await image.writeAsync(filePath);

        const newSize = fs.statSync(filePath).size;
        console.log(`  -> ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

console.log('Starting Asset Optimization (Max Width: 1024px, Quality: 80)...');
processDirectory(ASSETS_DIR)
    .then(() => console.log('Optimization Complete!'))
    .catch(err => console.error(err));
