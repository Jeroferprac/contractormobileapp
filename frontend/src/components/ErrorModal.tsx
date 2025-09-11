import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onAction: () => void;
  actionText: string;
}

const { width } = Dimensions.get('window');

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title,
  message,
  onClose,
  onAction,
  actionText,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const errorIconAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      errorIconAnim.setValue(0);
      shakeAnim.setValue(0);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start error icon animation
      Animated.timing(errorIconAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }).start();

      // Start shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const ErrorIcon = () => (
    <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Error background with warning triangle */}
      <Animated.View style={{ opacity: errorIconAnim }}>
        <Path
          d="M60 10L110 100H10L60 10Z"
          fill="#FFF3CD"
          stroke="#FB7504"
          strokeWidth="3"
        />
        
        {/* Exclamation mark */}
        <Path
          d="M60 30V70M60 80V85"
          stroke="#FB7504"
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Warning dots around triangle */}
        <Circle cx="25" cy="85" r="3" fill="#FB7504"/>
        <Circle cx="95" cy="85" r="3" fill="#FB7504"/>
        <Circle cx="60" cy="95" r="3" fill="#FB7504"/>
      </Animated.View>
    </Svg>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                { scale: scaleAnim },
                {
                  translateX: shakeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 8],
                  }),
                },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={20} color="#000" />
          </TouchableOpacity>

          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <ErrorIcon />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.gradientButton}
            >
              <Text style={styles.actionButtonText}>{actionText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 30,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1B2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 160,
  },
  gradientButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ErrorModal;
