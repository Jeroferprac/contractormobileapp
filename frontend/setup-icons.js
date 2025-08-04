#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Vector Icons for React Native...\n');

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
  if (gradleContent.includes('react-native-vector-icons')) {
    console.log('✅ Android vector icons configuration found');
  } else {
    console.log('⚠️  Android vector icons configuration may be missing');
    console.log('Make sure to run: npx react-native link react-native-vector-icons');
  }
} else {
  console.log('❌ Android build.gradle not found');
}

// Check iOS configuration
const iosPodfilePath = path.join(__dirname, 'ios/Podfile');
if (fs.existsSync(iosPodfilePath)) {
  const podfileContent = fs.readFileSync(iosPodfilePath, 'utf8');
  if (podfileContent.includes('RNVectorIcons')) {
    console.log('✅ iOS vector icons configuration found');
  } else {
    console.log('⚠️  iOS vector icons configuration may be missing');
    console.log('Make sure to run: npx react-native link react-native-vector-icons');
  }
} else {
  console.log('❌ iOS Podfile not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Run: npx react-native link react-native-vector-icons');
console.log('2. For iOS: cd ios && pod install');
console.log('3. Clean and rebuild: npx react-native run-android --reset-cache');
console.log('\n🎯 Icons should now display properly!'); 