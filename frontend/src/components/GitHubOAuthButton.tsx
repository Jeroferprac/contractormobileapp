import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { GitHubIcon } from './icons';

export const GitHubOAuthButton: React.FC = () => {
  const { startOAuth, isLoading } = useAuth();

  const handleGitHubLogin = async () => {
    try {
      await startOAuth('github');
    } catch (error) {
      console.error('GitHub OAuth failed:', error);
      Alert.alert('Error', 'GitHub OAuth failed');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handleGitHubLogin}
    >
      <View style={styles.buttonContent}>
        <GitHubIcon size={20} color="white" />
        <Text style={styles.buttonText}>Continue with GitHub</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#24292e',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 