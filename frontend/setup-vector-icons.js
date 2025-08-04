#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Professional Vector Icons Setup for React Native 0.80+\n');

// Check if react-native-vector-icons is installed
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

// Check Android configuration
const androidGradlePath = path.join(__dirname, 'android/app/build.gradle');
if (fs.existsSync(androidGradlePath)) {
  const gradleContent = fs.readFileSync(androidGradlePath, 'utf8');
  if (gradleContent.includes('applyNativeModulesAppBuildGradle')) {
    console.log('✅ Android autolinking configuration found');
  } else {
    console.log('⚠️  Android autolinking configuration may be missing');
  }
  
  if (gradleContent.includes('copyVectorIconsFonts')) {
    console.log('✅ Vector icons font copying task found');
  } else {
    console.log('⚠️  Vector icons font copying task missing');
  }
} else {
  console.log('❌ Android build.gradle not found');
}

// Create fonts directory if it doesn't exist
const fontsDir = path.join(__dirname, 'android/app/src/main/assets/fonts');
if (!fs.existsSync(fontsDir)) {
  try {
    fs.mkdirSync(fontsDir, { recursive: true });
    console.log('✅ Created fonts directory');
  } catch (error) {
    console.log('❌ Failed to create fonts directory:', error.message);
  }
}

// Copy vector icons fonts
const sourceFontsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');
if (fs.existsSync(sourceFontsDir)) {
  try {
    const fontFiles = fs.readdirSync(sourceFontsDir).filter(file => file.endsWith('.ttf'));
    console.log(`✅ Found ${fontFiles.length} font files in node_modules`);
    
    // Copy fonts
    fontFiles.forEach(fontFile => {
      const sourcePath = path.join(sourceFontsDir, fontFile);
      const destPath = path.join(fontsDir, fontFile);
      fs.copyFileSync(sourcePath, destPath);
    });
    console.log('✅ Copied vector icon fonts to Android assets');
  } catch (error) {
    console.log('❌ Failed to copy fonts:', error.message);
  }
} else {
  console.log('❌ Vector icons fonts not found in node_modules');
}

console.log('\n🚀 Professional Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Clean the project: cd android && ./gradlew clean');
console.log('2. Rebuild: npx react-native run-android --reset-cache');
console.log('\n🎯 Icons should now display properly!');

console.log('\n💡 If icons still don\'t work:');
console.log('1. Check Metro cache: npx react-native start --reset-cache');
console.log('2. Verify imports: import Icon from \'react-native-vector-icons/Feather\';');
console.log('3. Test with: <Icon name="home" size={24} color="black" />'); 