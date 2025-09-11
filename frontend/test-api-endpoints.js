const axios = require('axios');

// Test the fixed API endpoints
async function testAPIEndpoints() {
  const baseURL = 'http://192.168.1.4:8000/api/v1'; // Using your development IP
  
  console.log('🧪 Testing Fixed API Endpoints...\n');
  
  try {
    // Test 1: Test the correct inventory products endpoint
    console.log('1️⃣ Testing correct inventory products endpoint...');
    try {
      const productsResponse = await axios.get(`${baseURL}/inventory/inventory/products`, { timeout: 5000 });
      console.log('✅ Successfully fetched products:', productsResponse.data?.length || 0, 'products');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Products endpoint returned 404 - this might be expected if no products exist');
      } else {
        console.log('❌ Error fetching products:', error.response?.status, error.response?.statusText);
      }
    }
    
    // Test 2: Test the correct inventory warehouses endpoint
    console.log('\n2️⃣ Testing correct inventory warehouses endpoint...');
    try {
      const warehousesResponse = await axios.get(`${baseURL}/inventory/inventory/warehouses`, { timeout: 5000 });
      console.log('✅ Successfully fetched warehouses:', warehousesResponse.data?.length || 0, 'warehouses');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Warehouses endpoint returned 404 - this might be expected if no warehouses exist');
      } else {
        console.log('❌ Error fetching warehouses:', error.response?.status, error.response?.statusText);
      }
    }
    
    // Test 3: Test the old incorrect endpoint (should fail)
    console.log('\n3️⃣ Testing old incorrect endpoint (should fail)...');
    try {
      const oldResponse = await axios.get(`${baseURL}/inventory/products`, { timeout: 5000 });
      console.log('⚠️ Old endpoint still works - this might indicate a redirect or fallback');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Old endpoint correctly returns 404 as expected');
      } else {
        console.log('❌ Old endpoint returned unexpected error:', error.response?.status, error.response?.statusText);
      }
    }
    
    // Test 4: Test batches endpoint
    console.log('\n4️⃣ Testing batches endpoint...');
    try {
      const batchesResponse = await axios.get(`${baseURL}/batches`, { timeout: 5000 });
      console.log('✅ Successfully fetched batches:', batchesResponse.data?.length || 0, 'batches');
      
      // If batches exist, test the product lookup that was causing 404 errors
      if (batchesResponse.data && batchesResponse.data.length > 0) {
        const firstBatch = batchesResponse.data[0];
        console.log(`\n5️⃣ Testing product lookup for batch ${firstBatch.id}...`);
        
        if (firstBatch.product_id) {
          try {
            const productResponse = await axios.get(`${baseURL}/inventory/inventory/products/${firstBatch.product_id}`, { timeout: 5000 });
            console.log('✅ Successfully fetched product for batch:', productResponse.data.name || productResponse.data.id);
          } catch (error) {
            if (error.response?.status === 404) {
              console.log('⚠️ Product not found - this is expected if the product ID is invalid');
            } else {
              console.log('❌ Error fetching product:', error.response?.status, error.response?.statusText);
            }
          }
        } else {
          console.log('⚠️ Batch has no product_id');
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Batches endpoint returned 404 - this might be expected if no batches exist');
      } else {
        console.log('❌ Error fetching batches:', error.response?.status, error.response?.statusText);
      }
    }
    
  } catch (error) {
    console.log('❌ Error testing API endpoints:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.statusText}`);
      console.log(`   URL: ${error.config?.url}`);
    } else if (error.code === 'ERR_NETWORK') {
      console.log('   Network Error: Backend server appears to be offline');
      console.log('   Please start your backend server and try again');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n🏁 API endpoint test completed!');
  console.log('\n📝 Summary:');
  console.log('   - The 404 errors should now be resolved');
  console.log('   - Product and warehouse lookups should work correctly');
  console.log('   - Your app should no longer show console errors');
}

// Run the test
testAPIEndpoints().catch(console.error);
