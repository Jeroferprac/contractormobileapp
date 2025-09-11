import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import { LoginScreenNavigationProp } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import CompanyLogo from '../components/CompanyLogo';
import ErrorModal from '../components/ErrorModal';
import GoogleIcon from '../components/ui/GoogleIcon';
import FacebookIcon from '../components/ui/FacebookIcon';

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Validation checks
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      setShowErrorModal(true);
      return;
    }

    try {
      await login({ email, password });
    } catch (error: any) {
      // Professional error handling - API service already provides formatted messages
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
      
      // Log error for debugging (in production, this would go to error tracking service)
      console.error('Login Error:', error);
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleGuestLogin = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo and Progress Dots */}
        <View style={styles.logoContainer}>
            <CompanyLogo showProgressDots={true} activeDotIndex={1} showBusinessText={true} />
        </View>

          {/* Title */}
          <Text style={styles.title}>Login</Text>

          {/* Email Input */}
        <View style={styles.inputContainer}>
            <Icon name="mail" size={20} color="#9B9898" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9B9898"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#9B9898" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9B9898"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#9B9898" 
              />
            </TouchableOpacity>
        </View>

          {/* Login Button */}
        <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
          onPress={handleLogin}
            disabled={isLoading}
        >
          <LinearGradient
              colors={['#FB7504', '#C2252C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Log in'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

          {/* Terms Text */}
          <Text style={styles.termsText}>
          If you continue, you agree to the{' '}
          <Text style={styles.linkText}>Terms of Service</Text>
          {' '}&{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign up!</Text>
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

          {/* Guest Option */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Text style={styles.guestText}>
              Continue as <Text style={styles.linkText}>Guest</Text>
            </Text>
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title="Login Failed"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
        onAction={() => setShowErrorModal(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2F3643',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9B9898',
    lineHeight: 20,
    marginBottom: 20,
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
  linkText: {
    color: '#2F3643',
    textDecorationLine: 'underline',
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

  guestButton: {
    alignItems: 'center',
  },
  guestText: {
    fontSize: 16,
    color: '#9B9898',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default LoginScreen; 