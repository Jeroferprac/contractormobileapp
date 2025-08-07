#!/usr/bin/env node

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://192.168.31.45:8000';
const API_BASE = `${BACKEND_URL}/api/v1`;

console.log('🧪 Backend Connection Test');
console.log('========================\n');

// Test functions
async function testBackendConnection() {
  try {
    console.log('1. Testing basic connectivity...');
    const response = await axios.get(`${API_BASE}/auth/me`, {
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status
    });
    
    if (response.status === 200) {
      console.log('✅ Backend is reachable and responding');
    } else if (response.status === 401) {
      console.log('✅ Backend is reachable (401 expected - no auth token)');
    } else {
      console.log(`⚠️  Backend responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
  return true;
}

async function testRegistration() {
  try {
    console.log('\n2. Testing registration endpoint...');
    const testUser = {
      full_name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '+1234567890',
      role: 'customer'
    };
    
    const response = await axios.post(`${API_BASE}/auth/register`, testUser, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Registration endpoint working');
      console.log('   User created:', response.data.user?.email);
      return response.data.access_token;
    } else {
      console.log(`⚠️  Registration returned status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.detail || error.message);
    return null;
  }
}

async function testLogin(token) {
  try {
    console.log('\n3. Testing login endpoint...');
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_BASE}/auth/login`, credentials, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Login endpoint working');
      return response.data.access_token;
    } else {
      console.log(`⚠️  Login returned status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.detail || error.message);
    return null;
  }
}

async function testAuthenticatedEndpoint(token) {
  if (!token) {
    console.log('\n4. Skipping authenticated endpoint test (no token)');
    return;
  }
  
  try {
    console.log('\n4. Testing authenticated endpoint...');
    const response = await axios.get(`${API_BASE}/auth/me`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Authenticated endpoint working');
      console.log('   User:', response.data.email);
    } else {
      console.log(`⚠️  Authenticated endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Authenticated endpoint failed:', error.response?.data?.detail || error.message);
  }
}

async function testOAuthEndpoints() {
  try {
    console.log('\n5. Testing OAuth endpoints...');
    
    // Test OAuth login endpoint
    const oauthResponse = await axios.get(`${API_BASE}/auth/oauth/github`, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (oauthResponse.status === 200) {
      console.log('✅ OAuth login endpoint working');
    } else {
      console.log(`⚠️  OAuth login endpoint returned status: ${oauthResponse.status}`);
    }
    
    // Test roles endpoint
    const rolesResponse = await axios.get(`${API_BASE}/auth/roles`, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (rolesResponse.status === 200) {
      console.log('✅ Roles endpoint working');
      console.log('   Available roles:', rolesResponse.data);
    } else {
      console.log(`⚠️  Roles endpoint returned status: ${rolesResponse.status}`);
    }
  } catch (error) {
    console.log('❌ OAuth endpoints failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log(`Testing backend at: ${BACKEND_URL}\n`);
  
  const isConnected = await testBackendConnection();
  if (!isConnected) {
    console.log('\n❌ Backend is not accessible. Please check:');
    console.log('   1. Backend is running on the correct IP');
    console.log('   2. Firewall allows connections on port 8000');
    console.log('   3. Both devices are on the same network');
    process.exit(1);
  }
  
  const regToken = await testRegistration();
  const loginToken = await testLogin();
  const token = regToken || loginToken;
  
  await testAuthenticatedEndpoint(token);
  await testOAuthEndpoints();
  
  console.log('\n🎉 Backend testing complete!');
  console.log('\nNext steps:');
  console.log('1. Start your React Native app: npx react-native run-android');
  console.log('2. Use the OAuthTest component to test the full integration');
  console.log('3. Check the TESTING_GUIDE.md for detailed instructions');
}

// Run tests
runTests().catch(console.error); 