import React from 'react';
import { View, ViewStyle } from 'react-native';

interface FadeSlideInViewProps {
  delay?: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const FadeSlideInView: React.FC<FadeSlideInViewProps> = ({ delay = 0, children, style }) => {
  // Simple replacement - just return the children with style
  return <View style={style}>{children}</View>;
};

export default FadeSlideInView;
