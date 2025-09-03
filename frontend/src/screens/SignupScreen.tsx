import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
// import { COLORS } from '../constants/colors';
// import { SPACING } from '../constants/spacing';
import SuccessModal from '../components/SuccessModal';
import apiService from '../api/api';

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { register } = useAuth();

  // Fetch roles from backend on component mount
  React.useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      console.log('🔍 Fetching roles from backend...');
      const response = await apiService.getRoles();
      console.log('✅ Roles response:', response.data);
      console.log('📊 Roles array length:', response.data?.length);
      console.log('🔍 Roles structure:', JSON.stringify(response.data, null, 2));
      
      if (response.data && Array.isArray(response.data)) {
        // Convert string array to object array with id and name
        const rolesArray = (response.data as any[]).map((role: any, index: number) => ({
          id: typeof role === 'string' ? role : role.id || role.name,
          name: typeof role === 'string' ? role.charAt(0).toUpperCase() + role.slice(1) : role.name || role.id
        }));
        
        console.log('🔄 Converted roles:', rolesArray);
        setRoles(rolesArray);
        
        // Set default role if available
        if (rolesArray.length > 0) {
          setSelectedRole(rolesArray[0].id);
          console.log('🎯 Default role set to:', rolesArray[0].id);
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
      console.log('🔄 Using fallback roles:', fallbackRoles);
      setRoles(fallbackRoles);
      setSelectedRole('customer');
    }
  };

  const handleSignup = async () => {
    if (!firstName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        full_name: firstName,
        email,
        password,
        phone: phone || '',
        role: selectedRole,
      });
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setIsLoading(true);
    try {
      // This would integrate with GitHub OAuth
      Alert.alert('Coming Soon', 'GitHub signup will be available soon!');
    } catch (error: any) {
      Alert.alert('GitHub Signup Failed', error.message || 'Failed to signup with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - removed time and status icons */}

        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            style={styles.logo}
          >
            <Text style={styles.logoText}>Binyan</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>Signup</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="user" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
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
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone no. (optional)"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

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
                    <Text style={[
                      styles.roleButtonText,
                      selectedRole === role.id && styles.roleButtonTextActive
                    ]}>
                      {role.name}
                    </Text>
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
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            style={styles.gradientButton}
          >
            <Text style={styles.signUpText}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Legal Text */}
        <Text style={styles.legalText}>
          If you continue, you agree to the{' '}
          <Text style={styles.linkText}>Terms of Service</Text>
          {' '}&{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log in!</Text>
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
            <Icon name="apple" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={handleGitHubSignup}
          >
            <Icon name="github" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Continue as Guest */}
        <TouchableOpacity style={styles.guestButton}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Register Successfully"
        message="You have successfully created account. Let's start a memorable journey with us."
        username={firstName}
        onClose={() => setShowSuccessModal(false)}
        onAction={() => {
          setShowSuccessModal(false);
          navigation.navigate('MainTabs');
        }}
        actionText="Let's Go"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    borderRadius: 2,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 5,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    color: '#000',
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
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  signUpButton: {
    marginBottom: 20,
  },
  gradientButton: {
    height: 56,
    borderRadius: 2,
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
    color: '#666',
    lineHeight: 20,
    marginBottom: 30,
  },
  linkText: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#FF6B35',
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
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  guestButton: {
    alignItems: 'center',
  },
  guestText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SignupScreen; 