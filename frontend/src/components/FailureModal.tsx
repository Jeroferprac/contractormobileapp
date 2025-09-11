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

interface FailureModalProps {
  visible: boolean;
  title?: string;
  message: string;
  username?: string;
  onClose: () => void;
  onAction: () => void;
  actionText?: string;
  showIcon?: boolean;
  animationType?: 'slide' | 'fade' | 'slideUp' | 'shake';
  iconType?: 'error' | 'warning' | 'network';
}

const { width } = Dimensions.get('window');

const FailureModal: React.FC<FailureModalProps> = ({
  visible,
  title = "Failed!",
  message,
  username,
  onClose,
  onAction,
  actionText = "Try Again",
  showIcon = true,
  animationType = 'shake',
  iconType = 'error',
}) => {
  const [show, setShow] = useState(visible);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const errorPopAnim = useRef(new Animated.Value(0)).current;
  const xDrawAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const iconGlowAnim = useRef(new Animated.Value(0)).current;

  // Effect to control the modal's visibility and animations
  useEffect(() => {
    if (visible) {
      setShow(true);
      // Reset animations
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
      errorPopAnim.setValue(0);
      xDrawAnim.setValue(0);
      shakeAnim.setValue(0);
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
        case 'shake':
          entranceAnimation = Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 200,
              useNativeDriver: true,
            }),
          ]);
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

      // Start error pop animation for icon
      Animated.timing(errorPopAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Start X drawing animation
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(xDrawAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Start icon glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconGlowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(iconGlowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Allows for a fade-out animation
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, animationType, iconType]);

  // Impressive Failure Icon with premium animations
  const FailureIcon = () => (
    <Animated.View style={[
      styles.iconWrapper,
      {
        transform: [{
          scale: errorPopAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          })
        }],
        opacity: errorPopAnim,
      }
    ]}>
      {/* Main error circle with glowing animation */}
      <Animated.View style={{
        shadowColor: '#F44336',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: iconGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.6],
        }),
        shadowRadius: iconGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [5, 12],
        }),
        elevation: iconGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [2, 6],
        }),
      }}>
        <Svg width="88" height="88" viewBox="0 0 88 88">
          {/* Background circle */}
          <Circle cx="44" cy="44" r="40" fill="#FFF1F1" />
          {/* Border circle */}
          <Circle cx="44" cy="44" r="40" stroke="#F44336" strokeWidth="3" fill="none" />
          {/* X mark - first line */}
          <Path
            d="M30 30 L58 58"
            stroke="#F44336"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="40"
            strokeDashoffset={xDrawAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            })}
          />
          {/* X mark - second line */}
          <Path
            d="M58 30 L30 58"
            stroke="#F44336"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="40"
            strokeDashoffset={xDrawAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
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
      case 'shake':
        return [{ 
          translateX: shakeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 5]
          })
        }];
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
              transform: visible ? [{ scale: 1 }, { translateY: 0 }, ...getTransform()] : [{ scale: 0.95 }, { translateY: 20 }],
              opacity: visible ? 1 : 0,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={20} color="#6C757D" />
          </TouchableOpacity>

          {/* Failure Icon */}
          {showIcon && (
          <View style={styles.iconContainer}>
              <FailureIcon />
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
              <Text style={styles.actionButtonText}>{actionText}</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    minHeight: 56,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default FailureModal;