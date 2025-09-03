const axios = require('axios');

async function testBatchesAPI() {
  const baseURL = 'http://192.168.1.4:8000/api/v1';
  
  console.log('🔍 Testing Batches API...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connectivity...');
    const healthResponse = await axios.get(`${baseURL.replace('/api/v1', '')}/docs`, { timeout: 5000 });
    console.log('✅ Backend is running (FastAPI docs accessible)');

    // Test 2: Test batches endpoint
    console.log('\n2️⃣ Testing batches endpoint...');
    const batchesResponse = await axios.get(`${baseURL}/batches/`, { timeout: 5000 });
    console.log(`✅ Batches endpoint working - Found ${batchesResponse.data?.length || 0} batches`);

    if (batchesResponse.data && batchesResponse.data.length > 0) {
      console.log('📋 Sample batch data:');
      console.log(JSON.stringify(batchesResponse.data[0], null, 2));
    }

    // Test 3: Test products endpoint
    console.log('\n3️⃣ Testing products endpoint...');
    const productsResponse = await axios.get(`${baseURL}/inventory/products`, { timeout: 5000 });
    console.log(`✅ Products endpoint working - Found ${productsResponse.data?.length || 0} products`);

    // Test 4: Test warehouses endpoint
    console.log('\n4️⃣ Testing warehouses endpoint...');
    const warehousesResponse = await axios.get(`${baseURL}/inventory/warehouses`, { timeout: 5000 });
    console.log(`✅ Warehouses endpoint working - Found ${warehousesResponse.data?.length || 0} warehouses`);

    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('📱 Your React Native app should now be able to fetch real data.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.log('\n💡 Backend server is not running. Please start it with:');
      console.log('   cd ../contractorwebapp/Backend');
      console.log('   python run.py');
    } else if (error.response) {
      console.log('\n💡 Backend is running but returned an error:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.detail || error.response.statusText}`);
    }
  }
}

testBatchesAPI();
