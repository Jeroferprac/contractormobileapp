import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Timer is now handled by AppNavigator
  // This component just displays the splash UI

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Logo Icon */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>B</Text>
        </View>
      </View>
      
      {/* App Name */}
      <Text style={styles.appName}>Binyan</Text>
      
      {/* Tagline */}
      <Text style={styles.tagline}>Built on Trust, Designed for the Future</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.text.light,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text.light,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.text.light,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
}); 