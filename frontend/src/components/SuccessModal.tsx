import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message: string;
  username?: string;
  onClose: () => void;
  onAction: () => void;
  actionText?: string;
  showIcon?: boolean;
  animationType?: 'slide' | 'fade' | 'slideUp';
  iconType?: 'registration' | 'general' | 'message';
}

const { width } = Dimensions.get('window');

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title = "Successful!",
  message,
  username,
  onClose,
  onAction,
  actionText = "Continue",
  showIcon = true,
  animationType = 'slideUp',
  iconType = 'general',
}) => {
  const [show, setShow] = useState(visible);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const giftBoxAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const bubblePopAnim = useRef(new Animated.Value(0)).current;
  const iconGlowAnim = useRef(new Animated.Value(0)).current;

  // Effect to control the modal's visibility and animations
  useEffect(() => {
    if (visible) {
      setShow(true);
      // Reset animations
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);
      checkmarkAnim.setValue(0);
      starAnim.setValue(0);
      giftBoxAnim.setValue(0);
      messageAnim.setValue(0);
      bubblePopAnim.setValue(0);
      iconGlowAnim.setValue(0);

      // Start entrance animation based on type
      let entranceAnimation;
      switch (animationType) {
        case 'slide':
          entranceAnimation = Animated.timing(slideAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          });
          break;
        case 'slideUp':
          entranceAnimation = Animated.timing(slideAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          });
          break;
        case 'fade':
        default:
          entranceAnimation = Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          });
      }

      Animated.parallel([
        entranceAnimation,
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Start bubble pop animation for icon
      Animated.timing(bubblePopAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Start confetti animation
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      // Start icon glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconGlowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(iconGlowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start icon-specific animations
      if (iconType === 'registration') {
        // Gift box animation
        Animated.sequence([
          Animated.timing(giftBoxAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(starAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (iconType === 'message') {
        // Message bubble animation
        Animated.sequence([
          Animated.timing(messageAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(checkmarkAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // General checkmark animation
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // Allows for a fade-out animation
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, animationType, iconType]);

  // Impressive Success Icon with premium animations
  const SuccessIcon = () => (
    <Animated.View style={[
      styles.iconWrapper,
      {
        transform: [{
          scale: bubblePopAnim.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0.8, 1.05, 1],
          })
        }],
        opacity: bubblePopAnim,
      }
    ]}>
      {/* Confetti dots with animation */}
      <Animated.View style={{ opacity: confettiAnim, position: 'absolute' }}>
        <Svg width="88" height="88" viewBox="0 0 88 88">
          <Circle cx="8.5" cy="40.5" r="2.5" fill="#4CAF50" />
          <Circle cx="19.5" cy="19.5" r="3.5" fill="#4CAF50" />
          <Circle cx="44" cy="9" r="3" fill="#4CAF50" />
          <Circle cx="70.5" cy="18.5" r="2.5" fill="#4CAF50" />
          <Circle cx="81" cy="44" r="3" fill="#4CAF50" />
          <Circle cx="68.5" cy="69.5" r="1.5" fill="#4CAF50" />
          <Circle cx="15" cy="65" r="2" fill="#4CAF50" />
        </Svg>
      </Animated.View>

      {/* Main chat-bubble icon with glowing animation */}
      <Animated.View style={{
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: iconGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 0.8],
        }),
        shadowRadius: iconGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [5, 15],
        }),
        elevation: iconGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [2, 8],
        }),
      }}>
        <Svg width="88" height="88" viewBox="0 0 88 88">
          {/* The main chat-bubble icon shape */}
          <Path
            d="M57.47,23.5H30.53C26.37,23.5,23,26.87,23,31.03V48.1c0,4.16,3.37,7.53,7.53,7.53h10.95c0.55,2.5,2.71,4.37,5.43,4.37s4.88-1.87,5.43-4.37h0.59c4.16,0,7.53-3.37,7.53-7.53V31.03C65,26.87,61.63,23.5,57.47,23.5z"
            stroke="#E8F5E9"
            strokeWidth="2.5"
            fill="#4CAF50"
          />
          {/* Dots inside the icon */}
          <Circle cx="37" cy="34" r="1.5" fill="#FFFFFF" />
          <Circle cx="42" cy="34" r="1.5" fill="#FFFFFF" />
          {/* The checkmark path with drawing animation */}
          <Path
            d="M38.5,45.5l3.5,3.5l8-8"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="25"
            strokeDashoffset={checkmarkAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [25, 0],
            })}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );

  // Calculate transform based on animation type
  const getTransform = () => {
    switch (animationType) {
      case 'slide':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [width, 0]
        })}];
      case 'slideUp':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0]
        })}];
      case 'fade':
      default:
        return [];
    }
  };

  if (!show) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: visible ? 1 : 0 }]}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: visible ? [{ scale: 1 }, { translateY: 0 }] : [{ scale: 0.95 }, { translateY: 20 }],
              opacity: visible ? 1 : 0,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={20} color="#000" />
          </TouchableOpacity>

          {/* Success Icon */}
          {showIcon && (
          <View style={styles.iconContainer}>
            <SuccessIcon />
          </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {username && <Text style={styles.username}>{username}! </Text>}
            {message}
          </Text>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <LinearGradient
              colors={['#FB7504', '#C2252C']}
              style={styles.gradientButton}
            >
              <Text style={styles.actionButtonText}>{actionText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingTop: 48,
    width: width * 0.85,
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
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
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 88,
    height: 88,
    position: 'relative',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
    marginTop: 0,
  },
  message: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    marginTop: 0,
  },
  username: {
    fontWeight: 'bold',
    color: '#212529',
  },
  actionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 56,
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SuccessModal; 