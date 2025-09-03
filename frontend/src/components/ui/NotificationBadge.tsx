import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,

} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface NotificationBadgeProps {
  count: number;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'warning' | 'error';
  showBadge?: boolean;
  animated?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onPress,
  size = 'medium',
  variant = 'primary',
  showBadge = true,
  animated = true,
  accessibilityLabel,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 16,
      text: 10,
      icon: 12,
    },
    medium: {
      container: 20,
      text: 12,
      icon: 14,
    },
    large: {
      container: 24,
      text: 14,
      icon: 16,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      background: COLORS.status.error,
      text: COLORS.text.light,
      border: COLORS.status.error,
    },
    secondary: {
      background: COLORS.status.warning,
      text: COLORS.text.dark,
      border: COLORS.status.warning,
    },
    warning: {
      background: COLORS.status.warning,
      text: COLORS.text.dark,
      border: COLORS.status.warning,
    },
    error: {
      background: COLORS.status.error,
      text: COLORS.text.light,
      border: COLORS.status.error,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Animation effects
  useEffect(() => {
    if (animated && count > 0) {
      // Scale animation on new notification
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for attention
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [count, animated]);

  // Accessibility - AccessibilityInfo not available in this React Native version
  useEffect(() => {
    if (count > 0) {
      // Accessibility announcement not available
    }
  }, [count]);

  const handlePress = () => {
    if (onPress) {
      // Haptic feedback could be added here
      onPress();
    }
  };

  const formatCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };

  const renderBadge = () => {
    if (!showBadge || count === 0) return null;

    return (
      <Animated.View
        style={[
          styles.badge,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderRadius: currentSize.container / 2,
            backgroundColor: currentVariant.background,
            borderColor: currentVariant.border,
            transform: [
              { scale: scaleAnim },
            ],
          },
        ]}
        testID={`${testID}-badge`}
      >
        <Text
          style={[
            styles.badgeText,
            {
              fontSize: currentSize.text,
              color: currentVariant.text,
            },
          ]}
          numberOfLines={1}

        >
          {formatCount(count)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}


    >
      <View style={styles.iconContainer}>
        <Icon
          name="bell"
          size={currentSize.icon}
          color={COLORS.text.primary}
          style={styles.icon}
        />
        {renderBadge()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Icon styling
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minWidth: 16,
    paddingHorizontal: 2,
  },
  badgeText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default NotificationBadge;
