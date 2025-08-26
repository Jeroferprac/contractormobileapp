/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🚨🚨🚨 INDEX.JS BACKGROUND HANDLER TRIGGERED! 🚨🚨🚨');
  console.log('📱 Background message received:', remoteMessage);
  console.log('📱 Background notification title:', remoteMessage.notification?.title);
  console.log('📱 Background notification body:', remoteMessage.notification?.body);
  console.log('📱 Background full message data:', JSON.stringify(remoteMessage, null, 2));
});

AppRegistry.registerComponent(appName, () => App);
