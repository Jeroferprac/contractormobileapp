import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import apiService from '../api/api';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

export const ApiTest: React.FC = () => {
  const testConnection = async () => {
    try {
      const response = await apiService.testConnection();
      Alert.alert('Success', 'API connection working!');
      console.log('API Test Response:', response.data);
    } catch (error: any) {
      Alert.alert('Error', 'API connection failed: ' + (error.message || 'Unknown error'));
      console.error('API Test Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test API Connection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 