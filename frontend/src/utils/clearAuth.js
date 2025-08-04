#!/usr/bin/env node

const AsyncStorage = require('@react-native-async-storage/async-storage');

console.log('🧹 Clearing all authentication data...\n');

const clearAllAuthData = async () => {
  try {
    const keys = [
      'auth_token',
      'refresh_token', 
      'user_data',
      'auth_state',
      'oauth_state'
    ];

    for (const key of keys) {
      await AsyncStorage.removeItem(key);
      console.log(`✅ Cleared: ${key}`);
    }

    console.log('\n🎯 All authentication data cleared successfully!');
    console.log('📱 You can now test the complete login/signup flow.');
    
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

clearAllAuthData(); 