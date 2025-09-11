import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import CompanyLogo from '../components/CompanyLogo';
import SuccessModal from '../components/SuccessModal';
import FailureModal from '../components/FailureModal';
import apiService from '../api/api';
import { COLORS } from '../constants/colors';
import GoogleIcon from '../components/ui/GoogleIcon';
import FacebookIcon from '../components/ui/FacebookIcon';
import storageService from '../utils/storage';


interface SignupScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successUsername, setSuccessUsername] = useState('');
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  // registrationData is now managed globally in AuthContext
  
  // Form validation states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const { register, authenticateFromStorage, login, isLoading, isRegistering, showRegistrationSuccess, clearRegistrationSuccess, registrationData } = useAuth();
  

  // Fetch roles from backend on component mount
  React.useEffect(() => {
    fetchRoles();
  }, []);

  // Password strength calculation
  React.useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength('weak');
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'firstName':
        if (value.length < 2) {
          newErrors.firstName = 'Name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (value !== password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'phone':
        if (value.length > 0 && value.length < 10) {
          newErrors.phone = 'Please enter a valid phone number';
    } else {
          delete newErrors.phone;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'phone': setPhone(value); break;
    }
    
    // Only validate if field has been touched (user moved away from it)
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string) => {
    // Mark field as touched when user moves away
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Get current value and validate
    const value = field === 'firstName' ? firstName : 
                  field === 'email' ? email :
                  field === 'password' ? password :
                  field === 'confirmPassword' ? confirmPassword : phone;
    validateField(field, value);
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      
      if (response.data && Array.isArray(response.data)) {
        const rolesArray = (response.data as any[]).map((role: any, index: number) => ({
          id: typeof role === 'string' ? role : role.id || role.name,
          name: typeof role === 'string' ? role.charAt(0).toUpperCase() + role.slice(1) : role.name || role.id
        }));
        
        setRoles(rolesArray);
        
        if (rolesArray.length > 0) {
          setSelectedRole(rolesArray[0].id);
        }
      } else {
        console.warn('⚠️ Roles data is not an array:', response.data);
        throw new Error('Invalid roles data format');
      }
    } catch (error) {
      console.error('❌ Failed to fetch roles:', error);
      // Fallback to default roles if API fails
      const fallbackRoles = [
        { id: 'contractor', name: 'Contractor' },
        { id: 'company', name: 'Company' },
        { id: 'admin', name: 'Admin' },
      ];
      // Using fallback roles
      setRoles(fallbackRoles);
      setSelectedRole('contractor');
    }
  };

  const handleSignup = async () => {
    
    // Mark all fields as touched to show validation errors
    const allFields = ['firstName', 'email', 'password', 'confirmPassword', 'phone'];
    const newTouched = { ...touched };
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validate all fields and collect errors
    const validationErrors: {[key: string]: string} = {};
    
    // Validate firstName
    if (firstName.length < 2) {
      validationErrors.firstName = 'Name must be at least 2 characters';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate phone (optional but if provided, should be valid)
    if (phone.length > 0 && phone.length < 10) {
      validationErrors.phone = 'Please enter a valid phone number';
    }
    
    // Update errors state
    setErrors(validationErrors);
    
    // Check if there are any validation errors
    const hasErrors = Object.keys(validationErrors).length > 0 || 
                     !firstName || !email || !password || !confirmPassword;
    
    if (hasErrors) {
      return;
    }

    if (!selectedRole) {
      return;
    }

    try {
      const result = await register({
        full_name: firstName,
        email,
        password,
        phone: phone || '',
        role: selectedRole,
        }, password);
      
      // Show success modal immediately after successful registration
      if (result.success) {
        setSuccessUsername(result.user.full_name);
        
        // Registration data is now stored globally in AuthContext
        if (result.needsLogin) {
          // Will auto-login to get token
        }
        
        // SuccessModal will be shown via global state
      } else {
        // Show inline error for general registration failure
        setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
      }
    } catch (error: any) {
      // Professional error handling - show inline errors
      let errorMessage = 'Failed to create account. Please try again.';
      
      // Check if it's an API error with response
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
    }
  };

  const handleGitHubSignup = async () => {
    try {
      // This would integrate with GitHub OAuth
      setErrors(prev => ({ ...prev, general: 'GitHub signup will be available soon!' }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to signup with GitHub. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      console.error('GitHub Signup Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo and Progress Dots */}
          <View style={styles.logoContainer}>
            <CompanyLogo showProgressDots={true} activeDotIndex={0} showBusinessText={true} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Signup</Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            {/* Username/First Name */}
          <View style={[
            styles.inputWrapper,
            touched.firstName && errors.firstName && styles.inputError,
            touched.firstName && !errors.firstName && firstName && styles.inputSuccess
          ]}>
              <Icon 
                name="user" 
                size={20} 
                color={
                  touched.firstName && errors.firstName ? '#FF3B30' :
                  touched.firstName && !errors.firstName && firstName ? '#34C759' : '#9B9898'
                } 
                style={styles.inputIcon} 
              />
                          <TextInput
              style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9B9898"
              value={firstName}
              onChangeText={(value) => handleFieldChange('firstName', value)}
              onBlur={() => handleFieldBlur('firstName')}
              autoCapitalize="words"
            />
            {touched.firstName && !errors.firstName && firstName && (
              <Icon name="check-circle" size={20} color="#34C759" />
            )}
            {touched.firstName && errors.firstName && (
              <Icon name="x-circle" size={20} color="#FF3B30" />
            )}
            </View>
          {touched.firstName && errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}

            {/* Email */}
            <View style={[
              styles.inputWrapper,
              touched.email && errors.email && styles.inputError,
              touched.email && !errors.email && email && styles.inputSuccess
            ]}>
              <Icon 
                name="mail" 
                size={20} 
                color={
                  touched.email && errors.email ? '#FF3B30' :
                  touched.email && !errors.email && email ? '#34C759' : '#9B9898'
                } 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                  placeholderTextColor="#9B9898"
                value={email}
                onChangeText={(value) => handleFieldChange('email', value)}
                onBlur={() => handleFieldBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && !errors.email && email && (
                <Icon name="check-circle" size={20} color="#34C759" />
              )}
              {touched.email && errors.email && (
                <Icon name="x-circle" size={20} color="#FF3B30" />
              )}
            </View>
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Password */}
            <View style={[
              styles.inputWrapper,
              touched.password && errors.password && styles.inputError,
              touched.password && !errors.password && password && styles.inputSuccess
            ]}>
              <Icon 
                name="lock" 
                size={20} 
                color={
                  touched.password && errors.password ? '#FF3B30' :
                  touched.password && !errors.password && password ? '#34C759' : '#9B9898'
                } 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                  placeholderTextColor="#9B9898"
                value={password}
                onChangeText={(value) => handleFieldChange('password', value)}
                onBlur={() => handleFieldBlur('password')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9B9898" 
                />
              </TouchableOpacity>
              {touched.password && !errors.password && password && (
                <Icon name="check-circle" size={20} color="#34C759" />
              )}
              {touched.password && errors.password && (
                <Icon name="x-circle" size={20} color="#FF3B30" />
              )}
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
             {password.length > 0 && (
               <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBarContainer}>
                  <View style={[
                    styles.strengthBar,
                    {
                      width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                      backgroundColor: passwordStrength === 'weak' ? '#FF3B30' : passwordStrength === 'medium' ? '#FB7504' : '#34C759'
                    }
                  ]} />
                </View>
                <Text style={[
                  styles.passwordStrengthText,
                  { color: passwordStrength === 'weak' ? '#FF3B30' : passwordStrength === 'medium' ? '#FB7504' : '#34C759' }
                ]}>
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <View style={[
              styles.inputWrapper,
              touched.confirmPassword && errors.confirmPassword && styles.inputError,
              touched.confirmPassword && !errors.confirmPassword && confirmPassword && password === confirmPassword && styles.inputSuccess
            ]}>
              <Icon 
                name="lock" 
                size={20} 
                color={
                  touched.confirmPassword && errors.confirmPassword ? '#FF3B30' :
                  touched.confirmPassword && !errors.confirmPassword && confirmPassword && password === confirmPassword ? '#34C759' : '#9B9898'
                } 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9B9898"
                value={confirmPassword}
                onChangeText={(value) => handleFieldChange('confirmPassword', value)}
                onBlur={() => handleFieldBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9B9898" 
                />
              </TouchableOpacity>
            {touched.confirmPassword && !errors.confirmPassword && confirmPassword && password === confirmPassword && (
              <Icon name="check-circle" size={20} color="#34C759" />
            )}
            {touched.confirmPassword && errors.confirmPassword && (
              <Icon name="x-circle" size={20} color="#FF3B30" />
            )}
            </View>
          {touched.confirmPassword && errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

            {/* Phone (Optional) */}
            <View style={[
              styles.inputWrapper,
              touched.phone && errors.phone && styles.inputError,
              touched.phone && !errors.phone && phone && styles.inputSuccess
            ]}>
              <Icon 
                name="phone" 
                size={20} 
                color={
                  touched.phone && errors.phone ? '#FF3B30' :
                  touched.phone && !errors.phone && phone ? '#34C759' : '#9B9898'
                } 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Phone no. (optional)"
                  placeholderTextColor="#9B9898"
                value={phone}
                onChangeText={(value) => handleFieldChange('phone', value)}
                onBlur={() => handleFieldBlur('phone')}
                keyboardType="phone-pad"
              />
              {touched.phone && !errors.phone && phone && (
                <Icon name="check-circle" size={20} color="#34C759" />
              )}
              {touched.phone && errors.phone && (
                <Icon name="x-circle" size={20} color="#FF3B30" />
              )}
            </View>
            {touched.phone && errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            {/* General Error Message */}
            {errors.general && (
              <View style={styles.generalErrorContainer}>
                <Icon name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Select your role</Text>
              <View style={styles.roleButtons}>
                {roles.length > 0 ? (
                  roles.map((role, index) => (
                    <TouchableOpacity
                      key={`role-${role.id}-${index}`}
                      style={[
                        styles.roleButton,
                        selectedRole === role.id && styles.roleButtonActive
                      ]}
                      onPress={() => setSelectedRole(role.id)}
                    >
                      {selectedRole === role.id ? (
                        <LinearGradient
                          colors={COLORS.roleButton.activeBackground}
                          style={styles.roleButtonGradient}
                        >
                          <Text style={styles.roleButtonTextActive}>
                            {role.name}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.roleButtonText}>
                          {role.name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.loadingText}>Loading roles...</Text>
                )}
              </View>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#FB7504', '#C2252C']}
              style={styles.gradientButton}
            >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.signUpText, { marginLeft: 8 }]}>
                    Creating account...
                  </Text>
              </View>
            ) : (
              <Text style={styles.signUpText}>Sign up</Text>
            )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Legal Text */}
          <Text style={styles.legalText}>
            If you continue, you agree to the{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}&{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signupLink}>Sign in!</Text>
            </TouchableOpacity>
          </View>

          {/* OR Separator */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="github" size={24} color="#000" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <GoogleIcon size={24} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <FacebookIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* Continue as Guest */}
          <TouchableOpacity style={styles.guestButton}>
            <Text style={styles.guestText}>
              Continue as <Text style={styles.linkText}>Guest</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Success Modal */}
      <SuccessModal
        visible={showRegistrationSuccess}
        title="Congratulations!"
        message="You have successfully created account. Let's start a memorable journey with us."
        username={successUsername}
        actionText="Let's Go"
        iconType="registration"
        onClose={() => {
          clearRegistrationSuccess();
        }}
        onAction={async () => {
          clearRegistrationSuccess();
          
          if (registrationData && registrationData.user) {
            try {
              if (registrationData.needsLogin) {
                // Auto-login after registration to get token
                await login({
                  email: registrationData.user.email,
                  password: registrationData.password || '' // Use the password from registrationData
                });
              } else if (registrationData.token) {
                await storageService.setAuthToken(registrationData.token);
                await storageService.setUserData(registrationData.user);
                await authenticateFromStorage(registrationData.user, registrationData.token);
              } else {
                throw new Error('No authentication method available');
              }
              
              // Add a small delay to ensure state updates are processed
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              setErrorMessage('An error occurred while logging you in. Please try again.');
              setShowErrorModal(true);
            }
          } else {
            setErrorMessage('Registration data not found. Please try signing up again.');
            setShowErrorModal(true);
          }
        }}
      />

      {/* Error Modal */}
      <FailureModal
        visible={showErrorModal}
        title="Signup Failed"
        message={errorMessage}
        onClose={() => {
          setShowErrorModal(false);
        }}
        onAction={() => {
          setShowErrorModal(false);
        }}
        actionText="OK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F3643',
    marginBottom: 30,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  inputSuccess: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2F3643',
  },
  eyeIcon: {
    padding: 5,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    color: '#2F3643',
    marginBottom: 12,
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.roleButton.border,
    borderRadius: 12,
    backgroundColor: COLORS.roleButton.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: 'transparent',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.roleButton.text,
  },
  roleButtonTextActive: {
    color: COLORS.roleButton.activeText,
    fontWeight: '600',
  },
  roleButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButton: {
    marginBottom: 20,
  },
  gradientButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  legalText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9B9898',
    lineHeight: 20,
    marginBottom: 30,
  },
  linkText: {
    color: '#2F3643',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  signupText: {
    fontSize: 16,
    color: '#9B9898',
    textAlign: 'center',
  },
  signupLink: {
    fontSize: 16,
    color: '#2F3643',
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    fontSize: 16,
    color: '#9B9898',
  },
  loginLink: {
    fontSize: 16,
    color: '#2F3643',
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#9B9898',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 0,
  },
  socialButton: {
    width: (width - 60) / 3,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
  googleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  facebookText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
  },
  guestButton: {
    alignItems: 'center',
  },
  guestText: {
    fontSize: 16,
    color: '#9B9898',
  },
  loadingText: {
    fontSize: 16,
    color: '#9B9898',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
   passwordStrengthContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: -8,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    strengthBarContainer: {
      flex: 1,
      height: 6,
      backgroundColor: '#E5E7EB',
      borderRadius: 3,
      marginRight: 12,
      overflow: 'hidden',
    },
    strengthBar: {
      height: '100%',
      borderRadius: 3,
    },
    passwordStrengthText: {
      fontSize: 14,
      fontWeight: '500',
      minWidth: 60,
    },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderColor: '#FF3B30',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    },
});

export default SignupScreen; 