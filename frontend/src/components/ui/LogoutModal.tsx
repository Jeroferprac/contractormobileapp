import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Path, G, Polyline } from 'react-native-svg';

// --- PROPS INTERFACE ---
interface LogoutModalProps {
  visible: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  username?: string;
}

// --- SVG ICON COMPONENTS ---

const ConfirmationIcon = () => (
    <Svg width="80" height="80" viewBox="0 0 80 80">
        <G fill="none" fillRule="evenodd">
            <Circle fill="#FEF3C7" cx="40" cy="40" r="40"/>
            <G stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M48 52V28c0-1.1-.9-2-2-2H30c-1.1 0-2 .9-2 2v24"/>
                <Polyline points="42 44 48 38 42 32"/>
                <Path d="M34 38h14"/>
            </G>
        </G>
    </Svg>
);

const LoggingOutIcon = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.linear,
            })
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Svg width="80" height="80" viewBox="0 0 80 80">
                    <Circle cx="40" cy="40" r="38" stroke="#FDBA74" strokeWidth="4" strokeOpacity="0.3" />
                    <Path 
                        d="M 40 2 A 38 38 0 0 1 78 40"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </Svg>
            </Animated.View>
            <View style={{ position: 'absolute' }}>
                 <Svg width="40" height="40" viewBox="0 0 24 24">
                    <Path
                        fill="#F97316"
                        d="M16 17v-3H9v-4h7V7l5 5-5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"
                    />
                </Svg>
            </View>
        </View>
    );
};

const SuccessIcon = () => {
    const AnimatedPath = Animated.createAnimatedComponent(Path);
    const checkmarkAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(checkmarkAnim, {
            toValue: 1,
            duration: 500,
            delay: 100,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start();
    }, []);

    const strokeDashoffset = checkmarkAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
    });

    return (
        <Svg width="80" height="80" viewBox="0 0 80 80">
            <G fill="none" fillRule="evenodd">
                <Circle fill="#E7F7EF" cx="40" cy="40" r="40"/>
                <AnimatedPath 
                    d="M28 41.3l8.6 8.6L52 34" 
                    stroke="#0E9F6E" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    strokeDashoffset={strokeDashoffset}
                />
            </G>
        </Svg>
    );
};

// --- MAIN LOGOUT MODAL COMPONENT ---

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  isLoggingOut,
  onClose,
  onConfirm,
  title = "Log Out",
  message = "Are you sure you want to log out?",
  username,
}) => {
  const [stage, setStage] = useState<'confirm' | 'loggingOut' | 'success'>('confirm');
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStage('confirm');
      Animated.spring(modalAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  useEffect(() => {
    if (isLoggingOut) {
      setStage('loggingOut');
    } else if (stage === 'loggingOut' && !isLoggingOut) {
      setStage('success');
      setTimeout(() => {
        onClose(); 
      }, 1500); // Auto-close after success
    }
  }, [isLoggingOut, stage]);

  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          
          {stage === 'confirm' && (
            <>
              <ConfirmationIcon />
              <Text style={styles.title}>{username ? `Goodbye, ${username}!` : title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={onConfirm}>
                  <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {stage === 'loggingOut' && (
             <>
              <LoggingOutIcon />
              <Text style={styles.title}>Logging Out...</Text>
              <Text style={styles.message}>Please wait a moment.</Text>
            </>
          )}

          {stage === 'success' && (
             <>
              <SuccessIcon />
              <Text style={styles.title}>Logged Out</Text>
              <Text style={styles.message}>You have been successfully logged out.</Text>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};


// --- STYLES ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F97316',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LogoutModal;
