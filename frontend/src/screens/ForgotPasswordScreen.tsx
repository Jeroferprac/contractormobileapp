import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/colors';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOTPModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      // This would need refs to work properly
    }
  };

  const handleConfirmOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 5) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOTPModal(false);
      setShowResetModal(true);
    } catch (error: any) {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowResetModal(false);
      Alert.alert(
        'Success!',
        'Faisal! You nailed it, You successfully reset password for your account.',
        [
          {
            text: 'Go to Home',
            onPress: () => navigation.navigate('MainTabs')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="x" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Forget Password</Text>
        <Text style={styles.subtitle}>No worries, we'll send you reset instructions</Text>

        {/* Email Input */}
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

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.disabledButton]}
          onPress={handleResetPassword}
        >
          <LinearGradient
            colors={['#FB7504', '#C2252C']}
            style={styles.gradientButton}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Sending...' : 'Reset Password'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>Remember Password? Log in!</Text>
        </TouchableOpacity>
      </View>

      {/* OTP Modal */}
      <Modal
        visible={showOTPModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>OTP Verification</Text>
              <TouchableOpacity onPress={() => setShowOTPModal(false)}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Enter the code sent</Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[styles.otpInput, { textAlign: 'center' }]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(index, value)}
                  keyboardType="numeric"
                />
              ))}
            </View>

            <Text style={styles.otpInfo}>
              Confirmation code sent to {email}
            </Text>

            <View style={styles.otpFooter}>
              <Text style={styles.timer}>(1:47)</Text>
              <TouchableOpacity>
                <Text style={styles.resendText}>
                  Don't get the code? <Text style={styles.linkText}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmOTP}
            >
              <LinearGradient
                colors={['#FB7504', '#C2252C']}
                style={styles.gradientButton}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>No worries, we'll send you reset instructions</Text>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Icon name="mail" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#999' }]}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
              />
            </View>

            {/* New Password Input */}
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleResetPasswordSubmit}
            >
              <LinearGradient
                colors={['#FB7504', '#C2252C']}
                style={styles.gradientButton}
              >
                <Text style={styles.confirmButtonText}>Reset Password</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    borderRadius: 2,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
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
  resetButton: {
    marginBottom: 20,
  },
  gradientButton: {
    height: 56,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#FB7504',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otpInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#FB7504',
    fontWeight: '500',
  },
  confirmButton: {
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen; 