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
import { UserIcon, EmailIcon, LockIcon, PhoneIcon, GitHubIcon, CompanyIcon, ContractorIcon, CustomerIcon } from '../components/icons';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { register, isLoading, error, clearError, startOAuth } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'company',
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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
      };

      await register(userData);
      // Navigation will be handled by AuthContext state change
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Signup failed:', error);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await startOAuth(provider.toLowerCase());
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  const handleGuestSignup = () => {
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
          <Text style={styles.title}>Signup</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            value={formData.full_name}
            onChangeText={(text: string) => handleInputChange('full_name', text)}
            icon={<UserIcon size={20} color={COLORS.textSecondary} />}
            error={formErrors.full_name}
            autoCapitalize="words"
            autoCorrect={false}
          />

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

          <Input
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
            icon={<LockIcon size={20} color={COLORS.textSecondary} />}
            secureTextEntry
            error={formErrors.confirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            placeholder="Phone no. (Optional)"
            value={formData.phone}
            onChangeText={(text: string) => handleInputChange('phone', text)}
            icon={<PhoneIcon size={20} color={COLORS.textSecondary} />}
            keyboardType="phone-pad"
            error={formErrors.phone}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Select Role</Text>
            {formErrors.role && (
              <Text style={styles.errorText}>{formErrors.role}</Text>
            )}
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'company' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'company')}
              >
                <View style={styles.roleButtonContent}>
                  <CompanyIcon 
                    size={16} 
                    color={formData.role === 'company' ? COLORS.textLight : COLORS.textPrimary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'company' && styles.roleButtonTextActive
                  ]}>
                    Company
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'contractor' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'contractor')}
              >
                <View style={styles.roleButtonContent}>
                  <ContractorIcon 
                    size={16} 
                    color={formData.role === 'contractor' ? COLORS.textLight : COLORS.textPrimary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'contractor' && styles.roleButtonTextActive
                  ]}>
                    Contractor
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'customer' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'customer')}
              >
                <View style={styles.roleButtonContent}>
                  <CustomerIcon 
                    size={16} 
                    color={formData.role === 'customer' ? COLORS.textLight : COLORS.textPrimary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'customer' && styles.roleButtonTextActive
                  ]}>
                    Customer
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign up Button */}
          <Button
            title="Sign up"
            onPress={handleSignup}
            loading={isLoading}
            variant="gradient"
            style={styles.signupButton}
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

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Log in!</Text>
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
          onPress={handleGuestSignup}
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
  roleContainer: {
    marginBottom: SPACING.md,
  },
  roleLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  roleButton: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: COLORS.textLight,
  },
  roleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  signupButton: {
    marginTop: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
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
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginLinkText: {
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