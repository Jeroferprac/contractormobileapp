import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Input } from '../components';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { useAuth } from '../context/AuthContext';
import { EmailIcon, LockIcon, GitHubIcon } from '../components/icons';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading, error, clearError, startOAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(formData);
      // Navigation will be handled by AuthContext state change
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login failed:', error);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await startOAuth(provider.toLowerCase());
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'Guest Mode',
      'You can explore the app without creating an account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Binyan</Text>
          <Text style={styles.title}>Sign in</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text: string) => handleInputChange('email', text)}
            icon={<EmailIcon size={20} color={COLORS.textSecondary} />}
            keyboardType="email-address"
            error={formErrors.email}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            placeholder="Password"
            value={formData.password}
            onChangeText={(text: string) => handleInputChange('password', text)}
            icon={<LockIcon size={20} color={COLORS.textSecondary} />}
            secureTextEntry
            error={formErrors.password}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign in Button */}
          <Button
            title="Sign in"
            onPress={handleLogin}
            loading={isLoading}
            variant="gradient"
            style={styles.loginButton}
            disabled={isLoading}
          />

          {/* Auth Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            If you continue, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}&{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>

          {/* Signup Link */}
          <View style={styles.signupLinkContainer}>
            <Text style={styles.signupLinkText}>
              Don't have an account?{' '}
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.linkText}>Signup!</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

                     <View style={styles.socialButtons}>
             <TouchableOpacity
               style={styles.socialButton}
               onPress={() => handleSocialLogin('github')}
             >
               <GitHubIcon size={24} color={COLORS.textPrimary} />
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.socialButton}
               onPress={() => Alert.alert('Coming Soon', 'Google OAuth will be available soon!')}
             >
               <Text style={styles.socialButtonText}>G</Text>
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.socialButton}
               onPress={() => Alert.alert('Coming Soon', 'Facebook OAuth will be available soon!')}
             >
               <Text style={styles.socialButtonText}>f</Text>
             </TouchableOpacity>
           </View>
        </View>

        {/* Guest Login */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestLogin}
        >
          <Text style={styles.guestText}>
            Continue as <Text style={styles.linkText}>Guest</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    alignSelf: 'flex-start',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  inputIcon: {
    fontSize: 18,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.error,
  },
  loginButton: {
    marginBottom: SPACING.md,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  signupLinkContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signupLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  socialSection: {
    marginTop: SPACING.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  guestText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
}); 