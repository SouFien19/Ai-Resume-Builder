const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'templates', 'jpg');
const outputDir = path.join(__dirname, '..', 'public', 'templates', 'webp');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✓ Created output directory:', outputDir);
}

// Get all JPG files
const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.jpg'));

console.log(`\nFound ${files.length} JPG files to convert:\n`);

// Track total savings
let totalOriginalSize = 0;
let totalWebPSize = 0;

// Convert each file
const convertPromises = files.map(async (file) => {
  const inputPath = path.join(inputDir, file);
  const outputFile = file.replace('.jpg', '.webp');
  const outputPath = path.join(outputDir, outputFile);
  
  try {
    // Get original file size
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;
    totalOriginalSize += originalSize;
    
    // Convert to WebP with quality 80
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    
    // Get WebP file size
    const webpStats = fs.statSync(outputPath);
    const webpSize = webpStats.size;
    totalWebPSize += webpSize;
    
    const savings = originalSize - webpSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    console.log(`✓ ${file.padEnd(20)} ${(originalSize/1024).toFixed(1)}KB → ${(webpSize/1024).toFixed(1)}KB (${savingsPercent}% smaller)`);
    
    return { file, originalSize, webpSize, savings };
  } catch (error) {
    console.error(`✗ Error converting ${file}:`, error.message);
    return null;
  }
});

Promise.all(convertPromises).then((results) => {
  const successful = results.filter(r => r !== null);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`CONVERSION COMPLETE: ${successful.length}/${files.length} files converted`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Total Original Size: ${(totalOriginalSize/1024).toFixed(1)} KB`);
  console.log(`Total WebP Size:     ${(totalWebPSize/1024).toFixed(1)} KB`);
  console.log(`Total Savings:       ${((totalOriginalSize - totalWebPSize)/1024).toFixed(1)} KB (${(((totalOriginalSize - totalWebPSize) / totalOriginalSize) * 100).toFixed(1)}%)`);
  console.log(`${'='.repeat(70)}\n`);
  
  // List top 3 savings
  const sorted = successful.sort((a, b) => b.savings - a.savings);
  console.log('Top 3 files with largest savings:');
  sorted.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i+1}. ${r.file}: saved ${(r.savings/1024).toFixed(1)} KB`);
  });
  
  console.log('\n✓ All images converted successfully!');
  console.log('\nNext steps:');
  console.log('  1. Update image paths from /templates/jpg/ to /templates/webp/');
  console.log('  2. Add loading="lazy" and priority props to Image components');
  console.log('  3. Rebuild and test: npm run build');
});
