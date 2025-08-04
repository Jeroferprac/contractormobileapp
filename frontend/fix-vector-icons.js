#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Professional Vector Icons Fix for React Native 0.80+\n');

// Step 1: Check if react-native-vector-icons is installed
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (!packageJson.dependencies['react-native-vector-icons']) {
  console.log('❌ react-native-vector-icons not found in dependencies');
  console.log('Run: npm install react-native-vector-icons');
  process.exit(1);
}

console.log('✅ react-native-vector-icons is installed');

// Step 2: Create fonts directory
const fontsDir = path.join(__dirname, 'android/app/src/main/assets/fonts');
if (!fs.existsSync(fontsDir)) {
  try {
    fs.mkdirSync(fontsDir, { recursive: true });
    console.log('✅ Created fonts directory');
  } catch (error) {
    console.log('❌ Failed to create fonts directory:', error.message);
  }
} else {
  console.log('✅ Fonts directory exists');
}

// Step 3: Copy vector icons fonts
const sourceFontsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');
if (fs.existsSync(sourceFontsDir)) {
  try {
    const fontFiles = fs.readdirSync(sourceFontsDir).filter(file => file.endsWith('.ttf'));
    console.log(`✅ Found ${fontFiles.length} font files`);
    
    let copiedCount = 0;
    fontFiles.forEach(fontFile => {
      const sourcePath = path.join(sourceFontsDir, fontFile);
      const destPath = path.join(fontsDir, fontFile);
      try {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
      } catch (error) {
        console.log(`⚠️  Failed to copy ${fontFile}:`, error.message);
      }
    });
    console.log(`✅ Copied ${copiedCount} font files to Android assets`);
  } catch (error) {
    console.log('❌ Failed to copy fonts:', error.message);
  }
} else {
  console.log('❌ Vector icons fonts not found in node_modules');
}

// Step 4: Check React Native config
const reactNativeConfigPath = path.join(__dirname, 'react-native.config.js');
if (fs.existsSync(reactNativeConfigPath)) {
  console.log('✅ React Native config file exists');
} else {
  console.log('⚠️  React Native config file missing');
}

console.log('\n🚀 Professional Fix Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Clean Metro cache: npx react-native start --reset-cache');
console.log('2. Clean Android: cd android && ./gradlew clean');
console.log('3. Rebuild: npx react-native run-android');
console.log('\n🎯 Icons should now display properly!');

console.log('\n💡 If icons still don\'t work:');
console.log('1. Check that fonts are copied: ls android/app/src/main/assets/fonts/');
console.log('2. Verify imports: import Icon from \'react-native-vector-icons/Feather\';');
console.log('3. Test with: <Icon name="home" size={24} color="black" />'); 