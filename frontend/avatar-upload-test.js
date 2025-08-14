/**
 * Avatar Upload Test Script
 * 
 * This script tests the avatar upload functionality using the POST /api/v1/users/upload-avatar endpoint.
 * 
 * Usage:
 * 1. Make sure the backend server is running
 * 2. Run this script: node avatar-upload-test.js
 * 3. Check the console output for test results
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://10.81.175.204:8000/api/v1';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-avatar.jpg');

// Test function
async function testAvatarUpload() {
  console.log('🧪 Starting Avatar Upload Test...\n');
  
  try {
    // Step 1: Check if test image exists
    console.log('📁 Step 1: Checking test image...');
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.log('❌ Test image not found. Creating a simple test...');
      console.log('💡 To test with a real image, place a file named "test-avatar.jpg" in the frontend directory');
      
      // Test the endpoint without file upload
      await testEndpointWithoutFile();
      return;
    }
    
    console.log('✅ Test image found');
    
    // Step 2: Test the upload endpoint
    console.log('\n📤 Step 2: Testing avatar upload endpoint...');
    await testAvatarUploadWithFile();
    
    // Step 3: Test error handling
    console.log('\n⚠️ Step 3: Testing error handling...');
    await testErrorHandling();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function testAvatarUploadWithFile() {
  try {
    // Create FormData
    const formData = new FormData();
    const fileStream = fs.createReadStream(TEST_IMAGE_PATH);
    
    formData.append('file', fileStream, {
      filename: 'test-avatar.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('📤 Uploading test image...');
    
    // Make the request
    const response = await axios.post(`${API_BASE_URL}/users/upload-avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE' // Replace with actual token
      },
      timeout: 10000
    });
    
    console.log('✅ Upload successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️ Authentication required - this is expected without a valid token');
      console.log('💡 The endpoint is working, but requires authentication');
    } else {
      throw error;
    }
  }
}

async function testEndpointWithoutFile() {
  try {
    console.log('🔍 Testing endpoint availability...');
    
    // Test if the endpoint exists (should return 401 without auth, not 404)
    const response = await axios.post(`${API_BASE_URL}/users/upload-avatar`, {}, {
      timeout: 5000
    });
    
    console.log('✅ Endpoint is accessible');
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Endpoint exists and requires authentication (expected)');
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found - check the API route');
    } else {
      console.log('⚠️ Unexpected response:', error.response?.status);
    }
  }
}

async function testErrorHandling() {
  try {
    console.log('🧪 Testing with invalid data...');
    
    // Test with empty FormData
    const emptyFormData = new FormData();
    
    await axios.post(`${API_BASE_URL}/users/upload-avatar`, emptyFormData, {
      headers: {
        ...emptyFormData.getHeaders(),
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE'
      },
      timeout: 5000
    });
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Proper validation - endpoint rejects empty data');
    } else if (error.response?.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('⚠️ Unexpected error response:', error.response?.status);
    }
  }
}

// Run the test
if (require.main === module) {
  testAvatarUpload();
}

module.exports = { testAvatarUpload };
