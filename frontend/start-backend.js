#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

console.log('🚀 ContractorHub Backend Startup Script');
console.log('======================================\n');

// Path to your web backend
const BACKEND_PATH = path.join(__dirname, '..', '..', 'contractorwebapp', 'Backend');
const API_URL = 'http://192.168.1.2:8000';

async function checkBackendStatus() {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Backend is already running!');
      console.log(`📊 Health check: ${response.data.status}`);
      return true;
    }
  } catch (error) {
    console.log('ℹ️ Backend is not running yet...');
    return false;
  }
}

async function startBackend() {
  console.log(`📁 Backend path: ${BACKEND_PATH}`);
  console.log('🔄 Starting FastAPI backend server...\n');

  const pythonProcess = spawn('python', ['run.py'], {
    cwd: BACKEND_PATH,
    stdio: 'inherit',
    shell: true
  });

  pythonProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   1. Python installed');
    console.log('   2. Backend dependencies installed (pip install -r requirements.txt)');
    console.log('   3. Virtual environment activated');
    console.log('   4. Database configured');
  });

  pythonProcess.on('close', (code) => {
    console.log(`\n🛑 Backend process exited with code ${code}`);
  });

  // Wait a bit and then check if backend started successfully
  setTimeout(async () => {
    const isRunning = await checkBackendStatus();
    if (isRunning) {
      console.log('\n🎉 Backend started successfully!');
      console.log('📍 API Endpoints:');
      console.log(`   • Health: ${API_URL}/health`);
      console.log(`   • Docs: ${API_URL}/docs`);
      console.log(`   • API: ${API_URL}/api/v1`);
      console.log('\n✅ Your mobile app can now connect to the backend!');
    }
  }, 5000);
}

async function main() {
  const isRunning = await checkBackendStatus();
  
  if (!isRunning) {
    await startBackend();
  } else {
    console.log('\n📍 Backend is running at:');
    console.log(`   • Health: ${API_URL}/health`);
    console.log(`   • Docs: ${API_URL}/docs`);
    console.log(`   • API: ${API_URL}/api/v1`);
    console.log('\n✅ Your mobile app can connect to the backend!');
  }
}

main().catch(console.error);
