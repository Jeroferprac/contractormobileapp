// Simple test script to verify app structure
console.log('🧪 Testing React Native App Structure...');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'App.tsx',
  'src/components/Button.tsx',
  'src/components/Input.tsx',
  'src/screens/LoginScreen.tsx',
  'src/screens/SignupScreen.tsx',
  'src/screens/HomeScreen/HomeScreen.tsx',
  'src/context/AuthContext.tsx',
  'src/api/api.ts',
  'src/api/mockApi.ts',
  'src/navigation/AppNavigator.tsx',
  'src/constants/colors.ts',
  'src/constants/spacing.ts',
  'package.json',
  'tsconfig.json'
];

console.log('\n📁 Checking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📦 Checking package.json dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredDeps = ['react', 'react-native', '@react-navigation/native', 'axios'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]} (dev)`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
  allFilesExist = false;
}

console.log('\n🎯 Test Results:');
if (allFilesExist) {
  console.log('✅ All required files and dependencies are present!');
  console.log('🚀 App is ready for testing.');
} else {
  console.log('❌ Some files or dependencies are missing.');
  console.log('🔧 Please check the missing items above.');
}

console.log('\n📱 Next Steps:');
console.log('1. Run: pnpm start (Metro bundler)');
console.log('2. Run: pnpm run android (in another terminal)');
console.log('3. Test login with: test@example.com / password');
console.log('4. Test signup with any email except existing@example.com'); 