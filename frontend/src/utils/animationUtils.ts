import { Animated } from 'react-native';

/**
 * Safely start an animation with proper cleanup
 * @param animation - The animation to start
 * @param onComplete - Optional completion callback
 */
export const safeStartAnimation = (
  animation: Animated.CompositeAnimation,
  onComplete?: () => void
) => {
  try {
    animation.start(onComplete);
  } catch (error) {
    console.warn('Animation start failed:', error);
    // Reset animation state if needed
    if (onComplete) onComplete();
  }
};

/**
 * Safely stop an animation
 * @param animation - The animation to stop
 */
export const safeStopAnimation = (animation: Animated.CompositeAnimation) => {
  try {
    animation.stop();
  } catch (error) {
    console.warn('Animation stop failed:', error);
  }
};

/**
 * Create a timing animation with consistent native driver usage
 * @param value - The animated value
 * @param config - Animation configuration
 */
export const createTimingAnimation = (
  value: Animated.Value,
  config: {
    toValue: number;
    duration: number;
    easing?: any;
  }
) => {
  return Animated.timing(value, {
    ...config,
    useNativeDriver: true,
  });
};

/**
 * Create a loop animation with proper cleanup
 * @param animation - The animation to loop
 * @param iterations - Number of iterations (-1 for infinite)
 */
export const createLoopAnimation = (
  animation: Animated.CompositeAnimation,
  iterations: number = -1
) => {
  return Animated.loop(animation, { iterations });
};

/**
 * Cleanup multiple animations safely
 * @param animations - Array of animations to stop
 */
export const cleanupAnimations = (animations: Animated.CompositeAnimation[]) => {
  animations.forEach(safeStopAnimation);
};

