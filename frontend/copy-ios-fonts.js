#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Copying Vector Icons to iOS Bundle\n');

// iOS fonts directory
const iosFontsDir = path.join(__dirname, 'ios/frontend/fonts');
const sourceFontsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');

// Create iOS fonts directory
if (!fs.existsSync(iosFontsDir)) {
  try {
    fs.mkdirSync(iosFontsDir, { recursive: true });
    console.log('✅ Created iOS fonts directory');
  } catch (error) {
    console.log('❌ Failed to create iOS fonts directory:', error.message);
  }
} else {
  console.log('✅ iOS fonts directory exists');
}

// Copy fonts to iOS
if (fs.existsSync(sourceFontsDir)) {
  try {
    const fontFiles = fs.readdirSync(sourceFontsDir).filter(file => file.endsWith('.ttf'));
    console.log(`✅ Found ${fontFiles.length} font files`);
    
    let copiedCount = 0;
    fontFiles.forEach(fontFile => {
      const sourcePath = path.join(sourceFontsDir, fontFile);
      const destPath = path.join(iosFontsDir, fontFile);
      try {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
      } catch (error) {
        console.log(`⚠️  Failed to copy ${fontFile}:`, error.message);
      }
    });
    console.log(`✅ Copied ${copiedCount} font files to iOS bundle`);
  } catch (error) {
    console.log('❌ Failed to copy fonts:', error.message);
  }
} else {
  console.log('❌ Vector icons fonts not found in node_modules');
}

console.log('\n🚀 iOS Font Copy Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Clean iOS build: cd ios && rm -rf build/');
console.log('2. Install pods: cd ios && pod install');
console.log('3. Rebuild: npx react-native run-ios'); 