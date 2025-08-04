#!/usr/bin/env node

const axios = require('axios');

console.log('🚀 Quick Backend Test for React Native App');
console.log('===========================================\n');

const BACKEND_URL = 'http://192.168.31.45:8000';

async function quickTest() {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status === 200 || response.status === 401) {
      console.log('✅ Backend is accessible!');
      console.log('\n📱 Now you can test your React Native app:');
      console.log('\n1. Start your backend (if not already running):');
      console.log('   cd /path/to/your/backend');
      console.log('   # For Django: python manage.py runserver 192.168.31.45:8000');
      console.log('   # For FastAPI: uvicorn main:app --host 192.168.31.45 --port 8000');
      
      console.log('\n2. Start React Native app:');
      console.log('   cd frontend');
      console.log('   npx react-native run-android');
      
      console.log('\n3. In the app, use the OAuthTest component to test:');
      console.log('   - Environment Variables');
      console.log('   - Network Configuration');
      console.log('   - API Connection');
      console.log('   - GitHub OAuth');
      console.log('   - Login/Register');
      
      console.log('\n4. Check TESTING_GUIDE.md for detailed instructions');
      
    } else {
      console.log(`⚠️  Backend responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your backend is running on 192.168.31.45:8000');
    console.log('2. Check if both devices are on the same network');
    console.log('3. Verify firewall settings');
    console.log('4. Test with: curl http://192.168.31.45:8000/api/v1/auth/me');
  }
}

quickTest(); 